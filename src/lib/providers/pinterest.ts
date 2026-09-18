import { MediaFormat, MediaMetadata, PlatformType } from '../types';
import { MediaProvider, ProviderDownloadResult } from './base';
import { logger } from '../logger';
import { cleanAndDecodeTitle, sanitizeFilename, probeUrlSize } from '../string-utils';
import { ytDlpRunner } from '../ytdlp';

interface PinterestCacheEntry {
  data: MediaMetadata;
  expiresAt: number;
}
const pinMediaCache = new Map<string, PinterestCacheEntry>();

function getCachedMedia(key: string): MediaMetadata | null {
  const entry = pinMediaCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    pinMediaCache.delete(key);
    return null;
  }
  return entry.data;
}

function setCachedMedia(key: string, data: MediaMetadata) {
  pinMediaCache.set(key, {
    data,
    expiresAt: Date.now() + 15 * 60 * 1000,
  });
  if (pinMediaCache.size > 150) {
    const first = pinMediaCache.keys().next().value;
    if (first) pinMediaCache.delete(first);
  }
}

export class PinterestAdapter extends MediaProvider {
  readonly platform: PlatformType = 'pinterest';
  readonly displayName = 'Pinterest';

  canHandle(url: string): boolean {
    return (
      url.includes('pinterest.com') ||
      url.includes('pinterest.co.uk') ||
      url.includes('pin.it')
    );
  }

  detect(url: string): PlatformType {
    return this.canHandle(url) ? 'pinterest' : 'unknown';
  }

  /**
   * Resolves short links (like pin.it/...) to full canonical URL
   */
  async resolveCanonicalUrl(rawUrl: string): Promise<string> {
    if (!rawUrl.includes('pin.it')) {
      return rawUrl;
    }

    try {
      const response = await fetch(rawUrl, {
        method: 'GET',
        redirect: 'follow',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        signal: AbortSignal.timeout(6000),
      });

      if (response.url && response.url !== rawUrl && !response.url.includes('pin.it')) {
        return response.url;
      }

      const text = await response.text();
      const pinMatch =
        text.match(/href=["'](https?:\/\/(?:www\.)?pinterest\.[a-z.]+\/pin\/[0-9]+(?:\/|\?[^"']*)?)["']/i) ||
        text.match(/content=["'](https?:\/\/(?:www\.)?pinterest\.[a-z.]+\/pin\/[0-9]+(?:\/|\?[^"']*)?)["']/i) ||
        text.match(/href=["'](ios-app:\/\/429047995\/pinterest\/pin\/[0-9]+)["']/i) ||
        text.match(/https?:\/\/(?:www\.)?pinterest\.[a-z.]+\/pin\/([0-9]+)/i) ||
        text.match(/url=(https%3A%2F%2F[^\s"&]+pinterest\.[a-z.]+%2Fpin%2F[0-9]+)/i);

      if (pinMatch) {
        const matched = pinMatch[1];
        if (matched.startsWith('http')) {
          return decodeURIComponent(matched);
        }
        const pinId = matched.replace(/[^0-9]/g, '');
        if (pinId) {
          return `https://www.pinterest.com/pin/${pinId}/`;
        }
      }

      if (response.url && /\/pin\/[0-9]+/i.test(response.url)) {
        return response.url;
      }
    } catch (err: unknown) {
      const error = err as Error;
      logger.warn('Pinterest resolve canonical URL warning', { msg: error.message, rawUrl });
    }

    return rawUrl;
  }

  extractPinId(url: string): string | null {
    const pinMatch = url.match(/\/pin\/([0-9]+)/i);
    if (pinMatch) return pinMatch[1];
    const generalMatch = url.match(/[0-9]{8,25}/);
    return generalMatch ? generalMatch[0] : null;
  }

  private async scrapePinterest(url: string): Promise<{
    title?: string;
    author?: string;
    thumbnailUrl?: string;
    directVideoUrl?: string;
  }> {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        },
        signal: AbortSignal.timeout(7000),
      });

      if (!res.ok) {
        return {};
      }

      const html = await res.text();

      // 1. Direct regex for V_720P mp4 or similar
      let directVideoUrl: string | undefined;
      const v720Match = html.match(/https?:\/\/[^"'\s<>]+?\/v_720p\/[^"'\s<>]+\.mp4/i);
      const vHlsMatch = html.match(/https?:\/\/[^"'\s<>]+?\/v_exp[0-9a-zA-Z]+\/[^"'\s<>]+\.mp4/i);
      const vGeneralMatch = html.match(/https?:\/\/[^"'\s<>]+?\/video\/[^"'\s<>]+\.mp4/i);
      const generalMp4 = html.match(/https?:\/\/(?:v1\.pinimg\.com|v\.pinimg\.com)\/[^"'\s<>]+\.mp4/i);

      if (v720Match) {
        directVideoUrl = v720Match[0];
      } else if (vHlsMatch) {
        directVideoUrl = vHlsMatch[0];
      } else if (vGeneralMatch) {
        directVideoUrl = vGeneralMatch[0];
      } else if (generalMp4) {
        directVideoUrl = generalMp4[0];
      }

      // 2. Extract from JSON-LD script
      if (!directVideoUrl) {
        const jsonLdMatches = html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi);
        for (const match of jsonLdMatches) {
          try {
            const data = JSON.parse(match[1]);
            if (data['@type'] === 'VideoObject' || data.contentUrl) {
              if (data.contentUrl && data.contentUrl.endsWith('.mp4')) {
                directVideoUrl = data.contentUrl;
                break;
              }
            }
          } catch {}
        }
      }

      // 3. Extract from Redux / Relay initial state script
      if (!directVideoUrl) {
        const relayMatch = html.match(/"url":"(https:\/\/[^"]+?\.mp4)"/i);
        if (relayMatch) {
          directVideoUrl = relayMatch[1].replace(/\\u0026/g, '&').replace(/\\\//g, '/');
        }
      }

      // 4. Extract og:video
      if (!directVideoUrl) {
        const ogVideo =
          html.match(/<meta\s+property="og:video"\s+content="([^"]+)"/i) ||
          html.match(/<meta\s+name="og:video"\s+content="([^"]+)"/i) ||
          html.match(/content="([^"]+)"\s+property="og:video"/i);
        if (ogVideo && ogVideo[1].includes('.mp4')) {
          directVideoUrl = ogVideo[1];
        }
      }

      // 5. Extract title
      let title: string | undefined;
      const ogTitle =
        html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i) ||
        html.match(/<meta\s+name="title"\s+content="([^"]+)"/i) ||
        html.match(/<title>([^<]+)<\/title>/i);
      if (ogTitle) {
        title = cleanAndDecodeTitle(ogTitle[1]);
      }

      // 6. Extract thumbnail
      let thumbnailUrl: string | undefined;
      const ogImage =
        html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i) ||
        html.match(/<meta\s+name="og:image"\s+content="([^"]+)"/i) ||
        html.match(/content="([^"]+)"\s+property="og:image"/i) ||
        html.match(/"image_cover_url":\s*"([^"]+)"/i) ||
        html.match(/"thumbnail_url":\s*"([^"]+)"/i);
      if (ogImage) {
        const found = ogImage[1].replace(/&amp;/g, '&').replace(/\\\//g, '/');
        if (
          !found.includes('facebook_share_image') &&
          !found.includes('default_avatar') &&
          !found.includes('favicon')
        ) {
          thumbnailUrl = found;
        }
      }

      // 7. Extract author
      let author: string | undefined;
      const authorMatch =
        html.match(/property="og:site_name"[^>]+content="([^"]+)"/i) ||
        html.match(/"author":\{"name":"([^"]+)"/i) ||
        html.match(/"uploader":\s*"([^"]+)"/i);
      if (authorMatch && authorMatch[1] && !authorMatch[1].toLowerCase().includes('pinterest')) {
        author = authorMatch[1].trim();
      }

      return { title, author, thumbnailUrl, directVideoUrl };
    } catch (err: unknown) {
      const error = err as Error;
      logger.warn('Pinterest scrape warning', { msg: error.message, url });
    }

    return {};
  }

  async getMediaInfo(rawUrl: string): Promise<MediaMetadata> {
    const resolvedUrl = await this.resolveCanonicalUrl(rawUrl);
    const pinId = this.extractPinId(resolvedUrl) || this.extractPinId(rawUrl) || 'pinterest-video';

    // 1. Check cache
    const cached = getCachedMedia(resolvedUrl) || getCachedMedia(rawUrl) || getCachedMedia(pinId);
    if (cached) return cached;

    // 2. Primary Engine: yt-dlp native extraction if available
    if (ytDlpRunner.isAvailable()) {
      try {
        const info = await ytDlpRunner.getMediaInfo(resolvedUrl);
        if (info && info.formats && info.formats.length > 0) {
          const proxiedThumb = info.thumbnailUrl
            ? `/api/thumbnail?url=${encodeURIComponent(info.thumbnailUrl)}`
            : undefined;

          const result: MediaMetadata = {
            ...info,
            id: pinId,
            platform: 'pinterest',
            title: info.title || `Pinterest Video (${pinId})`,
            author: info.author || 'Unavailable',
            thumbnailUrl: proxiedThumb,
            sourceUrl: resolvedUrl,
            requiresProviderSetup: false,
          };

          setCachedMedia(resolvedUrl, result);
          setCachedMedia(rawUrl, result);
          setCachedMedia(pinId, result);
          return result;
        }
      } catch (err: unknown) {
        const error = err as Error;
        logger.info('Pinterest yt-dlp info fallback note:', { msg: error.message });
      }
    }

    // 3. Fallback: Scrape directly from page
    const scraped = await this.scrapePinterest(resolvedUrl);
    const directVideo = scraped.directVideoUrl;
    const title = scraped.title;
    const author = scraped.author || 'Unavailable';
    const thumbnailUrl = scraped.thumbnailUrl;

    if (!directVideo) {
      throw new Error(
        'Unable to process this Pinterest link. Please make sure the link is to a public video pin and try again.'
      );
    }

    const cleanTitle = title || `Pinterest Video (${pinId})`;
    const proxiedThumb = thumbnailUrl
      ? `/api/thumbnail?url=${encodeURIComponent(thumbnailUrl)}`
      : undefined;

    const vidSize = await probeUrlSize(directVideo);

    const formats: MediaFormat[] = [
      {
        id: 'video',
        format: 'mp4',
        quality: 'Video (MP4)',
        hasAudio: true,
        hasVideo: true,
        downloadUrl: directVideo,
        fileSize: vidSize,
      },
      {
        id: 'mp3',
        format: 'mp3',
        quality: 'Original Audio (MP3)',
        hasAudio: true,
        hasVideo: false,
        downloadUrl: directVideo,
      },
    ];

    const result: MediaMetadata = {
      id: pinId,
      platform: 'pinterest',
      title: cleanTitle,
      author,
      thumbnailUrl: proxiedThumb,
      sourceUrl: resolvedUrl,
      formats,
      requiresProviderSetup: false,
    };

    setCachedMedia(resolvedUrl, result);
    setCachedMedia(rawUrl, result);
    setCachedMedia(pinId, result);

    return result;
  }

  getDownloadOptions(media: MediaMetadata): MediaFormat[] {
    return media.formats || [];
  }

  async download(media: MediaMetadata, formatId: string): Promise<ProviderDownloadResult> {
    const isMp3 = formatId.toLowerCase().includes('mp3') || formatId.toLowerCase().includes('audio');
    const ext = isMp3 ? 'mp3' : 'mp4';
    const cleanTitle = sanitizeFilename(media.title || 'Pinterest_Video', ext);

    // 1. Direct video URL if available
    const format = media.formats.find((f) => f.id === formatId);
    let directUrl = format?.downloadUrl;

    if (!directUrl) {
      const fresh = await this.scrapePinterest(media.sourceUrl);
      if (fresh.directVideoUrl) {
        directUrl = fresh.directVideoUrl;
      }
    }

    if (directUrl && directUrl.startsWith('http')) {
      const proxyPath = `/api/download/file?url=${encodeURIComponent(
        directUrl
      )}&title=${encodeURIComponent(cleanTitle)}&ext=${ext}`;
      return {
        success: true,
        downloadUrl: proxyPath,
        message: 'Direct media download prepared successfully.',
      };
    }

    // 2. Try yt-dlp direct stream URL extraction
    if (ytDlpRunner.isAvailable()) {
      try {
        const streamUrl = await ytDlpRunner.getStreamUrl(media.sourceUrl, formatId);
        if (streamUrl && streamUrl.startsWith('http')) {
          const proxyPath = `/api/download/file?url=${encodeURIComponent(
            streamUrl
          )}&title=${encodeURIComponent(cleanTitle)}&ext=${ext}`;
          return {
            success: true,
            downloadUrl: proxyPath,
            message: 'Direct stream prepared successfully.',
          };
        }
      } catch (err: unknown) {
        const error = err as Error;
        logger.warn('Pinterest yt-dlp getStreamUrl warning', { msg: error.message });
      }

      // 3. Fallback to yt-dlp downloadMedia
      try {
        const localResult = await ytDlpRunner.downloadMedia(media, formatId);
        if (localResult && localResult.serveUrl) {
          return {
            success: true,
            downloadUrl: localResult.serveUrl,
            fileSizeBytes: localResult.fileSizeBytes,
            fileSizeFormatted: localResult.fileSizeFormatted,
            resolution: localResult.resolution,
            duration: localResult.duration,
            message: 'Direct media file prepared and validated successfully.',
          };
        }
      } catch (err: unknown) {
        const error = err as Error;
        logger.warn('Pinterest yt-dlp downloadMedia error', { msg: error.message });
      }
    }

    throw new Error('Unable to extract Pinterest video stream. Please ensure the pin contains a video and is public.');
  }
}
