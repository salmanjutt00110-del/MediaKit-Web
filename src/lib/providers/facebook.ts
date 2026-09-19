import { MediaFormat, MediaMetadata, PlatformType } from '../types';
import { MediaProvider, ProviderDownloadResult } from './base';
import { logger } from '../logger';
import { cleanAndDecodeTitle, sanitizeFilename, probeUrlSize } from '../string-utils';
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

interface VikasScrapeResult {
  id?: string;
  title?: string;
  description?: string;
  thumbnailUrl?: string;
  hdUrl?: string;
  sdUrl?: string;
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
        url.match(/\/reel\/([a-zA-Z0-9_-]+)/i) ||
        url.match(/\/share\/(?:r|v)\/([a-zA-Z0-9_-]+)/i) ||
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
        const expandRes = await fetch(target, {
          method: 'GET',
          redirect: 'follow',
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          },
          signal: AbortSignal.timeout(4000),
        });
        if (expandRes.url && expandRes.url !== target) {
          target = expandRes.url;
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

  /**
   * Scrapes Facebook video streams and metadata directly utilizing the exact
   * browser header signature and extraction logic from vikas5914/Facebook-Video-Downloader.
   */
  private async scrapeFacebookVikas(url: string): Promise<VikasScrapeResult> {
    const cleanStr = (str?: string | null): string => {
      if (!str) return '';
      try {
        return JSON.parse(`"${str.replace(/"/g, '\\"')}"`);
      } catch {
        return str.replace(/\\\//g, '/').replace(/\\u0026/g, '&');
      }
    };

    const appendDl = (link: string): string => {
      if (!link) return link;
      if (link.includes('dl=1')) return link;
      return link.includes('?') ? `${link}&dl=1` : `${link}?dl=1`;
    };

    const headers = {
      'sec-fetch-user': '?1',
      'sec-ch-ua-mobile': '?0',
      'sec-fetch-site': 'none',
      'sec-fetch-dest': 'document',
      'sec-fetch-mode': 'navigate',
      'cache-control': 'max-age=0',
      'authority': 'www.facebook.com',
      'upgrade-insecure-requests': '1',
      'accept-language': 'en-GB,en;q=0.9,tr-TR;q=0.8,tr;q=0.7,en-US;q=0.6',
      'sec-ch-ua': '"Google Chrome";v="89", "Chromium";v="89", ";Not A Brand";v="99"',
      'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36',
      accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
    };

    try {
      const res = await fetch(url, {
        headers,
        redirect: 'follow',
        signal: AbortSignal.timeout(8000),
      });

      if (!res.ok) return {};
      const html = await res.text();

      // 1. SD & HD Video Streams (vikas5914 patterns + modern playable fallbacks)
      let sdUrl: string | undefined;
      let hdUrl: string | undefined;

      const sdMatch =
        html.match(/browser_native_sd_url":"([^"]+)"/) ||
        html.match(/"playable_url":"([^"]+)"/);
      if (sdMatch) {
        const cleaned = cleanStr(sdMatch[1]);
        if (cleaned && cleaned.startsWith('http')) {
          sdUrl = appendDl(cleaned);
        }
      }

      const hdMatch =
        html.match(/browser_native_hd_url":"([^"]+)"/) ||
        html.match(/"playable_url_quality_hd":"([^"]+)"/);
      if (hdMatch) {
        const cleaned = cleanStr(hdMatch[1]);
        if (cleaned && cleaned.startsWith('http')) {
          hdUrl = appendDl(cleaned);
        }
      }

      // 2. Title extraction (vikas5914: <title> and title id="pageTitle", plus og:title)
      let title: string | undefined;
      const titleM1 = html.match(/<title>(.*?)<\/title>/i);
      const titleM2 = html.match(/title\s+id="pageTitle">(.+?)<\/title>/i);
      const ogTitle =
        html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i) ||
        html.match(/content="([^"]+)"\s+property="og:title"/i);

      if (titleM2 && titleM2[1].trim()) {
        title = cleanStr(titleM2[1].trim());
      } else if (titleM1 && titleM1[1].trim() && titleM1[1].trim().toLowerCase() !== 'facebook') {
        title = cleanStr(titleM1[1].trim());
      } else if (ogTitle && ogTitle[1].trim()) {
        title = cleanAndDecodeTitle(ogTitle[1]);
      }

      // 3. Caption / Description (vikas5914: span class="hasCaption", plus og:description)
      let description: string | undefined;
      const captionMatch = html.match(/span\s+class="hasCaption">(.+?)<\/span>/i);
      const ogDesc =
        html.match(/<meta\s+property="og:description"\s+content="([^"]+)"/i) ||
        html.match(/content="([^"]+)"\s+property="og:description"/i);
      if (captionMatch && captionMatch[1]) {
        description = cleanStr(captionMatch[1]);
      } else if (ogDesc && ogDesc[1]) {
        description = cleanAndDecodeTitle(ogDesc[1]);
      }

      // 4. Thumbnail extraction
      let thumbnailUrl: string | undefined;
      const ogImage =
        html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i) ||
        html.match(/content="([^"]+)"\s+property="og:image"/i) ||
        html.match(/"preferred_thumbnail":\{"image":\{"uri":"([^"]+)"/i);
      if (ogImage) {
        thumbnailUrl = cleanStr(ogImage[1]);
      }

      // 5. Video ID (vikas5914: (\d+)/?$)
      let id: string | undefined;
      const idMatch = url.match(/(\d+)\/?$/);
      if (idMatch) {
        id = idMatch[1];
      }

      return { id, title, description, thumbnailUrl, hdUrl, sdUrl };
    } catch (err: unknown) {
      const error = err as Error;
      logger.warn('Facebook Vikas scrape warning', { url, msg: error.message });
      return {};
    }
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

    // 1. Tier 1: Vikas Facebook direct scraper (authentic fbcdn.net streams with &dl=1)
    const vikasData: VikasScrapeResult = await this.scrapeFacebookVikas(resolvedUrl).catch(() => ({} as VikasScrapeResult));
    let fbThumb = vikasData.thumbnailUrl;
    let fbHd = vikasData.hdUrl;
    let fbSd = vikasData.sdUrl;

    // 2. Tier 2: If direct fbcdn streams were not extracted (e.g. dynamic reels/shares), try GetMyFB & SnapSave
    let getmyfbData: { hdUrl?: string; sdUrl?: string; title?: string; thumb?: string } | null = null;
    if (!fbHd && !fbSd) {
      const [gfb, snapItems] = await Promise.all([
        this.extractGetMyFB(resolvedUrl).catch(() => null),
        extractSnapSave(resolvedUrl).catch(() => null),
      ]);
      getmyfbData = gfb;
      fbHd = getmyfbData?.hdUrl || snapItems?.[0]?.url || undefined;
      fbSd = getmyfbData?.sdUrl || snapItems?.[1]?.url || snapItems?.[0]?.url || undefined;
      fbThumb = fbThumb || getmyfbData?.thumb || snapItems?.[0]?.thumbnail || undefined;
    }

    // 3. Tier 3: yt-dlp fallback with timeout if web scrapers missed
    if (!fbHd && !fbSd && ytDlpRunner.isAvailable()) {
      try {
        const info = await Promise.race([
          ytDlpRunner.getMediaInfo(resolvedUrl),
          new Promise<null>((_, reject) => setTimeout(() => reject(new Error('yt-dlp timeout')), 6000)),
        ]);
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
        logger.warn('Facebook yt-dlp fallback note:', { msg: error.message });
      }
    }

    if (!fbHd && !fbSd) {
      throw new Error('Unable to extract Facebook video stream. Please ensure the video is public and accessible.');
    }

    const title = vikasData.title || getmyfbData?.title || `Facebook Video (${videoId})`;
    const description = vikasData.description;
    const thumbnailUrl = fbThumb
      ? `/api/thumbnail?url=${encodeURIComponent(fbThumb)}`
      : undefined;
    const isDifferent = Boolean(fbHd && fbSd && fbHd !== fbSd);

    const formats: MediaFormat[] = [];
    if (fbHd) {
      formats.push({
        id: 'hd',
        format: 'mp4',
        quality: isDifferent ? 'HD Video (High Definition)' : 'Video (MP4)',
        resolution: '1280x720',
        hasAudio: true,
        hasVideo: true,
        downloadUrl: fbHd,
      });
    }
    if (isDifferent && fbSd) {
      formats.push({
        id: 'sd',
        format: 'mp4',
        quality: 'SD Video (Standard Quality)',
        resolution: '640x360',
        hasAudio: true,
        hasVideo: true,
        downloadUrl: fbSd,
      });
    }
    const audioSource = fbHd || fbSd;
    if (audioSource) {
      formats.push({
        id: 'mp3',
        format: 'mp3',
        quality: 'Original Audio (MP3)',
        hasAudio: true,
        hasVideo: false,
        downloadUrl: audioSource,
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

    // 1. Check stream cache first
    const cacheKey = `fb_${media.id}_${formatId}`;
    const cachedStream = fbStreamCache.get(cacheKey);
    if (cachedStream && cachedStream.expiry > Date.now()) {
      return {
        success: true,
        downloadUrl: cachedStream.url,
        message: 'Instant stream retrieved from cache.',
      };
    }

    // 2. Direct return if format has authentic direct fbcdn stream
    const format = media.formats.find((f) => f.id === formatId);
    let directUrl = format?.downloadUrl;
    if (!directUrl) {
      const anyFmtWithUrl = media.formats.find((f) => f.downloadUrl && f.downloadUrl.startsWith('http'));
      if (anyFmtWithUrl) directUrl = anyFmtWithUrl.downloadUrl;
    }

    if (directUrl && directUrl.startsWith('http') && !directUrl.includes('ssscdn.io') && !directUrl.includes('getmyfb')) {
      return {
        success: true,
        downloadUrl: wrapProxy(directUrl),
        message: 'Direct media download prepared successfully.',
      };
    }

    // 3. If direct stream is ssscdn or missing, try yt-dlp to guarantee full synchronized audio & video
    if (ytDlpRunner.isAvailable()) {
      try {
        const localResult = await ytDlpRunner.downloadMedia(media, formatId);
        if (localResult && localResult.serveUrl) {
          fbStreamCache.set(cacheKey, {
            url: localResult.serveUrl,
            expiry: Date.now() + 20 * 60 * 1000,
          });
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
        logger.warn('Facebook yt-dlp download attempt note', { msg: error.message });
      }
    }

    // 4. Fallback to direct URL proxy if available
    if (directUrl && directUrl.startsWith('http')) {
      return {
        success: true,
        downloadUrl: wrapProxy(directUrl),
        message: 'Direct media download prepared successfully.',
      };
    }

    throw new Error('Unable to extract Facebook video stream. Please ensure the post is public and contains a valid video.');
  }
}
