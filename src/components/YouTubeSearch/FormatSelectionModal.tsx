'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Sparkles, Video, Music, Download } from 'lucide-react';
import { YouTubeSearchResult } from '@/lib/youtube-search-service';
import styles from './YouTubeSearch.module.css';

export type DownloadFormatStrategy = 'best_available' | 'mp4' | 'mp3';
export type VideoTargetQuality = '1080p' | '720p' | '480p' | '360p';

export interface FormatSelectionResult {
  strategy: DownloadFormatStrategy;
  targetQuality?: VideoTargetQuality;
  itemFormats: { [videoId: string]: string };
}

interface FormatSelectionModalProps {
  selectedVideos: YouTubeSearchResult[];
  onConfirm: (config: FormatSelectionResult) => void;
  onClose: () => void;
}

export default function FormatSelectionModal({
  selectedVideos,
  onConfirm,
  onClose,
}: FormatSelectionModalProps) {
  const [selectedQuality, setSelectedQuality] = useState<VideoTargetQuality>('720p');
  const [mounted, setMounted] = useState(false);
  const count = selectedVideos.length;

  useEffect(() => {
    setMounted(true);
    // Lock body scroll while modal is open
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  const triggerDownload = (strategy: DownloadFormatStrategy, targetQ?: VideoTargetQuality) => {
    const q = targetQ || (strategy === 'mp4' ? selectedQuality : undefined);
    const itemFormats: { [videoId: string]: string } = {};

    for (const v of selectedVideos) {
      if (strategy === 'mp3') {
        itemFormats[v.id] = 'mp3';
      } else if (strategy === 'best_available') {
        itemFormats[v.id] = v.maxQuality || (v.definition === 'sd' ? '480p' : '720p');
      } else {
        const available = v.availableQualities || (v.definition === 'hd' ? ['1080p', '720p', '480p', '360p'] : ['480p', '360p']);
        const chosen = q || '720p';
        itemFormats[v.id] = available.includes(chosen) ? chosen : (v.maxQuality || '720p');
      }
    }

    onConfirm({
      strategy,
      targetQuality: q,
      itemFormats,
    });
  };

  if (!mounted) return null;

  return createPortal(
    <div className={styles.modalOverlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modalContentCompact} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeaderCompact}>
          <div className={styles.modalHeaderTitleGroup}>
            <h3 className={styles.modalTitleCompact}>Select Download Format</h3>
            <span className={styles.modalSubtitleCompact}>
              {count} {count === 1 ? 'video' : 'videos'} selected • 1-tap instant download
            </span>
          </div>
          <button
            type="button"
            className={styles.modalCloseBtn}
            onClick={onClose}
            aria-label="Close dialog"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className={styles.modalBodyCompact}>
          {/* OPTION 1: Best Available HD (1-Tap Download) */}
          <div className={`${styles.quickFormatCard} ${styles.quickFormatCardRecommended}`}>
            <div className={styles.quickFormatInfo}>
              <div className={styles.quickFormatTitleRow}>
                <span className={styles.quickFormatTitle}>Best Available HD</span>
                <span className={styles.formatBadgeRecommended}>
                  <Sparkles size={11} style={{ marginRight: '3px' }} />
                  RECOMMENDED
                </span>
              </div>
              <p className={styles.quickFormatDesc}>
                Automatically fetches highest available quality (up to 1080p Full HD)
              </p>
            </div>
            <button
              type="button"
              className={styles.quickActionBtnPrimary}
              onClick={() => triggerDownload('best_available')}
              title={`Download ${count} videos in Best HD quality`}
            >
              <Download size={15} strokeWidth={2.4} />
              <span>Download Best HD</span>
            </button>
          </div>

          {/* OPTION 2: MP4 Video with Resolution Select (1-Tap Download) */}
          <div className={styles.quickFormatCard}>
            <div className={styles.quickFormatInfo}>
              <div className={styles.quickFormatTitleRow}>
                <span className={styles.quickFormatTitle}>MP4 Video</span>
                <div className={styles.compactPillsGroup}>
                  {(['1080p', '720p', '480p'] as VideoTargetQuality[]).map((q) => (
                    <button
                      key={q}
                      type="button"
                      className={`${styles.compactPillBtn} ${selectedQuality === q ? styles.compactPillBtnActive : ''}`}
                      onClick={() => setSelectedQuality(q)}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
              <p className={styles.quickFormatDesc}>
                Universal MP4 video file compatible with all phones, TVs and players
              </p>
            </div>
            <button
              type="button"
              className={styles.quickActionBtnSecondary}
              onClick={() => triggerDownload('mp4', selectedQuality)}
              title={`Download ${count} videos in MP4 (${selectedQuality})`}
            >
              <Video size={15} strokeWidth={2.4} />
              <span>Download MP4 ({selectedQuality})</span>
            </button>
          </div>

          {/* OPTION 3: MP3 Audio Only (1-Tap Download) */}
          <div className={styles.quickFormatCard}>
            <div className={styles.quickFormatInfo}>
              <div className={styles.quickFormatTitleRow}>
                <span className={styles.quickFormatTitle}>MP3 Audio Only</span>
                <span className={styles.audioFormatBadge}>320 KBPS</span>
              </div>
              <p className={styles.quickFormatDesc}>
                Extracts clean, high-bitrate MP3 audio stream for offline listening
              </p>
            </div>
            <button
              type="button"
              className={styles.quickActionBtnAudio}
              onClick={() => triggerDownload('mp3')}
              title={`Download audio for ${count} videos`}
            >
              <Music size={15} strokeWidth={2.4} />
              <span>Download MP3</span>
            </button>
          </div>
        </div>

        <div className={styles.modalFooterCompact}>
          <button type="button" className={styles.modalCancelBtnCompact} onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
