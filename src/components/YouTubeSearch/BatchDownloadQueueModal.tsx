'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Download,
  Loader2,
  FileCheck,
  Film,
  Music,
  StopCircle,
  Ban,
  AlertTriangle,
} from 'lucide-react';
import { YouTubeSearchResult } from '@/lib/youtube-search-service';
import { FormatSelectionResult } from './FormatSelectionModal';
import { sanitizeFilename, safeEncodeURIComponent } from '@/lib/string-utils';
import styles from './YouTubeSearch.module.css';

export type QueueItemStatus =
  | 'waiting'
  | 'preparing'
  | 'fetching'
  | 'processing'
  | 'downloading'
  | 'validating'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface QueueItem {
  id: string;
  video: YouTubeSearchResult;
  status: QueueItemStatus;
  formatId: string;
  formatLabel: string;
  isAudio: boolean;
  progressPercent?: number; // Only set if authentic percentage is available
  stageMessage: string;
  downloadUrl?: string;
  fileSizeFormatted?: string;
  fileSizeBytes?: number;
  actualResolution?: string;
  filename: string;
  error?: string;
  retryCount: number;
}

interface BatchDownloadQueueModalProps {
  selectedVideos: YouTubeSearchResult[];
  formatConfig: FormatSelectionResult;
  onClose: () => void;
}

export default function BatchDownloadQueueModal({
  selectedVideos,
  formatConfig,
  onClose,
}: BatchDownloadQueueModalProps) {
  const [mounted, setMounted] = useState(false);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const queueRef = useRef<QueueItem[]>([]);
  const isCanceledRef = useRef(false);
  const activeAbortControllersRef = useRef<Map<string, AbortController>>(new Map());
  const downloadQueueRef = useRef<{ url: string; filename: string }[]>([]);
  const isDispatchingRef = useRef(false);

  // Body scroll lock on mount to maintain viewport focus
  useEffect(() => {
    setMounted(true);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Generate safe sanitized filenames with unique duplicate numbering (Section 17)
  const generateUniqueFilenames = (videos: YouTubeSearchResult[], isAudio: boolean): string[] => {
    const ext = isAudio ? 'mp3' : 'mp4';
    const filenameCounts = new Map<string, number>();
    const results: string[] = [];

    for (const v of videos) {
      const baseClean = sanitizeFilename(`${v.channelTitle} - ${v.title}`, ext);
      const nameWithoutExt = baseClean.replace(/\.[^/.]+$/, '');
      const count = filenameCounts.get(nameWithoutExt) || 0;
      filenameCounts.set(nameWithoutExt, count + 1);

      if (count === 0) {
        results.push(`${nameWithoutExt}.${ext}`);
      } else {
        results.push(`${nameWithoutExt} (${count + 1}).${ext}`);
      }
    }

    return results;
  };

  // Initialize queue on mount
  useEffect(() => {
    isCanceledRef.current = false;
    const isAudio = formatConfig.strategy === 'mp3';
    const uniqueNames = generateUniqueFilenames(selectedVideos, isAudio);

    const items: QueueItem[] = selectedVideos.map((video, idx) => {
      const chosenFmt = formatConfig.itemFormats?.[video.id] || (isAudio ? 'mp3' : '720p');
      const label = isAudio
        ? 'MP3 Audio'
        : formatConfig.strategy === 'best_available'
        ? `Best (${chosenFmt})`
        : `MP4 ${chosenFmt}`;

      return {
        id: `${video.id}_${idx}_${Date.now()}`,
        video,
        status: 'waiting',
        formatId: chosenFmt,
        formatLabel: label,
        isAudio,
        stageMessage: 'Waiting in queue...',
        filename: uniqueNames[idx] || `${video.id}.${isAudio ? 'mp3' : 'mp4'}`,
        retryCount: 0,
      };
    });

    setQueue(items);
    queueRef.current = items;
    startQueue(items);

    return () => {
      isCanceledRef.current = true;
      // Abort all active fetch requests
      for (const ctrl of activeAbortControllersRef.current.values()) {
        ctrl.abort();
      }
      activeAbortControllersRef.current.clear();
      downloadQueueRef.current = [];
    };
  }, []);

  const updateItem = (id: string, patch: Partial<QueueItem>) => {
    setQueue((prev) => {
      const next = prev.map((item) => (item.id === id ? { ...item, ...patch } : item));
      queueRef.current = next;
      return next;
    });
  };

  const triggerBrowserFileDownload = (url: string, filename: string) => {
    if (typeof window === 'undefined') return;
    try {
      const a = document.createElement('a');
      a.href = url;
      a.setAttribute('download', filename);
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        try {
          document.body.removeChild(a);
        } catch {}
      }, 4000);
    } catch (err) {
      console.error('Download trigger error:', err);
    }
  };

  // Staggered browser download dispatcher: triggers 1 file every 1000ms to prevent browser socket drops
  const enqueueBrowserDownload = (url: string, filename: string) => {
    downloadQueueRef.current.push({ url, filename });
    processDownloadDispatcher();
  };

  const processDownloadDispatcher = async () => {
    if (isDispatchingRef.current) return;
    isDispatchingRef.current = true;

    while (downloadQueueRef.current.length > 0 && !isCanceledRef.current) {
      const next = downloadQueueRef.current.shift();
      if (next) {
        triggerBrowserFileDownload(next.url, next.filename);
        await new Promise((r) => setTimeout(r, 1000));
      }
    }

    isDispatchingRef.current = false;
  };

  const processSingleItem = async (item: QueueItem): Promise<boolean> => {
    if (isCanceledRef.current) return false;

    const controller = new AbortController();
    activeAbortControllersRef.current.set(item.id, controller);

    // Timeout protection: prevent any batch job from remaining stuck/pending forever
    const timeoutId = setTimeout(() => {
      try {
        controller.abort();
      } catch {}
    }, 75000);

    try {
      // 1. Preparing stage
      updateItem(item.id, {
        status: 'preparing',
        stageMessage: 'Connecting...',
      });

      if (isCanceledRef.current) return false;

      const res = await fetch('/api/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream, application/json',
        },
        body: JSON.stringify({
          url: item.video.videoUrl,
          formatId: item.formatId,
          mediaInfo: {
            id: item.video.id,
            title: item.video.title,
            author: item.video.channelTitle,
            duration: item.video.duration,
            thumbnailUrl: item.video.thumbnailUrl,
            sourceUrl: item.video.videoUrl,
            platform: 'youtube',
          },
        }),
        signal: controller.signal,
      });

      if (isCanceledRef.current) return false;

      let dlResultData: any = null;

      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('text/event-stream') && res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split('\n\n');
          buffer = parts.pop() || '';

          for (const chunk of parts) {
            const trimmed = chunk.trim();
            if (!trimmed.startsWith('data:')) continue;
            try {
              const payload = JSON.parse(trimmed.slice(5).trim());
              if (payload.type === 'progress') {
                updateItem(item.id, {
                  status: 'downloading',
                  stageMessage: payload.stage || 'Downloading stream...',
                  progressPercent: payload.percent,
                });
              } else if (payload.type === 'complete') {
                dlResultData = payload.data;
              } else if (payload.type === 'error') {
                throw new Error(payload.message || 'Media stream generation failed');
              }
            } catch (pErr: any) {
              if (pErr.message && !pErr.message.includes('JSON')) throw pErr;
            }
          }
        }
      } else {
        updateItem(item.id, {
          status: 'downloading',
          stageMessage: 'Downloading stream...',
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.success || !data.data?.downloadUrl) {
          throw new Error(data?.error?.message || 'Media stream generation failed');
        }
        dlResultData = data.data;
      }

      if (!dlResultData || !dlResultData.downloadUrl) {
        // Auto-retry up to 2 times with a slight delay
        if (item.retryCount < 2 && !isCanceledRef.current) {
          updateItem(item.id, {
            status: 'preparing',
            stageMessage: 'Retrying stream connection...',
            retryCount: item.retryCount + 1,
          });
          await new Promise((r) => setTimeout(r, 1000));
          return processSingleItem({ ...item, retryCount: item.retryCount + 1 });
        }
        throw new Error('Media stream generation failed');
      }

      const rawDlUrl = dlResultData.downloadUrl;
      const preliminarySize = dlResultData.fileSize || dlResultData.fileSizeFormatted;

      // 3. Downloading stage
      updateItem(item.id, {
        status: 'downloading',
        stageMessage: 'Saving...',
        downloadUrl: rawDlUrl,
      });

      const safeBaseTitle = item.filename.replace(/\.[^/.]+$/, '');
      const ext = item.isAudio ? 'mp3' : 'mp4';

      let finalDownloadUrl = rawDlUrl;
      if (rawDlUrl.startsWith('/api/download/serve')) {
        try {
          const u = new URL(rawDlUrl, typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
          u.searchParams.set('title', safeBaseTitle);
          finalDownloadUrl = u.pathname + u.search;
        } catch {}
      } else if (!rawDlUrl.startsWith('/api/download/file')) {
        finalDownloadUrl = `/api/download/file?url=${safeEncodeURIComponent(rawDlUrl)}&title=${safeEncodeURIComponent(safeBaseTitle)}&ext=${ext}`;
      }

      // 4. Completed state (Immediate fast handover)
      updateItem(item.id, {
        status: 'completed',
        stageMessage: 'Completed ✓',
        downloadUrl: finalDownloadUrl,
        fileSizeFormatted: preliminarySize || (item.isAudio ? 'Audio HQ' : 'HD Ready'),
        actualResolution: dlResultData.resolution || (item.isAudio ? 'Audio HQ' : item.formatId),
      });

      // Safely enqueue into staggered download dispatcher
      enqueueBrowserDownload(finalDownloadUrl, item.filename);

      return true;
    } catch (err: any) {
      if (err.name === 'AbortError' || isCanceledRef.current) {
        updateItem(item.id, {
          status: 'cancelled',
          stageMessage: 'Cancelled',
        });
        return false;
      }

      // Auto-retry transient failures up to 2 times with a backoff delay before failing
      if (item.retryCount < 2 && !isCanceledRef.current) {
        updateItem(item.id, {
          status: 'preparing',
          stageMessage: `Retrying (${item.retryCount + 1}/2)...`,
          retryCount: item.retryCount + 1,
        });
        await new Promise((r) => setTimeout(r, 1500));
        return processSingleItem({ ...item, retryCount: item.retryCount + 1 });
      }

      const errMsg = err?.message || 'Unable to download this file right now.';
      updateItem(item.id, {
        status: 'failed',
        stageMessage: '✕ Download Failed',
        error: errMsg,
      });
      return false;
    } finally {
      clearTimeout(timeoutId);
      activeAbortControllersRef.current.delete(item.id);
    }
  };

  const startQueue = async (items: QueueItem[]) => {
    setIsRunning(true);
    setIsDone(false);

    // Controlled concurrency of 3 workers: fast throughput without overloading network
    const concurrency = 3;
    let index = 0;

    const worker = async () => {
      while (index < items.length && !isCanceledRef.current) {
        const currentIndex = index++;
        const item = items[currentIndex];
        if (item && item.status !== 'completed' && item.status !== 'cancelled') {
          await processSingleItem(item);
          // 200ms spacing between starting new items
          await new Promise((r) => setTimeout(r, 200));
        }
      }
    };

    const workers = Array.from({ length: Math.min(concurrency, items.length) }).map(() => worker());
    await Promise.all(workers);

    if (!isCanceledRef.current) {
      setIsRunning(false);
      setIsDone(true);
    }
  };

  // Section 19: Cancel Queue implementation
  const handleConfirmCancelQueue = () => {
    isCanceledRef.current = true;
    setShowCancelConfirm(false);

    // Abort active fetch requests
    for (const ctrl of activeAbortControllersRef.current.values()) {
      ctrl.abort();
    }
    activeAbortControllersRef.current.clear();

    // Mark waiting and active items as cancelled (completed remain completed)
    setQueue((prev) =>
      prev.map((item) => {
        if (item.status === 'completed') return item;
        return {
          ...item,
          status: 'cancelled',
          stageMessage: 'Cancelled',
        };
      })
    );

    setIsRunning(false);
    setIsDone(true);
  };

  // Section 18: Retry failed items with limit
  const handleRetryFailed = async () => {
    isCanceledRef.current = false;
    const failedItems = queueRef.current.filter((i) => i.status === 'failed' && i.retryCount < 3);
    if (failedItems.length === 0) return;

    for (const item of failedItems) {
      updateItem(item.id, {
        status: 'waiting',
        error: undefined,
        stageMessage: 'Waiting in queue...',
        retryCount: item.retryCount + 1,
      });
    }

    startQueue(failedItems);
  };

  const total = queue.length;
  const completedCount = queue.filter((i) => i.status === 'completed').length;
  const failedCount = queue.filter((i) => i.status === 'failed').length;
  const cancelledCount = queue.filter((i) => i.status === 'cancelled').length;
  const inProgressCount = queue.filter(
    (i) =>
      i.status === 'preparing' ||
      i.status === 'fetching' ||
      i.status === 'processing' ||
      i.status === 'downloading' ||
      i.status === 'validating'
  ).length;

  const totalProgressPercent = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  if (!mounted) return null;

  return createPortal(
    <div className={styles.modalOverlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.bottomSheetHandle} aria-hidden="true" />
        <div className={styles.modalHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 className={styles.modalTitle}>Batch Download Queue</h3>
            <span className={styles.selectionCountBadge}>
              {completedCount} / {total} Completed
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isRunning && !showCancelConfirm && (
              <button
                type="button"
                className={styles.queueCancelBtn}
                onClick={() => setShowCancelConfirm(true)}
                title="Cancel remaining downloads in queue"
              >
                Cancel Queue
              </button>
            )}
            <button
              type="button"
              className={styles.modalCloseBtn}
              onClick={onClose}
              aria-label="Close queue dialog"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className={styles.modalBody}>
          {/* Cancel Queue Confirmation Box (Section 19) */}
          {showCancelConfirm && (
            <div className={styles.confirmCancelBox}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={18} color="#e11d48" />
                <span className={styles.confirmCancelText}>Cancel remaining downloads?</span>
              </div>
              <div className={styles.confirmCancelActions}>
                <button
                  type="button"
                  className={styles.confirmCancelYesBtn}
                  onClick={handleConfirmCancelQueue}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={styles.confirmCancelNoBtn}
                  onClick={() => setShowCancelConfirm(false)}
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Global Progress Bar */}
          <div>
            <div className={styles.queueProgressHeader}>
              <span>
                {isRunning
                  ? `Processing batch (${inProgressCount} active, controlled concurrency)...`
                  : isDone
                  ? cancelledCount > 0
                    ? 'Queue Finished (Some cancelled)'
                    : 'Download Complete'
                  : 'Preparing queue...'}
              </span>
              <span>{totalProgressPercent}%</span>
            </div>
            <div className={styles.queueProgressBarTrack}>
              <div
                className={styles.queueProgressBarFill}
                style={{ width: `${totalProgressPercent}%` }}
              />
            </div>
          </div>

          {/* Queue Items List (Section 11 & 12) */}
          <div className={styles.queueItemsList}>
            {queue.map((item, idx) => (
              <div key={item.id} className={styles.queueItemCard}>
                <div className={styles.queueItemInfo}>
                  <img
                    src={item.video.thumbnailUrl}
                    alt={item.video.title}
                    className={styles.queueItemThumb}
                  />
                  <div className={styles.queueItemText}>
                    <span className={styles.queueItemTitle} title={item.video.title}>
                      {idx + 1}. {item.video.title}
                    </span>
                    <div className={styles.queueItemMeta}>
                      <span>{item.video.channelTitle}</span>
                      <span>•</span>
                      <span className={styles.queueFormatBadge}>{item.formatLabel}</span>
                      {item.fileSizeFormatted && (
                        <>
                          <span>•</span>
                          <span style={{ fontWeight: 600, color: '#2563eb' }}>
                            {item.fileSizeFormatted}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {/* Status Badges */}
                  {item.status === 'waiting' && (
                    <span className={`${styles.queueItemStatusBadge} ${styles.statusWaiting}`}>
                      Waiting
                    </span>
                  )}
                  {(item.status === 'preparing' ||
                    item.status === 'fetching' ||
                    item.status === 'processing' ||
                    item.status === 'downloading' ||
                    item.status === 'validating') && (
                    <span className={`${styles.queueItemStatusBadge} ${styles.statusDownloading}`}>
                      <Loader2 size={13} className={styles.loadingSpinnerSmall} />
                      <span>{item.stageMessage}</span>
                    </span>
                  )}
                  {item.status === 'completed' && (
                    <span className={`${styles.queueItemStatusBadge} ${styles.statusCompleted}`}>
                      <CheckCircle2 size={14} color="#059669" />
                      <span>Completed ✓</span>
                    </span>
                  )}
                  {item.status === 'failed' && (
                    <span
                      className={`${styles.queueItemStatusBadge} ${styles.statusFailed}`}
                      title={item.error}
                    >
                      <AlertCircle size={14} color="#dc2626" />
                      <span>{item.stageMessage}</span>
                    </span>
                  )}
                  {item.status === 'cancelled' && (
                    <span className={`${styles.queueItemStatusBadge} ${styles.statusCancelled}`}>
                      <Ban size={13} color="#6b7280" />
                      <span>Cancelled</span>
                    </span>
                  )}

                  {/* Actions */}
                  {item.status === 'completed' && item.downloadUrl && (
                    <button
                      type="button"
                      className={styles.queueItemActionBtn}
                      onClick={() => triggerBrowserFileDownload(item.downloadUrl!, item.filename)}
                      title="Save again to Downloads"
                    >
                      <Download size={13} />
                    </button>
                  )}
                  {item.status === 'failed' && (
                    <button
                      type="button"
                      className={styles.queueItemActionBtn}
                      onClick={() => processSingleItem(item)}
                      title="Retry this download"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      <RefreshCw size={12} />
                      <span>Retry</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Final Summary Box (Section 20) */}
          {isDone && (
            <div className={styles.finalSummaryCard}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', letterSpacing: '0.02em' }}>
                  DOWNLOAD COMPLETE
                </span>
                <div className={styles.summaryCounts}>
                  <span className={styles.summaryTotal}>Total selected: {total}</span>
                  <span className={styles.summarySuccess}>Completed: {completedCount}</span>
                  {failedCount > 0 && (
                    <span className={styles.summaryFailed}>Failed: {failedCount}</span>
                  )}
                  {cancelledCount > 0 && (
                    <span style={{ color: '#64748b' }}>Cancelled: {cancelledCount}</span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {failedCount > 0 && (
                  <button
                    type="button"
                    className={styles.modalCancelBtn}
                    onClick={handleRetryFailed}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <RefreshCw size={13} />
                    <span>Retry Failed ({failedCount})</span>
                  </button>
                )}
                <button
                  type="button"
                  className={styles.modalPrimaryBtn}
                  onClick={onClose}
                  title="Clear completed queue"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
