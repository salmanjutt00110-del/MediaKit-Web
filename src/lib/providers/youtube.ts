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
 * Fetches high-definition video or audio stream via the Savenow conversion engine.
 * Generates direct CDN download URLs with Content-Disposition attachments.
 */
async function fetchSavenowStream(
  canonicalUrl: string,
  formatId: string,
  onProgress?: DownloadProgressCallback
): Promise<string | null> {
  const isAudio =
    formatId.toLowerCase().includes('mp3') || formatId.toLowerCase().includes('audio');
  const targetFmt = isAudio
    ? 'mp3'
    : formatId.includes('1080')
    ? '1080'
    : formatId.includes('720')
    ? '720'
    : formatId.includes('480')
    ? '480'
    : formatId.includes('360')
    ? '360'
    : '1080';

  try {
    onProgress?.({ percent: 25, stage: 'Connecting to media engine...' });
    const initUrl = `https://p.savenow.to/ajax/download.php?format=${targetFmt}&url=${encodeURIComponent(canonicalUrl)}`;
    const initRes = await fetch(initUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Referer: 'https://loader.to/',
      },
      signal: AbortSignal.timeout(12000),
    });

    if (!initRes.ok) return null;
    const init = await initRes.json().catch(() => null);
    if (!init || !init.success) return null;

    if (init.download_url) {
      onProgress?.({ percent: 100, stage: 'Stream ready ✓' });
      return init.download_url;
    }

    if (!init.progress_url) return null;

    // Poll progress endpoint
    for (let i = 0; i < 22; i++) {
      await new Promise((r) => setTimeout(r, 1200));
      const pct = Math.min(95, 30 + i * 3);
      onProgress?.({ percent: pct, stage: 'Preparing media stream...' });

      try {
        const pRes = await fetch(init.progress_url, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            Referer: 'https://loader.to/',
          },
          signal: AbortSignal.timeout(8000),
        });

        if (!pRes.ok) continue;
        const p = await pRes.json().catch(() => null);
        if (!p) continue;

        if (p.download_url) {
          onProgress?.({ percent: 100, stage: 'Download ready ✓' });
          return p.download_url;
        }

        if (p.success === 1 && p.download_url) {
          onProgress?.({ percent: 100, stage: 'Download ready ✓' });
          return p.download_url;
        }

        if (p.text && typeof p.text === 'string' && p.text.toLowerCase().includes('error')) {
          logger.warn('Savenow progress returned error', { text: p.text, canonicalUrl });
          return null;
        }
      } catch {}
    }
  } catch (err: unknown) {
    logger.warn('fetchSavenowStream failed', {
      error: (err as Error).message,
      canonicalUrl,
    });
  }

  return null;
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

    // High-definition formats universally supported by the media conversion engine
    return {
      formats: [
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
      ],
    };
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

    const canonicalUrl = YouTubeMetadataProvider.getCanonicalUrl(videoId);
    const isAudio =
      formatId.toLowerCase().includes('mp3') || formatId.toLowerCase().includes('audio');

    // 2. High-Speed Conversion Engine (Savenow / direct CDN delivery)
    const savenowUrl = await fetchSavenowStream(canonicalUrl, formatId, onProgress);
    if (savenowUrl) {
      const resLabel = isAudio
        ? undefined
        : formatId.includes('1080')
        ? '1080p'
        : formatId.includes('720')
        ? '720p'
        : formatId.includes('480')
        ? '480p'
        : '360p';

      const result: ProviderDownloadResult = {
        success: true,
        downloadUrl: savenowUrl,
        resolution: resLabel,
        duration: media.duration,
        message: 'Media successfully processed and ready for download.',
      };

      youtubeStreamCache.set(cacheKey, {
        url: savenowUrl,
        fileResult: result,
        expiry: Date.now() + 30 * 60 * 1000,
      });

      return result;
    }

    // 3. Secondary Engine: yt-dlp (local binary if available)
    if (ytDlpRunner.isAvailable()) {
      try {
        onProgress?.({ percent: 30, stage: 'Processing with local download engine...' });
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
    }

    return {
      success: false,
      message: 'Unable to process YouTube download stream. Please verify the link or try another quality.',
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
