import { MediaFormat, MediaMetadata, PlatformType } from '../types';
import { MediaProvider, ProviderDownloadResult } from './base';
import { ytDlpRunner } from '../ytdlp';

// In-memory stream cache to make repeat and pre-warmed downloads instantaneous
const youtubeStreamCache = new Map<string, { url: string; expiry: number }>();

// In-flight conversion promise map to de-duplicate simultaneous prewarm and user requests
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
    const videoId = this.extractVideoId(url) || 'unknown';

    // 1. Primary Engine: yt-dlp local extractor
    if (ytDlpRunner.isAvailable()) {
      try {
        const info = await ytDlpRunner.getMediaInfo(url);
        return info;
      } catch (err: any) {
        if (err.code === 'PRIVATE_CONTENT' || err.code === 'UNAVAILABLE_CONTENT') {
          throw err;
        }
      }
    }

    // 2. Serverless / Vercel Fallback: Extract authentic metadata via YouTube oEmbed API
    let realTitle = videoId !== 'unknown' ? `YouTube Video (${videoId})` : 'YouTube Media';
    let realAuthor: string | undefined = undefined;
    let thumbnailUrl =
      videoId !== 'unknown' ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : undefined;

    try {
      const oembedRes = await fetch(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
        { signal: AbortSignal.timeout(4000) }
      );
      if (oembedRes.ok) {
        const oembedData = await oembedRes.json();
        if (oembedData.title) realTitle = oembedData.title;
        if (oembedData.author_name) realAuthor = oembedData.author_name;
        if (oembedData.thumbnail_url) thumbnailUrl = oembedData.thumbnail_url;
      }
    } catch {}

    const fallbackFormats: MediaFormat[] = [
      {
        id: '1080p',
        format: 'mp4',
        quality: '1080p',
        resolution: '1920x1080',
        hasAudio: true,
        hasVideo: true,
      },
      {
        id: '720p',
        format: 'mp4',
        quality: '720p',
        resolution: '1280x720',
        hasAudio: true,
        hasVideo: true,
      },
      {
        id: '480p',
        format: 'mp4',
        quality: '480p',
        resolution: '854x480',
        hasAudio: true,
        hasVideo: true,
      },
      {
        id: '360p',
        format: 'mp4',
        quality: '360p',
        resolution: '640x360',
        hasAudio: true,
        hasVideo: true,
      },
      {
        id: 'mp3',
        format: 'mp3',
        quality: '192 kbps',
        fileSize: '4.5 MB',
        hasAudio: true,
        hasVideo: false,
      },
    ];

    return {
      id: videoId,
      platform: 'youtube',
      title: realTitle,
      author: realAuthor,
      sourceUrl: url,
      thumbnailUrl,
      formats: fallbackFormats,
      requiresProviderSetup: false,
    };
  }

  getDownloadOptions(media: MediaMetadata): MediaFormat[] {
    return media.formats || [];
  }

  async download(media: MediaMetadata, formatId: string): Promise<ProviderDownloadResult> {
    const videoId = this.extractVideoId(media.sourceUrl) || media.id;
    const cacheKey = `${videoId}_${formatId}`;

    // Instant return if stream was pre-warmed or previously fetched
    const cached = youtubeStreamCache.get(cacheKey);
    if (cached && cached.expiry > Date.now()) {
      return {
        success: true,
        downloadUrl: cached.url,
        message: 'Instant stream retrieved from cache.',
      };
    }

    // If already in flight, reuse the ongoing conversion promise
    if (inFlightConversions.has(cacheKey)) {
      try {
        return await inFlightConversions.get(cacheKey)!;
      } catch {
        // Fallback to launching fresh if previous crashed
      }
    }

    const conversionPromise = (async (): Promise<ProviderDownloadResult> => {
      try {
        const isMp3 =
          formatId.toLowerCase().includes('mp3') ||
          formatId.toLowerCase().includes('audio');
        const format = isMp3 ? 'mp3' : formatId.replace(/[^0-9]/g, '') || '720';

        const initRes = await fetch(
          `https://loader.to/ajax/download.php?button=1&start=1&end=1&format=${format}&url=${encodeURIComponent(
            media.sourceUrl
          )}`,
          {
            headers: {
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              Referer: 'https://loader.to/',
            },
            signal: AbortSignal.timeout(12000),
          }
        );

        const init = await initRes.json();
        if (!init.id) {
          throw new Error(init.message || 'Unable to initialize download stream.');
        }

        // If already finished at initialization
        if (init.download_url) {
          youtubeStreamCache.set(cacheKey, {
            url: init.download_url,
            expiry: Date.now() + 3 * 60 * 60 * 1000,
          });
          return {
            success: true,
            downloadUrl: init.download_url,
            message: 'Direct media file prepared successfully.',
          };
        }

        const progressUrl =
          init.progress_url || `https://lto2.affadaffa.com/api/progress?id=${init.id}`;

        // Fast high-frequency polling every 500ms
        for (let attempt = 0; attempt < 35; attempt++) {
          if (attempt > 0) {
            await new Promise((r) => setTimeout(r, 500));
          }

          const pRes = await fetch(progressUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            signal: AbortSignal.timeout(5000),
          });
          const pData = await pRes.json();

          if (pData.success === 1 && pData.download_url) {
            youtubeStreamCache.set(cacheKey, {
              url: pData.download_url,
              expiry: Date.now() + 3 * 60 * 60 * 1000,
            });
            return {
              success: true,
              downloadUrl: pData.download_url,
              message: 'Direct media file prepared successfully.',
            };
          }
        }

        throw new Error('Conversion processing timeout. Please retry in a moment.');
      } finally {
        inFlightConversions.delete(cacheKey);
      }
    })();

    inFlightConversions.set(cacheKey, conversionPromise);

    try {
      return await conversionPromise;
    } catch (err: any) {
      // Internal stream proxy fallback
      const streamEndpoint = `/api/download/file?url=${encodeURIComponent(
        media.sourceUrl
      )}&title=${encodeURIComponent(media.title || 'media')}&ext=${
        formatId.includes('mp3') ? 'mp3' : 'mp4'
      }`;

      return {
        success: true,
        downloadUrl: streamEndpoint,
        message: 'Direct media stream prepared.',
      };
    }
  }
}

