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
} from 'lucide-react';
import { MediaFormat, MediaMetadata, PlatformType } from '@/lib/types';
import { YouTubeIcon, TikTokIcon, FacebookIcon, InstagramIcon, PinterestIcon } from './PlatformIcons';
import { cleanAndDecodeTitle } from '@/lib/string-utils';
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
      case 'pinterest':
        return (
          <span className={`${styles.platformPill} ${styles.pillPinterest}`}>
            <PinterestIcon size={13} />
            <span>Pinterest</span>
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
  const [imgSrc, setImgSrc] = useState<string | undefined>(undefined);
  const [imgError, setImgError] = useState(false);
  const [isImgLoading, setIsImgLoading] = useState(true);
  const [hasTriedProxy, setHasTriedProxy] = useState(false);

  useEffect(() => {
    const rawThumb =
      media.thumbnailUrl &&
      !media.thumbnailUrl.includes('facebook_share_image') &&
      !media.thumbnailUrl.includes('default_avatar')
        ? media.thumbnailUrl
        : undefined;

    if (rawThumb) {
      // For Pinterest & Instagram, route through /api/thumbnail immediately to bypass hotlink/CORS protection
      if (media.platform === 'pinterest' || media.platform === 'instagram') {
        setImgSrc(`/api/thumbnail?url=${encodeURIComponent(rawThumb)}`);
      } else {
        setImgSrc(rawThumb);
      }
      setImgError(false);
      setIsImgLoading(true);
    } else {
      setImgSrc(undefined);
      setImgError(true);
      setIsImgLoading(false);
    }
    setHasTriedProxy(false);
  }, [media.id, media.sourceUrl, media.thumbnailUrl, media.platform]);

  // Safety timer to ensure skeleton never gets stuck
  useEffect(() => {
    if (!imgSrc || imgError) {
      setIsImgLoading(false);
      return;
    }
    const timer = setTimeout(() => {
      setIsImgLoading(false);
    }, 3500);
    return () => clearTimeout(timer);
  }, [imgSrc, imgError]);

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
                {media.platform === 'pinterest' && <PinterestIcon size={34} color="#ffffff" />}
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
                  {mp4Formats.map((fmt: MediaFormat) => (
                    <div key={fmt.id} className={styles.formatRow}>
                      <div className={styles.formatInfo}>
                        <span className={styles.qualityLabel}>{fmt.quality}</span>
                        <span className={styles.formatBadgeText}>{fmt.format.toUpperCase()}</span>
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
                  ))}
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
                  {mp3Formats.map((fmt: MediaFormat) => (
                    <div key={fmt.id} className={styles.formatRow}>
                      <div className={styles.formatInfo}>
                        <span className={styles.qualityLabel}>{fmt.quality}</span>
                        <span className={styles.formatBadgeText}>{fmt.format.toUpperCase()}</span>
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
                  ))}
                </div>
              </div>
            )}

            {/* Other Formats */}
            {otherFormats.length > 0 && (
              <div className={styles.formatGroup}>
                <span className={styles.groupLabel}>Other Formats</span>
                <div className={styles.groupItems}>
                  {otherFormats.map((fmt: MediaFormat) => (
                    <div key={fmt.id} className={styles.formatRow}>
                      <div className={styles.formatInfo}>
                        <span className={styles.qualityLabel}>
                          {fmt.quality} ({fmt.format.toUpperCase()})
                        </span>
                        <span className={styles.formatBadgeText}>{fmt.format.toUpperCase()}</span>
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
                  ))}
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
