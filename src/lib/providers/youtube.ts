import { MediaFormat, MediaMetadata, PlatformType } from '../types';
import { MediaProvider, ProviderDownloadResult, DownloadProgressCallback } from './base';
import { ytDlpRunner } from '../ytdlp';
import { sanitizeFilename } from '../string-utils';
import { logger } from '../logger';

// In-memory stream cache to make repeat downloads instantaneous
const youtubeStreamCache = new Map<string, { url: string; expiry: number }>();

// In-memory media info cache
const youtubeMediaInfoCache = new Map<string, { info: MediaMetadata; expiry: number }>();

// In-flight conversion promises to deduplicate and share background pre-warming
const inFlightConversions = new Map<string, Promise<string | null>>();
const inFlightProgressListeners = new Map<string, Set<DownloadProgressCallback>>();

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

  /**
   * Background pre-warm: starts preparing the CDN stream ahead of time
   * so that when the user clicks "Download", the file link is already 100% ready.
   */
  prewarmStream(
    videoId: string,
    title: string,
    format: string,
    onProgress?: DownloadProgressCallback
  ): Promise<string | null> {
    const isMp3 = format === 'mp3';
    const cleanTitle = sanitizeFilename(title || 'YouTube_Video', isMp3 ? 'mp3' : 'mp4');
    const wrapSafeUrl = (rawUrl: string) => {
      if (rawUrl.startsWith('/api/download/file') || rawUrl.startsWith('/api/download/serve')) return rawUrl;
      return `/api/download/file?url=${encodeURIComponent(rawUrl)}&title=${encodeURIComponent(cleanTitle)}&ext=${isMp3 ? 'mp3' : 'mp4'}`;
    };
    const cacheKey = `${videoId}_${format === 'mp3' ? 'mp3' : `${format}p`}`;

    // Attach listener if provided
    if (onProgress) {
      if (!inFlightProgressListeners.has(cacheKey)) {
        inFlightProgressListeners.set(cacheKey, new Set());
      }
      inFlightProgressListeners.get(cacheKey)!.add(onProgress);
    }

    const emitProgress = (percent: number, stage: string) => {
      const listeners = inFlightProgressListeners.get(cacheKey);
      if (listeners) {
        for (const cb of listeners) {
          try { cb({ percent, stage }); } catch {}
        }
      }
    };

    // Check existing cache
    const existing = youtubeStreamCache.get(cacheKey);
    if (existing && existing.expiry > Date.now()) {
      emitProgress(100, 'Retrieved from instant cache ✓');
      return Promise.resolve(existing.url);
    }

    // Check if conversion is already in-flight
    if (inFlightConversions.has(cacheKey)) {
      emitProgress(45, 'Connecting to ongoing stream...');
      return inFlightConversions.get(cacheKey)!;
    }

    const conversionPromise = (async (): Promise<string | null> => {
      try {
        emitProgress(20, 'Connecting to high-speed cloud stream...');
        const targetUrl = `https://www.youtube.com/watch?v=${videoId}`;
        const initRes = await fetch(
          `https://loader.to/ajax/download.php?button=1&start=1&end=1&format=${format}&url=${encodeURIComponent(targetUrl)}`,
          {
            headers: {
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
              Referer: 'https://loader.to/',
            },
            signal: AbortSignal.timeout(6000),
          }
        );
        if (!initRes.ok) return null;
        const init = await initRes.json();
        if (init.download_url) {
          const safe = wrapSafeUrl(init.download_url);
          youtubeStreamCache.set(cacheKey, { url: safe, expiry: Date.now() + 3 * 3600 * 1000 });
          emitProgress(100, 'Stream ready! Starting download...');
          return safe;
        }
        if (init.id) {
          const progressUrl = init.progress_url || `https://lto2.affadaffa.com/api/progress?id=${init.id}`;
          // Active polling with live SSE progress updates up to 30 attempts (~12s max)
          for (let attempt = 0; attempt < 30; attempt++) {
            await new Promise((r) => setTimeout(r, 400));
            const progressPercent = Math.min(94, 25 + Math.round(((attempt + 1) / 26) * 69));
            const stage = attempt < 4
              ? 'Connecting to CDN stream...'
              : attempt < 15
              ? `Generating media stream (${progressPercent}%)...`
              : 'Optimizing high-speed stream...';
            emitProgress(progressPercent, stage);

            try {
              const pRes = await fetch(progressUrl, {
                headers: { 'User-Agent': 'Mozilla/5.0' },
                signal: AbortSignal.timeout(3000),
              });
              if (pRes.ok) {
                const pData = await pRes.json();
                if (pData.success === 1 && pData.download_url) {
                  const safe = wrapSafeUrl(pData.download_url);
                  youtubeStreamCache.set(cacheKey, { url: safe, expiry: Date.now() + 3 * 3600 * 1000 });
                  logger.info('High-speed stream pre-warm complete', { videoId, format });
                  emitProgress(100, 'Stream ready! Starting download...');
                  return safe;
                }
                if (pData.text === 'Failed' || pData.success === -1) {
                  logger.warn('Cloud conversion returned failed', { pData });
                  break;
                }
              }
            } catch {}
          }
        }
      } catch (err: any) {
        logger.warn('Pre-warm conversion error', { videoId, format, msg: err.message });
      } finally {
        inFlightConversions.delete(cacheKey);
        inFlightProgressListeners.delete(cacheKey);
      }
      return null;
    })();

    inFlightConversions.set(cacheKey, conversionPromise);
    return conversionPromise;
  }

  async getMediaInfo(url: string): Promise<MediaMetadata> {
    const videoId = this.extractVideoId(url) || url;

    // Check cache
    const cached = youtubeMediaInfoCache.get(videoId);
    if (cached && cached.expiry > Date.now()) {
      // Trigger background pre-warm if not yet cached
      this.prewarmStream(videoId, cached.info.title, '720');
      this.prewarmStream(videoId, cached.info.title, 'mp3');
      return cached.info;
    }

    const dynamicFormats: MediaFormat[] = [
      {
        id: '720p',
        format: 'mp4',
        quality: '720p HD (Recommended)',
        resolution: '1280x720',
        hasAudio: true,
        hasVideo: true,
      },
      {
        id: '1080p',
        format: 'mp4',
        quality: '1080p Full HD',
        resolution: '1920x1080',
        hasAudio: true,
        hasVideo: true,
      },
      {
        id: '480p',
        format: 'mp4',
        quality: '480p SD',
        resolution: '854x480',
        hasAudio: true,
        hasVideo: true,
      },
      {
        id: '360p',
        format: 'mp4',
        quality: '360p (Fast Download)',
        resolution: '640x360',
        hasAudio: true,
        hasVideo: true,
      },
      {
        id: 'mp3',
        format: 'mp3',
        quality: 'High Quality Audio (MP3)',
        hasAudio: true,
        hasVideo: false,
      },
    ];

    // 1. Primary Engine: Official YouTube oEmbed API (< 600ms latency)
    try {
      const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
      const res = await fetch(oembedUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(3500),
      });

      if (res.ok) {
        const oembed = await res.json();
        const rawTitle = oembed.title || 'YouTube Video';
        const author = oembed.author_name;
        const title = author && !rawTitle.toLowerCase().includes(author.toLowerCase())
          ? `${rawTitle} | ${author}`
          : rawTitle;

        const result: MediaMetadata = {
          id: videoId,
          platform: 'youtube',
          title,
          sourceUrl: `https://www.youtube.com/watch?v=${videoId}`,
          thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
          duration: undefined,
          author,
          formats: dynamicFormats,
          requiresProviderSetup: false,
        };

        youtubeMediaInfoCache.set(videoId, {
          info: result,
          expiry: Date.now() + 30 * 60 * 1000,
        });

        // Trigger instant background pre-warming for the most popular formats
        this.prewarmStream(videoId, title, '720');
        this.prewarmStream(videoId, title, '1080');
        this.prewarmStream(videoId, title, 'mp3');

        return result;
      }
    } catch {}

    // 2. Secondary Engine: yt-dlp native extractor
    if (ytDlpRunner.isAvailable()) {
      try {
        const info = await ytDlpRunner.getMediaInfo(url);
        youtubeMediaInfoCache.set(videoId, {
          info,
          expiry: Date.now() + 15 * 60 * 1000,
        });

        this.prewarmStream(videoId, info.title, '720');
        this.prewarmStream(videoId, info.title, '1080');
        this.prewarmStream(videoId, info.title, 'mp3');

        return info;
      } catch (err: unknown) {
        const error = err as { code?: string; message?: string };
        if (error.code === 'PRIVATE_CONTENT' || error.code === 'UNAVAILABLE_CONTENT') {
          throw err;
        }
        logger.warn('YouTube yt-dlp getMediaInfo failed', { msg: error.message });
      }
    }

    const fallbackResult: MediaMetadata = {
      id: videoId,
      platform: 'youtube',
      title: videoId !== 'unknown' ? `YouTube Video (${videoId})` : 'YouTube Media',
      sourceUrl: url,
      thumbnailUrl: videoId !== 'unknown' ? `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg` : undefined,
      formats: dynamicFormats,
      requiresProviderSetup: false,
    };

    return fallbackResult;
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

    // 1. Instant Cache Return (0ms latency!)
    const cached = youtubeStreamCache.get(cacheKey);
    if (cached && cached.expiry > Date.now()) {
      onProgress?.({ percent: 100, stage: 'Retrieved from instant cache ✓' });
      return {
        success: true,
        downloadUrl: cached.url,
        message: 'Instant stream retrieved from cache.',
      };
    }

    // 2. Check if background pre-warming is currently completing
    if (inFlightConversions.has(cacheKey)) {
      if (onProgress) {
        if (!inFlightProgressListeners.has(cacheKey)) {
          inFlightProgressListeners.set(cacheKey, new Set());
        }
        inFlightProgressListeners.get(cacheKey)!.add(onProgress);
      }
      onProgress?.({ percent: 45, stage: 'Connecting to ongoing stream...' });
      const readyUrl = await inFlightConversions.get(cacheKey);
      if (readyUrl) {
        onProgress?.({ percent: 100, stage: 'Stream ready! Starting download...' });
        return {
          success: true,
          downloadUrl: readyUrl,
          message: 'Direct high-speed media stream ready.',
        };
      }
    }

    // 3. Primary High-Speed Engine: Fast Direct Cloud Stream
    try {
      const isMp3 =
        formatId.toLowerCase().includes('mp3') ||
        formatId.toLowerCase().includes('audio');
      const format = isMp3 ? 'mp3' : formatId.replace(/[^0-9]/g, '') || '720';

      const directUrl = await this.prewarmStream(videoId, media.title || 'video', format, onProgress);
      if (directUrl) {
        onProgress?.({ percent: 100, stage: 'Stream ready! Starting download...' });
        return {
          success: true,
          downloadUrl: directUrl,
          message: 'Direct high-speed media stream ready.',
        };
      }
    } catch (cloudErr) {
      logger.warn('Fast stream engine unavailable, falling back to local engine', {
        err: (cloudErr as Error).message,
      });
    }

    // 4. Robust Fallback Engine: Full-Fidelity Multi-Threaded Download via yt-dlp (12 concurrent fragments)
    if (ytDlpRunner.isAvailable()) {
      try {
        onProgress?.({ percent: 30, stage: 'Connecting to dedicated media server...' });
        const serveUrl = await ytDlpRunner.downloadMedia(media, formatId, onProgress);
        if (serveUrl && (serveUrl.startsWith('/api/download/') || serveUrl.startsWith('http'))) {
          youtubeStreamCache.set(cacheKey, {
            url: serveUrl,
            expiry: Date.now() + 20 * 60 * 1000,
          });

          return {
            success: true,
            downloadUrl: serveUrl,
            message: 'Media successfully processed and ready for download.',
          };
        }
      } catch (dlErr: unknown) {
        const err = dlErr as Error;
        logger.error('yt-dlp downloadMedia failed with error:', { msg: err.message });
        throw err;
      }
    }

    return {
      success: false,
      message: 'Unable to process YouTube download stream. Please verify the link or try another format.',
    };
  }
}
