import { MediaFormat, MediaMetadata, PlatformType } from '../types';
import { MediaProvider, ProviderDownloadResult } from './base';
import { logger } from '../logger';
import { cleanAndDecodeTitle } from '../string-utils';

// In-memory cache for Facebook media information and streams
interface FbCacheEntry {
  data: MediaMetadata;
  expiresAt: number;
}
const fbMediaCache = new Map<string, FbCacheEntry>();
const fbStreamCache = new Map<string, { url: string; expiry: number }>();

function getCachedMedia(key: string): MediaMetadata | null {
  const entry = fbMediaCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    fbMediaCache.delete(key);
    return null;
  }
  return entry.data;
}

function setCachedMedia(key: string, data: MediaMetadata) {
  fbMediaCache.set(key, {
    data,
    expiresAt: Date.now() + 5 * 60 * 1000,
  });
  if (fbMediaCache.size > 100) {
    const first = fbMediaCache.keys().next().value;
    if (first) fbMediaCache.delete(first);
  }
}

export class FacebookAdapter extends MediaProvider {
  readonly platform: PlatformType = 'facebook';
  readonly displayName = 'Facebook';

  canHandle(url: string): boolean {
    return (
      url.includes('facebook.com') ||
      url.includes('fb.watch') ||
      url.includes('fb.com')
    );
  }

  detect(url: string): PlatformType {
    return this.canHandle(url) ? 'facebook' : 'unknown';
  }

  private extractVideoId(url: string): string | null {
    try {
      const match =
        url.match(/\/videos\/(?:[a-zA-Z0-9._-]+\/)?(\d+)/i) ||
        url.match(/\/reel\/(\d+)/i) ||
        url.match(/[?&]v=(\d+)/i) ||
        url.match(/\/watch\/?\?v=(\d+)/i) ||
        url.match(/fb\.watch\/([A-Za-z0-9_-]+)/i);
      return match ? match[1] : null;
    } catch {
      return null;
    }
  }

  private async resolveCanonicalUrl(rawUrl: string): Promise<string> {
    let target = rawUrl.trim();
    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      target = `https://${target}`;
    }

    // Expand short links (fb.watch or facebook.com/share)
    if (target.includes('fb.watch') || target.includes('/share/')) {
      try {
        const headRes = await fetch(target, {
          method: 'GET',
          redirect: 'follow',
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          },
          signal: AbortSignal.timeout(6000),
        });
        if (headRes.url && headRes.url !== target) {
          target = headRes.url;
        }
      } catch (err) {
        logger.warn('Facebook short URL expand error', { target, err });
      }
    }

    return target;
  }

  private async scrapeFacebookPage(url: string): Promise<{
    title?: string;
    thumbnailUrl?: string;
    hdUrl?: string;
    sdUrl?: string;
  }> {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
        },
        signal: AbortSignal.timeout(8000),
      });

      if (res.ok) {
        const html = await res.text();

        // Extract title
        let title: string | undefined;
        const ogTitle = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i) ||
          html.match(/<title>([^<]+)<\/title>/i);
        if (ogTitle) {
          title = cleanAndDecodeTitle(ogTitle[1]);
        }

        // Extract thumbnail
        let thumbnailUrl: string | undefined;
        const ogImage = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i) ||
          html.match(/"preferred_thumbnail":\{"image":\{"uri":"([^"]+)"/i);
        if (ogImage) {
          thumbnailUrl = ogImage[1].replace(/&amp;/g, '&').replace(/\\\//g, '/');
        }

        // Extract video URLs
        let hdUrl: string | undefined;
        let sdUrl: string | undefined;

        const hdMatch =
          html.match(/"browser_native_hd_url":"([^"]+)"/) ||
          html.match(/"playable_url_quality_hd":"([^"]+)"/);
        if (hdMatch) {
          hdUrl = hdMatch[1].replace(/\\\//g, '/').replace(/\\u0026/g, '&');
        }

        const sdMatch =
          html.match(/"browser_native_sd_url":"([^"]+)"/) ||
          html.match(/"playable_url":"([^"]+)"/);
        if (sdMatch) {
          sdUrl = sdMatch[1].replace(/\\\//g, '/').replace(/\\u0026/g, '&');
        }

        return { title, thumbnailUrl, hdUrl, sdUrl };
      }
    } catch (err) {
      logger.warn('Facebook page scrape error', { url, err });
    }
    return {};
  }

  async getMediaInfo(rawUrl: string): Promise<MediaMetadata> {
    const resolvedUrl = await this.resolveCanonicalUrl(rawUrl);
    const videoId = this.extractVideoId(resolvedUrl) || this.extractVideoId(rawUrl) || 'facebook-media';

    // Check cache
    const cached = getCachedMedia(resolvedUrl) || getCachedMedia(rawUrl) || getCachedMedia(videoId);
    if (cached) return cached;

    // Scrape metadata and potential direct streams
    const scraped = await this.scrapeFacebookPage(resolvedUrl);

    const title = scraped.title || `Facebook Video (${videoId})`;
    const thumbnailUrl = scraped.thumbnailUrl || undefined;

    const formats: MediaFormat[] = [
      {
        id: 'hd',
        format: 'mp4',
        quality: '1080p HD (High Definition)',
        resolution: '1920x1080',
        hasAudio: true,
        hasVideo: true,
        downloadUrl: scraped.hdUrl || scraped.sdUrl || undefined,
      },
      {
        id: '720p',
        format: 'mp4',
        quality: '720p HD (Standard HD)',
        resolution: '1280x720',
        hasAudio: true,
        hasVideo: true,
        downloadUrl: scraped.hdUrl || scraped.sdUrl || undefined,
      },
      {
        id: 'sd',
        format: 'mp4',
        quality: 'SD Quality (Fast Download)',
        resolution: '640x360',
        hasAudio: true,
        hasVideo: true,
        downloadUrl: scraped.sdUrl || scraped.hdUrl || undefined,
      },
      {
        id: 'mp3',
        format: 'mp3',
        quality: 'Original Audio (MP3)',
        hasAudio: true,
        hasVideo: false,
        downloadUrl: scraped.hdUrl || scraped.sdUrl || undefined,
      },
    ];

    const result: MediaMetadata = {
      id: videoId,
      platform: 'facebook',
      title,
      author: 'Facebook Video',
      thumbnailUrl,
      sourceUrl: resolvedUrl,
      formats,
      requiresProviderSetup: false,
    };

    setCachedMedia(resolvedUrl, result);
    setCachedMedia(rawUrl, result);
    setCachedMedia(videoId, result);

    return result;
  }

  getDownloadOptions(media: MediaMetadata): MediaFormat[] {
    return media.formats || [];
  }

  async download(media: MediaMetadata, formatId: string): Promise<ProviderDownloadResult> {
    const isMp3 = formatId.toLowerCase().includes('mp3') || formatId.toLowerCase().includes('audio');

    // 1. Check if format already has a direct URL extracted
    const format = media.formats.find((f) => f.id === formatId);
    if (format && format.downloadUrl) {
      return {
        success: true,
        downloadUrl: format.downloadUrl,
        message: 'Direct media download prepared successfully.',
      };
    }

    // 2. Check stream cache
    const cacheKey = `fb_${media.id}_${formatId}`;
    const cachedStream = fbStreamCache.get(cacheKey);
    if (cachedStream && cachedStream.expiry > Date.now()) {
      return {
        success: true,
        downloadUrl: cachedStream.url,
        message: 'Instant stream retrieved from cache.',
      };
    }

    // 3. Try loader.to conversion service
    try {
      const convFormat = isMp3 ? 'mp3' : formatId.includes('1080') ? '1080' : '720';
      const initRes = await fetch(
        `https://loader.to/ajax/download.php?button=1&start=1&end=1&format=${convFormat}&url=${encodeURIComponent(
          media.sourceUrl
        )}`,
        {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            Referer: 'https://loader.to/',
          },
          signal: AbortSignal.timeout(10000),
        }
      );

      const init = await initRes.json();
      if (init.download_url) {
        fbStreamCache.set(cacheKey, {
          url: init.download_url,
          expiry: Date.now() + 2 * 60 * 60 * 1000,
        });
        return {
          success: true,
          downloadUrl: init.download_url,
          message: 'Direct media file prepared successfully.',
        };
      }

      if (init.id) {
        const progressUrl =
          init.progress_url || `https://lto2.affadaffa.com/api/progress?id=${init.id}`;

        for (let attempt = 0; attempt < 25; attempt++) {
          await new Promise((r) => setTimeout(r, 600));
          const pRes = await fetch(progressUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            signal: AbortSignal.timeout(5000),
          });
          const pData = await pRes.json();
          if (pData.text === 'Failed' || pData.success === -1) {
            break;
          }
          if (pData.success === 1 && pData.download_url) {
            fbStreamCache.set(cacheKey, {
              url: pData.download_url,
              expiry: Date.now() + 2 * 60 * 60 * 1000,
            });
            return {
              success: true,
              downloadUrl: pData.download_url,
              message: 'Direct media file prepared successfully.',
            };
          }
        }
      }
    } catch (err) {
      logger.warn('Facebook loader.to attempt failed, using direct stream proxy fallback', { err });
    }

    // 4. Final Fallback: Direct stream proxy
    const cleanTitle = (media.title || 'facebook-media')
      .replace(/[/\\?%*:|"<>]/g, '_')
      .trim();
    const proxyPath = `/api/download/file?url=${encodeURIComponent(
      media.sourceUrl
    )}&title=${encodeURIComponent(cleanTitle)}&ext=${isMp3 ? 'mp3' : 'mp4'}`;

    return {
      success: true,
      downloadUrl: proxyPath,
      message: 'Direct media stream prepared.',
    };
  }
}
