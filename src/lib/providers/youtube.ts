import { MediaFormat, MediaMetadata, PlatformType } from '../types';
import { MediaProvider, ProviderDownloadResult, DownloadProgressCallback } from './base';
import { ytDlpRunner } from '../ytdlp';
import { logger } from '../logger';

// In-memory stream cache to make repeat downloads instantaneous
const youtubeStreamCache = new Map<string, { url: string; expiry: number }>();

// In-memory media info cache (30 minutes TTL)
const youtubeMediaInfoCache = new Map<string, { info: MediaMetadata; expiry: number }>();

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

  private extractVideoId(url: string): string | null {
    if (!url || typeof url !== 'string') return null;

    const clean = url.trim();

    // 1. Universal regex to match standard YouTube video IDs (11 chars)
    const match = clean.match(
      /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|(?:shorts|live|embed|v|e)\/))([a-zA-Z0-9_-]{11})/i
    );
    if (match && match[1]) {
      return match[1];
    }

    // 2. URL searchParams or pathname fallback
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

    // 3. Raw 11-char ID check (e.g. if user pasted just the ID)
    if (/^[a-zA-Z0-9_-]{11}$/.test(clean)) {
      return clean;
    }

    return null;
  }

  private getCanonicalUrl(videoId: string): string {
    if (/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      return `https://www.youtube.com/watch?v=${videoId}`;
    }
    if (videoId.startsWith('http://') || videoId.startsWith('https://')) {
      return videoId;
    }
    return `https://www.youtube.com/watch?v=${videoId}`;
  }

  private async fetchOEmbedMetadata(videoId: string, canonicalUrl: string): Promise<MediaMetadata | null> {
    try {
      const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(canonicalUrl)}&format=json`;
      const res = await fetch(oembedUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
        },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) return null;
      const data = await res.json();
      return {
        id: videoId,
        platform: 'youtube',
        title: data.title || 'YouTube Video',
        author: data.author_name || 'YouTube Creator',
        thumbnailUrl: data.thumbnail_url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        sourceUrl: canonicalUrl,
        formats: [
          { id: '1080p', format: 'mp4', quality: '1080p Full HD', resolution: '1920x1080', hasAudio: true, hasVideo: true },
          { id: '720p', format: 'mp4', quality: '720p HD (Recommended)', resolution: '1280x720', hasAudio: true, hasVideo: true },
          { id: '480p', format: 'mp4', quality: '480p SD', resolution: '854x480', hasAudio: true, hasVideo: true },
          { id: '360p', format: 'mp4', quality: '360p Fast Download', resolution: '640x360', hasAudio: true, hasVideo: true },
          { id: 'mp3', format: 'mp3', quality: 'High Quality Audio (MP3)', hasAudio: true, hasVideo: false },
        ],
        requiresProviderSetup: false,
      };
    } catch {
      return null;
    }
  }

  async getMediaInfo(url: string): Promise<MediaMetadata> {
    const videoId = this.extractVideoId(url) || url;
    const canonicalUrl = this.getCanonicalUrl(videoId);

    // 1. Check in-memory cache
    const cached =
      youtubeMediaInfoCache.get(videoId) ||
      youtubeMediaInfoCache.get(canonicalUrl) ||
      youtubeMediaInfoCache.get(url);
    if (cached && cached.expiry > Date.now()) {
      return cached.info;
    }

    // 2. Extract authentic metadata & real formats via yt-dlp runner
    if (ytDlpRunner.isAvailable()) {
      try {
        const info = await ytDlpRunner.getMediaInfo(canonicalUrl);
        const resolved: MediaMetadata = {
          ...info,
          id: videoId,
          platform: 'youtube',
          sourceUrl: canonicalUrl,
        };

        youtubeMediaInfoCache.set(videoId, {
          info: resolved,
          expiry: Date.now() + 30 * 60 * 1000,
        });
        youtubeMediaInfoCache.set(canonicalUrl, {
          info: resolved,
          expiry: Date.now() + 30 * 60 * 1000,
        });

        return resolved;
      } catch (err: unknown) {
        const error = err as { code?: string; message?: string };
        if (error.code === 'PRIVATE_CONTENT' || error.code === 'UNAVAILABLE_CONTENT') {
          throw err;
        }
        logger.warn('YouTube yt-dlp getMediaInfo canonicalUrl failed, trying original url', {
          msg: error.message,
          canonicalUrl,
        });

        // Try with the raw input url if different from canonicalUrl
        if (url !== canonicalUrl) {
          try {
            const rawInfo = await ytDlpRunner.getMediaInfo(url);
            const resolved: MediaMetadata = {
              ...rawInfo,
              id: videoId,
              platform: 'youtube',
              sourceUrl: canonicalUrl,
            };
            youtubeMediaInfoCache.set(videoId, { info: resolved, expiry: Date.now() + 30 * 60 * 1000 });
            return resolved;
          } catch {}
        }

        // 3. Fallback to YouTube official oEmbed metadata endpoint
        logger.info('Falling back to YouTube oEmbed metadata provider', { videoId, canonicalUrl });
        const oembedMeta = await this.fetchOEmbedMetadata(videoId, canonicalUrl);
        if (oembedMeta) {
          youtubeMediaInfoCache.set(videoId, {
            info: oembedMeta,
            expiry: Date.now() + 30 * 60 * 1000,
          });
          return oembedMeta;
        }

        logger.error('YouTube yt-dlp getMediaInfo failed', { msg: error.message, canonicalUrl });
        throw new Error(
          error.message || 'Unable to retrieve YouTube video information. Please verify the URL and try again.'
        );
      }
    }

    // 4. Fallback if yt-dlp is not available
    const oembedMeta = await this.fetchOEmbedMetadata(videoId, canonicalUrl);
    if (oembedMeta) {
      return oembedMeta;
    }

    throw new Error('YouTube engine is currently unavailable. Please try again later.');
  }

  getDownloadOptions(media: MediaMetadata): MediaFormat[] {
    return media.formats || [];
  }

  async download(
    media: MediaMetadata,
    formatId: string,
    onProgress?: DownloadProgressCallback
  ): Promise<ProviderDownloadResult> {
    const videoId = this.extractVideoId(media.sourceUrl) || media.id;
    const cacheKey = `${videoId}_${formatId}`;

    // 1. Instant Cache Return
    const cached = youtubeStreamCache.get(cacheKey);
    if (cached && cached.expiry > Date.now()) {
      onProgress?.({ percent: 100, stage: 'Retrieved from cache ✓' });
      return {
        success: true,
        downloadUrl: cached.url,
        message: 'Instant stream retrieved from cache.',
      };
    }

    // 2. Download and merge authentic media stream via ytDlpRunner + FFmpeg
    if (ytDlpRunner.isAvailable()) {
      try {
        onProgress?.({ percent: 15, stage: 'Starting download engine...' });
        const canonicalUrl = this.getCanonicalUrl(videoId);
        const fullMedia = { ...media, sourceUrl: canonicalUrl };

        const fileResult = await ytDlpRunner.downloadMedia(fullMedia, formatId, onProgress);
        if (fileResult && fileResult.serveUrl) {
          youtubeStreamCache.set(cacheKey, {
            url: fileResult.serveUrl,
            expiry: Date.now() + 30 * 60 * 1000,
          });

          return {
            success: true,
            downloadUrl: fileResult.serveUrl,
            fileSizeBytes: fileResult.fileSizeBytes,
            fileSizeFormatted: fileResult.fileSizeFormatted,
            resolution: fileResult.resolution,
            duration: fileResult.duration,
            message: 'Media successfully processed and ready for download.',
          };
        }
      } catch (dlErr: unknown) {
        const err = dlErr as Error;
        logger.error('YouTube yt-dlp downloadMedia failed', { msg: err.message, videoId, formatId });
        throw err;
      }
    }

    return {
      success: false,
      message: 'Unable to process YouTube download stream. Please verify the link or try another format.',
    };
  }
}

