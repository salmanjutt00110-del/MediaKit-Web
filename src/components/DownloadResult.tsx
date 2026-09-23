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
  Sparkles,
} from 'lucide-react';
import { MediaFormat, MediaMetadata, PlatformType } from '@/lib/types';
import { YouTubeIcon, TikTokIcon, FacebookIcon, InstagramIcon, PinterestIcon } from './PlatformIcons';
import { cleanAndDecodeTitle } from '@/lib/string-utils';
import { getHighestVideoFormat } from './Downloader';
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

  const highestVideoFormat = getHighestVideoFormat(availableFormats);
  const displayTitle = cleanAndDecodeTitle(media.title);

  // Thumbnail states with React 19 safety
  const initialThumb = React.useMemo(() => {
    const rawThumb =
      media.thumbnailUrl &&
      !media.thumbnailUrl.includes('facebook_share_image') &&
      !media.thumbnailUrl.includes('default_avatar')
        ? media.thumbnailUrl
        : undefined;

    if (!rawThumb) return undefined;
    // Don't double-wrap URLs already proxied through /api/thumbnail
    if (rawThumb.startsWith('/api/thumbnail')) return rawThumb;
    if (media.platform === 'pinterest' || media.platform === 'instagram' || media.platform === 'facebook') {
      return `/api/thumbnail?url=${encodeURIComponent(rawThumb)}`;
    }
    return rawThumb;
  }, [media.thumbnailUrl, media.platform]);

  const [imgSrc, setImgSrc] = useState<string | undefined>(initialThumb);
  const [imgError, setImgError] = useState(!initialThumb);
  const [isImgLoading, setIsImgLoading] = useState(!!initialThumb);
  const [hasTriedProxy, setHasTriedProxy] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const previewVideoUrl = React.useMemo(() => {
    const videoFmt = highestVideoFormat || mp4Formats[0];
    if (!videoFmt?.downloadUrl) return undefined;
    return videoFmt.downloadUrl;
  }, [highestVideoFormat, mp4Formats]);

  // Dynamic aspect ratio calculation
  const isInitialPortrait =
    media.platform === 'tiktok' ||
    media.sourceUrl?.includes('/reel') ||
    media.sourceUrl?.includes('/shorts/') ||
    media.sourceUrl?.includes('/pin/');

  const [aspectClass, setAspectClass] = useState<string>(
    isInitialPortrait ? styles.aspectPortrait : styles.aspectLandscape
  );

  // Fallback safety timer for skeleton
  useEffect(() => {
    if (!imgSrc || imgError) {
      return;
    }
    const timer = setTimeout(() => {
      setIsImgLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, [imgSrc, imgError]);

  const handleImageError = () => {
    if (!hasTriedProxy && media.thumbnailUrl && !media.thumbnailUrl.startsWith('/api/thumbnail')) {
      setHasTriedProxy(true);
      setImgSrc(`/api/thumbnail?url=${encodeURIComponent(media.thumbnailUrl)}`);
      setIsImgLoading(true);
    } else {
      setImgError(true);
      setIsImgLoading(false);
    }
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setIsImgLoading(false);
    const { naturalWidth, naturalHeight } = e.currentTarget;
    if (naturalWidth && naturalHeight) {
      const ratio = naturalWidth / naturalHeight;
      if (ratio <= 0.65) {
        setAspectClass(styles.aspectPortrait); // 9:16
      } else if (ratio > 0.65 && ratio < 0.88) {
        setAspectClass(styles.aspectVertical); // 4:5
      } else if (ratio >= 0.88 && ratio <= 1.15) {
        setAspectClass(styles.aspectSquare); // 1:1
      } else {
        setAspectClass(styles.aspectLandscape); // 16:9
      }
    }
  };

  const getFormatDownloadLink = (fmt: MediaFormat) => {
    const safeTitle = (media.title || 'media')
      .replace(/[/\\?%*:|"<>]/g, '_')
      .replace(/\s+/g, ' ')
      .trim();
    const ext = fmt.format || (fmt.id.includes('mp3') ? 'mp3' : 'mp4');

    if (fmt.downloadUrl) {
      if (
        fmt.downloadUrl.startsWith('/api/download/file') ||
        fmt.downloadUrl.startsWith('/api/download/serve') ||
        fmt.downloadUrl.startsWith('/api/download') ||
        fmt.downloadUrl.includes('savenow.to') ||
        fmt.downloadUrl.includes('loader.to')
      ) {
        return fmt.downloadUrl;
      }
      return `/api/download/file?url=${encodeURIComponent(fmt.downloadUrl)}&title=${encodeURIComponent(safeTitle)}&ext=${ext}`;
    }

    // Direct endpoint for server-prepared media downloads (YouTube, etc.)
    return `/api/download?url=${encodeURIComponent(media.sourceUrl)}&formatId=${encodeURIComponent(fmt.id)}`;
  };

  const getFormatFilename = (fmt: MediaFormat) => {
    const safeTitle = (media.title || 'media')
      .replace(/[/\\?%*:|"<>]/g, '_')
      .replace(/\s+/g, ' ')
      .trim();
    const ext = fmt.format || (fmt.id.includes('mp3') ? 'mp3' : 'mp4');
    return `${safeTitle}.${ext}`;
  };

  return (
    <div className={styles.resultCard} role="region" aria-label="Media Download Information">
      {/* Media Details Banner */}
      <div className={styles.resultGrid}>
        {/* Thumbnail Preview Container */}
        <div className={`${styles.thumbnailWrapper} ${aspectClass}`}>
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
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          ) : previewVideoUrl && !videoError ? (
            <video
              src={previewVideoUrl}
              preload="metadata"
              muted
              playsInline
              className={styles.thumbnailImg}
              style={{ objectFit: 'cover' }}
              onError={() => setVideoError(true)}
              onLoadedData={() => setIsImgLoading(false)}
            />
          ) : (
            <div className={styles.fallbackThumbnail}>
              <div className={styles.fallbackIcon}>
                <Film size={28} />
              </div>
              <span className={styles.fallbackText}>Preview unavailable</span>
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
            {media.author ? (
              <span className={styles.metaItem}>
                <User size={13} color="#64748B" />
                <span>{media.author}</span>
              </span>
            ) : (
              <span className={styles.metaItem}>
                <User size={13} color="#64748B" />
                <span>Information unavailable</span>
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

        {/* Auto HD Featured Recommendation */}
        {highestVideoFormat && (
          <div className={styles.autoHdCard}>
            <div className={styles.autoHdLeft}>
              <div className={styles.autoHdBreadcrumb}>
                <Sparkles size={14} className={styles.sparkleIcon} />
                <span>Smart Quality Match</span>
              </div>
              <div className={styles.autoHdTitle}>
                Auto HD • {highestVideoFormat.quality}
              </div>
              <div className={styles.autoHdMeta}>
                {highestVideoFormat.resolution && <span>{highestVideoFormat.resolution}</span>}
                {highestVideoFormat.fileSize && <span>• {highestVideoFormat.fileSize}</span>}
                <span>• Highest available quality</span>
              </div>
            </div>
            {(() => {
              const autoHdLnk = getFormatDownloadLink(highestVideoFormat);
              const autoHdName = getFormatFilename(highestVideoFormat);
              return autoHdLnk ? (
                <a
                  href={autoHdLnk}
                  download={autoHdName}
                  className={styles.autoHdBtn}
                  onClick={(e) => {
                    e.preventDefault();
                    onDownloadFormat && onDownloadFormat(highestVideoFormat.id);
                  }}
                  aria-label={`Download Auto HD ${highestVideoFormat.quality}`}
                >
                  <Download size={16} />
                  <span>
                    {isDownloading && downloadingFormatId === highestVideoFormat.id
                      ? 'Downloading...'
                      : 'Download Auto HD'}
                  </span>
                </a>
              ) : (
                <button
                  type="button"
                  className={styles.autoHdBtn}
                  onClick={() => onDownloadFormat && onDownloadFormat(highestVideoFormat.id)}
                  disabled={isDownloading}
                  aria-label={`Download Auto HD ${highestVideoFormat.quality}`}
                >
                  <Download size={16} />
                  <span>
                    {isDownloading && downloadingFormatId === highestVideoFormat.id
                      ? 'Preparing...'
                      : 'Download Auto HD'}
                  </span>
                </button>
              );
            })()}
          </div>
        )}

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
                    const dlLink = getFormatDownloadLink(fmt);
                    const filename = getFormatFilename(fmt);
                    return (
                      <div key={fmt.id} className={styles.formatRow}>
                        <div className={styles.formatInfo}>
                          <span className={styles.qualityLabel}>{fmt.quality}</span>
                          <span className={styles.formatBadgeText}>{fmt.format.toUpperCase()}</span>
                          <span className={styles.fileSizeLabel}>
                            {fmt.fileSize || 'Size unavailable'}
                          </span>
                        </div>
                        {dlLink ? (
                          <a
                            href={dlLink}
                            download={filename}
                            className={styles.rowDownloadBtn}
                            onClick={(e) => {
                              e.preventDefault();
                              onDownloadFormat && onDownloadFormat(fmt.id);
                            }}
                            aria-label={`Download MP4 ${fmt.quality}`}
                          >
                            <Download size={14} />
                            <span>
                              {isDownloading && downloadingFormatId === fmt.id
                                ? 'Downloading...'
                                : 'Instant Download'}
                            </span>
                          </a>
                        ) : (
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
                                ? 'Preparing File...'
                                : 'Download'}
                            </span>
                          </button>
                        )}
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
                    const dlLink = getFormatDownloadLink(fmt);
                    const filename = getFormatFilename(fmt);
                    return (
                      <div key={fmt.id} className={styles.formatRow}>
                        <div className={styles.formatInfo}>
                          <span className={styles.qualityLabel}>{fmt.quality}</span>
                          <span className={styles.formatBadgeText}>{fmt.format.toUpperCase()}</span>
                          <span className={styles.fileSizeLabel}>
                            {fmt.fileSize || 'Size unavailable'}
                          </span>
                        </div>
                        {dlLink ? (
                          <a
                            href={dlLink}
                            download={filename}
                            className={styles.rowDownloadBtnAudio}
                            onClick={(e) => {
                              e.preventDefault();
                              onDownloadFormat && onDownloadFormat(fmt.id);
                            }}
                            aria-label="Download MP3 Audio"
                          >
                            <Download size={14} />
                            <span>
                              {isDownloading && downloadingFormatId === fmt.id
                                ? 'Downloading...'
                                : 'Instant Download'}
                            </span>
                          </a>
                        ) : (
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
                                ? 'Preparing File...'
                                : 'Download MP3'}
                            </span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Other Formats (e.g. Pinterest Original Photos) */}
            {otherFormats.length > 0 && (
              <div className={styles.formatGroup}>
                <span className={styles.groupLabel}>Original Image / Other Formats</span>
                <div className={styles.groupItems}>
                  {otherFormats.map((fmt: MediaFormat) => {
                    const dlLink = getFormatDownloadLink(fmt);
                    const filename = getFormatFilename(fmt);
                    return (
                      <div key={fmt.id} className={styles.formatRow}>
                        <div className={styles.formatInfo}>
                          <span className={styles.qualityLabel}>
                            {fmt.quality} ({fmt.format.toUpperCase()})
                          </span>
                          <span className={styles.formatBadgeText}>{fmt.format.toUpperCase()}</span>
                          <span className={styles.fileSizeLabel}>
                            {fmt.fileSize || 'Size unavailable'}
                          </span>
                        </div>
                        {dlLink ? (
                          <a
                            href={dlLink}
                            download={filename}
                            className={styles.rowDownloadBtn}
                            onClick={(e) => {
                              e.preventDefault();
                              onDownloadFormat && onDownloadFormat(fmt.id);
                            }}
                            aria-label={`Download ${fmt.format}`}
                          >
                            <Download size={14} />
                            <span>Download {fmt.format.toUpperCase()}</span>
                          </a>
                        ) : (
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
                        )}
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
