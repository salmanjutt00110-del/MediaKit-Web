import { MediaFormat, MediaMetadata, PlatformType } from '../types';
import { MediaProvider, ProviderDownloadResult } from './base';

export class InstagramAdapter extends MediaProvider {
  readonly platform: PlatformType = 'instagram';
  readonly displayName = 'Instagram';

  canHandle(url: string): boolean {
    return (
      url.includes('instagram.com') ||
      url.includes('instagr.am')
    );
  }

  detect(url: string): PlatformType {
    return this.canHandle(url) ? 'instagram' : 'unknown';
  }

  private extractShortcode(url: string): string | null {
    try {
      const match =
        url.match(/\/(?:p|reel|reels|tv)\/([A-Za-z0-9_-]+)/i) ||
        url.match(/instagram\.com\/([A-Za-z0-9_-]+)/i);
      return match ? match[1] : null;
    } catch {
      return null;
    }
  }

  async getMediaInfo(url: string): Promise<MediaMetadata> {
    const shortcode = this.extractShortcode(url) || 'ig-media';
    const hasKey = this.hasEnv('META_APP_ID') && this.hasEnv('META_APP_SECRET');

    if (!hasKey) {
      return {
        id: shortcode,
        platform: 'instagram',
        title: `Instagram Media (${shortcode})`,
        sourceUrl: url,
        formats: [],
        requiresProviderSetup: true,
        providerStatusMessage:
          'Instagram provider architecture initialized. Server requires META_APP_ID and META_APP_SECRET in .env for Meta Graph API access.',
      };
    }

    return {
      id: shortcode,
      platform: 'instagram',
      title: `Instagram Media (${shortcode})`,
      sourceUrl: url,
      formats: [],
      requiresProviderSetup: false,
      providerStatusMessage: 'Instagram provider active. Awaiting verified stream extraction module.',
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
        message: 'The requested Instagram format is not available or has not been verified by the provider.',
      };
    }
    return {
      success: false,
      message: 'Instagram download pipeline will be configured with verified provider credentials in Prompt 2.',
    };
  }
}
