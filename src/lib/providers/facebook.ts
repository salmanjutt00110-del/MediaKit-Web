import { MediaFormat, MediaMetadata, PlatformType } from '../types';
import { MediaProvider, ProviderDownloadResult } from './base';

export class FacebookAdapter extends MediaProvider {
  readonly platform: PlatformType = 'facebook';
  readonly displayName = 'Facebook';

  canHandle(url: string): boolean {
    return (
      url.includes('facebook.com') ||
      url.includes('fb.watch') ||
      url.includes('fb.com')
    );
  }

  detect(url: string): PlatformType {
    return this.canHandle(url) ? 'facebook' : 'unknown';
  }

  private extractVideoId(url: string): string | null {
    try {
      const match =
        url.match(/\/videos\/(\d+)/i) ||
        url.match(/\/reel\/(\d+)/i) ||
        url.match(/v=(\d+)/i) ||
        url.match(/fb\.watch\/([A-Za-z0-9_-]+)/i);
      return match ? match[1] : null;
    } catch {
      return null;
    }
  }

  async getMediaInfo(url: string): Promise<MediaMetadata> {
    const videoId = this.extractVideoId(url) || 'fb-media';
    const hasKey = this.hasEnv('META_APP_ID') && this.hasEnv('META_APP_SECRET');

    if (!hasKey) {
      return {
        id: videoId,
        platform: 'facebook',
        title: `Facebook Media (${videoId})`,
        sourceUrl: url,
        formats: [],
        requiresProviderSetup: true,
        providerStatusMessage:
          'Facebook provider integration architecture initialized. Server requires META_APP_ID and META_APP_SECRET in .env to connect to Graph API.',
      };
    }

    return {
      id: videoId,
      platform: 'facebook',
      title: `Facebook Media (${videoId})`,
      sourceUrl: url,
      formats: [],
      requiresProviderSetup: false,
      providerStatusMessage: 'Facebook provider active. Awaiting verified stream extraction module.',
    };
  }

  getDownloadOptions(media: MediaMetadata): MediaFormat[] {
    return media.formats || [];
  }

  async download(media: MediaMetadata, formatId: string): Promise<ProviderDownloadResult> {
    const format = media.formats.find((f) => f.id === formatId);
    if (!format) {
      return {
        success: false,
        message: 'The requested Facebook format is not available or has not been verified by the provider.',
      };
    }
    return {
      success: false,
      message: 'Facebook download pipeline will be configured with verified provider credentials in Prompt 2.',
    };
  }
}
