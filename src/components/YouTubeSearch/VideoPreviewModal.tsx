'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, ExternalLink, Minimize2, AlertCircle } from 'lucide-react';
import { YouTubeSearchResult } from '@/lib/youtube-search-service';
import styles from './YouTubeSearch.module.css';

interface VideoPreviewModalProps {
  video: YouTubeSearchResult | null;
  onClose: () => void;
}

export default function VideoPreviewModal({ video, onClose }: VideoPreviewModalProps) {
  const [embedError, setEmbedError] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    setEmbedError(false);
    setIsMinimized(false);
  }, [video?.id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!video) return null;

  return (
    <div className={`${styles.miniPlayer} ${isMinimized ? styles.miniPlayerMinimized : ''}`}>
      {/* Mini Player Header */}
      <div className={styles.miniPlayerHeader}>
        <span className={styles.miniPlayerTitle} title={video.title}>
          {video.title}
        </span>
        <div className={styles.miniPlayerControls}>
          <button
            type="button"
            className={styles.miniPlayerBtn}
            onClick={() => setIsMinimized(!isMinimized)}
            aria-label={isMinimized ? 'Expand player' : 'Minimize player'}
            title={isMinimized ? 'Expand' : 'Minimize'}
          >
            <Minimize2 size={14} />
          </button>
          <a
            href={video.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.miniPlayerBtn}
            title="Open on YouTube"
          >
            <ExternalLink size={14} />
          </a>
          <button
            type="button"
            className={styles.miniPlayerBtn}
            onClick={onClose}
            aria-label="Close player"
            title="Close"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Mini Player Body */}
      {!isMinimized && (
        <div className={styles.miniPlayerBody}>
          {!embedError ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&enablejsapi=1&rel=0&modestbranding=1&playsinline=1`}
              title={video.title}
              className={styles.miniPlayerIframe}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              onError={() => setEmbedError(true)}
            />
          ) : (
            <div className={styles.miniPlayerError}>
              <AlertCircle size={20} color="#ef4444" />
              <span>Preview unavailable</span>
              <a
                href={video.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.miniPlayerLink}
              >
                Watch on YouTube <ExternalLink size={12} />
              </a>
            </div>
          )}
        </div>
      )}

      {/* Mini info bar */}
      {!isMinimized && (
        <div className={styles.miniPlayerInfo}>
          <span>{video.channelTitle}</span>
          {video.duration && <span>• {video.duration}</span>}
          {video.viewCount && <span>• {video.viewCount}</span>}
        </div>
      )}
    </div>
  );
}
