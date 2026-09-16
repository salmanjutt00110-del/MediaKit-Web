import { MediaFormat, MediaMetadata, PlatformType } from '../types';
import { MediaProvider, ProviderDownloadResult } from './base';

export class TikTokAdapter extends MediaProvider {
  readonly platform: PlatformType = 'tiktok';
  readonly displayName = 'TikTok';

  canHandle(url: string): boolean {
    return (
      url.includes('tiktok.com') ||
      url.includes('vm.tiktok.com') ||
      url.includes('vt.tiktok.com')
    );
  }

  detect(url: string): PlatformType {
    return this.canHandle(url) ? 'tiktok' : 'unknown';
  }

  private extractVideoId(url: string): string | null {
    try {
      const match = url.match(/\/video\/(\d+)/i) || url.match(/\/photo\/(\d+)/i);
      if (match) return match[1];
      const shortMatch = url.match(/(?:vm|vt)\.tiktok\.com\/([A-Za-z0-9_-]+)/i);
      if (shortMatch) return shortMatch[1];
      return null;
    } catch {
      return null;
    }
  }

  async getMediaInfo(url: string): Promise<MediaMetadata> {
    const videoId = this.extractVideoId(url) || 'tiktok-media';
    const hasKey = this.hasEnv('TIKTOK_CLIENT_KEY') && this.hasEnv('TIKTOK_CLIENT_SECRET');

    if (!hasKey) {
      return {
        id: videoId,
        platform: 'tiktok',
        title: `TikTok Media (${videoId})`,
        sourceUrl: url,
        formats: [],
        requiresProviderSetup: true,
        providerStatusMessage:
          'TikTok provider integration architecture initialized. Server requires TIKTOK_CLIENT_KEY and TIKTOK_CLIENT_SECRET in .env to connect to official API.',
      };
    }

    return {
      id: videoId,
      platform: 'tiktok',
      title: `TikTok Media (${videoId})`,
      sourceUrl: url,
      formats: [],
      requiresProviderSetup: false,
      providerStatusMessage: 'TikTok provider active. Awaiting verified stream extraction module.',
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
        message: 'The requested TikTok format is not available or has not been verified by the provider.',
      };
    }
    return {
      success: false,
      message: 'TikTok download pipeline will be configured with verified provider credentials in Prompt 2.',
    };
  }
}
