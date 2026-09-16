import { MediaFormat, MediaMetadata, PlatformType } from '../types';
import { MediaProvider, ProviderDownloadResult } from './base';
import { logger } from '../logger';

// 5-minute in-memory cache to prevent hitting rate limits between media-info & download calls
interface CacheEntry {
  data: MediaMetadata;
  expiresAt: number;
}
const mediaCache = new Map<string, CacheEntry>();

function getFromCache(key: string): MediaMetadata | null {
  const entry = mediaCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    mediaCache.delete(key);
    return null;
  }
  return entry.data;
}

function setInCache(key: string, data: MediaMetadata) {
  // Retain for 5 minutes
  mediaCache.set(key, {
    data,
    expiresAt: Date.now() + 5 * 60 * 1000,
  });

  // Limit cache size to 100 items
  if (mediaCache.size > 100) {
    const firstKey = mediaCache.keys().next().value;
    if (firstKey) mediaCache.delete(firstKey);
  }
}

export class TikTokAdapter extends MediaProvider {
  readonly platform: PlatformType = 'tiktok';
  readonly displayName = 'TikTok';

  canHandle(url: string): boolean {
    return (
      url.includes('tiktok.com') ||
      url.includes('vm.tiktok.com') ||
      url.includes('vt.tiktok.com')
    );
  }

  detect(url: string): PlatformType {
    return this.canHandle(url) ? 'tiktok' : 'unknown';
  }

  private extractVideoId(url: string): string | null {
    try {
      const match = url.match(/\/video\/(\d+)/i) || url.match(/\/photo\/(\d+)/i);
      if (match) return match[1];
      const shortMatch = url.match(/(?:vm|vt)\.tiktok\.com\/([A-Za-z0-9_-]+)/i);
      if (shortMatch) return shortMatch[1];
      const tMatch = url.match(/\/t\/([A-Za-z0-9_-]+)/i);
      if (tMatch) return tMatch[1];
      return null;
    } catch {
      return null;
    }
  }

  private async resolveCanonicalUrl(rawUrl: string): Promise<string> {
    let target = rawUrl.trim();
    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      target = `https://${target}`;
    }

    // Expand short links if needed
    if (
      target.includes('vm.tiktok.com') ||
      target.includes('vt.tiktok.com') ||
      target.includes('/t/')
    ) {
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
        if (headRes.url && headRes.url.includes('tiktok.com/@')) {
          target = headRes.url;
        }
      } catch (err) {
        logger.warn('Failed to expand short TikTok URL', { target, err });
      }
    }

    // Ensure canonical starts with www.tiktok.com for oEmbed & TikWM compatibility
    try {
      const parsed = new URL(target);
      if (parsed.hostname === 'tiktok.com') {
        parsed.hostname = 'www.tiktok.com';
        target = parsed.toString();
      }
    } catch {}

    return target;
  }

  private async fetchOfficialOEmbed(url: string): Promise<{
    title?: string;
    author_name?: string;
    author_unique_id?: string;
    thumbnail_url?: string;
    video_id?: string;
  } | null> {
    try {
      const oembedEndpoint = `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`;
      const res = await fetch(oembedEndpoint, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          Accept: 'application/json',
        },
        signal: AbortSignal.timeout(6000),
      });

      if (res.ok) {
        const data = await res.json();
        return {
          title: data.title,
          author_name: data.author_name,
          author_unique_id: data.author_unique_id,
          thumbnail_url: data.thumbnail_url,
          video_id: data.embed_product_id,
        };
      }
    } catch (e) {
      logger.warn('TikTok oEmbed request error', { url, err: e });
    }
    return null;
  }

  private async fetchTikWM(url: string, rawUrl?: string): Promise<any | null> {
    const urlsToTry = [url];
    if (rawUrl && rawUrl !== url) urlsToTry.push(rawUrl);

    for (const u of urlsToTry) {
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          if (attempt > 0) {
            // Short backoff if rate-limited
            await new Promise((r) => setTimeout(r, 850));
          }

          const res = await fetch(`https://tikwm.com/api/?url=${encodeURIComponent(u)}`, {
            headers: {
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            },
            signal: AbortSignal.timeout(9000),
          });

          if (res.ok) {
            const data = await res.json();
            if (data.code === 0 && data.data) {
              return data.data;
            }
          }
        } catch {}
      }
    }
    return null;
  }

  async getMediaInfo(rawUrl: string): Promise<MediaMetadata> {
    const resolvedUrl = await this.resolveCanonicalUrl(rawUrl);
    const videoId = this.extractVideoId(resolvedUrl) || this.extractVideoId(rawUrl) || 'tiktok-media';

    // Check cache first
    const cached = getFromCache(resolvedUrl) || getFromCache(rawUrl) || getFromCache(videoId);
    if (cached) {
      return cached;
    }

    // Run official TikTok oEmbed and TikWM stream resolver in parallel
    const [oembedResult, tikwmData] = await Promise.all([
      this.fetchOfficialOEmbed(resolvedUrl),
      this.fetchTikWM(resolvedUrl, rawUrl),
    ]);

    // Build consolidated metadata
    const finalTitle =
      tikwmData?.title?.trim() ||
      oembedResult?.title?.trim() ||
      `TikTok Video (${videoId})`;

    const finalAuthor =
      tikwmData?.author?.nickname ||
      tikwmData?.author?.unique_id ||
      oembedResult?.author_name ||
      (oembedResult?.author_unique_id ? `@${oembedResult.author_unique_id}` : 'TikTok Creator');

    const finalThumbnail =
      tikwmData?.cover ||
      tikwmData?.origin_cover ||
      oembedResult?.thumbnail_url ||
      undefined;

    const finalDuration = tikwmData?.duration ? `${tikwmData.duration}s` : undefined;

    const formats: MediaFormat[] = [
      {
        id: 'hd',
        format: 'mp4',
        quality: 'HD (No Watermark)',
        resolution: '1080x1920',
        hasAudio: true,
        hasVideo: true,
        downloadUrl: tikwmData?.hdplay || tikwmData?.play || undefined,
      },
      {
        id: 'sd',
        format: 'mp4',
        quality: 'Standard (No Watermark)',
        resolution: '720x1280',
        hasAudio: true,
        hasVideo: true,
        downloadUrl: tikwmData?.play || undefined,
      },
      {
        id: 'mp3',
        format: 'mp3',
        quality: 'Original Audio',
        hasAudio: true,
        hasVideo: false,
        downloadUrl: tikwmData?.music || undefined,
      },
    ];

    const result: MediaMetadata = {
      id: String(tikwmData?.id || oembedResult?.video_id || videoId),
      platform: 'tiktok',
      title: finalTitle,
      author: finalAuthor,
      duration: finalDuration,
      thumbnailUrl: finalThumbnail,
      sourceUrl: resolvedUrl,
      formats,
      requiresProviderSetup: false,
    };

    // Save in cache
    setInCache(resolvedUrl, result);
    setInCache(rawUrl, result);
    setInCache(result.id, result);

    return result;
  }

  getDownloadOptions(media: MediaMetadata): MediaFormat[] {
    return media.formats || [];
  }

  async download(media: MediaMetadata, formatId: string): Promise<ProviderDownloadResult> {
    // 1. Check if the format already has a prepared download URL
    const format = media.formats.find((f) => f.id === formatId);
    if (format && format.downloadUrl) {
      return {
        success: true,
        downloadUrl: format.downloadUrl,
        message: 'Direct media download prepared successfully.',
      };
    }

    // 2. Check cached media entry
    const cached = getFromCache(media.sourceUrl) || getFromCache(media.id);
    if (cached) {
      const cachedFormat = cached.formats.find((f) => f.id === formatId);
      if (cachedFormat && cachedFormat.downloadUrl) {
        return {
          success: true,
          downloadUrl: cachedFormat.downloadUrl,
          message: 'Direct media download prepared successfully.',
        };
      }
    }

    // 3. Re-fetch from TikWM with retry if needed
    try {
      const resolvedUrl = await this.resolveCanonicalUrl(media.sourceUrl);
      const tikwmData = await this.fetchTikWM(resolvedUrl, media.sourceUrl);

      if (tikwmData) {
        const isMp3 = formatId.toLowerCase().includes('mp3');
        const dlUrl = isMp3 ? tikwmData.music : (tikwmData.hdplay || tikwmData.play);

        if (dlUrl) {
          // Update cached entry
          if (format) format.downloadUrl = dlUrl;
          return {
            success: true,
            downloadUrl: dlUrl,
            message: 'Direct media download prepared successfully.',
          };
        }
      }
    } catch (err) {
      logger.error('TikTok download extraction error', err);
    }

    return {
      success: false,
      message: 'Unable to process TikTok download stream. Please try again in a moment.',
    };
  }
}
