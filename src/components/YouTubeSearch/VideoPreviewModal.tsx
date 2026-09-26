'use client';

import React, { useState, useEffect } from 'react';
import { X, Play, AlertCircle, ExternalLink } from 'lucide-react';
import { YouTubeSearchResult } from '@/lib/youtube-search-service';
import styles from './YouTubeSearch.module.css';

interface VideoPreviewModalProps {
  video: YouTubeSearchResult | null;
  onClose: () => void;
}

export default function VideoPreviewModal({ video, onClose }: VideoPreviewModalProps) {
  const [embedError, setEmbedError] = useState(false);

  useEffect(() => {
    setEmbedError(false);
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
    <div className={styles.modalOverlay} onClick={onClose} role="dialog" aria-modal="true">
      <div
        className={`${styles.modalContent} ${styles.previewModalContent}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle} title={video.title}>
            {video.title}
          </h3>
          <button
            type="button"
            className={styles.modalCloseBtn}
            onClick={onClose}
            aria-label="Close preview"
          >
            <X size={18} />
          </button>
        </div>

        <div className={styles.previewIframeWrapper}>
          {!embedError ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&enablejsapi=1&rel=0&modestbranding=1`}
              title={video.title}
              className={styles.previewIframe}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              onError={() => setEmbedError(true)}
            />
          ) : (
            <div className={styles.previewUnavailable}>
              <AlertCircle size={36} color="#ef4444" />
              <p style={{ margin: 0, fontWeight: 600, fontSize: '1.05rem', color: '#f8fafc' }}>
                Preview unavailable for this video.
              </p>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
                The creator may have restricted third-party embedded playback.
              </p>
              <a
                href={video.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#38bdf8',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  marginTop: '6px',
                  textDecoration: 'none',
                }}
              >
                <span>Watch on YouTube</span>
                <ExternalLink size={14} />
              </a>
            </div>
          )}
        </div>

        <div style={{ padding: '14px 20px', background: '#0f172a', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#94a3b8' }}>
              <span style={{ fontWeight: 600, color: '#f1f5f9' }}>{video.channelTitle}</span>
              {video.duration && <span>• {video.duration}</span>}
              {video.viewCount && <span>• {video.viewCount}</span>}
              {video.publishedTimeAgo && <span>• {video.publishedTimeAgo}</span>}
            </div>
            <a
              href={video.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '0.82rem',
                color: '#38bdf8',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>YouTube Link</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
