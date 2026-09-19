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
    try {
      const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
      if (parsed.hostname.includes('youtu.be')) {
        return parsed.pathname.slice(1).split('?')[0] || null;
      }
      if (parsed.pathname.startsWith('/shorts/')) {
        return parsed.pathname.replace('/shorts/', '').split('?')[0] || null;
      }
      if (parsed.pathname.startsWith('/embed/')) {
        return parsed.pathname.replace('/embed/', '').split('?')[0] || null;
      }
      return parsed.searchParams.get('v');
    } catch {
      return null;
    }
  }

  private getCanonicalUrl(videoId: string): string {
    return `https://www.youtube.com/watch?v=${videoId}`;
  }

  async getMediaInfo(url: string): Promise<MediaMetadata> {
    const videoId = this.extractVideoId(url) || url;
    const canonicalUrl = this.getCanonicalUrl(videoId);

    // 1. Check in-memory cache
    const cached = youtubeMediaInfoCache.get(videoId) || youtubeMediaInfoCache.get(url);
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
        logger.error('YouTube yt-dlp getMediaInfo failed', { msg: error.message, canonicalUrl });
        throw new Error(error.message || 'Unable to retrieve YouTube video information. Please verify the URL and try again.');
      }
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

