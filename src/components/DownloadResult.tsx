'use client';

import React from 'react';
import Image from 'next/image';
import { Download, Clock, User, Check, Info } from 'lucide-react';
import { MediaFormat, MediaMetadata, PlatformType } from '@/lib/types';
import { YouTubeIcon, TikTokIcon, FacebookIcon, InstagramIcon } from './PlatformIcons';
import styles from './DownloadResult.module.css';

interface DownloadResultProps {
  media: MediaMetadata;
  onDownloadFormat?: (formatId: string) => void;
  isDownloading?: boolean;
  downloadingFormatId?: string | null;
}

export default function DownloadResult({
  media,
  onDownloadFormat,
  isDownloading,
  downloadingFormatId,
}: DownloadResultProps) {
  const getPlatformBadge = (platform: PlatformType) => {
    switch (platform) {
      case 'youtube':
        return (
          <span className={`${styles.platformPill} ${styles.pillYouTube}`}>
            <YouTubeIcon size={13} />
            <span>YouTube</span>
          </span>
        );
      case 'tiktok':
        return (
          <span className={`${styles.platformPill} ${styles.pillTikTok}`}>
            <TikTokIcon size={13} />
            <span>TikTok</span>
          </span>
        );
      case 'facebook':
        return (
          <span className={`${styles.platformPill} ${styles.pillFacebook}`}>
            <FacebookIcon size={13} />
            <span>Facebook</span>
          </span>
        );
      case 'instagram':
        return (
          <span className={`${styles.platformPill} ${styles.pillInstagram}`}>
            <InstagramIcon size={13} />
            <span>Instagram</span>
          </span>
        );
      default:
        return (
          <span className={styles.platformPill}>
            <span>Media</span>
          </span>
        );
    }
  };

  const availableFormats = media.formats || [];
  const mp4Formats = availableFormats.filter((f) => f.format === 'mp4');
  const mp3Formats = availableFormats.filter((f) => f.format === 'mp3');
  const otherFormats = availableFormats.filter(
    (f) => f.format !== 'mp4' && f.format !== 'mp3'
  );

  const displayTitle = media.title?.trim() || 'Media File';

  const [imgError, setImgError] = React.useState(false);

  // Reset img error on media change
  React.useEffect(() => {
    setImgError(false);
  }, [media.id, media.thumbnailUrl]);

  return (
    <div className={styles.resultCard} role="region" aria-label="Media Download Information">
      <div className={styles.resultGrid}>
        {/* Guaranteed Thumbnail Preview */}
        <div className={styles.thumbnailWrapper}>
          {media.thumbnailUrl && !imgError ? (
            <Image
              src={media.thumbnailUrl}
              alt={displayTitle}
              fill
              unoptimized
              className={styles.thumbnailImg}
              onError={() => setImgError(true)}
            />
          ) : (
            <div className={`${styles.fallbackThumbnail} ${styles[`fallback_${media.platform}`] || ''}`}>
              <div className={styles.fallbackIcon}>
                {media.platform === 'tiktok' && <TikTokIcon size={34} color="#ffffff" />}
                {media.platform === 'youtube' && <YouTubeIcon size={34} color="#ffffff" />}
                {media.platform === 'facebook' && <FacebookIcon size={34} color="#ffffff" />}
                {media.platform === 'instagram' && <InstagramIcon size={34} color="#ffffff" />}
              </div>
              <span className={styles.fallbackText}>{media.platform} video</span>
            </div>
          )}
        </div>

        {/* Media Details */}
        <div className={styles.contentWrapper}>
          <div className={styles.headerBlock}>
            {getPlatformBadge(media.platform)}
            <h3 className={styles.mediaTitle}>{displayTitle}</h3>
          </div>

          <div className={styles.metaRow}>
            {media.author && (
              <span className={styles.metaItem}>
                <User size={13} color="#64748B" />
                <span>{media.author}</span>
              </span>
            )}
            {media.duration && (
              <span className={styles.metaItem}>
                <Clock size={13} color="#64748B" />
                <span>{media.duration}</span>
              </span>
            )}
            <span className={styles.metaItem}>
              <Check size={13} color="#10B981" />
              <span>Link Verified</span>
            </span>
          </div>

          {/* Available Downloads */}
          <div className={styles.downloadsSection}>
            <h4 className={styles.downloadsHeading}>Available Downloads</h4>

            {availableFormats.length > 0 ? (
              <div className={styles.formatsList}>
                {/* MP4 Section */}
                {mp4Formats.length > 0 && (
                  <div className={styles.formatGroup}>
                    <span className={styles.groupLabel}>MP4</span>
                    <div className={styles.groupItems}>
                      {mp4Formats.map((fmt: MediaFormat) => (
                        <div key={fmt.id} className={styles.formatRow}>
                          <div className={styles.formatInfo}>
                            <span className={styles.qualityLabel}>{fmt.quality}</span>
                            {fmt.fileSize && (
                              <span className={styles.fileSizeLabel}>{fmt.fileSize}</span>
                            )}
                          </div>
                          <button
                            type="button"
                            className={styles.rowDownloadBtn}
                            onClick={() => onDownloadFormat && onDownloadFormat(fmt.id)}
                            disabled={isDownloading}
                            aria-label={`Download MP4 ${fmt.quality}`}
                          >
                            <Download size={14} />
                            <span>
                              {isDownloading && downloadingFormatId === fmt.id
                                ? 'Downloading...'
                                : 'Download'}
                            </span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* MP3 Section */}
                {mp3Formats.length > 0 && (
                  <div className={styles.formatGroup}>
                    <span className={styles.groupLabel}>MP3</span>
                    <div className={styles.groupItems}>
                      {mp3Formats.map((fmt: MediaFormat) => (
                        <div key={fmt.id} className={styles.formatRow}>
                          <div className={styles.formatInfo}>
                            <span className={styles.qualityLabel}>{fmt.quality}</span>
                            {fmt.fileSize && (
                              <span className={styles.fileSizeLabel}>{fmt.fileSize}</span>
                            )}
                          </div>
                          <button
                            type="button"
                            className={styles.rowDownloadBtn}
                            onClick={() => onDownloadFormat && onDownloadFormat(fmt.id)}
                            disabled={isDownloading}
                            aria-label={`Download MP3 ${fmt.quality}`}
                          >
                            <Download size={14} />
                            <span>
                              {isDownloading && downloadingFormatId === fmt.id
                                ? 'Downloading...'
                                : 'Download'}
                            </span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Other Formats Section */}
                {otherFormats.length > 0 && (
                  <div className={styles.formatGroup}>
                    <span className={styles.groupLabel}>Other Formats</span>
                    <div className={styles.groupItems}>
                      {otherFormats.map((fmt: MediaFormat) => (
                        <div key={fmt.id} className={styles.formatRow}>
                          <div className={styles.formatInfo}>
                            <span className={styles.qualityLabel}>{fmt.quality}</span>
                            {fmt.fileSize && (
                              <span className={styles.fileSizeLabel}>{fmt.fileSize}</span>
                            )}
                          </div>
                          <button
                            type="button"
                            className={styles.rowDownloadBtn}
                            onClick={() => onDownloadFormat && onDownloadFormat(fmt.id)}
                            disabled={isDownloading}
                            aria-label={`Download ${fmt.format} ${fmt.quality}`}
                          >
                            <Download size={14} />
                            <span>Download</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.providerNotice}>
                <Info size={16} color="#2563EB" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Platform detected.</strong>
                  <p style={{ marginTop: '2px' }}>
                    {media.providerStatusMessage ||
                      'Stream extraction credentials will be configured. Only authentic formats are displayed.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
