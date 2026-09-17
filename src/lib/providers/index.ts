import { PlatformType } from '../types';
import { MediaProvider } from './base';
import { FacebookAdapter } from './facebook';
import { InstagramAdapter } from './instagram';
import { PinterestAdapter } from './pinterest';
import { TikTokAdapter } from './tiktok';
import { YouTubeAdapter } from './youtube';

export * from './base';
export * from './facebook';
export * from './instagram';
export * from './pinterest';
export * from './tiktok';
export * from './youtube';

export class ProviderRegistry {
  private static providers: MediaProvider[] = [
    new YouTubeAdapter(),
    new TikTokAdapter(),
    new FacebookAdapter(),
    new InstagramAdapter(),
    new PinterestAdapter(),
  ];

  static getProviderForUrl(url: string): MediaProvider | null {
    if (!url) return null;
    for (const provider of this.providers) {
      if (provider.canHandle(url)) {
        return provider;
      }
    }
    return null;
  }

  static getProviderForPlatform(platform: PlatformType): MediaProvider | null {
    return this.providers.find((p) => p.platform === platform) || null;
  }

  static getAllProviders(): MediaProvider[] {
    return [...this.providers];
  }
}
