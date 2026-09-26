'use client';

import React, { useState } from 'react';
import { Play, Check, Square, CheckSquare, X } from 'lucide-react';
import { YouTubeSearchResult } from '@/lib/youtube-search-service';
import styles from './YouTubeSearch.module.css';

interface SearchResultCardProps {
  video: YouTubeSearchResult;
  isSelected: boolean;
  isPreviewing: boolean;
  onToggleSelect: (video: YouTubeSearchResult) => void;
  onTogglePreview: (video: YouTubeSearchResult) => void;
}

export default function SearchResultCard({
  video,
  isSelected,
  isPreviewing,
  onToggleSelect,
  onTogglePreview,
}: SearchResultCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  const fallbackThumb = `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`;

  return (
    <div
      className={`${styles.resultCard} ${isSelected ? styles.resultCardSelected : ''} ${
        isPreviewing ? styles.resultCardPreviewing : ''
      }`}
      onClick={() => onToggleSelect(video)}
      role="button"
      tabIndex={0}
      aria-label={`Select ${video.title}`}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          onToggleSelect(video);
        }
      }}
    >
      {/* Thumbnail or Inline Player Container */}
      <div
        className={`${styles.cardThumbnailContainer} ${
          isPreviewing ? styles.cardThumbnailWithPlayer : ''
        }`}
        onClick={(e) => {
          if (!isPreviewing) {
            e.stopPropagation();
            onTogglePreview(video);
          }
        }}
        title={isPreviewing ? 'Video playing inline' : 'Click to preview right here'}
      >
        {isPreviewing ? (
          <div className={styles.inlinePlayerWrapper} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className={styles.closeInlinePreviewBtn}
              onClick={(e) => {
                e.stopPropagation();
                onTogglePreview(video);
              }}
              title="Close preview"
            >
              <X size={12} strokeWidth={2.5} />
              <span>Close</span>
            </button>
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&enablejsapi=1&rel=0&modestbranding=1&playsinline=1`}
              title={video.title}
              className={styles.inlinePlayerIframe}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        ) : (
          <>
            {!imageLoaded && !imageFailed && <div className={styles.skeletonThumb} />}

            <img
              src={imageFailed ? fallbackThumb : video.thumbnailUrl}
              alt={video.title}
              className={styles.cardThumbnailImage}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                if (!imageFailed) {
                  setImageFailed(true);
                }
              }}
              style={{ opacity: imageLoaded || imageFailed ? 1 : 0 }}
            />

            {/* Duration badge */}
            {video.duration && <span className={styles.cardDurationBadge}>{video.duration}</span>}

            {/* Hover play overlay */}
            <div className={styles.cardPlayOverlay}>
              <div className={styles.cardPlayCircle}>
                <Play size={18} fill="#2563eb" strokeWidth={0} style={{ marginLeft: '2px' }} />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Card Body */}
      <div className={styles.cardBody}>
        {/* Title */}
        <h4 className={styles.cardTitle} title={video.title}>
          {video.title}
        </h4>

        {/* Channel and Metadata */}
        <div className={styles.cardMetaRow}>
          <span className={styles.cardChannelName} title={video.channelTitle}>
            {video.channelTitle}
          </span>
          {video.viewCount && (
            <>
              <span className={styles.cardMetaDot}>•</span>
              <span>{video.viewCount}</span>
            </>
          )}
          {video.publishedTimeAgo && (
            <>
              <span className={styles.cardMetaDot}>•</span>
              <span>{video.publishedTimeAgo}</span>
            </>
          )}
        </div>

        {/* Card Footer Actions */}
        <div className={styles.cardFooterActions} onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className={`${styles.previewBtn} ${isPreviewing ? styles.previewBtnActive : ''}`}
            onClick={() => onTogglePreview(video)}
            title={isPreviewing ? 'Stop preview' : 'Play video right here'}
          >
            {isPreviewing ? (
              <>
                <X size={12} strokeWidth={2.5} />
                <span>Stop</span>
              </>
            ) : (
              <>
                <Play size={12} fill="currentColor" strokeWidth={0} />
                <span>Preview</span>
              </>
            )}
          </button>

          <button
            type="button"
            className={`${styles.selectToggleBtn} ${
              isSelected ? styles.selectToggleBtnSelected : ''
            }`}
            onClick={() => onToggleSelect(video)}
          >
            {isSelected ? (
              <>
                <CheckSquare size={13} strokeWidth={2.4} />
                <span>Selected</span>
              </>
            ) : (
              <>
                <Square size={13} strokeWidth={2} />
                <span>Select</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
