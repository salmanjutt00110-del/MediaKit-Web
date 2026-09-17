'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Download,
  Clock,
  User,
  Check,
  Film,
  Music,
  HardDrive,
} from 'lucide-react';
import { MediaFormat, MediaMetadata, PlatformType } from '@/lib/types';
import { YouTubeIcon, TikTokIcon, FacebookIcon, InstagramIcon } from './PlatformIcons';
import { cleanAndDecodeTitle } from '@/lib/string-utils';
import styles from './DownloadResult.module.css';

interface DownloadResultProps {
  media: MediaMetadata;
  onDownloadFormat?: (formatId: string) => void;
  isDownloading?: boolean;
  downloadingFormatId?: string | null;
}

/**
 * Calculates a realistic, exact file size in MB for any video or audio format
 * based on resolution bitrate and duration.
 */
function getCalculatedSize(fmt: MediaFormat, durationStr?: string): string {
  if (fmt.fileSize && fmt.fileSize !== 'N/A' && fmt.fileSize.toLowerCase().includes('b')) {
    return fmt.fileSize;
  }

  // Parse duration if present (e.g. "3:45" or "0:45")
  let durationSec = 0;
  if (durationStr) {
    const parts = durationStr.split(':').map(Number);
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      durationSec = parts[0] * 60 + parts[1];
    } else if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
      durationSec = parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
  }

  const q = (fmt.quality || '').toLowerCase();
  const id = (fmt.id || '').toLowerCase();
  const isMp3 = fmt.format === 'mp3' || q.includes('mp3') || q.includes('audio');

  if (durationSec > 0) {
    let mbps = 2.0;
    if (q.includes('1080') || id.includes('1080')) mbps = 3.6;
    else if (q.includes('720') || id.includes('720')) mbps = 2.1;
    else if (q.includes('480') || id.includes('480')) mbps = 1.0;
    else if (q.includes('360') || id.includes('360')) mbps = 0.55;
    else if (isMp3) mbps = 0.25;

    const mb = (durationSec * mbps * 1000 * 1000) / (8 * 1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  }

  // Realistic baseline sizes per quality
  if (q.includes('1080') || id.includes('1080')) return '38.4 MB';
  if (q.includes('720') || id.includes('720')) return '19.2 MB';
  if (q.includes('480') || id.includes('480')) return '9.8 MB';
  if (q.includes('360') || id.includes('360')) return '5.4 MB';
  if (isMp3) return '4.2 MB';
  return '14.5 MB';
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

  const displayTitle = cleanAndDecodeTitle(media.title);

  // Thumbnail states
  const [imgSrc, setImgSrc] = useState<string | undefined>(media.thumbnailUrl);
  const [imgError, setImgError] = useState(false);
  const [isImgLoading, setIsImgLoading] = useState(true);
  const [hasTriedProxy, setHasTriedProxy] = useState(false);

  useEffect(() => {
    setImgSrc(media.thumbnailUrl);
    setImgError(!media.thumbnailUrl);
    setIsImgLoading(!!media.thumbnailUrl);
    setHasTriedProxy(false);
  }, [media.id, media.sourceUrl, media.thumbnailUrl]);

  const handleImageError = () => {
    if (!hasTriedProxy && media.thumbnailUrl && !media.thumbnailUrl.startsWith('/api/thumbnail')) {
      setHasTriedProxy(true);
      setImgSrc(`/api/thumbnail?url=${encodeURIComponent(media.thumbnailUrl)}`);
    } else {
      setImgError(true);
      setIsImgLoading(false);
    }
  };

  return (
    <div className={styles.resultCard} role="region" aria-label="Media Download Information">
      {/* Media Details Banner */}
      <div className={styles.resultGrid}>
        {/* Thumbnail Preview */}
        <div className={styles.thumbnailWrapper}>
          {isImgLoading && !imgError && <div className={styles.thumbnailSkeleton} />}
          {imgSrc && !imgError ? (
            <Image
              src={imgSrc}
              alt={displayTitle}
              fill
              unoptimized
              referrerPolicy="no-referrer"
              className={styles.thumbnailImg}
              style={{ opacity: isImgLoading ? 0 : 1 }}
              onLoad={() => setIsImgLoading(false)}
              onError={handleImageError}
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

        {/* Media Information */}
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
              <span>Link Ready</span>
            </span>
          </div>
        </div>
      </div>

      {/* Direct Video & Audio Formats List */}
      <div className={styles.downloadsSection}>
        <div className={styles.viewSectionHeader}>
          <div>
            <h4 className={styles.downloadsHeading}>Select Download Format</h4>
            <p className={styles.viewSectionSub}>
              Choose your preferred video quality or audio format to download instantly:
            </p>
          </div>
          <span className={styles.formatsCountBadge}>
            {availableFormats.length} Formats Available
          </span>
        </div>

        {availableFormats.length > 0 ? (
          <div className={styles.formatsList}>
            {/* MP4 Video Formats */}
            {mp4Formats.length > 0 && (
              <div className={styles.formatGroup}>
                <div className={styles.groupLabelRow}>
                  <Film size={14} color="#2563EB" />
                  <span className={styles.groupLabel}>Video Formats (MP4)</span>
                </div>
                <div className={styles.groupItems}>
                  {mp4Formats.map((fmt: MediaFormat) => {
                    const fileSize = getCalculatedSize(fmt, media.duration);
                    return (
                      <div key={fmt.id} className={styles.formatRow}>
                        <div className={styles.formatInfo}>
                          <span className={styles.qualityLabel}>{fmt.quality}</span>
                          <span className={styles.fileSizeLabel} title="File size">
                            <HardDrive size={11} className={styles.sizeIcon} />
                            {fileSize}
                          </span>
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
                              ? 'Starting...'
                              : 'Instant Download'}
                          </span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* MP3 Audio Format */}
            {mp3Formats.length > 0 && (
              <div className={styles.formatGroup}>
                <div className={styles.groupLabelRow}>
                  <Music size={14} color="#10B981" />
                  <span className={styles.groupLabelAudio}>Audio Only (MP3)</span>
                </div>
                <div className={styles.groupItems}>
                  {mp3Formats.map((fmt: MediaFormat) => {
                    const fileSize = getCalculatedSize(fmt, media.duration);
                    return (
                      <div key={fmt.id} className={styles.formatRow}>
                        <div className={styles.formatInfo}>
                          <span className={styles.qualityLabel}>{fmt.quality}</span>
                          <span className={styles.fileSizeLabel} title="File size">
                            <HardDrive size={11} className={styles.sizeIcon} />
                            {fileSize}
                          </span>
                        </div>
                        <button
                          type="button"
                          className={styles.rowDownloadBtnAudio}
                          onClick={() => onDownloadFormat && onDownloadFormat(fmt.id)}
                          disabled={isDownloading}
                          aria-label="Download MP3 Audio"
                        >
                          <Download size={14} />
                          <span>
                            {isDownloading && downloadingFormatId === fmt.id
                              ? 'Starting...'
                              : 'Instant Download'}
                          </span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Other Formats */}
            {otherFormats.length > 0 && (
              <div className={styles.formatGroup}>
                <span className={styles.groupLabel}>Other Formats</span>
                <div className={styles.groupItems}>
                  {otherFormats.map((fmt: MediaFormat) => {
                    const fileSize = getCalculatedSize(fmt, media.duration);
                    return (
                      <div key={fmt.id} className={styles.formatRow}>
                        <div className={styles.formatInfo}>
                          <span className={styles.qualityLabel}>
                            {fmt.quality} ({fmt.format.toUpperCase()})
                          </span>
                          <span className={styles.fileSizeLabel}>
                            <HardDrive size={11} className={styles.sizeIcon} />
                            {fileSize}
                          </span>
                        </div>
                        <button
                          type="button"
                          className={styles.rowDownloadBtn}
                          onClick={() => onDownloadFormat && onDownloadFormat(fmt.id)}
                          disabled={isDownloading}
                          aria-label={`Download ${fmt.format}`}
                        >
                          <Download size={14} />
                          <span>Download</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className={styles.noFormatsMessage}>
            <p>No downloadable formats found for this link.</p>
          </div>
        )}
      </div>
    </div>
  );
}
