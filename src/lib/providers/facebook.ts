import { MediaFormat, MediaMetadata, PlatformType } from '../types';
import { MediaProvider, ProviderDownloadResult } from './base';
import { logger } from '../logger';
import { cleanAndDecodeTitle, sanitizeFilename } from '../string-utils';
import { ytDlpRunner } from '../ytdlp';
import { extractSnapSave } from '../snapsave-native';

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
    expiresAt: Date.now() + 10 * 60 * 1000,
  });
  if (fbMediaCache.size > 150) {
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

    if (target.includes('fb.watch') || target.includes('/share/')) {
      try {
        const headRes = await fetch(target, {
          method: 'HEAD',
          redirect: 'follow',
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          },
          signal: AbortSignal.timeout(6000),
        });
        if (headRes.url && headRes.url !== target) {
          target = headRes.url;
        }
      } catch (err: unknown) {
        const error = err as Error;
        logger.warn('Facebook link expansion warning', { target, msg: error.message });
      }
    }

    try {
      const parsed = new URL(target);
      if (parsed.hostname === 'm.facebook.com') {
        parsed.hostname = 'www.facebook.com';
        target = parsed.toString();
      }
    } catch {}

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
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        },
        signal: AbortSignal.timeout(7000),
      });

      if (res.ok) {
        const html = await res.text();

        let title: string | undefined;
        const ogTitle =
          html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i) ||
          html.match(/content="([^"]+)"\s+property="og:title"/i) ||
          html.match(/<title>([^<]+)<\/title>/i);
        if (ogTitle) {
          title = cleanAndDecodeTitle(ogTitle[1]);
        }

        let thumbnailUrl: string | undefined;
        const ogImage =
          html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i) ||
          html.match(/content="([^"]+)"\s+property="og:image"/i) ||
          html.match(/"preferred_thumbnail":\{"image":\{"uri":"([^"]+)"/i);
        if (ogImage) {
          thumbnailUrl = ogImage[1].replace(/&amp;/g, '&').replace(/\\\//g, '/');
        }

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
    } catch (err: unknown) {
      const error = err as Error;
      logger.warn('Facebook page scrape warning', { url, msg: error.message });
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
        signal: AbortSignal.timeout(6500),
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
      logger.warn('GetMyFB extraction warning', { msg: error.message });
    }
    return null;
  }

  async getMediaInfo(rawUrl: string): Promise<MediaMetadata> {
    const resolvedUrl = await this.resolveCanonicalUrl(rawUrl);
    const videoId = this.extractVideoId(resolvedUrl) || this.extractVideoId(rawUrl) || 'facebook-media';

    // Check cache
    const cached = getCachedMedia(resolvedUrl) || getCachedMedia(rawUrl) || getCachedMedia(videoId);
    if (cached) return cached;

    // 1. Primary Engine: yt-dlp native extraction if available
    if (ytDlpRunner.isAvailable()) {
      try {
        const info = await ytDlpRunner.getMediaInfo(resolvedUrl);
        if (info && info.formats && info.formats.length > 0) {
          const proxiedThumb = info.thumbnailUrl
            ? `/api/thumbnail?url=${encodeURIComponent(info.thumbnailUrl)}`
            : undefined;

          const result: MediaMetadata = {
            ...info,
            id: videoId,
            platform: 'facebook',
            title: info.title || `Facebook Video (${videoId})`,
            author: info.author || 'Facebook Creator',
            thumbnailUrl: proxiedThumb,
            sourceUrl: resolvedUrl,
            requiresProviderSetup: false,
          };

          setCachedMedia(resolvedUrl, result);
          setCachedMedia(rawUrl, result);
          setCachedMedia(videoId, result);
          return result;
        }
      } catch (ytErr: unknown) {
        const error = ytErr as Error;
        logger.warn('Facebook yt-dlp extraction note:', { msg: error.message });
      }
    }

    // 2. Parallel web scrapers
    const [getmyfbData, scraped] = await Promise.all([
      this.extractGetMyFB(resolvedUrl).catch(() => null),
      this.scrapeFacebookPage(resolvedUrl).catch(() => ({} as { title?: string; thumbnailUrl?: string; hdUrl?: string; sdUrl?: string })),
    ]);

    let fbThumb = getmyfbData?.thumb || scraped.thumbnailUrl;
    let fbHd = getmyfbData?.hdUrl || scraped.hdUrl;
    let fbSd = getmyfbData?.sdUrl || scraped.sdUrl;

    if (!fbHd && !fbSd) {
      try {
        const snapItems = await extractSnapSave(resolvedUrl);
        if (snapItems && snapItems.length > 0) {
          fbHd = snapItems[0].url;
          fbSd = snapItems[1]?.url || snapItems[0].url;
          if (!fbThumb && snapItems[0].thumbnail) {
            fbThumb = snapItems[0].thumbnail;
          }
        }
      } catch {}
    }

    const title = getmyfbData?.title || scraped.title || `Facebook Video (${videoId})`;
    const thumbnailUrl = fbThumb
      ? `/api/thumbnail?url=${encodeURIComponent(fbThumb)}`
      : undefined;

    const formats: MediaFormat[] = [];
    if (fbHd) {
      formats.push({
        id: 'hd',
        format: 'mp4',
        quality: '720p HD (High Definition)',
        resolution: '1280x720',
        hasAudio: true,
        hasVideo: true,
        downloadUrl: fbHd,
      });
    }
    if (fbSd) {
      formats.push({
        id: 'sd',
        format: 'mp4',
        quality: 'SD Quality (Fast Download)',
        resolution: '640x360',
        hasAudio: true,
        hasVideo: true,
        downloadUrl: fbSd,
      });
    }
    if (fbHd || fbSd) {
      formats.push({
        id: 'mp3',
        format: 'mp3',
        quality: 'Original Audio (MP3)',
        hasAudio: true,
        hasVideo: false,
        downloadUrl: fbSd || fbHd,
      });
    }

    const result: MediaMetadata = {
      id: videoId,
      platform: 'facebook',
      title,
      author: 'Facebook Creator',
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
    const ext = isMp3 ? 'mp3' : 'mp4';
    const cleanTitle = sanitizeFilename(media.title || 'Facebook_Video', ext);

    const wrapProxy = (rawUrl: string) => {
      if (rawUrl.startsWith('/api/download/file') || rawUrl.startsWith('/api/download/serve')) return rawUrl;
      return `/api/download/file?url=${encodeURIComponent(rawUrl)}&title=${encodeURIComponent(cleanTitle)}&ext=${ext}`;
    };

    // 1. Direct return if format already has prepared download URL
    const format = media.formats.find((f) => f.id === formatId);
    let directUrl = format?.downloadUrl;
    if (!directUrl) {
      const anyFmtWithUrl = media.formats.find((f) => f.downloadUrl && f.downloadUrl.startsWith('http'));
      if (anyFmtWithUrl) directUrl = anyFmtWithUrl.downloadUrl;
    }

    if (directUrl && directUrl.startsWith('http')) {
      return {
        success: true,
        downloadUrl: wrapProxy(directUrl),
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

    // 3. Try yt-dlp local downloader
    if (ytDlpRunner.isAvailable()) {
      try {
        const streamUrl = await ytDlpRunner.getStreamUrl(media.sourceUrl, formatId);
        if (streamUrl && streamUrl.startsWith('http')) {
          const safeUrl = wrapProxy(streamUrl);
          fbStreamCache.set(cacheKey, {
            url: safeUrl,
            expiry: Date.now() + 2 * 60 * 60 * 1000,
          });
          return {
            success: true,
            downloadUrl: safeUrl,
            message: 'Direct media stream prepared successfully.',
          };
        }
      } catch (err: unknown) {
        const error = err as Error;
        logger.warn('Facebook yt-dlp stream failed, trying downloadMedia', { msg: error.message });
      }

      try {
        const localPath = await ytDlpRunner.downloadMedia(media, formatId);
        if (localPath) {
          fbStreamCache.set(cacheKey, {
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
        logger.warn('Facebook yt-dlp download attempt', { msg: error.message });
      }
    }

    throw new Error('Unable to extract Facebook video stream. Please ensure the post is public and contains a valid video.');
  }
}
