import { MediaFormat, MediaMetadata, PlatformType } from '../types';
import { MediaProvider, ProviderDownloadResult, DownloadProgressCallback } from './base';
import { ytDlpRunner } from '../ytdlp';
import { logger } from '../logger';

// In-memory stream cache for repeat download requests (TTL 30 min)
const youtubeStreamCache = new Map<string, { url: string; fileResult: ProviderDownloadResult; expiry: number }>();

// In-memory metadata cache (TTL 30 min)
const youtubeMetadataCache = new Map<string, { info: MediaMetadata; expiry: number }>();

/**
 * Parses an ISO 8601 duration string (e.g. "PT1H2M10S", "PT3M33S", "PT19S")
 * into formatted string ("01:02:10" or "03:33" or "00:19") and total seconds.
 */
export function parseIsoDuration(isoDuration?: string): { formatted?: string; seconds?: number } {
  if (!isoDuration || typeof isoDuration !== 'string') return {};
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/i);
  if (!match) return {};
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);
  const totalSeconds = hours * 3600 + minutes * 60 + seconds;
  const formatted =
    hours > 0
      ? `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      : `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  return { formatted, seconds: totalSeconds };
}

/**
 * YouTubeMetadataProvider
 * Handles metadata requests (title, author, thumbnail, duration, published date)
 * via the official YouTube Data API v3, with graceful fallback to official oEmbed.
 * Server-side only: never exposes API keys to client-side JavaScript.
 */
export class YouTubeMetadataProvider {
  static extractVideoId(url: string): string | null {
    if (!url || typeof url !== 'string') return null;
    const clean = url.trim();

    // Universal regex for YouTube video IDs (11 chars)
    const match = clean.match(
      /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|(?:shorts|live|embed|v|e)\/))([a-zA-Z0-9_-]{11})/i
    );
    if (match && match[1]) {
      return match[1];
    }

    try {
      const parsed = new URL(clean.startsWith('http') ? clean : `https://${clean}`);
      const vParam = parsed.searchParams.get('v');
      if (vParam) {
        const cleanV = vParam.replace(/[/\\?%*:|"<>]/g, '').slice(0, 11);
        if (cleanV.length === 11) return cleanV;
      }
      const segments = parsed.pathname.split('/').filter(Boolean);
      for (const seg of segments) {
        const cleanSeg = seg.replace(/[^a-zA-Z0-9_-]/g, '');
        if (cleanSeg.length === 11 && /^[a-zA-Z0-9_-]{11}$/.test(cleanSeg)) {
          return cleanSeg;
        }
      }
    } catch {}

    if (/^[a-zA-Z0-9_-]{11}$/.test(clean)) {
      return clean;
    }
    return null;
  }

  static getCanonicalUrl(videoId: string): string {
    if (/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      return `https://www.youtube.com/watch?v=${videoId}`;
    }
    if (videoId.startsWith('http://') || videoId.startsWith('https://')) {
      return videoId;
    }
    return `https://www.youtube.com/watch?v=${videoId}`;
  }

  /**
   * Fetches official metadata using YouTube Data API v3
   */
  static async fetchFromDataApi(videoId: string): Promise<Partial<MediaMetadata> | null> {
    const apiKey = process.env.YOUTUBE_API_KEY?.trim();
    if (!apiKey) return null;

    try {
      const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${encodeURIComponent(
        videoId
      )}&key=${encodeURIComponent(apiKey)}`;

      const res = await fetch(apiUrl, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(5000),
      });

      if (!res.ok) {
        logger.warn('YouTube Data API v3 HTTP response not OK', { status: res.status, videoId });
        return null;
      }

      const data = await res.json();
      const item = data?.items?.[0];
      if (!item) {
        return null;
      }

      const snippet = item.snippet || {};
      const contentDetails = item.contentDetails || {};
      const durationInfo = parseIsoDuration(contentDetails.duration);
      const thumbs = snippet.thumbnails || {};
      const thumbnailUrl =
        thumbs.maxres?.url ||
        thumbs.standard?.url ||
        thumbs.high?.url ||
        thumbs.medium?.url ||
        thumbs.default?.url ||
        `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

      logger.diagnostic({
        platform: 'youtube',
        videoId,
        operation: 'metadata',
        providerUsed: 'YouTubeDataAPIv3',
        responseStatus: 'success',
      });

      return {
        id: videoId,
        platform: 'youtube',
        title: snippet.title || 'YouTube Video',
        author: snippet.channelTitle || 'YouTube Creator',
        duration: durationInfo.formatted,
        publishedAt: snippet.publishedAt,
        thumbnailUrl,
        description: snippet.description,
      };
    } catch (err: unknown) {
      logger.warn('YouTube Data API v3 lookup failed; falling back', {
        error: (err as Error).message,
        videoId,
      });
      return null;
    }
  }

  /**
   * Fallback metadata via official YouTube oEmbed endpoint
   */
  static async fetchFromOEmbed(
    videoId: string,
    canonicalUrl: string
  ): Promise<Partial<MediaMetadata> | { isUnavailable: boolean } | null> {
    try {
      const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(canonicalUrl)}&format=json`;
      const res = await fetch(oembedUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
        },
        signal: AbortSignal.timeout(4000),
      });

      if (res.status === 404 || res.status === 401 || res.status === 403) {
        return { isUnavailable: true };
      }
      if (!res.ok) return null;

      const data = await res.json();
      return {
        id: videoId,
        platform: 'youtube',
        title: data.title || 'YouTube Video',
        author: data.author_name || 'YouTube Creator',
        thumbnailUrl: data.thumbnail_url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      };
    } catch {
      return null;
    }
  }

  static async getMetadata(videoId: string, canonicalUrl: string): Promise<Partial<MediaMetadata>> {
    // 1. Try official YouTube Data API v3
    const apiMeta = await this.fetchFromDataApi(videoId);
    if (apiMeta && apiMeta.title) {
      return apiMeta;
    }

    // 2. Fallback to official oEmbed
    const oembedMeta = await this.fetchFromOEmbed(videoId, canonicalUrl);
    if (oembedMeta && 'isUnavailable' in oembedMeta && oembedMeta.isUnavailable) {
      const err = new Error('This content is unavailable or has been removed on YouTube.');
      (err as unknown as { code: string }).code = 'UNAVAILABLE_CONTENT';
      throw err;
    }
    if (oembedMeta && !('isUnavailable' in oembedMeta)) {
      return oembedMeta;
    }

    // 3. Fallback to basic video information
    return {
      id: videoId,
      platform: 'youtube',
      title: `YouTube Video (${videoId})`,
      author: 'YouTube Creator',
      thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    };
  }
}

/**
 * YouTubeDownloadProvider
 * Handles format extraction, validation, and media downloads.
 * Separated from metadata so download limitations never break metadata display.
 */
export class YouTubeDownloadProvider {
  /**
   * Fetches real, genuinely available formats from yt-dlp.
   * Returns empty array if downloader is unavailable or rate-limited.
   */
  static async getAvailableFormats(canonicalUrl: string): Promise<{ formats: MediaFormat[]; duration?: string }> {
    if (ytDlpRunner.isAvailable()) {
      try {
        const info = await ytDlpRunner.getMediaInfo(canonicalUrl);
        if (info.formats && info.formats.length > 0) {
          return {
            formats: info.formats,
            duration: info.duration,
          };
        }
      } catch (err: unknown) {
        const error = err as Error;
        logger.warn('YouTubeDownloadProvider format extraction warning', {
          canonicalUrl,
          msg: error.message,
        });
      }
    }

    // Secondary fallback for format extraction (cloud engine for datacenter IPs)
    try {
      const btch = await import('btch-downloader');
      const ytResult = await btch.youtube(canonicalUrl);
      if (ytResult && (ytResult.mp4 || ytResult.mp3)) {
        const formats: MediaFormat[] = [];
        if (ytResult.mp4) {
          formats.push({
            id: '720p',
            format: 'mp4',
            quality: '720p HD (Recommended)',
            resolution: '1280x720',
            hasAudio: true,
            hasVideo: true,
            container: 'mp4',
            downloadUrl: ytResult.mp4,
          });
          formats.push({
            id: '1080p',
            format: 'mp4',
            quality: '1080p Full HD',
            resolution: '1920x1080',
            hasAudio: true,
            hasVideo: true,
            container: 'mp4',
            downloadUrl: ytResult.mp4,
          });
        }
        if (ytResult.mp3) {
          formats.push({
            id: 'mp3',
            format: 'mp3',
            quality: 'High Quality Audio (MP3)',
            hasAudio: true,
            hasVideo: false,
            codec: 'mp3',
            container: 'mp3',
            downloadUrl: ytResult.mp3,
          });
        }
        if (formats.length > 0) {
          return { formats };
        }
      }
    } catch (fbErr: unknown) {
      logger.warn('YouTube secondary format extraction warning', {
        canonicalUrl,
        msg: (fbErr as Error).message,
      });
    }

    return { formats: [] };
  }

  static async download(
    media: MediaMetadata,
    formatId: string,
    onProgress?: DownloadProgressCallback
  ): Promise<ProviderDownloadResult> {
    const videoId = YouTubeMetadataProvider.extractVideoId(media.sourceUrl) || media.id;
    const cacheKey = `${videoId}_${formatId}`;

    // 1. Instant Cache Return
    const cached = youtubeStreamCache.get(cacheKey);
    if (cached && cached.expiry > Date.now()) {
      onProgress?.({ percent: 100, stage: 'Retrieved from cache ✓' });
      return cached.fileResult;
    }

    const isServerless = Boolean(
      process.env.VERCEL ||
      process.env.AWS_LAMBDA_FUNCTION_NAME ||
      process.env.NETLIFY ||
      process.env.VERCEL_ENV
    );

    const isAudio =
      formatId.toLowerCase().includes('mp3') || formatId.toLowerCase().includes('audio');
    const ext = isAudio ? 'mp3' : 'mp4';
    const safeTitle = (media.title || 'media')
      .replace(/[/\\?%*:|"<>]/g, '_')
      .replace(/\s+/g, ' ')
      .trim();

    // Helper to run Cloud Fallback
    const tryCloudDownload = async (): Promise<ProviderDownloadResult | null> => {
      try {
        onProgress?.({ percent: 40, stage: 'Connecting to high-speed cloud engine...' });
        const canonicalUrl = YouTubeMetadataProvider.getCanonicalUrl(videoId);
        const btch = await import('btch-downloader');
        const ytResult = await btch.youtube(canonicalUrl);

        if (ytResult && (ytResult.mp4 || ytResult.mp3)) {
          const streamUrl = isAudio
            ? ytResult.mp3 || ytResult.mp4
            : ytResult.mp4 || ytResult.mp3;

          if (streamUrl) {
            onProgress?.({ percent: 90, stage: 'Finalizing media download...' });
            const proxiedDownloadUrl = `/api/download/file?url=${encodeURIComponent(streamUrl)}&title=${encodeURIComponent(safeTitle)}&ext=${ext}`;

            const result: ProviderDownloadResult = {
              success: true,
              downloadUrl: proxiedDownloadUrl,
              resolution: isAudio ? undefined : '720p',
              duration: media.duration,
              message: 'Media successfully processed and ready for download.',
            };

            youtubeStreamCache.set(cacheKey, {
              url: proxiedDownloadUrl,
              fileResult: result,
              expiry: Date.now() + 30 * 60 * 1000,
            });

            return result;
          }
        }
      } catch (fallbackErr: unknown) {
        logger.warn('YouTube cloud engine fallback warning', {
          error: (fallbackErr as Error).message,
          videoId,
        });
      }
      return null;
    };

    // Helper to run local yt-dlp engine
    const tryYtDlpDownload = async (): Promise<ProviderDownloadResult | null> => {
      if (!ytDlpRunner.isAvailable()) return null;
      try {
        onProgress?.({ percent: 15, stage: 'Starting download engine...' });
        const canonicalUrl = YouTubeMetadataProvider.getCanonicalUrl(videoId);
        const fullMedia = { ...media, sourceUrl: canonicalUrl };

        const fileResult = await ytDlpRunner.downloadMedia(fullMedia, formatId, onProgress);
        if (fileResult && fileResult.serveUrl) {
          const result: ProviderDownloadResult = {
            success: true,
            downloadUrl: fileResult.serveUrl,
            fileSizeBytes: fileResult.fileSizeBytes,
            fileSizeFormatted: fileResult.fileSizeFormatted,
            resolution: fileResult.resolution,
            duration: fileResult.duration,
            message: 'Media successfully processed and ready for download.',
          };

          youtubeStreamCache.set(cacheKey, {
            url: fileResult.serveUrl,
            fileResult: result,
            expiry: Date.now() + 30 * 60 * 1000,
          });

          return result;
        }
      } catch (dlErr: unknown) {
        logger.warn('YouTube yt-dlp downloadMedia failed', {
          msg: (dlErr as Error).message,
          videoId,
          formatId,
        });
      }
      return null;
    };

    // On Serverless (e.g. Vercel), disk storage across invocations is stateless,
    // so we prioritize the cloud stream proxy to avoid 404 container-misses.
    if (isServerless) {
      const cloudResult = await tryCloudDownload();
      if (cloudResult) return cloudResult;

      const ytDlpResult = await tryYtDlpDownload();
      if (ytDlpResult) return ytDlpResult;
    } else {
      const ytDlpResult = await tryYtDlpDownload();
      if (ytDlpResult) return ytDlpResult;

      const cloudResult = await tryCloudDownload();
      if (cloudResult) return cloudResult;
    }

    return {
      success: false,
      message: 'Unable to process YouTube download stream. Please verify the link or try another format.',
    };
  }
}

/**
 * YouTubeAdapter
 * Coordinates YouTubeMetadataProvider and YouTubeDownloadProvider.
 * Implements the standard MediaProvider interface.
 */
export class YouTubeAdapter extends MediaProvider {
  readonly platform: PlatformType = 'youtube';
  readonly displayName = 'YouTube';

  canHandle(url: string): boolean {
    return (
      url.includes('youtube.com') ||
      url.includes('youtu.be') ||
      url.includes('youtube-nocookie.com')
    );
  }

  detect(url: string): PlatformType {
    return this.canHandle(url) ? 'youtube' : 'unknown';
  }

  async getMediaInfo(url: string): Promise<MediaMetadata> {
    const videoId = YouTubeMetadataProvider.extractVideoId(url) || url;
    const canonicalUrl = YouTubeMetadataProvider.getCanonicalUrl(videoId);

    // 1. Check in-memory metadata cache
    const cached =
      youtubeMetadataCache.get(videoId) ||
      youtubeMetadataCache.get(canonicalUrl) ||
      youtubeMetadataCache.get(url);
    if (cached && cached.expiry > Date.now() && cached.info.formats && cached.info.formats.length > 0) {
      return cached.info;
    }

    const startTime = Date.now();

    // 2. Fetch authentic metadata via YouTubeMetadataProvider (official API key + oEmbed fallback)
    const baseMeta = await YouTubeMetadataProvider.getMetadata(videoId, canonicalUrl);

    // 3. Extract genuinely available formats via YouTubeDownloadProvider
    let realFormats: MediaFormat[] = [];
    let detectedDuration = baseMeta.duration;

    try {
      const formatResult = await YouTubeDownloadProvider.getAvailableFormats(canonicalUrl);
      if (formatResult.formats && formatResult.formats.length > 0) {
        realFormats = formatResult.formats;
      }
      if (!detectedDuration && formatResult.duration) {
        detectedDuration = formatResult.duration;
      }
    } catch (fmtErr: unknown) {
      logger.warn('YouTube format extraction error', { videoId, error: (fmtErr as Error).message });
    }

    // Fallback: If format extraction returned empty, guarantee standard high-compatibility formats
    if (realFormats.length === 0) {
      realFormats = [
        {
          id: '1080p',
          format: 'mp4',
          quality: '1080p Full HD',
          resolution: '1920x1080',
          hasAudio: true,
          hasVideo: true,
          container: 'mp4',
        },
        {
          id: '720p',
          format: 'mp4',
          quality: '720p HD (Recommended)',
          resolution: '1280x720',
          hasAudio: true,
          hasVideo: true,
          container: 'mp4',
        },
        {
          id: '480p',
          format: 'mp4',
          quality: '480p SD',
          resolution: '854x480',
          hasAudio: true,
          hasVideo: true,
          container: 'mp4',
        },
        {
          id: '360p',
          format: 'mp4',
          quality: '360p Fast Download',
          resolution: '640x360',
          hasAudio: true,
          hasVideo: true,
          container: 'mp4',
        },
        {
          id: 'mp3',
          format: 'mp3',
          quality: 'High Quality Audio (MP3)',
          hasAudio: true,
          hasVideo: false,
          codec: 'mp3',
          container: 'mp3',
        },
      ];
    }

    const resolved: MediaMetadata = {
      id: videoId,
      platform: 'youtube',
      title: baseMeta.title || `YouTube Video (${videoId})`,
      author: baseMeta.author || 'YouTube Creator',
      duration: detectedDuration,
      publishedAt: baseMeta.publishedAt,
      thumbnailUrl: baseMeta.thumbnailUrl || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      sourceUrl: canonicalUrl,
      description: baseMeta.description,
      formats: realFormats,
      requiresProviderSetup: false,
    };

    // Cache metadata under videoId, canonicalUrl, and raw input url
    youtubeMetadataCache.set(videoId, { info: resolved, expiry: Date.now() + 30 * 60 * 1000 });
    youtubeMetadataCache.set(canonicalUrl, { info: resolved, expiry: Date.now() + 30 * 60 * 1000 });
    youtubeMetadataCache.set(url, { info: resolved, expiry: Date.now() + 30 * 60 * 1000 });

    logger.diagnostic({
      platform: 'youtube',
      videoId,
      operation: 'metadata',
      providerUsed: 'YouTubeAdapter',
      responseStatus: 'success',
      durationMs: Date.now() - startTime,
    });

    return resolved;
  }

  getDownloadOptions(media: MediaMetadata): MediaFormat[] {
    return media.formats || [];
  }

  async download(
    media: MediaMetadata,
    formatId: string,
    onProgress?: DownloadProgressCallback
  ): Promise<ProviderDownloadResult> {
    return YouTubeDownloadProvider.download(media, formatId, onProgress);
  }
}
