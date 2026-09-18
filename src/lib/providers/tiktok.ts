import { MediaFormat, MediaMetadata, PlatformType } from '../types';
import { MediaProvider, ProviderDownloadResult } from './base';
import { logger } from '../logger';
import { sanitizeFilename, probeUrlSize } from '../string-utils';
import { ytDlpRunner } from '../ytdlp';

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
  mediaCache.set(key, {
    data,
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes cache
  });
  if (mediaCache.size > 150) {
    const firstKey = mediaCache.keys().next().value;
    if (firstKey) mediaCache.delete(firstKey);
  }
}

interface TikWMData {
  id?: string | number;
  title?: string;
  cover?: string;
  origin_cover?: string;
  duration?: number;
  play?: string;
  hdplay?: string;
  music?: string;
  author?: {
    id?: string;
    unique_id?: string;
    nickname?: string;
    avatar?: string;
  };
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

    // Expand short links (e.g. /t/ZP83tPtQX/, vm.tiktok.com)
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
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          },
          signal: AbortSignal.timeout(7000),
        });
        if (headRes.url && (headRes.url.includes('/video/') || headRes.url.includes('/photo/') || headRes.url.includes('/@'))) {
          target = headRes.url.split('?')[0]; // strip tracking params
        }
      } catch (err) {
        logger.warn('Failed to expand short TikTok URL', { target, err });
      }
    }

    try {
      const parsed = new URL(target);
      if (parsed.hostname === 'tiktok.com') {
        parsed.hostname = 'www.tiktok.com';
        target = parsed.toString();
      }
    } catch {}

    return target;
  }

  /**
   * Tier 1: Direct serverless page extraction via TikTok Universal Data
   */
  private async extractUniversalData(url: string): Promise<{
    title?: string;
    author?: string;
    thumbnailUrl?: string;
    playUrl?: string;
    hdUrl?: string;
    musicUrl?: string;
    duration?: string;
  } | null> {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        signal: AbortSignal.timeout(6000),
      });

      if (!res.ok) return null;
      const html = await res.text();
      const match = html.match(
        /<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__" type="application\/json">([^<]+)<\/script>/
      );
      if (!match) return null;

      const data = JSON.parse(match[1]);
      const defaultScope = data['__DEFAULT_SCOPE__'];
      const itemDetail = defaultScope?.['webapp.video-detail']?.itemInfo?.itemStruct;

      if (!itemDetail) return null;

      const title = itemDetail.desc || undefined;
      const author = itemDetail.author?.nickname || itemDetail.author?.uniqueId ? `@${itemDetail.author.uniqueId}` : undefined;
      const thumbnailUrl = itemDetail.video?.cover || itemDetail.video?.originCover;
      const playUrl = itemDetail.video?.downloadAddr || itemDetail.video?.playAddr;
      const musicUrl = itemDetail.music?.playUrl;
      const duration = itemDetail.video?.duration ? `${itemDetail.video.duration}s` : undefined;

      return {
        title,
        author,
        thumbnailUrl,
        playUrl,
        hdUrl: playUrl,
        musicUrl,
        duration,
      };
    } catch (err: unknown) {
      const error = err as Error;
      logger.warn('TikTok Universal Data extraction error', { msg: error.message });
      return null;
    }
  }

  /**
   * Tier 2: Extraction via bundled yt-dlp binary
   */
  private async extractViaYtDlp(url: string): Promise<MediaMetadata | null> {
    if (!ytDlpRunner.isAvailable()) return null;
    try {
      return await ytDlpRunner.getMediaInfo(url);
    } catch (err: unknown) {
      const error = err as Error;
      logger.warn('TikTok yt-dlp extraction warning', { msg: error.message });
      return null;
    }
  }

  /**
   * Tier 3: TikWM public API fallback
   */
  private async fetchTikWM(url: string, rawUrl?: string): Promise<TikWMData | null> {
    const urlsToTry = [url];
    if (rawUrl && rawUrl !== url) urlsToTry.push(rawUrl);

    for (const u of urlsToTry) {
      try {
        const res = await fetch(`https://tikwm.com/api/?url=${encodeURIComponent(u)}`, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          },
          signal: AbortSignal.timeout(6500),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.code === 0 && data.data) {
            return data.data as TikWMData;
          }
        }
      } catch {}
    }
    return null;
  }

  /**
   * Tier 4: Official TikTok oEmbed for fast metadata
   */
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
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          Accept: 'application/json',
        },
        signal: AbortSignal.timeout(4000),
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
    } catch {}
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

    // Run Tier 1 (Universal Data), TikWM, and oEmbed in parallel
    const [universalData, tikwmData, oembedResult] = await Promise.all([
      this.extractUniversalData(resolvedUrl),
      this.fetchTikWM(resolvedUrl, rawUrl),
      this.fetchOfficialOEmbed(resolvedUrl),
    ]);

    // Consolidate metadata
    const finalTitle =
      universalData?.title ||
      tikwmData?.title?.trim() ||
      oembedResult?.title?.trim() ||
      `TikTok Video (${videoId})`;

    const finalAuthor =
      universalData?.author ||
      tikwmData?.author?.nickname ||
      (tikwmData?.author?.unique_id ? `@${tikwmData.author.unique_id}` : undefined) ||
      oembedResult?.author_name ||
      (oembedResult?.author_unique_id ? `@${oembedResult.author_unique_id}` : 'Unavailable');

    const finalThumbnail =
      universalData?.thumbnailUrl ||
      tikwmData?.cover ||
      tikwmData?.origin_cover ||
      oembedResult?.thumbnail_url ||
      undefined;

    const finalDuration =
      universalData?.duration ||
      (tikwmData?.duration ? `${tikwmData.duration}s` : undefined);

    // Pick best available stream URLs (Prioritize TikWM CDN urls which never return 403)
    const hdDownloadUrl =
      tikwmData?.hdplay ||
      tikwmData?.play ||
      universalData?.hdUrl ||
      universalData?.playUrl ||
      undefined;

    const sdDownloadUrl =
      tikwmData?.play ||
      tikwmData?.hdplay ||
      universalData?.playUrl ||
      undefined;

    const mp3DownloadUrl =
      tikwmData?.music ||
      universalData?.musicUrl ||
      undefined;

    const [hdSize, sdSize, mp3Size] = await Promise.all([
      hdDownloadUrl ? probeUrlSize(hdDownloadUrl) : Promise.resolve(undefined),
      sdDownloadUrl && sdDownloadUrl !== hdDownloadUrl ? probeUrlSize(sdDownloadUrl) : Promise.resolve(undefined),
      mp3DownloadUrl ? probeUrlSize(mp3DownloadUrl) : Promise.resolve(undefined),
    ]);

    const formats: MediaFormat[] = [
      {
        id: 'hd',
        format: 'mp4',
        quality: 'HD (No Watermark)',
        resolution: '1080x1920',
        hasAudio: true,
        hasVideo: true,
        downloadUrl: hdDownloadUrl,
        fileSize: hdSize,
      },
      {
        id: 'sd',
        format: 'mp4',
        quality: 'Standard (No Watermark)',
        resolution: '720x1280',
        hasAudio: true,
        hasVideo: true,
        downloadUrl: sdDownloadUrl,
        fileSize: sdSize || hdSize,
      },
      {
        id: 'mp3',
        format: 'mp3',
        quality: 'Original Audio',
        hasAudio: true,
        hasVideo: false,
        downloadUrl: mp3DownloadUrl,
        fileSize: mp3Size,
      },
    ];

    // If stream URLs were not found via Tier 1 or Tier 3, attempt Tier 2 yt-dlp fallback
    if (!hdDownloadUrl && ytDlpRunner.isAvailable()) {
      try {
        const ytdlpMeta = await this.extractViaYtDlp(resolvedUrl);
        if (ytdlpMeta && ytdlpMeta.formats.length > 0) {
          // Merge formats from yt-dlp
          setInCache(resolvedUrl, ytdlpMeta);
          setInCache(rawUrl, ytdlpMeta);
          return ytdlpMeta;
        }
      } catch {}
    }

    const textMatches = (finalTitle || '').match(/#([a-zA-Z0-9_\u0600-\u06FF]+)/g) || [];
    const hashtags: string[] = Array.from(new Set<string>(textMatches));

    const result: MediaMetadata = {
      id: String(tikwmData?.id || oembedResult?.video_id || videoId),
      platform: 'tiktok',
      title: finalTitle,
      description: finalTitle,
      hashtags,
      author: finalAuthor,
      duration: finalDuration,
      thumbnailUrl: finalThumbnail,
      sourceUrl: resolvedUrl,
      formats,
      requiresProviderSetup: false,
    };

    setInCache(resolvedUrl, result);
    setInCache(rawUrl, result);
    setInCache(result.id, result);

    return result;
  }

  getDownloadOptions(media: MediaMetadata): MediaFormat[] {
    return media.formats || [];
  }

  async download(media: MediaMetadata, formatId: string): Promise<ProviderDownloadResult> {
    const isMp3 = formatId.toLowerCase().includes('mp3') || formatId.toLowerCase().includes('audio');
    const ext = isMp3 ? 'mp3' : 'mp4';
    const cleanTitle = sanitizeFilename(media.title || 'TikTok_Video', ext);

    const wrapProxy = (rawUrl: string) => {
      if (rawUrl.startsWith('/api/download/file') || rawUrl.startsWith('/api/download/serve')) return rawUrl;
      return `/api/download/file?url=${encodeURIComponent(rawUrl)}&title=${encodeURIComponent(cleanTitle)}&ext=${ext}`;
    };

    // 1. Direct return if format already has prepared download URL
    const format = media.formats.find((f) => f.id === formatId);
    if (format && format.downloadUrl) {
      return {
        success: true,
        downloadUrl: wrapProxy(format.downloadUrl),
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
          downloadUrl: wrapProxy(cachedFormat.downloadUrl),
          message: 'Direct media download prepared successfully.',
        };
      }
    }

    // 3. Re-extract via Universal Data (Tier 1)
    const resolvedUrl = await this.resolveCanonicalUrl(media.sourceUrl);
    const uData = await this.extractUniversalData(resolvedUrl);
    if (uData) {
      const dlUrl = isMp3 ? uData.musicUrl : (uData.hdUrl || uData.playUrl);
      if (dlUrl) {
        if (format) format.downloadUrl = dlUrl;
        return {
          success: true,
          downloadUrl: wrapProxy(dlUrl),
          message: 'Direct media download prepared successfully.',
        };
      }
    }

    // 4. Fallback to TikWM (Tier 3)
    const tikwmData = await this.fetchTikWM(resolvedUrl, media.sourceUrl);
    if (tikwmData) {
      const dlUrl = isMp3 ? (tikwmData.music as string) : ((tikwmData.hdplay as string) || (tikwmData.play as string));
      if (dlUrl) {
        if (format) format.downloadUrl = dlUrl;
        return {
          success: true,
          downloadUrl: wrapProxy(dlUrl),
          message: 'Direct media download prepared successfully.',
        };
      }
    }

    // 5. Fallback to yt-dlp stream extractor (Tier 2)
    if (ytDlpRunner.isAvailable()) {
      try {
        const streamUrl = await ytDlpRunner.getStreamUrl(resolvedUrl, formatId);
        if (streamUrl) {
          return {
            success: true,
            downloadUrl: wrapProxy(streamUrl),
            message: 'Direct media stream prepared successfully.',
          };
        }
      } catch (err: unknown) {
        const error = err as Error;
        logger.warn('TikTok yt-dlp stream extraction failed', { msg: error.message });
      }
    }

    return {
      success: false,
      message: 'Unable to process this video. Please check the URL or try another supported TikTok link.',
    };
  }
}
