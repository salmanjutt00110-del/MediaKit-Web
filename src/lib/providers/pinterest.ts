import { MediaFormat, MediaMetadata, PlatformType } from '../types';
import { MediaProvider, ProviderDownloadResult } from './base';
import { logger } from '../logger';
import { cleanAndDecodeTitle } from '../string-utils';
import { ytDlpRunner } from '../ytdlp';

interface PinterestCacheEntry {
  data: MediaMetadata;
  expiresAt: number;
}
const pinMediaCache = new Map<string, PinterestCacheEntry>();
const pinStreamCache = new Map<string, { url: string; expiry: number }>();

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
          'Accept-Language': 'en-US,en;q=0.9',
        },
        signal: AbortSignal.timeout(8000),
      });

      if (response.url && response.url.includes('/pin/')) {
        return response.url;
      }

      // Check HTML for deep alternate / canonical pin link
      const text = await response.text();
      const pinMatch =
        text.match(/href=["'](android-app:\/\/com\.pinterest\/pinterest\/pin\/[0-9]+)["']/i) ||
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
    } catch (err: any) {
      logger.warn('Pinterest resolve canonical URL warning', { msg: err.message, rawUrl });
    }

    return rawUrl;
  }

  extractPinId(url: string): string | null {
    const pinMatch = url.match(/\/pin\/([0-9]+)/i);
    if (pinMatch) return pinMatch[1];
    const generalMatch = url.match(/[0-9]{8,25}/);
    return generalMatch ? generalMatch[0] : null;
  }

  /**
   * Fast HTML, HLS & JSON-LD Scraper for Pinterest Videos
   */
  private async scrapePinterest(url: string): Promise<{
    title?: string;
    author?: string;
    thumbnailUrl?: string;
    directVideoUrl?: string;
  }> {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        signal: AbortSignal.timeout(8000),
      });

      if (!response.ok) return {};

      const html = await response.text();

      // 1. Direct video URL in OpenGraph or video tag
      let directVideoUrl: string | undefined;
      const ogVideo =
        html.match(/property="og:video"[^>]+content="([^"]+)"/i) ||
        html.match(/content="([^"]+)"[^>]+property="og:video"/i) ||
        html.match(/property="og:video:secure_url"[^>]+content="([^"]+)"/i) ||
        html.match(/<video[^>]+src="([^"]+)"/i);

      if (ogVideo) {
        directVideoUrl = ogVideo[1].replace(/&amp;/g, '&');
      }

      // 2. Search JSON / script tags for .mp4 URLs on (v|v1|v2).pinimg.com
      if (!directVideoUrl) {
        const vPinMatch =
          html.match(/https?:\/\/(?:v|v1|v2)\.pinimg\.com\/videos\/[^\s"'\\]+\.mp4/i) ||
          html.match(/"url"\s*:\s*"(https?:\/\/(?:v|v1|v2)\.pinimg\.com\/videos\/[^"]+\.mp4)"/i) ||
          html.match(/"contentUrl"\s*:\s*"(https?:\/\/[^"]+\.mp4)"/i);
        if (vPinMatch) {
          directVideoUrl = (vPinMatch[1] || vPinMatch[0]).replace(/\\u0026/g, '&').replace(/\\/g, '');
        }
      }

      // 3. Search for HLS .m3u8 URLs and convert to 720p MP4
      if (!directVideoUrl) {
        const m3u8Match =
          html.match(/https?:\/\/(?:v|v1|v2)\.pinimg\.com\/videos\/[^\s"'\\]+\.m3u8/i) ||
          html.match(/"url"\s*:\s*"(https?:\/\/(?:v|v1|v2)\.pinimg\.com\/videos\/[^"]+\.m3u8)"/i);
        if (m3u8Match) {
          const rawM3u8 = (m3u8Match[1] || m3u8Match[0]).replace(/\\u0026/g, '&').replace(/\\/g, '');
          directVideoUrl = rawM3u8.replace(/\/hls\//g, '/720p/').replace(/\.m3u8/g, '.mp4');
        }
      }

      // 4. Search embedded JSON in __PWS_DATA__
      if (!directVideoUrl) {
        const pwsMatches = html.match(/<script id="__PWS_DATA__"[^>]*>([\s\S]*?)<\/script>/i);
        if (pwsMatches) {
          const rawPws = pwsMatches[1];
          const mp4InPws = rawPws.match(/https?:\/\/(?:v|v1|v2)\.pinimg\.com\/videos\/[^\s"'\\]+\.mp4/i);
          if (mp4InPws) {
            directVideoUrl = mp4InPws[0].replace(/\\u0026/g, '&').replace(/\\/g, '');
          } else {
            const m3u8InPws = rawPws.match(/https?:\/\/(?:v|v1|v2)\.pinimg\.com\/videos\/[^\s"'\\]+\.m3u8/i);
            if (m3u8InPws) {
              directVideoUrl = m3u8InPws[0].replace(/\\u0026/g, '&').replace(/\\/g, '').replace(/\/hls\//g, '/720p/').replace(/\.m3u8/g, '.mp4');
            }
          }
        }
      }

      // 5. Extract title
      let title: string | undefined;
      const ogTitle =
        html.match(/property="og:title"[^>]+content="([^"]+)"/i) ||
        html.match(/content="([^"]+)"[^>]+property="og:title"/i) ||
        html.match(/<title>([^<]+)<\/title>/i);
      if (ogTitle) {
        const rawTitle = ogTitle[1].replace(/\|\s*Pinterest.*$/i, '').trim();
        if (rawTitle && !rawTitle.toLowerCase().includes('pinterest')) {
          title = cleanAndDecodeTitle(rawTitle);
        }
      }

      // 6. Extract thumbnail
      let thumbnailUrl: string | undefined;
      const ogImage =
        html.match(/property="og:image"[^>]+content="([^"]+)"/i) ||
        html.match(/content="([^"]+)"[^>]+property="og:image"/i) ||
        html.match(/https?:\/\/i\.pinimg\.com\/(?:originals|736x|564x)\/[^\s"'\\]+\.(?:jpg|jpeg|png|webp)/i);
      if (ogImage) {
        const found = (ogImage[1] || ogImage[0]).replace(/&amp;/g, '&').replace(/\\/g, '');
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
    } catch (err: any) {
      logger.warn('Pinterest scrape warning', { msg: err.message, url });
    }

    return {};
  }

  async getMediaInfo(rawUrl: string): Promise<MediaMetadata> {
    const resolvedUrl = await this.resolveCanonicalUrl(rawUrl);
    const pinId = this.extractPinId(resolvedUrl) || this.extractPinId(rawUrl) || 'pinterest-video';

    // 1. Check cache
    const cached = getCachedMedia(resolvedUrl) || getCachedMedia(rawUrl) || getCachedMedia(pinId);
    if (cached) return cached;

    // 2. Scrape directly from page
    const scraped = await this.scrapePinterest(resolvedUrl);

    // 3. Fallback to yt-dlp if direct video wasn't found in initial HTML
    let directVideo = scraped.directVideoUrl;
    let title = scraped.title;
    let author = scraped.author || 'Pinterest Creator';
    let thumbnailUrl = scraped.thumbnailUrl;

    if (!directVideo && ytDlpRunner.isAvailable()) {
      try {
        const info = await ytDlpRunner.getMediaInfo(resolvedUrl);
        if (info) {
          title = title || info.title;
          if (info.author) author = info.author;
          if (info.thumbnailUrl && !info.thumbnailUrl.includes('facebook_share_image')) {
            thumbnailUrl = info.thumbnailUrl;
          }
          if (info.formats && info.formats.length > 0) {
            const firstFmtWithUrl = info.formats.find((f) => f.downloadUrl);
            if (firstFmtWithUrl) {
              directVideo = firstFmtWithUrl.downloadUrl;
            }
          }
        }
      } catch (err: any) {
        logger.info('Pinterest yt-dlp info fallback', { msg: err.message });
      }
    }

    if (!directVideo) {
      throw new Error(
        'Could not extract a downloadable video from this Pinterest link. Please make sure the link is to a public video pin and try again.'
      );
    }

    const cleanTitle = title || `Pinterest Video (${pinId})`;

    const formats: MediaFormat[] = [
      {
        id: 'hd',
        format: 'mp4',
        quality: '1080p HD (High Definition)',
        resolution: '1080x1920',
        hasAudio: true,
        hasVideo: true,
        downloadUrl: directVideo,
      },
      {
        id: '720p',
        format: 'mp4',
        quality: '720p HD (Standard HD)',
        resolution: '720x1280',
        hasAudio: true,
        hasVideo: true,
        downloadUrl: directVideo,
      },
      {
        id: 'sd',
        format: 'mp4',
        quality: 'SD Quality (Fast Download)',
        resolution: '480x854',
        hasAudio: true,
        hasVideo: true,
        downloadUrl: directVideo,
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
      description: cleanTitle,
      author,
      thumbnailUrl,
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
    const cleanTitle = (media.title || 'Pinterest_Video')
      .replace(/[/\\?%*:|"<>]/g, '_')
      .trim();
    const cacheKey = `pin_${media.id}_${formatId}`;

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
      )}&title=${encodeURIComponent(cleanTitle)}&ext=${isMp3 ? 'mp3' : 'mp4'}`;
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
          )}&title=${encodeURIComponent(cleanTitle)}&ext=${isMp3 ? 'mp3' : 'mp4'}`;
          return {
            success: true,
            downloadUrl: proxyPath,
            message: 'Direct stream prepared successfully.',
          };
        }
      } catch (err: any) {
        logger.warn('Pinterest yt-dlp getStreamUrl warning', { msg: err.message });
      }
    }

    // 3. Fallback to yt-dlp downloadMedia
    if (ytDlpRunner.isAvailable()) {
      try {
        const localPath = await ytDlpRunner.downloadMedia(media, formatId);
        if (localPath) {
          return {
            success: true,
            downloadUrl: localPath,
            message: 'Direct media file prepared successfully.',
          };
        }
      } catch (err: any) {
        logger.warn('Pinterest yt-dlp downloadMedia error', { msg: err.message });
      }
    }

    throw new Error('Unable to extract Pinterest video stream. Please ensure the pin contains a video and is public.');
  }
}
