import { MediaFormat, MediaMetadata, PlatformType } from '../types';
import { MediaProvider, ProviderDownloadResult } from './base';
import { ytDlpRunner } from '../ytdlp';

// In-memory stream cache to make repeat and pre-warmed downloads instantaneous
const youtubeStreamCache = new Map<string, { url: string; expiry: number }>();

// In-memory media info cache to make subsequent format downloads instant
const youtubeMediaInfoCache = new Map<string, { info: MediaMetadata; expiry: number }>();

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
    const videoId = this.extractVideoId(url) || url;

    // Check cache
    const cached = youtubeMediaInfoCache.get(videoId);
    if (cached && cached.expiry > Date.now()) {
      return cached.info;
    }

    // 1. Primary Engine: yt-dlp local extractor
    if (ytDlpRunner.isAvailable()) {
      try {
        const info = await ytDlpRunner.getMediaInfo(url);
        youtubeMediaInfoCache.set(videoId, {
          info,
          expiry: Date.now() + 15 * 60 * 1000,
        });
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
        // Prefer maxresdefault for 16:9 HD without black letterbox bars
        thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
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

    // 0. If format already has a direct downloadUrl from getMediaInfo, return it immediately!
    const matchingFormat = media.formats?.find((f) => 
      f.id === formatId || 
      f.quality === formatId || 
      (formatId.includes('360') && (f.id === '18' || f.quality?.includes('360'))) ||
      (formatId.includes('720') && (f.id === '22' || f.quality?.includes('720'))) ||
      (formatId.toLowerCase().includes('mp3') && (f.format === 'mp3' || f.id.includes('mp3')))
    );
    if (matchingFormat?.downloadUrl && (matchingFormat.downloadUrl.startsWith('http://') || matchingFormat.downloadUrl.startsWith('https://') || matchingFormat.downloadUrl.startsWith('/api/'))) {
      const isMp3 =
        formatId.toLowerCase().includes('mp3') ||
        formatId.toLowerCase().includes('audio') ||
        matchingFormat.format === 'mp3';
      const cleanTitle = (media.title || 'YouTube_Video')
        .replace(/[/\\?%*:|"<>]/g, '_')
        .trim();
      const safeUrl = `/api/download/file?url=${encodeURIComponent(
        matchingFormat.downloadUrl
      )}&title=${encodeURIComponent(cleanTitle)}&ext=${isMp3 ? 'mp3' : 'mp4'}`;
      return {
        success: true,
        downloadUrl: safeUrl,
        message: 'Instant stream retrieved from media info.',
      };
    }

    // Instant return if stream was pre-warmed or previously fetched
    const cached = youtubeStreamCache.get(cacheKey);
    if (cached && cached.expiry > Date.now()) {
      return {
        success: true,
        downloadUrl: cached.url,
        message: 'Instant stream retrieved from cache.',
      };
    }

    // 1. If yt-dlp is available (e.g. Localhost), try direct stream first!
    if (ytDlpRunner.isAvailable()) {
      try {
        const streamUrl = await ytDlpRunner.getStreamUrl(media.sourceUrl, formatId);
        if (streamUrl && streamUrl.startsWith('http')) {
          const isMp3 =
            formatId.toLowerCase().includes('mp3') ||
            formatId.toLowerCase().includes('audio');
          const cleanTitle = (media.title || 'YouTube_Video')
            .replace(/[/\\?%*:|"<>]/g, '_')
            .trim();
          const safeUrl = `/api/download/file?url=${encodeURIComponent(
            streamUrl
          )}&title=${encodeURIComponent(cleanTitle)}&ext=${isMp3 ? 'mp3' : 'mp4'}`;

          youtubeStreamCache.set(cacheKey, {
            url: safeUrl,
            expiry: Date.now() + 2 * 60 * 60 * 1000,
          });

          return {
            success: true,
            downloadUrl: safeUrl,
            message: 'Direct media stream prepared successfully.',
          };
        }
      } catch (streamErr: any) {
        console.warn('yt-dlp getStreamUrl failed:', streamErr.message);
      }
    }

    // 2. Cloud Conversion Engine (loader.to) - Handles ALL formats on Vercel / Serverless: 1080p, 720p, 480p, 360p, MP3
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
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              Referer: 'https://loader.to/',
            },
            signal: AbortSignal.timeout(10000),
          }
        );

        const init = await initRes.json();
        if (init.id) {
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

          // Poll up to 25 attempts (1 second intervals)
          for (let attempt = 0; attempt < 25; attempt++) {
            await new Promise((r) => setTimeout(r, 1000));

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
            } catch {}
          }
        }
      } catch (e: any) {
        console.warn('Cloud conversion failed:', e.message);
      } finally {
        inFlightConversions.delete(cacheKey);
      }

      return {
        success: false,
        message: 'Unable to prepare download stream for this format. Please try another quality tier.',
      };
    })();

    inFlightConversions.set(cacheKey, conversionPromise);
    return await conversionPromise;
  }
}

