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
        method: 'HEAD',
        redirect: 'follow',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        },
        signal: AbortSignal.timeout(6000),
      });
      if (response.url && response.url.includes('pinterest.com')) {
        return response.url;
      }
    } catch {}

    return rawUrl;
  }

  extractPinId(url: string): string | null {
    const pinMatch = url.match(/\/pin\/([0-9]+)/i);
    if (pinMatch) return pinMatch[1];
    const generalMatch = url.match(/[0-9]{8,25}/);
    return generalMatch ? generalMatch[0] : null;
  }

  /**
   * Fast HTML & JSON-LD Scraper for Pinterest Videos
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
          'Accept-Language': 'en-US,en;q=0.9',
        },
        signal: AbortSignal.timeout(7000),
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

      // 2. Search JSON / script tags for v.pinimg.com video URLs
      if (!directVideoUrl) {
        const vPinMatch =
          html.match(/https:\/\/v\.pinimg\.com\/videos\/[^\s"'\\]+\.mp4/i) ||
          html.match(/"url":"(https:\/\/v\.pinimg\.com\/videos\/[^"]+\.mp4)"/i);
        if (vPinMatch) {
          directVideoUrl = (vPinMatch[1] || vPinMatch[0]).replace(/\\u0026/g, '&').replace(/\\/g, '');
        }
      }

      // 3. Extract title
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

      // 4. Extract thumbnail
      let thumbnailUrl: string | undefined;
      const ogImage =
        html.match(/property="og:image"[^>]+content="([^"]+)"/i) ||
        html.match(/content="([^"]+)"[^>]+property="og:image"/i) ||
        html.match(/https:\/\/i\.pinimg\.com\/originals\/[^\s"']+/i);
      if (ogImage) {
        thumbnailUrl = (ogImage[1] || ogImage[0]).replace(/&amp;/g, '&');
      }

      // 5. Extract author
      let author: string | undefined;
      const authorMatch =
        html.match(/property="og:site_name"[^>]+content="([^"]+)"/i) ||
        html.match(/"author":\{"name":"([^"]+)"/i);
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
          if (info.thumbnailUrl) thumbnailUrl = info.thumbnailUrl;
          if (info.formats && info.formats.length > 0) {
            directVideo = info.formats[0].downloadUrl;
          }
        }
      } catch (err: any) {
        logger.info('Pinterest yt-dlp info fallback', { msg: err.message });
      }
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
