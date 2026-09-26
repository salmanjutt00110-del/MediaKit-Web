'use client';

import React, { useState } from 'react';
import { X, Sparkles, Video, Music, Check, Info, AlertTriangle } from 'lucide-react';
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
  const [strategy, setStrategy] = useState<DownloadFormatStrategy>('best_available');
  const [targetQuality, setTargetQuality] = useState<VideoTargetQuality>('720p');
  const [fallbackMode, setFallbackMode] = useState<'best_available' | 'skip'>('best_available');

  const count = selectedVideos.length;

  // Calculate dynamic availability across selected videos (Section 8)
  const count1080p = selectedVideos.filter(
    (v) => (v.availableQualities || []).includes('1080p') || v.maxQuality === '1080p'
  ).length;
  const count720p = selectedVideos.filter(
    (v) => (v.availableQualities || []).includes('720p') || v.maxQuality === '720p' || v.maxQuality === '1080p'
  ).length;
  const count480p = selectedVideos.filter(
    (v) => (v.availableQualities || []).includes('480p') || v.maxQuality !== undefined
  ).length;
  const count360p = selectedVideos.length;

  // Determine the per-video expected format based on actual capabilities
  const getItemExpectedQuality = (
    video: YouTubeSearchResult
  ): { quality: string; isFallback: boolean; isUnavailable: boolean } => {
    if (strategy === 'mp3') {
      return { quality: 'MP3 Audio', isFallback: false, isUnavailable: false };
    }

    const available =
      video.availableQualities ||
      (video.definition === 'hd' ? ['1080p', '720p', '480p', '360p'] : ['480p', '360p']);
    const maxQ = video.maxQuality || (video.definition === 'sd' ? '480p' : '720p');

    if (strategy === 'best_available') {
      return { quality: maxQ, isFallback: false, isUnavailable: false };
    }

    // MP4 mode with specific quality choice
    const supportsChosen = available.includes(targetQuality);
    if (supportsChosen) {
      return { quality: targetQuality, isFallback: false, isUnavailable: false };
    }

    // When chosen quality is unavailable
    if (fallbackMode === 'best_available') {
      return { quality: maxQ, isFallback: true, isUnavailable: false };
    }

    return { quality: `${targetQuality} Unavailable`, isFallback: false, isUnavailable: true };
  };

  const handleStart = () => {
    const itemFormats: { [videoId: string]: string } = {};
    for (const v of selectedVideos) {
      const exp = getItemExpectedQuality(v);
      if (exp.isUnavailable) continue;
      itemFormats[v.id] = strategy === 'mp3' ? 'mp3' : exp.quality;
    }

    onConfirm({
      strategy,
      targetQuality: strategy === 'mp4' ? targetQuality : undefined,
      itemFormats,
    });
  };

  const hasAnyFallback =
    strategy === 'mp4' && selectedVideos.some((v) => getItemExpectedQuality(v).isFallback);

  return (
    <div className={styles.modalOverlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.bottomSheetHandle} aria-hidden="true" />
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Choose Download Format</h3>
          <button
            type="button"
            className={styles.modalCloseBtn}
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <p style={{ margin: 0, fontSize: '0.92rem', color: '#64748b' }}>
            Select download format for <strong>{count} selected {count === 1 ? 'video' : 'videos'}</strong>:
          </p>

          <div className={styles.formatOptionsList}>
            {/* Category: VIDEO */}
            <div className={styles.formatCategoryHeader}>
              <Video size={14} color="#0284c7" />
              <span>VIDEO</span>
            </div>

            {/* Option 1: Best Available (Recommended) */}
            <div
              className={`${styles.formatOptionCard} ${
                strategy === 'best_available' ? styles.formatOptionCardActive : ''
              }`}
              onClick={() => setStrategy('best_available')}
            >
              <div className={styles.formatRadioCircle} />
              <div className={styles.formatOptionContent}>
                <div className={styles.formatOptionTitleRow}>
                  <span className={styles.formatOptionTitle}>Best Available</span>
                  <span className={styles.formatBadgeRecommended}>
                    <Sparkles size={11} style={{ display: 'inline', marginRight: '3px' }} />
                    Recommended
                  </span>
                </div>
                <p className={styles.formatOptionDesc}>
                  Automatically selects the highest suitable authentic HD quality available for <strong>each</strong> video independently (1080p, 720p, or 480p) without stretching or distortion.
                </p>
              </div>
            </div>

            {/* Option 2: Specific MP4 Quality */}
            <div
              className={`${styles.formatOptionCard} ${
                strategy === 'mp4' ? styles.formatOptionCardActive : ''
              }`}
              onClick={() => setStrategy('mp4')}
            >
              <div className={styles.formatRadioCircle} />
              <div className={styles.formatOptionContent}>
                <div className={styles.formatOptionTitleRow}>
                  <span className={styles.formatOptionTitle}>MP4 Video</span>
                  <Video size={16} color="#0284c7" />
                </div>
                <p className={styles.formatOptionDesc}>
                  Universal MP4 video with embedded audio. Choose your preferred target resolution:
                </p>

                {strategy === 'mp4' && (
                  <div style={{ marginTop: '10px' }} onClick={(e) => e.stopPropagation()}>
                    <div className={styles.formatSubQualityPills}>
                      {count1080p > 0 && (
                        <button
                          type="button"
                          className={`${styles.subQualityPill} ${
                            targetQuality === '1080p' ? styles.subQualityPillActive : ''
                          }`}
                          onClick={() => setTargetQuality('1080p')}
                        >
                          1080p Full HD ({count1080p}/{count})
                        </button>
                      )}
                      <button
                        type="button"
                        className={`${styles.subQualityPill} ${
                          targetQuality === '720p' ? styles.subQualityPillActive : ''
                        }`}
                        onClick={() => setTargetQuality('720p')}
                      >
                        720p HD ({count720p}/{count})
                      </button>
                      <button
                        type="button"
                        className={`${styles.subQualityPill} ${
                          targetQuality === '480p' ? styles.subQualityPillActive : ''
                        }`}
                        onClick={() => setTargetQuality('480p')}
                      >
                        480p SD ({count480p}/{count})
                      </button>
                      <button
                        type="button"
                        className={`${styles.subQualityPill} ${
                          targetQuality === '360p' ? styles.subQualityPillActive : ''
                        }`}
                        onClick={() => setTargetQuality('360p')}
                      >
                        360p Fast ({count360p}/{count})
                      </button>
                    </div>

                    {/* Fallback choice when a video doesn't support the chosen target quality */}
                    <div style={{ marginTop: '10px', fontSize: '0.8rem', color: '#475569' }}>
                      <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={fallbackMode === 'best_available'}
                          onChange={(e) => setFallbackMode(e.target.checked ? 'best_available' : 'skip')}
                        />
                        <span>Use Best Available quality for videos where {targetQuality} is unavailable</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Category: AUDIO */}
            <div className={styles.formatCategoryHeader} style={{ marginTop: '12px' }}>
              <Music size={14} color="#0284c7" />
              <span>AUDIO</span>
            </div>

            {/* Option 3: MP3 Audio Only */}
            <div
              className={`${styles.formatOptionCard} ${
                strategy === 'mp3' ? styles.formatOptionCardActive : ''
              }`}
              onClick={() => setStrategy('mp3')}
            >
              <div className={styles.formatRadioCircle} />
              <div className={styles.formatOptionContent}>
                <div className={styles.formatOptionTitleRow}>
                  <span className={styles.formatOptionTitle}>MP3 / Audio Only</span>
                  <Music size={16} color="#0284c7" />
                </div>
                <p className={styles.formatOptionDesc}>
                  Extracts high-bitrate MP3 audio stream for offline listening, lectures, Naats, podcasts, and speeches.
                </p>
              </div>
            </div>
          </div>

          {/* Download Summary Section (Section 10) */}
          <div className={styles.formatSummaryCard}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#0f172a' }}>
                <Info size={16} color="#0284c7" />
                <span>Download Summary</span>
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0284c7' }}>
                {count} {count === 1 ? 'video' : 'videos'} selected
              </span>
            </div>

            <div style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '8px' }}>
              Mode:{' '}
              <strong style={{ color: '#0f172a' }}>
                {strategy === 'best_available'
                  ? 'Best Available'
                  : strategy === 'mp4'
                  ? `MP4 Video (${targetQuality})`
                  : 'MP3 / Audio Only'}
              </strong>
            </div>

            <details className={styles.formatPerVideoDetails}>
              <summary className={styles.formatDetailsSummary}>
                <span>View {selectedVideos.length} videos format preview</span>
              </summary>
              <div className={styles.formatPerVideoList}>
                {selectedVideos.map((video, idx) => {
                  const exp = getItemExpectedQuality(video);
                  return (
                    <div key={video.id} className={styles.formatPerVideoItem}>
                      <span className={styles.formatPerVideoTitle} title={video.title}>
                        {idx + 1}. {video.title}
                      </span>
                      {exp.isUnavailable ? (
                        <span className={styles.formatFallbackBadge} style={{ background: '#fef2f2', color: '#dc2626' }}>
                          Skip
                        </span>
                      ) : exp.isFallback ? (
                        <span className={styles.formatFallbackBadge}>
                          {exp.quality}
                        </span>
                      ) : (
                        <span className={styles.formatQualityBadge}>{exp.quality}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </details>

            {hasAnyFallback && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#b45309', marginTop: '8px' }}>
                <AlertTriangle size={14} color="#f59e0b" style={{ flexShrink: 0 }} />
                <span>
                  Videos where {targetQuality} is unavailable will use their highest real quality.
                </span>
              </div>
            )}
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button type="button" className={styles.modalCancelBtn} onClick={onClose}>
            Cancel
          </button>
          <button type="button" className={styles.modalPrimaryBtn} onClick={handleStart}>
            <Download size={16} />
            <span>Start Download ({count})</span>
          </button>
        </div>
      </div>
    </div>
  );
}
