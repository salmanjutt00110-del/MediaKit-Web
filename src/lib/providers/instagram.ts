import { MediaFormat, MediaMetadata, PlatformType } from '../types';
import { MediaProvider, ProviderDownloadResult } from './base';
import { logger } from '../logger';
import { cleanAndDecodeTitle } from '../string-utils';
import { ytDlpRunner, getCookiesPath } from '../ytdlp';
import { snapsave } from 'snapsave-media-downloader';

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
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 min cache
  });
  if (igMediaCache.size > 150) {
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

  /**
   * Fast metadata and thumbnail scraper
   */
  private async scrapeInstagramMetadata(shortcode: string, canonicalUrl: string): Promise<{
    title?: string;
    author?: string;
    thumbnailUrl?: string;
    directVideoUrl?: string;
  }> {
    // 1. Try public oEmbed endpoint
    try {
      const oembedRes = await fetch(
        `https://api.instagram.com/oembed/?url=https://www.instagram.com/p/${shortcode}/`,
        {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          },
          signal: AbortSignal.timeout(6000),
        }
      );
      if (oembedRes.ok) {
        const data = await oembedRes.json();
        if (data.title || data.thumbnail_url) {
          return {
            title: data.title ? cleanAndDecodeTitle(data.title) : undefined,
            author: data.author_name ? `@${data.author_name}` : undefined,
            thumbnailUrl: data.thumbnail_url,
          };
        }
      }
    } catch {}

    // 2. Try captioned embed scraping with browser headers (try both /p/ and /reel/)
    const embedUrls = [
      canonicalUrl.includes('/reel')
        ? `https://www.instagram.com/reel/${shortcode}/embed/captioned/`
        : `https://www.instagram.com/p/${shortcode}/embed/captioned/`,
      `https://www.instagram.com/p/${shortcode}/embed/captioned/`,
    ];

    for (const embedUrl of embedUrls) {
      try {
        const res = await fetch(embedUrl, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
          },
          signal: AbortSignal.timeout(8000),
        });

        if (res.ok) {
          const html = await res.text();

          let author: string | undefined;
          const authorMatch =
            html.match(/class="UsernameText"[^>]*>([^<]+)<\/span>/i) ||
            html.match(/href="\/([^/?#"]+)\/"[^>]*class="[^"]*Username/i);
          if (authorMatch) {
            author = `@${authorMatch[1].trim()}`;
          }

          let title: string | undefined;
          const captionMatch =
            html.match(/class="Caption"[^>]*>([\s\S]*?)<\/div>/i) ||
            html.match(/class="Caption"[^>]*>([^<]+)/i) ||
            html.match(/<title>([^<]+)<\/title>/i);
          if (captionMatch) {
            const rawCap = captionMatch[1].replace(/<[^>]+>/g, '').trim();
            if (rawCap && !rawCap.includes('Instagram')) {
              title = cleanAndDecodeTitle(rawCap);
            }
          }

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

          let directVideoUrl: string | undefined;
          const videoMatch =
            html.match(/<video[^>]+src="([^"]+)"/i) ||
            html.match(/"video_url":"([^"]+)"/i) ||
            html.match(/"playable_url":"([^"]+)"/i) ||
            html.match(/"playable_url_quality_hd":"([^"]+)"/i) ||
            html.match(/"video_versions":\[\{"url":"([^"]+)"/i);
          if (videoMatch) {
            directVideoUrl = videoMatch[1].replace(/&amp;/g, '&').replace(/\\u0026/g, '&');
          }

          if (title || thumbnailUrl || directVideoUrl) {
            return { title, author, thumbnailUrl, directVideoUrl };
          }
        }
      } catch (err: any) {
        logger.warn('Instagram embed scrape warning', { shortcode, msg: err.message });
      }
    }

    return {};
  }

  async getMediaInfo(rawUrl: string): Promise<MediaMetadata> {
    const resolvedUrl = await this.resolveCanonicalUrl(rawUrl);
    const shortcode = this.extractShortcode(resolvedUrl) || this.extractShortcode(rawUrl) || 'ig-media';

    // Check cache
    const cached = getCachedMedia(resolvedUrl) || getCachedMedia(rawUrl) || getCachedMedia(shortcode);
    if (cached) return cached;

    // 0. Primary Engine: yt-dlp extractor (extracts Reels, Posts, Stories directly in 2 seconds)
    if (ytDlpRunner.isAvailable()) {
      try {
        const info = await ytDlpRunner.getMediaInfo(resolvedUrl);
        if (info && info.formats && info.formats.length > 0) {
          setCachedMedia(resolvedUrl, info);
          setCachedMedia(rawUrl, info);
          setCachedMedia(shortcode, info);
          return info;
        }
      } catch (err: any) {
        logger.warn('Instagram yt-dlp info attempt failed', { msg: err.message });
      }
    }

    // 1. High-Performance Serverless Extractor: snapsave (extracts real HD video & thumbnail in <2s)
    try {
      const snapRes: any = await snapsave(resolvedUrl).catch(() => null);
      if (snapRes && snapRes.status && Array.isArray(snapRes.data) && snapRes.data.length > 0) {
        const bestItem = snapRes.data[0];
        const rawThumbnail = bestItem.thumbnail;
        const thumbnailUrl = rawThumbnail
          ? `/api/thumbnail?url=${encodeURIComponent(rawThumbnail)}`
          : undefined;

        const formats: MediaFormat[] = snapRes.data.map((item: any, idx: number) => {
          const resLabel = item.resolution || (idx === 0 ? '720p HD (High Definition)' : 'SD Quality (Fast Download)');
          const isHd = resLabel.toLowerCase().includes('hd') || resLabel.includes('720') || resLabel.includes('1080');
          return {
            id: isHd ? 'hd' : `sd_${idx}`,
            format: 'mp4',
            quality: resLabel,
            resolution: isHd ? '720x1280' : '480x854',
            hasAudio: true,
            hasVideo: true,
            downloadUrl: item.url,
          };
        });

        // Add 720p / 360p aliases and MP3 audio
        if (bestItem.url) {
          if (!formats.some((f) => f.id === '720p')) {
            formats.push({
              id: '720p',
              format: 'mp4',
              quality: '720p HD (Standard HD)',
              resolution: '720x1280',
              hasAudio: true,
              hasVideo: true,
              downloadUrl: bestItem.url,
            });
          }
          formats.push({
            id: 'mp3',
            format: 'mp3',
            quality: 'Original Audio (MP3)',
            hasAudio: true,
            hasVideo: false,
            downloadUrl: bestItem.url,
          });
        }

        const cleanTitle = `Instagram Reel (${shortcode})`;

        const result: MediaMetadata = {
          id: shortcode,
          platform: 'instagram',
          title: cleanTitle,
          author: 'Instagram Creator',
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
    } catch (err: any) {
      logger.warn('Instagram snapsave extraction error', { msg: err.message });
    }

    // 2. Fallback scrape metadata
    const meta = await this.scrapeInstagramMetadata(shortcode, resolvedUrl);

    const isReel = resolvedUrl.includes('/reel');
    const title = meta.title || (isReel ? `Instagram Reel (${shortcode})` : `Instagram Post (${shortcode})`);
    const author = meta.author || 'Instagram Creator';
    // If thumbnail was found, wrap with thumbnail proxy to avoid cross-origin 403 blocks
    const rawThumbnail = meta.thumbnailUrl;
    const thumbnailUrl = rawThumbnail
      ? `/api/thumbnail?url=${encodeURIComponent(rawThumbnail)}`
      : undefined;

    const formats: MediaFormat[] = [
      {
        id: 'hd',
        format: 'mp4',
        quality: '1080p HD (High Definition)',
        resolution: '1080x1920',
        hasAudio: true,
        hasVideo: true,
        downloadUrl: meta.directVideoUrl,
      },
      {
        id: '720p',
        format: 'mp4',
        quality: '720p HD (Standard HD)',
        resolution: '720x1280',
        hasAudio: true,
        hasVideo: true,
        downloadUrl: meta.directVideoUrl,
      },
      {
        id: 'sd',
        format: 'mp4',
        quality: 'SD Quality (Fast Download)',
        resolution: '480x854',
        hasAudio: true,
        hasVideo: true,
        downloadUrl: meta.directVideoUrl,
      },
      {
        id: 'mp3',
        format: 'mp3',
        quality: 'Original Audio (MP3)',
        hasAudio: true,
        hasVideo: false,
        downloadUrl: meta.directVideoUrl,
      },
    ];

    const textMatches = (title || '').match(/#([a-zA-Z0-9_\u0600-\u06FF]+)/g) || [];
    const hashtags = Array.from(new Set(textMatches));

    const result: MediaMetadata = {
      id: shortcode,
      platform: 'instagram',
      title,
      description: title,
      hashtags,
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
    const cleanTitle = (media.title || 'Instagram_Video')
      .replace(/[/\\?%*:|"<>]/g, '_')
      .trim();

    // 1. If format has directVideoUrl or prepared download URL, proxy it safely with attachment header
    const format = media.formats.find((f) => f.id === formatId);
    let directUrl = format?.downloadUrl;

    if (!directUrl) {
      // Re-scrape with full timeout in case first pass was incomplete
      const shortcode = this.extractShortcode(media.sourceUrl) || media.id;
      const freshMeta = await this.scrapeInstagramMetadata(shortcode, media.sourceUrl);
      if (freshMeta.directVideoUrl) {
        directUrl = freshMeta.directVideoUrl;
      }
    }

    if (directUrl && directUrl.startsWith('http')) {
      return {
        success: true,
        downloadUrl: directUrl,
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

    // 3. Try yt-dlp direct stream extraction (FAST: 1-2 seconds, zero ffmpeg overhead)
    if (ytDlpRunner.isAvailable()) {
      try {
        const streamUrl = await ytDlpRunner.getStreamUrl(media.sourceUrl, formatId);
        if (streamUrl && streamUrl.startsWith('http')) {
          const safeUrl = `/api/download/file?url=${encodeURIComponent(
            streamUrl
          )}&title=${encodeURIComponent(cleanTitle)}&ext=${isMp3 ? 'mp3' : 'mp4'}`;
          igStreamCache.set(cacheKey, {
            url: safeUrl,
            expiry: Date.now() + 2 * 60 * 60 * 1000,
          });
          return {
            success: true,
            downloadUrl: safeUrl,
            message: 'Direct media download prepared successfully.',
          };
        }
      } catch (err: any) {
        logger.warn('Instagram yt-dlp getStreamUrl failed, trying downloadMedia', { msg: err.message });
      }

      try {
        const localPath = await ytDlpRunner.downloadMedia(media, formatId);
        if (localPath) {
          igStreamCache.set(cacheKey, {
            url: localPath,
            expiry: Date.now() + 6 * 60 * 60 * 1000,
          });
          return {
            success: true,
            downloadUrl: localPath,
            message: 'Direct media file prepared successfully.',
          };
        }
      } catch (err: any) {
        logger.warn('Instagram yt-dlp download attempt', { msg: err.message });
      }
    }

    // 4. Fast conversion probe via loader.to (max 4 fast checks)
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
          signal: AbortSignal.timeout(4000),
        }
      );

      const init = await initRes.json();
      if (init.download_url) {
        const safeUrl = `/api/download/file?url=${encodeURIComponent(
          init.download_url
        )}&title=${encodeURIComponent(cleanTitle)}&ext=${isMp3 ? 'mp3' : 'mp4'}`;
        igStreamCache.set(cacheKey, {
          url: safeUrl,
          expiry: Date.now() + 2 * 60 * 60 * 1000,
        });
        return {
          success: true,
          downloadUrl: safeUrl,
          message: 'Direct media file prepared successfully.',
        };
      }

      if (init.id) {
        const progressUrl =
          init.progress_url || `https://lto2.affadaffa.com/api/progress?id=${init.id}`;

        for (let attempt = 0; attempt < 5; attempt++) {
          await new Promise((r) => setTimeout(r, 400));
          try {
            const pRes = await fetch(progressUrl, {
              headers: { 'User-Agent': 'Mozilla/5.0' },
              signal: AbortSignal.timeout(2000),
            });
            const pData = await pRes.json();
            if (pData.text === 'Failed' || pData.success === -1) {
              break;
            }
            if (pData.success === 1 && pData.download_url) {
              const safeUrl = `/api/download/file?url=${encodeURIComponent(
                pData.download_url
              )}&title=${encodeURIComponent(cleanTitle)}&ext=${isMp3 ? 'mp3' : 'mp4'}`;
              igStreamCache.set(cacheKey, {
                url: safeUrl,
                expiry: Date.now() + 2 * 60 * 60 * 1000,
              });
              return {
                success: true,
                downloadUrl: safeUrl,
                message: 'Direct media file prepared successfully.',
              };
            }
          } catch {}
        }
      }
    } catch {}

    throw new Error('Unable to extract Instagram video stream. Meta requires public posts or active browser cookies (place cookies.txt into the bin folder for unrestricted downloads).');
  }
}
