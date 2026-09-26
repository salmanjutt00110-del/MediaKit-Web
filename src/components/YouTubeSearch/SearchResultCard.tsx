'use client';

import React, { useState } from 'react';
import { Play, Check, Square, CheckSquare } from 'lucide-react';
import { YouTubeSearchResult } from '@/lib/youtube-search-service';
import styles from './YouTubeSearch.module.css';

interface SearchResultCardProps {
  video: YouTubeSearchResult;
  isSelected: boolean;
  onToggleSelect: (video: YouTubeSearchResult) => void;
  onPreview: (video: YouTubeSearchResult) => void;
}

export default function SearchResultCard({
  video,
  isSelected,
  onToggleSelect,
  onPreview,
}: SearchResultCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  const fallbackThumb = `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`;

  return (
    <div
      className={`${styles.resultCard} ${isSelected ? styles.resultCardSelected : ''}`}
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
      {/* Thumbnail Container (Left) */}
      <div
        className={styles.cardThumbnailContainer}
        onClick={(e) => {
          e.stopPropagation();
          onPreview(video);
        }}
        title="Click to preview video in floating mini-player"
      >
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
      </div>

      {/* Card Body (Right) */}
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
            className={styles.previewBtn}
            onClick={() => onPreview(video)}
            title="Preview video in mini-player"
          >
            <Play size={12} fill="currentColor" strokeWidth={0} />
            <span>Preview</span>
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
