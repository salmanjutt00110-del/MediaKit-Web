import { MediaFormat, MediaMetadata, PlatformType } from '../types';

export interface ProviderDownloadResult {
  success: boolean;
  message: string;
  downloadUrl?: string;
  suggestedFilename?: string;
  fileSizeBytes?: number;
  fileSizeFormatted?: string;
  resolution?: string;
  duration?: string;
}

export type DownloadProgressCallback = (progress: {
  percent: number;
  stage: string;
  speed?: string;
  total?: string;
}) => void;

export abstract class MediaProvider {
  abstract readonly platform: PlatformType;
  abstract readonly displayName: string;

  /**
   * Evaluates if this provider can handle the given URL.
   */
  abstract canHandle(url: string): boolean;

  /**
   * Returns the detected platform type.
   */
  abstract detect(url: string): PlatformType;

  /**
   * Retrieves media metadata and supported format availability.
   * If credentials are not yet configured in server environment,
   * cleanly reflects the configuration status without faking downloads.
   */
  abstract getMediaInfo(url: string): Promise<MediaMetadata>;

  /**
   * Filters and orders download options for a media item.
   */
  abstract getDownloadOptions(media: MediaMetadata): MediaFormat[];

  /**
   * Handles authorized/supported download processing for a given format.
   */
  abstract download(
    media: MediaMetadata,
    formatId: string,
    onProgress?: DownloadProgressCallback
  ): Promise<ProviderDownloadResult>;

  /**
   * Helper to verify if required server-side credentials exist.
   */
  protected hasEnv(varName: string): boolean {
    return Boolean(process.env[varName] && process.env[varName]?.trim() !== '');
  }
}
