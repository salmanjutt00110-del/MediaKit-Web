'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Link as LinkIcon,
  X,
  Download,
  AlertCircle,
  Check,
  ClipboardPaste,
  RotateCw,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { detectPlatform, getPlatformDisplayName } from '@/lib/detect';
import {
  DetectionResult,
  DownloadState,
  ErrorState,
  ErrorType,
  LoadingStage,
  MediaMetadata,
  PlatformType,
} from '@/lib/types';
import { YouTubeIcon, TikTokIcon, FacebookIcon, InstagramIcon } from './PlatformIcons';
import DownloadResult from './DownloadResult';
import styles from './Downloader.module.css';

export default function Downloader() {
  const [url, setUrl] = useState('');
  const [state, setState] = useState<DownloadState>('idle');
  const [loadingStage, setLoadingStage] = useState<LoadingStage>('idle');
  const [detection, setDetection] = useState<DetectionResult | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [mediaInfo, setMediaInfo] = useState<MediaMetadata | null>(null);
  const [error, setError] = useState<ErrorState | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [clipboardToast, setClipboardToast] = useState<string | null>(null);
  const [downloadingFormatId, setDownloadingFormatId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<{
    percent: number;
    receivedMB: string;
    totalMB: string;
    active: boolean;
    formatTitle?: string;
  }>({
    percent: 0,
    receivedMB: '0 MB',
    totalMB: '',
    active: false,
  });
  const [completedInfo, setCompletedInfo] = useState<{
    title: string;
    ext: string;
    formatId: string;
  } | null>(null);

  const isProcessingRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-dismiss clipboard toast
  useEffect(() => {
    if (clipboardToast) {
      const timer = setTimeout(() => setClipboardToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [clipboardToast]);

  // Client-side auto-detection with debouncing for typing
  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = url.trim();
      if (!trimmed) {
        setDetection(null);
        setIsDetecting(false);
        setError(null);
        if (state !== 'ready' && state !== 'downloading' && state !== 'completed') setState('idle');
        return;
      }

      setIsDetecting(true);
      const result = detectPlatform(trimmed);
      setDetection(result);
      setIsDetecting(false);

      if (result.valid) {
        setError(null);
        if (state !== 'ready' && state !== 'processing' && state !== 'downloading' && state !== 'completed') {
          setState('url_entered');
        }
      } else if (trimmed.length > 7) {
        if (result.errorCode === 'UNSUPPORTED_PLATFORM') {
          setError({
            type: 'UNSUPPORTED_PLATFORM',
            code: 'UNSUPPORTED_PLATFORM',
            title: "Platform Isn't Supported",
            message: "Sorry, this platform isn't supported yet. Try a YouTube, TikTok, Facebook, or Instagram link.",
            retryable: false,
          });
        } else {
          setError({
            type: 'INVALID_URL',
            code: 'INVALID_URL',
            title: 'Invalid Link',
            message: result.error || 'Please enter a valid link.',
            retryable: false,
          });
        }
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [url, state]);

  // Handle immediate detection upon paste
  const handlePasteEvent = (pastedText: string) => {
    const trimmed = pastedText.trim();
    if (!trimmed) return;

    setUrl(trimmed);
    setMediaInfo(null);
    setCompletedInfo(null);
    setDownloadProgress({ percent: 0, receivedMB: '0 MB', totalMB: '', active: false });
    setError(null);
    setIsDetecting(true);
    const result = detectPlatform(trimmed);
    setDetection(result);
    setIsDetecting(false);

    if (result.valid) {
      setError(null);
      setState('url_entered');
      handleSubmit(undefined, trimmed);
    } else if (result.errorCode === 'UNSUPPORTED_PLATFORM') {
      setError({
        type: 'UNSUPPORTED_PLATFORM',
        code: 'UNSUPPORTED_PLATFORM',
        title: "Platform Isn't Supported",
        message: "Sorry, this platform isn't supported yet. Try a YouTube, TikTok, Facebook, or Instagram link.",
        retryable: false,
      });
    } else {
      setError({
        type: 'INVALID_URL',
        code: 'INVALID_URL',
        title: 'Invalid Link',
        message: 'Please enter a valid link.',
        retryable: false,
      });
    }
  };

  // Clipboard button interaction
  const handleClipboardClick = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text && text.trim()) {
          handlePasteEvent(text);
          setClipboardToast('Pasted link from clipboard');
          return;
        }
      }
    } catch {}

    inputRef.current?.focus();
    inputRef.current?.select();
    setClipboardToast('Press Ctrl+V to paste your link');
  };

  // Clear / Reset
  const handleClear = () => {
    setUrl('');
    setDetection(null);
    setIsDetecting(false);
    setMediaInfo(null);
    setError(null);
    setState('idle');
    setLoadingStage('idle');
    setDownloadingFormatId(null);
    setCompletedInfo(null);
    setDownloadProgress({ percent: 0, receivedMB: '0 MB', totalMB: '', active: false });
    isProcessingRef.current = false;
  };

  // Submit flow with multi-stage loading
  const handleSubmit = async (e?: React.FormEvent, urlOverride?: string) => {
    if (e) e.preventDefault();

    const targetUrl = (urlOverride !== undefined ? urlOverride : url).trim();
    if (!targetUrl) {
      setError({
        type: 'INVALID_URL',
        code: 'INVALID_URL',
        title: 'Input Required',
        message: 'Please enter a valid link.',
        retryable: false,
      });
      return;
    }

    // Direct Download Requirement: If media is already resolved and user clicks Download, start immediately!
    if (mediaInfo && mediaInfo.formats && mediaInfo.formats.length > 0 && targetUrl === mediaInfo.sourceUrl) {
      const bestFmt = mediaInfo.formats[0];
      handleDownloadFormat(bestFmt.id);
      return;
    }

    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    try {
      setState('processing');
      setError(null);
      setMediaInfo(null);
      setCompletedInfo(null);
      setDownloadProgress({ percent: 0, receivedMB: '0 MB', totalMB: '', active: false });

      // Stage 1: Checking link
      setLoadingStage('checking_link');
      await new Promise((r) => setTimeout(r, 120));

      // Stage 2: Detecting platform
      setLoadingStage('detecting_platform');
      const detectResponse = await fetch('/api/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl }),
      });

      const detectData = await detectResponse.json();

      if (!detectResponse.ok || !detectData.success) {
        const errCode = (detectData?.error as ErrorType) || 'INVALID_URL';
        if (errCode === 'UNSUPPORTED_PLATFORM') {
          setError({
            type: 'UNSUPPORTED_PLATFORM',
            code: 'UNSUPPORTED_PLATFORM',
            title: "Platform Isn't Supported",
            message: "Sorry, this platform isn't supported yet. Try a YouTube, TikTok, Facebook, or Instagram link.",
            retryable: false,
          });
        } else if (errCode === 'RATE_LIMITED') {
          setError({
            type: 'RATE_LIMITED',
            code: 'RATE_LIMITED',
            title: 'Rate Limit',
            message: 'Too many requests. Please try again later.',
            retryable: true,
          });
        } else {
          setError({
            type: 'INVALID_URL',
            code: 'INVALID_URL',
            title: 'Invalid Link',
            message: "That link doesn't look valid.",
            retryable: false,
          });
        }
        setState('error');
        setLoadingStage('idle');
        isProcessingRef.current = false;
        return;
      }

      // Stage 3: Fetching media info
      setLoadingStage('fetching_media');
      const normalizedUrl = detectData.normalizedUrl || targetUrl;

      const mediaResponse = await fetch('/api/media-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: normalizedUrl,
          platform: detectData.platform,
        }),
      });

      const mediaData = await mediaResponse.json();

      if (!mediaResponse.ok || !mediaData.success) {
        const errCode = (mediaData?.error?.code as ErrorType) || 'PROVIDER_ERROR';
        const errTitle =
          errCode === 'PRIVATE_CONTENT'
            ? 'Private Content'
            : errCode === 'UNAVAILABLE_CONTENT'
            ? 'Content Unavailable'
            : errCode === 'RATE_LIMITED'
            ? 'Rate Limit'
            : 'Unable to Process';

        const errMsg =
          errCode === 'PRIVATE_CONTENT'
            ? 'This content is private and cannot be accessed.'
            : errCode === 'UNAVAILABLE_CONTENT'
            ? 'This content is not available or has been removed.'
            : errCode === 'RATE_LIMITED'
            ? 'Too many requests. Please try again later.'
            : "We couldn't process this link right now. Please check the URL and try again.";

        setError({
          type: errCode,
          code: errCode,
          title: errTitle,
          message: errMsg,
          retryable: true,
        });
        setState('error');
        setLoadingStage('idle');
        isProcessingRef.current = false;
        return;
      }

      // Stage 4: Preparing downloads
      setLoadingStage('preparing_downloads');
      await new Promise((r) => setTimeout(r, 120));

      // Stage 5: Ready
      setLoadingStage('ready');
      setMediaInfo(mediaData.data);
      setState('ready');
    } catch {
      setError({
        type: 'NETWORK_ERROR',
        code: 'NETWORK_ERROR',
        title: 'Connection Issue',
        message: "We couldn't process this link right now. Please check your internet and try again.",
        retryable: true,
      });
      setState('error');
      setLoadingStage('idle');
    } finally {
      isProcessingRef.current = false;
    }
  };

  // Direct fast download with real-time progress tracking
  const handleDownloadFormat = async (formatId: string) => {
    if (!mediaInfo) return;

    try {
      setDownloadingFormatId(formatId);
      setState('downloading');
      setError(null);
      setCompletedInfo(null);

      const targetFormat = mediaInfo.formats?.find((f) => f.id === formatId);
      const formatQuality = targetFormat?.quality || formatId;

      setDownloadProgress({
        percent: 0,
        receivedMB: '0 MB',
        totalMB: '',
        active: true,
        formatTitle: formatQuality,
      });

      // 1. Obtain stream endpoint from /api/download
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: mediaInfo.sourceUrl,
          formatId,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success || !data.data?.downloadUrl) {
        const errCode = (data?.error?.code as ErrorType) || 'DOWNLOAD_ERROR';
        setError({
          type: errCode,
          code: errCode,
          title: 'Download Notice',
          message:
            data?.error?.message ||
            'Unable to process this download stream right now. Please try again in a moment.',
          retryable: true,
        });
        setState('ready');
        setDownloadingFormatId(null);
        setDownloadProgress((prev) => ({ ...prev, active: false }));
        return;
      }

      const rawDlUrl = data.data.downloadUrl;
      const isAudio =
        formatId.toLowerCase().includes('mp3') ||
        formatId.toLowerCase().includes('audio') ||
        rawDlUrl.endsWith('.mp3');
      const ext = isAudio ? 'mp3' : 'mp4';
      const safeTitle = (mediaInfo.title || 'media')
        .replace(/[/\\?%*:|"<>]/g, '_')
        .replace(/\s+/g, ' ')
        .trim();
      const filename = `${safeTitle}.${ext}`;

      // 2. Stream download with active byte-level progress reporting
      let streamSucceeded = false;
      try {
        const streamRes = await fetch(rawDlUrl);
        if (streamRes.ok && streamRes.body) {
          const reader = streamRes.body.getReader();
          const contentLength = +(streamRes.headers.get('content-length') || 0);
          const totalMBStr = contentLength > 0 ? `${(contentLength / (1024 * 1024)).toFixed(1)} MB` : '';
          let receivedBytes = 0;
          const chunks: Uint8Array[] = [];

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            if (value) {
              chunks.push(value);
              receivedBytes += value.length;
              const receivedMBStr = `${(receivedBytes / (1024 * 1024)).toFixed(1)} MB`;
              const percent = contentLength > 0 ? Math.min(100, Math.round((receivedBytes / contentLength) * 100)) : 0;
              setDownloadProgress({
                percent,
                receivedMB: receivedMBStr,
                totalMB: totalMBStr,
                active: true,
                formatTitle: formatQuality,
              });
            }
          }

          // Complete: save file directly to disk
          const blob = new Blob(chunks as BlobPart[], { type: isAudio ? 'audio/mpeg' : 'video/mp4' });
          const blobUrl = URL.createObjectURL(blob);
          const dlAnchor = document.createElement('a');
          dlAnchor.href = blobUrl;
          dlAnchor.setAttribute('download', filename);
          document.body.appendChild(dlAnchor);
          dlAnchor.click();
          document.body.removeChild(dlAnchor);
          setTimeout(() => URL.revokeObjectURL(blobUrl), 15000);
          streamSucceeded = true;
        }
      } catch (streamErr: any) {
        // If stream reading fails (e.g. cross-origin restrictions), gracefully fall back to native anchor download
      }

      if (!streamSucceeded) {
        // Fallback: Trigger native browser download directly
        const dlAnchor = document.createElement('a');
        dlAnchor.href = rawDlUrl;
        dlAnchor.setAttribute('download', filename);
        document.body.appendChild(dlAnchor);
        dlAnchor.click();
        document.body.removeChild(dlAnchor);
      }

      setState('completed');
      setCompletedInfo({
        title: safeTitle,
        ext,
        formatId,
      });
    } catch {
      setError({
        type: 'NETWORK_ERROR',
        code: 'NETWORK_ERROR',
        title: 'Download Interrupted',
        message: 'A network error occurred while downloading. Please try again.',
        retryable: true,
      });
      setState('ready');
    } finally {
      setDownloadingFormatId(null);
      setDownloadProgress((prev) => ({ ...prev, active: false }));
    }
  };

  const renderPlatformBadgeIcon = (platform: PlatformType) => {
    switch (platform) {
      case 'youtube':
        return <YouTubeIcon size={14} />;
      case 'tiktok':
        return <TikTokIcon size={14} />;
      case 'facebook':
        return <FacebookIcon size={14} />;
      case 'instagram':
        return <InstagramIcon size={14} />;
      default:
        return null;
    }
  };

  const renderLoadingStageText = () => {
    switch (loadingStage) {
      case 'checking_link':
        return 'Analyzing link...';
      case 'detecting_platform':
        return 'Detecting platform...';
      case 'fetching_media':
        return 'Fetching video information...';
      case 'preparing_downloads':
        return 'Preparing available downloads...';
      case 'ready':
        return 'Download ready';
      default:
        return 'Processing...';
    }
  };

  return (
    <section id="downloader" className={styles.downloaderSection} aria-label="Media Downloader">
      <div className="app-container">
        <div className={styles.downloaderContainer}>
          <form onSubmit={handleSubmit} noValidate>
            <div
              className={`${styles.downloaderCard} ${
                isFocused ? styles.downloaderCardFocus : ''
              }`}
            >
              <div className={styles.linkIcon}>
                <LinkIcon size={22} />
              </div>

              <input
                ref={inputRef}
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onPaste={(e) => {
                  const text = e.clipboardData.getData('text');
                  if (text) handlePasteEvent(text);
                }}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Paste your link here..."
                className={styles.urlInput}
                aria-label="Paste media link"
                autoComplete="off"
                spellCheck={false}
                disabled={state === 'processing'}
              />

              {/* Paste or Clear button */}
              {url ? (
                <button
                  type="button"
                  onClick={handleClear}
                  className={styles.clearBtn}
                  aria-label="Clear link"
                  title="Clear input"
                >
                  <X size={15} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleClipboardClick}
                  className={styles.pasteBtn}
                  aria-label="Paste from clipboard"
                  title="Paste link from clipboard"
                >
                  <ClipboardPaste size={18} />
                </button>
              )}

              {/* Primary Action Button */}
              <button
                type="submit"
                className={styles.downloadBtn}
                disabled={state === 'processing' || !url.trim()}
                aria-label="Download media"
              >
                {state === 'processing' ? (
                  <>
                    <div className={styles.loadingSpinner} />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Download size={18} />
                    <span>Download</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Toast Notification (Clipboard/Mobile) */}
          {clipboardToast && (
            <div className={styles.clipboardToast} role="status">
              <span>{clipboardToast}</span>
            </div>
          )}

          {/* Multi-Stage Loading Indicator */}
          {state === 'processing' && (
            <div className={styles.loadingStageBar} role="status" aria-live="polite">
              <div className={styles.stageSpinner} />
              <span className={styles.stageText}>{renderLoadingStageText()}</span>
            </div>
          )}

          {/* Detection Status Indicator */}
          {state !== 'processing' && (isDetecting || (detection && detection.valid)) && (
            <div className={styles.statusBar} role="status" aria-live="polite">
              {isDetecting && (
                <div className={styles.detectingBadge}>
                  <div className={styles.detectingSpinner} />
                  <span>Detecting platform...</span>
                </div>
              )}

              {!isDetecting && detection && detection.valid && (
                <div className={styles.detectedBadge}>
                  <Check size={14} color="#10B981" />
                  {renderPlatformBadgeIcon(detection.platform)}
                  <span>{getPlatformDisplayName(detection.platform)} detected</span>
                </div>
              )}
            </div>
          )}

          {/* Live Download Progress Card */}
          {state === 'downloading' && downloadProgress.active && (
            <div className={styles.downloadProgressCard} role="status" aria-live="polite">
              <div className={styles.progressHeader}>
                <span className={styles.progressTitle}>
                  {mediaInfo?.title || 'Downloading media...'} ({downloadProgress.formatTitle})
                </span>
                <span className={styles.progressPercent}>
                  {downloadProgress.percent > 0 ? `${downloadProgress.percent}%` : 'Downloading...'}
                </span>
              </div>
              <div className={styles.progressBarTrack}>
                <div
                  className={`${styles.progressBarFill} ${
                    downloadProgress.percent === 0 ? styles.progressBarIndeterminate : ''
                  }`}
                  style={{ width: downloadProgress.percent > 0 ? `${downloadProgress.percent}%` : undefined }}
                />
              </div>
              <div className={styles.progressDetails}>
                <span>
                  {downloadProgress.totalMB
                    ? `${downloadProgress.receivedMB} / ${downloadProgress.totalMB}`
                    : downloadProgress.receivedMB}
                </span>
                <span>Please keep this page open while downloading</span>
              </div>
            </div>
          )}

          {/* Download Complete Card */}
          {state === 'completed' && completedInfo && (
            <div className={styles.downloadCompleteCard} role="status" aria-live="polite">
              <div className={styles.completeHeader}>
                <CheckCircle2 size={20} color="#059669" />
                <span>Download Complete!</span>
              </div>
              <p className={styles.completeSubtext}>
                <strong>{completedInfo.title}.{completedInfo.ext}</strong> is ready in your browser Downloads.
              </p>
              <div className={styles.completeActions}>
                <button
                  type="button"
                  onClick={() => handleDownloadFormat(completedInfo.formatId)}
                  className={styles.actionBtnPrimary}
                >
                  <RefreshCw size={14} />
                  <span>Download Again</span>
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className={styles.actionBtnSecondary}
                >
                  <span>Download Another Video</span>
                </button>
              </div>
            </div>
          )}

          {/* Error Alert with Optional Retry */}
          {error && (
            <div className={styles.errorAlert} role="alert">
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div className={styles.errorContent}>
                <div className={styles.errorText}>
                  <strong>{error.title}:</strong> {error.message}
                </div>
                {error.retryable && (
                  <button
                    type="button"
                    onClick={() => handleSubmit()}
                    className={styles.retryBtn}
                  >
                    <RotateCw size={13} />
                    <span>Try Again</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Result Card */}
          {mediaInfo && (
            <DownloadResult
              media={mediaInfo}
              onDownloadFormat={handleDownloadFormat}
              isDownloading={state === 'downloading'}
              downloadingFormatId={downloadingFormatId}
            />
          )}
        </div>
      </div>
    </section>
  );
}
