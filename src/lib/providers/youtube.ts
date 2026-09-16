import { MediaFormat, MediaMetadata, PlatformType } from '../types';
import { MediaProvider, ProviderDownloadResult } from './base';
import { ytDlpRunner } from '../ytdlp';

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
        // Fallback to basic details if extraction fails
      }
    }

    // 2. Fallback basic details
    return {
      id: videoId,
      platform: 'youtube',
      title: videoId !== 'unknown' ? `YouTube Video (${videoId})` : 'YouTube Media',
      sourceUrl: url,
      thumbnailUrl: videoId !== 'unknown' ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : undefined,
      formats: [],
      requiresProviderSetup: true,
      providerStatusMessage:
        'yt-dlp extractor engine is initializing. Please retry in a few moments.',
    };
  }

  getDownloadOptions(media: MediaMetadata): MediaFormat[] {
    return media.formats || [];
  }

  async download(media: MediaMetadata, formatId: string): Promise<ProviderDownloadResult> {
    if (ytDlpRunner.isAvailable()) {
      try {
        const downloadUrl = await ytDlpRunner.downloadMedia(media, formatId);
        return {
          success: true,
          downloadUrl,
          message: 'Media file processed successfully.',
        };
      } catch (err: any) {
        return {
          success: false,
          message: err.message || 'Unable to process media file.',
        };
      }
    }

    return {
      success: false,
      message: 'Extractor engine is not configured.',
    };
  }
}
