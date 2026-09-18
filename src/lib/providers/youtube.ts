import { MediaFormat, MediaMetadata, PlatformType } from '../types';
import { MediaProvider, ProviderDownloadResult } from './base';
import { ytDlpRunner } from '../ytdlp';
import { sanitizeFilename } from '../string-utils';
import { logger } from '../logger';

// In-memory stream cache to make repeat downloads instantaneous
const youtubeStreamCache = new Map<string, { url: string; expiry: number }>();

// In-memory media info cache
const youtubeMediaInfoCache = new Map<string, { info: MediaMetadata; expiry: number }>();

// In-flight conversion promise map to de-duplicate simultaneous requests
const inFlightConversions = new Map<string, Promise<ProviderDownloadResult>>();

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

  async getMediaInfo(url: string): Promise<MediaMetadata> {
    const videoId = this.extractVideoId(url) || url;

    // Check cache
    const cached = youtubeMediaInfoCache.get(videoId);
    if (cached && cached.expiry > Date.now()) {
      return cached.info;
    }

    // 1. Primary Engine: yt-dlp native extractor
    if (ytDlpRunner.isAvailable()) {
      try {
        const info = await ytDlpRunner.getMediaInfo(url);
        youtubeMediaInfoCache.set(videoId, {
          info,
          expiry: Date.now() + 15 * 60 * 1000,
        });
        return info;
      } catch (err: unknown) {
        const error = err as { code?: string; message?: string };
        if (error.code === 'PRIVATE_CONTENT' || error.code === 'UNAVAILABLE_CONTENT') {
          throw err;
        }
        logger.warn('YouTube yt-dlp getMediaInfo failed, falling back to oembed', { msg: error.message });
      }
    }

    // 2. Serverless Fallback: Extract authentic metadata via YouTube oEmbed API
    let realTitle = videoId !== 'unknown' ? `YouTube Video (${videoId})` : 'YouTube Media';
    let realAuthor: string | undefined = undefined;
    let thumbnailUrl =
      videoId !== 'unknown' ? `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg` : undefined;

    try {
      const oembedRes = await fetch(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
        { signal: AbortSignal.timeout(4000) }
      );
      if (oembedRes.ok) {
        const oembedData = await oembedRes.json();
        if (oembedData.title) realTitle = oembedData.title;
        if (oembedData.author_name) realAuthor = oembedData.author_name;
        thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
      }
    } catch {}

    const dynamicFormats: MediaFormat[] = [
      {
        id: '720p',
        format: 'mp4',
        quality: '720p HD (Standard HD)',
        resolution: '1280x720',
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

    const result: MediaMetadata = {
      id: videoId,
      platform: 'youtube',
      title: realTitle,
      author: realAuthor,
      sourceUrl: url,
      thumbnailUrl,
      formats: dynamicFormats,
      requiresProviderSetup: false,
    };

    return result;
  }

  getDownloadOptions(media: MediaMetadata): MediaFormat[] {
    return media.formats || [];
  }

  async download(media: MediaMetadata, formatId: string): Promise<ProviderDownloadResult> {
    const videoId = this.extractVideoId(media.sourceUrl) || media.id;
    const cacheKey = `${videoId}_${formatId}`;

    // Instant return if stream was pre-warmed or previously generated
    const cached = youtubeStreamCache.get(cacheKey);
    if (cached && cached.expiry > Date.now()) {
      return {
        success: true,
        downloadUrl: cached.url,
        message: 'Instant stream retrieved from cache.',
      };
    }

    // 1. Primary Engine: Full-Fidelity Merged Download via yt-dlp + FFmpeg
    if (ytDlpRunner.isAvailable()) {
      try {
        const serveUrl = await ytDlpRunner.downloadMedia(media, formatId);
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

    // 3. Cloud Conversion Engine (fallback for serverless / Vercel cloud environments without local FFmpeg)
    if (inFlightConversions.has(cacheKey)) {
      try {
        return await inFlightConversions.get(cacheKey)!;
      } catch {}
    }

    const conversionPromise = (async (): Promise<ProviderDownloadResult> => {
      try {
        const isMp3 =
          formatId.toLowerCase().includes('mp3') ||
          formatId.toLowerCase().includes('audio');
        const format = isMp3 ? 'mp3' : formatId.replace(/[^0-9]/g, '') || '720';
        const targetUrl =
          videoId && videoId !== 'unknown'
            ? `https://www.youtube.com/watch?v=${videoId}`
            : media.sourceUrl;

        const initRes = await fetch(
          `https://loader.to/ajax/download.php?button=1&start=1&end=1&format=${format}&url=${encodeURIComponent(
            targetUrl
          )}`,
          {
            headers: {
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
              Referer: 'https://loader.to/',
            },
            signal: AbortSignal.timeout(10000),
          }
        );

        const cleanTitle = sanitizeFilename(media.title || 'YouTube_Video', isMp3 ? 'mp3' : 'mp4');

        const wrapSafeUrl = (rawUrl: string) => {
          if (rawUrl.startsWith('/api/download/file') || rawUrl.startsWith('/api/download/serve')) return rawUrl;
          return `/api/download/file?url=${encodeURIComponent(rawUrl)}&title=${encodeURIComponent(cleanTitle)}&ext=${isMp3 ? 'mp3' : 'mp4'}`;
        };

        const init = await initRes.json();
        if (init.id) {
          if (init.download_url) {
            const safe = wrapSafeUrl(init.download_url);
            youtubeStreamCache.set(cacheKey, {
              url: safe,
              expiry: Date.now() + 3 * 60 * 60 * 1000,
            });
            return {
              success: true,
              downloadUrl: safe,
              message: 'Direct media file prepared successfully.',
            };
          }

          const progressUrl =
            init.progress_url || `https://lto2.affadaffa.com/api/progress?id=${init.id}`;

          // Polling up to 15 attempts (1.2s intervals)
          for (let attempt = 0; attempt < 15; attempt++) {
            await new Promise((r) => setTimeout(r, 1200));

            try {
              const pRes = await fetch(progressUrl, {
                headers: { 'User-Agent': 'Mozilla/5.0' },
                signal: AbortSignal.timeout(4000),
              });
              const pData = await pRes.json();

              if (pData.text === 'Failed' || pData.success === -1) {
                break;
              }

              if (pData.success === 1 && pData.download_url) {
                const safe = wrapSafeUrl(pData.download_url);
                youtubeStreamCache.set(cacheKey, {
                  url: safe,
                  expiry: Date.now() + 3 * 60 * 60 * 1000,
                });
                return {
                  success: true,
                  downloadUrl: safe,
                  message: 'Direct media file prepared successfully.',
                };
              }
            } catch {}
          }
        }
      } catch (e: unknown) {
        const err = e as Error;
        logger.warn('Cloud conversion failed:', { msg: err.message });
      } finally {
        inFlightConversions.delete(cacheKey);
      }

      return {
        success: false,
        message: 'Unable to process YouTube download stream. Please verify the link or try another format.',
      };
    })();

    inFlightConversions.set(cacheKey, conversionPromise);
    return await conversionPromise;
  }
}
