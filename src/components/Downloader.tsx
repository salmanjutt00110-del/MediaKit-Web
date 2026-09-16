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
        if (state !== 'ready') setState('idle');
        return;
      }

      setIsDetecting(true);
      const result = detectPlatform(trimmed);
      setDetection(result);
      setIsDetecting(false);

      if (result.valid) {
        setError(null);
        if (state !== 'ready' && state !== 'processing') {
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

  // Background stream pre-warming for instantaneous download response
  useEffect(() => {
    if (mediaInfo && mediaInfo.platform === 'youtube' && mediaInfo.sourceUrl) {
      fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: mediaInfo.sourceUrl,
          formatId: '720p',
          prewarm: true,
        }),
      }).catch(() => {});
    }
  }, [mediaInfo]);

  // Handle immediate detection upon paste
  const handlePasteEvent = (pastedText: string) => {
    const trimmed = pastedText.trim();
    if (!trimmed) return;

    setUrl(trimmed);
    setMediaInfo(null); // Clear stale previous media card immediately
    setError(null);
    setIsDetecting(true);
    const result = detectPlatform(trimmed);
    setDetection(result);
    setIsDetecting(false);

    if (result.valid) {
      setError(null);
      setState('url_entered');
      // Automatically start fetching newly pasted media
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

    // If clipboard read is blocked by browser permissions, focus and select input for quick pasting
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

    // Duplicate submission protection
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    try {
      setState('processing');
      setError(null);
      setMediaInfo(null);

      // Stage 1: Checking your link...
      setLoadingStage('checking_link');
      await new Promise((r) => setTimeout(r, 160));

      // Stage 2: Detecting platform...
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

      // Stage 3: Fetching media information...
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
            : 'Processing Error';

        const errMsg =
          errCode === 'PRIVATE_CONTENT'
            ? 'This content is private and cannot be accessed.'
            : errCode === 'UNAVAILABLE_CONTENT'
            ? 'This content is not available.'
            : errCode === 'RATE_LIMITED'
            ? 'Too many requests. Please try again later.'
            : "We couldn't process this link right now. Please try again.";

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

      // Stage 4: Preparing available downloads...
      setLoadingStage('preparing_downloads');
      await new Promise((r) => setTimeout(r, 140));

      // Stage 5: Ready
      setLoadingStage('ready');
      setMediaInfo(mediaData.data);
      setState('ready');
    } catch {
      setError({
        type: 'NETWORK_ERROR',
        code: 'NETWORK_ERROR',
        title: 'Connection Issue',
        message: "We couldn't process this link right now. Please check your network and try again.",
        retryable: true,
      });
      setState('error');
      setLoadingStage('idle');
    } finally {
      isProcessingRef.current = false;
    }
  };

  const handleDownloadFormat = async (formatId: string) => {
    if (!mediaInfo) return;

    try {
      setDownloadingFormatId(formatId);
      setState('downloading');

      const response = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: mediaInfo.sourceUrl,
          formatId,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const errCode = (data?.error?.code as ErrorType) || 'DOWNLOAD_ERROR';
        setError({
          type: errCode,
          code: errCode,
          title: 'Download Notice',
          message:
            data?.error?.message ||
            'Stream extraction credentials will be configured in Prompt 4. Only authentic formats are displayed.',
          retryable: true,
        });
        setState('ready');
        setDownloadingFormatId(null);
        return;
      }

      if (data.data?.downloadUrl) {
        const isAudio =
          formatId.toLowerCase().includes('mp3') ||
          formatId.toLowerCase().includes('audio') ||
          data.data.downloadUrl.endsWith('.mp3');
        const ext = isAudio ? 'mp3' : 'mp4';
        const safeTitle = (mediaInfo.title || 'media').replace(/[/\\?%*:|"<>]/g, '_');

        const downloadLink = document.createElement('a');
        downloadLink.href = data.data.downloadUrl;
        downloadLink.setAttribute('download', `${safeTitle}.${ext}`);
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }

      setState('completed');
    } catch {
      setError({
        type: 'NETWORK_ERROR',
        code: 'NETWORK_ERROR',
        title: 'Network Error',
        message: 'A network error occurred while initiating the download.',
        retryable: true,
      });
      setState('ready');
    } finally {
      setDownloadingFormatId(null);
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
        return 'Checking your link...';
      case 'detecting_platform':
        return 'Detecting platform...';
      case 'fetching_media':
        return 'Fetching media information...';
      case 'preparing_downloads':
        return 'Preparing available downloads...';
      case 'ready':
        return 'Ready';
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
