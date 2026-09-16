import { MediaFormat, MediaMetadata, PlatformType } from '../types';
import { MediaProvider, ProviderDownloadResult } from './base';
import { logger } from '../logger';
import { cleanAndDecodeTitle } from '../string-utils';

// In-memory cache for Instagram media information and streams
interface IgCacheEntry {
  data: MediaMetadata;
  expiresAt: number;
}
const igMediaCache = new Map<string, IgCacheEntry>();
const igStreamCache = new Map<string, { url: string; expiry: number }>();

function getCachedMedia(key: string): MediaMetadata | null {
  const entry = igMediaCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    igMediaCache.delete(key);
    return null;
  }
  return entry.data;
}

function setCachedMedia(key: string, data: MediaMetadata) {
  igMediaCache.set(key, {
    data,
    expiresAt: Date.now() + 5 * 60 * 1000,
  });
  if (igMediaCache.size > 100) {
    const first = igMediaCache.keys().next().value;
    if (first) igMediaCache.delete(first);
  }
}

export class InstagramAdapter extends MediaProvider {
  readonly platform: PlatformType = 'instagram';
  readonly displayName = 'Instagram';

  canHandle(url: string): boolean {
    return url.includes('instagram.com') || url.includes('instagr.am');
  }

  detect(url: string): PlatformType {
    return this.canHandle(url) ? 'instagram' : 'unknown';
  }

  private extractShortcode(url: string): string | null {
    try {
      const match =
        url.match(/\/(?:p|reel|reels|tv)\/([A-Za-z0-9_-]+)/i) ||
        url.match(/instagram\.com\/([A-Za-z0-9_-]+)/i) ||
        url.match(/instagr\.am\/([A-Za-z0-9_-]+)/i);
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

    try {
      const parsed = new URL(target);
      // Clean query parameters for Instagram post URLs
      if (parsed.hostname.includes('instagram.com') || parsed.hostname.includes('instagr.am')) {
        const shortcode = this.extractShortcode(target);
        if (shortcode) {
          const type = target.includes('/reel') ? 'reel' : 'p';
          return `https://www.instagram.com/${type}/${shortcode}/`;
        }
      }
    } catch {}

    return target;
  }

  private async scrapeInstagramMetadata(shortcode: string, canonicalUrl: string): Promise<{
    title?: string;
    author?: string;
    thumbnailUrl?: string;
  }> {
    try {
      const embedUrl = `https://www.instagram.com/p/${shortcode}/embed/captioned/`;
      const res = await fetch(embedUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        signal: AbortSignal.timeout(4000),
      });

      if (res.ok) {
        const html = await res.text();

        // Extract author
        let author: string | undefined;
        const authorMatch =
          html.match(/class="UsernameText"[^>]*>([^<]+)<\/span>/i) ||
          html.match(/href="\/([^/?#"]+)\/"[^>]*class="[^"]*Username/i);
        if (authorMatch) {
          author = `@${authorMatch[1].trim()}`;
        }

        // Extract title or caption
        let title: string | undefined;
        const captionMatch =
          html.match(/class="Caption"[^>]*>([^<]+)/i) ||
          html.match(/<title>([^<]+)<\/title>/i);
        if (captionMatch) {
          title = cleanAndDecodeTitle(captionMatch[1]);
        }

        // Extract thumbnail image from multiple possible selectors
        let thumbnailUrl: string | undefined;
        const imgMatch =
          html.match(/class="EmbeddedMediaImage"[^>]*src="([^"]+)"/i) ||
          html.match(/<img[^>]+src="([^"]+)"[^>]+class="EmbeddedMediaImage"/i) ||
          html.match(/property="og:image"\s+content="([^"]+)"/i) ||
          html.match(/content="([^"]+)"\s+property="og:image"/i) ||
          html.match(/"display_url":"([^"]+)"/i) ||
          html.match(/"thumbnail_src":"([^"]+)"/i);

        if (imgMatch) {
          thumbnailUrl = imgMatch[1].replace(/&amp;/g, '&').replace(/\\u0026/g, '&');
        }

        // Reliable direct thumbnail fallback
        if (!thumbnailUrl && shortcode && shortcode !== 'ig-media') {
          thumbnailUrl = `https://www.instagram.com/p/${shortcode}/media/?size=l`;
        }

        return { title, author, thumbnailUrl };
      }
    } catch (err) {
      logger.warn('Instagram embed scrape error', { shortcode, err });
    }

    // Direct fallback thumbnail if embed scrape fails
    const fallbackThumb = shortcode && shortcode !== 'ig-media'
      ? `https://www.instagram.com/p/${shortcode}/media/?size=l`
      : undefined;

    return { thumbnailUrl: fallbackThumb };
  }

  async getMediaInfo(rawUrl: string): Promise<MediaMetadata> {
    const resolvedUrl = await this.resolveCanonicalUrl(rawUrl);
    const shortcode = this.extractShortcode(resolvedUrl) || this.extractShortcode(rawUrl) || 'ig-media';

    // Check cache
    const cached = getCachedMedia(resolvedUrl) || getCachedMedia(rawUrl) || getCachedMedia(shortcode);
    if (cached) return cached;

    // Scrape metadata
    const meta = await this.scrapeInstagramMetadata(shortcode, resolvedUrl);

    const isReel = resolvedUrl.includes('/reel');
    const title = meta.title || (isReel ? `Instagram Reel (${shortcode})` : `Instagram Post (${shortcode})`);
    const author = meta.author || 'Instagram Creator';
    const thumbnailUrl = meta.thumbnailUrl || (shortcode !== 'ig-media' ? `https://www.instagram.com/p/${shortcode}/media/?size=l` : undefined);

    const formats: MediaFormat[] = [
      {
        id: 'hd',
        format: 'mp4',
        quality: '1080p HD (High Definition)',
        resolution: '1080x1920',
        hasAudio: true,
        hasVideo: true,
      },
      {
        id: '720p',
        format: 'mp4',
        quality: '720p HD (Standard HD)',
        resolution: '720x1280',
        hasAudio: true,
        hasVideo: true,
      },
      {
        id: 'sd',
        format: 'mp4',
        quality: 'SD Quality (Fast Download)',
        resolution: '480x854',
        hasAudio: true,
        hasVideo: true,
      },
      {
        id: 'mp3',
        format: 'mp3',
        quality: 'Original Audio (MP3)',
        hasAudio: true,
        hasVideo: false,
      },
    ];

    const result: MediaMetadata = {
      id: shortcode,
      platform: 'instagram',
      title,
      author,
      thumbnailUrl,
      sourceUrl: resolvedUrl,
      formats,
      requiresProviderSetup: false,
    };

    setCachedMedia(resolvedUrl, result);
    setCachedMedia(rawUrl, result);
    setCachedMedia(shortcode, result);

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
    const cacheKey = `ig_${media.id}_${formatId}`;
    const cachedStream = igStreamCache.get(cacheKey);
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
          signal: AbortSignal.timeout(8000),
        }
      );

      const init = await initRes.json();
      if (init.download_url) {
        igStreamCache.set(cacheKey, {
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
          await new Promise((r) => setTimeout(r, 300));
          const pRes = await fetch(progressUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            signal: AbortSignal.timeout(4000),
          });
          const pData = await pRes.json();
          if (pData.text === 'Failed' || pData.success === -1) {
            break;
          }
          if (pData.success === 1 && pData.download_url) {
            igStreamCache.set(cacheKey, {
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
      logger.warn('Instagram loader.to attempt failed, using direct stream proxy fallback', { err });
    }

    // 4. Fallback: Direct stream proxy
    const cleanTitle = (media.title || 'instagram-media')
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
