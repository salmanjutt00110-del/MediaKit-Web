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

    try {
      const res = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        signal: AbortSignal.timeout(6000),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.code === 0 && data.data) {
          const item = data.data;
          const formats: MediaFormat[] = [
            {
              id: 'hd',
              format: 'mp4',
              quality: 'HD (No Watermark)',
              resolution: '1080x1920',
              hasAudio: true,
              hasVideo: true,
              downloadUrl: item.hdplay || item.play,
            },
            {
              id: 'sd',
              format: 'mp4',
              quality: 'Standard (No Watermark)',
              resolution: '720x1280',
              hasAudio: true,
              hasVideo: true,
              downloadUrl: item.play,
            },
            {
              id: 'mp3',
              format: 'mp3',
              quality: 'Original Audio',
              hasAudio: true,
              hasVideo: false,
              downloadUrl: item.music,
            },
          ];

          return {
            id: String(item.id || videoId),
            platform: 'tiktok',
            title: item.title || `TikTok by @${item.author?.unique_id || 'creator'}`,
            author: item.author?.nickname || item.author?.unique_id || 'TikTok Creator',
            duration: item.duration ? `${item.duration}s` : undefined,
            thumbnailUrl: item.cover || item.origin_cover,
            sourceUrl: url,
            formats,
            requiresProviderSetup: false,
          };
        }
      }
    } catch {}

    // Fallback standard formats
    return {
      id: videoId,
      platform: 'tiktok',
      title: `TikTok Video (${videoId})`,
      sourceUrl: url,
      formats: [
        {
          id: 'hd',
          format: 'mp4',
          quality: 'HD (No Watermark)',
          resolution: '1080x1920',
          hasAudio: true,
          hasVideo: true,
        },
        {
          id: 'mp3',
          format: 'mp3',
          quality: 'Original Audio',
          hasAudio: true,
          hasVideo: false,
        },
      ],
      requiresProviderSetup: false,
    };
  }

  getDownloadOptions(media: MediaMetadata): MediaFormat[] {
    return media.formats || [];
  }

  async download(media: MediaMetadata, formatId: string): Promise<ProviderDownloadResult> {
    const format = media.formats.find((f) => f.id === formatId);
    if (format && format.downloadUrl) {
      return {
        success: true,
        downloadUrl: format.downloadUrl,
        message: 'Direct media download prepared successfully.',
      };
    }

    try {
      const res = await fetch(
        `https://www.tikwm.com/api/?url=${encodeURIComponent(media.sourceUrl)}`,
        { signal: AbortSignal.timeout(8000) }
      );
      const data = await res.json();
      if (data.code === 0 && data.data) {
        const isMp3 = formatId.toLowerCase().includes('mp3');
        const dlUrl = isMp3 ? data.data.music : (data.data.hdplay || data.data.play);
        return {
          success: true,
          downloadUrl: dlUrl,
          message: 'Direct media download prepared successfully.',
        };
      }
    } catch {}

    return {
      success: false,
      message: 'Unable to process TikTok download stream. Please try again.',
    };
  }
}
