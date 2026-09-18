import { MediaFormat, MediaMetadata, PlatformType } from '../types';
import { MediaProvider, ProviderDownloadResult } from './base';
import { logger } from '../logger';
import { cleanAndDecodeTitle, sanitizeFilename } from '../string-utils';
import { ytDlpRunner } from '../ytdlp';
import { extractSnapSave } from '../snapsave-native';

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
    expiresAt: Date.now() + 10 * 60 * 1000,
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
   * Fast metadata and thumbnail scraper fallback
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
          signal: AbortSignal.timeout(5000),
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

    // 2. Try captioned embed scraping with browser headers
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
          signal: AbortSignal.timeout(6000),
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
      } catch (err: unknown) {
        const error = err as Error;
        logger.warn('Instagram embed scrape warning', { shortcode, msg: error.message });
      }
    }

    return {};
  }

  private async extractGetMyFB(url: string): Promise<{ hdUrl?: string; sdUrl?: string; title?: string; thumb?: string } | null> {
    try {
      const formData = new URLSearchParams();
      formData.append('id', url);
      formData.append('locale', 'en');

      const res = await fetch('https://getmyfb.com/process', {
        method: 'POST',
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          'x-requested-with': 'XMLHttpRequest',
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'referer': 'https://getmyfb.com/',
        },
        body: formData.toString(),
        signal: AbortSignal.timeout(6000),
      });

      if (!res.ok) return null;
      const html = await res.text();
      const links = [...html.matchAll(/href="([^"]+)"/g)]
        .map((m) => m[1])
        .filter((l) => l.includes('ssscdn.io') || l.includes('getmyfb'));

      const thumbMatch = html.match(/<img[^>]+src="([^"]+)"/i);
      const titleMatch = html.match(/<h5[^>]*>([^<]+)<\/h5>/i) || html.match(/<p[^>]*class="[^"]*caption[^"]*"[^>]*>([^<]+)<\/p>/i);

      if (links.length > 0) {
        return {
          hdUrl: links[0],
          sdUrl: links[1] || links[0],
          thumb: thumbMatch ? thumbMatch[1] : undefined,
          title: titleMatch ? cleanAndDecodeTitle(titleMatch[1].trim()) : undefined,
        };
      }
    } catch (err: unknown) {
      const error = err as Error;
      logger.warn('Instagram GetMyFB extraction warning', { msg: error.message });
    }
    return null;
  }

  async getMediaInfo(rawUrl: string): Promise<MediaMetadata> {
    const resolvedUrl = await this.resolveCanonicalUrl(rawUrl);
    const shortcode = this.extractShortcode(resolvedUrl) || this.extractShortcode(rawUrl) || 'ig-media';

    // Check cache
    const cached = getCachedMedia(resolvedUrl) || getCachedMedia(rawUrl) || getCachedMedia(shortcode);
    if (cached) return cached;

    // 1. Primary Engine: yt-dlp native extraction (Extracts authentic caption, author username, thumbnail, dimensions, direct video)
    if (ytDlpRunner.isAvailable()) {
      try {
        const info = await ytDlpRunner.getMediaInfo(resolvedUrl);
        if (info && info.formats && info.formats.length > 0) {
          const proxiedThumb = info.thumbnailUrl
            ? `/api/thumbnail?url=${encodeURIComponent(info.thumbnailUrl)}`
            : undefined;

          const realTitle = info.title && !info.title.toLowerCase().includes('instagram video')
            ? cleanAndDecodeTitle(info.title)
            : `Instagram Reel (${shortcode})`;

          const realAuthor = info.author
            ? (info.author.startsWith('@') ? info.author : `@${info.author}`)
            : 'Information unavailable';

          const result: MediaMetadata = {
            ...info,
            id: shortcode,
            platform: 'instagram',
            title: realTitle,
            author: realAuthor,
            thumbnailUrl: proxiedThumb,
            sourceUrl: resolvedUrl,
            requiresProviderSetup: false,
          };

          setCachedMedia(resolvedUrl, result);
          setCachedMedia(rawUrl, result);
          setCachedMedia(shortcode, result);
          return result;
        }
      } catch (ytErr: unknown) {
        const error = ytErr as Error;
        logger.warn('Instagram yt-dlp extraction note, trying web extractors:', { msg: error.message });
      }
    }

    // 2. High-Speed API Extractor (GetMyFB multi-platform)
    const getmyfb = await this.extractGetMyFB(resolvedUrl).catch(() => null);
    if (getmyfb && (getmyfb.hdUrl || getmyfb.sdUrl)) {
      const bestUrl = getmyfb.hdUrl || getmyfb.sdUrl!;
      const formats: MediaFormat[] = [
        {
          id: 'hd',
          format: 'mp4',
          quality: '1080p HD (High Definition)',
          resolution: '1080x1920',
          hasAudio: true,
          hasVideo: true,
          downloadUrl: getmyfb.hdUrl || bestUrl,
        },
        {
          id: 'sd',
          format: 'mp4',
          quality: 'SD Quality (Fast Download)',
          resolution: '480x854',
          hasAudio: true,
          hasVideo: true,
          downloadUrl: getmyfb.sdUrl || bestUrl,
        },
        {
          id: 'mp3',
          format: 'mp3',
          quality: 'Original Audio (MP3)',
          hasAudio: true,
          hasVideo: false,
          downloadUrl: bestUrl,
        },
      ];

      const result: MediaMetadata = {
        id: shortcode,
        platform: 'instagram',
        title: getmyfb.title || `Instagram Reel (${shortcode})`,
        author: 'Information unavailable',
        thumbnailUrl: getmyfb.thumb ? `/api/thumbnail?url=${encodeURIComponent(getmyfb.thumb)}` : undefined,
        sourceUrl: resolvedUrl,
        formats,
        requiresProviderSetup: false,
      };

      setCachedMedia(resolvedUrl, result);
      setCachedMedia(rawUrl, result);
      setCachedMedia(shortcode, result);
      return result;
    }

    // 3. Fallback serverless extractor: snapsave
    try {
      const snapItems = await extractSnapSave(resolvedUrl);
      if (snapItems && snapItems.length > 0) {
        const bestItem = snapItems[0];
        const rawThumbnail = bestItem.thumbnail;
        const thumbnailUrl = rawThumbnail
          ? `/api/thumbnail?url=${encodeURIComponent(rawThumbnail)}`
          : undefined;

        const formats: MediaFormat[] = snapItems.map((item, idx) => {
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

        if (bestItem.url) {
          formats.push({
            id: 'mp3',
            format: 'mp3',
            quality: 'Original Audio (MP3)',
            hasAudio: true,
            hasVideo: false,
            downloadUrl: bestItem.url,
          });
        }

        const result: MediaMetadata = {
          id: shortcode,
          platform: 'instagram',
          title: `Instagram Reel (${shortcode})`,
          author: 'Information unavailable',
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
    } catch (err: unknown) {
      const error = err as Error;
      logger.warn('Instagram snapsave extraction error', { msg: error.message });
    }

    // 4. Fallback scrape metadata
    const meta = await this.scrapeInstagramMetadata(shortcode, resolvedUrl);
    const title = meta.title || `Instagram Reel (${shortcode})`;
    const author = meta.author || 'Information unavailable';
    const rawThumbnail = meta.thumbnailUrl;
    const thumbnailUrl = rawThumbnail
      ? `/api/thumbnail?url=${encodeURIComponent(rawThumbnail)}`
      : undefined;

    const formats: MediaFormat[] = [];
    if (meta.directVideoUrl) {
      formats.push({
        id: 'hd',
        format: 'mp4',
        quality: '720p HD (High Definition)',
        resolution: '720x1280',
        hasAudio: true,
        hasVideo: true,
        downloadUrl: meta.directVideoUrl,
      });
      formats.push({
        id: 'mp3',
        format: 'mp3',
        quality: 'Original Audio (MP3)',
        hasAudio: true,
        hasVideo: false,
        downloadUrl: meta.directVideoUrl,
      });
    }

    const result: MediaMetadata = {
      id: shortcode,
      platform: 'instagram',
      title,
      description: title,
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
    const ext = isMp3 ? 'mp3' : 'mp4';
    const cleanTitle = sanitizeFilename(media.title || 'Instagram_Video', ext);

    // 1. If format has directVideoUrl or prepared download URL, proxy it safely with attachment header
    const format = media.formats.find((f) => f.id === formatId);
    let directUrl = format?.downloadUrl;

    if (!directUrl) {
      const anyFmtWithUrl = media.formats.find((f) => f.downloadUrl && f.downloadUrl.startsWith('http'));
      if (anyFmtWithUrl) {
        directUrl = anyFmtWithUrl.downloadUrl;
      } else {
        const shortcode = this.extractShortcode(media.sourceUrl) || media.id;
        const freshMeta = await this.scrapeInstagramMetadata(shortcode, media.sourceUrl);
        if (freshMeta.directVideoUrl) {
          directUrl = freshMeta.directVideoUrl;
        }
      }
    }

    if (directUrl && directUrl.startsWith('http')) {
      const safeUrl = directUrl.startsWith('/api/download/file') || directUrl.startsWith('/api/download/serve')
        ? directUrl
        : `/api/download/file?url=${encodeURIComponent(directUrl)}&title=${encodeURIComponent(cleanTitle)}&ext=${ext}`;
      return {
        success: true,
        downloadUrl: safeUrl,
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

    // 3. Try yt-dlp direct stream or downloadMedia
    if (ytDlpRunner.isAvailable()) {
      try {
        const streamUrl = await ytDlpRunner.getStreamUrl(media.sourceUrl, formatId);
        if (streamUrl && streamUrl.startsWith('http')) {
          const safeUrl = `/api/download/file?url=${encodeURIComponent(
            streamUrl
          )}&title=${encodeURIComponent(cleanTitle)}&ext=${ext}`;
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
      } catch (err: unknown) {
        const error = err as Error;
        logger.warn('Instagram yt-dlp getStreamUrl failed, trying downloadMedia', { msg: error.message });
      }

      try {
        const localPath = await ytDlpRunner.downloadMedia(media, formatId);
        if (localPath) {
          igStreamCache.set(cacheKey, {
            url: localPath,
            expiry: Date.now() + 20 * 60 * 1000,
          });
          return {
            success: true,
            downloadUrl: localPath,
            message: 'Direct media file prepared successfully.',
          };
        }
      } catch (err: unknown) {
        const error = err as Error;
        logger.warn('Instagram yt-dlp download attempt', { msg: error.message });
      }
    }

    throw new Error('Unable to extract Instagram video stream. Meta requires public posts or active browser cookies (place cookies.txt into the bin folder for unrestricted downloads).');
  }
}
