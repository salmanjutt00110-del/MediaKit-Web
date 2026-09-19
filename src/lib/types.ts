export type PlatformType = 'youtube' | 'tiktok' | 'facebook' | 'instagram' | 'pinterest' | 'unknown';

export interface DetectionResult {
  platform: PlatformType;
  valid: boolean;
  normalizedUrl: string;
  originalUrl?: string;
  error?: string;
  errorCode?: 'INVALID_URL' | 'UNSUPPORTED_PLATFORM';
}

export type MediaFormatType = 'mp4' | 'mp3' | 'webm' | 'm4a' | 'jpg' | 'png' | 'webp';

export interface MediaFormat {
  id: string;
  format: MediaFormatType;
  quality: string;
  resolution?: string;
  fileSize?: string;
  hasAudio: boolean;
  hasVideo: boolean;
  note?: string;
  downloadUrl?: string;
}

export interface MediaMetadata {
  id: string;
  platform: PlatformType;
  title: string;
  author?: string;
  duration?: string;
  thumbnailUrl?: string;
  sourceUrl: string;
  formats: MediaFormat[];
  requiresProviderSetup?: boolean;
  providerStatusMessage?: string;
  description?: string;
  hashtags?: string[];
  script?: {
    text: string;
    srt?: string;
    language?: string;
  };
}

export type DownloadState =
  | 'idle'
  | 'url_entered'
  | 'detecting'
  | 'processing'
  | 'ready'
  | 'downloading'
  | 'completed'
  | 'error';

export type LoadingStage =
  | 'idle'
  | 'checking_link'
  | 'detecting_platform'
  | 'fetching_media'
  | 'preparing_downloads'
  | 'ready';

export type ErrorType =
  | 'INVALID_URL'
  | 'UNSUPPORTED_PLATFORM'
  | 'PRIVATE_CONTENT'
  | 'UNAVAILABLE_CONTENT'
  | 'PROVIDER_ERROR'
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  | 'RATE_LIMITED'
  | 'NO_MEDIA_FOUND'
  | 'FORMAT_UNAVAILABLE'
  | 'DOWNLOAD_ERROR'
  | 'invalid_url'
  | 'unsupported_url'
  | 'provider_error'
  | 'rate_limit';

export interface ErrorState {
  type: ErrorType;
  code?: string;
  title: string;
  message: string;
  retryable?: boolean;
}
