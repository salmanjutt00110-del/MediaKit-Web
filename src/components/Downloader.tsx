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
  RefreshCw,
  ArrowDownToLine,
  Layers,
  Sparkles,
  Play,
  FileVideo,
  Music,
  CheckCircle2,
} from 'lucide-react';
import { detectPlatform, getPlatformDisplayName } from '@/lib/detect';
import {
  DetectionResult,
  DownloadState,
  ErrorState,
  ErrorType,
  LoadingStage,
  MediaFormat,
  MediaMetadata,
  PlatformType,
} from '@/lib/types';
import { YouTubeIcon, TikTokIcon, FacebookIcon, InstagramIcon, PinterestIcon } from './PlatformIcons';
import DownloadResult from './DownloadResult';
import styles from './Downloader.module.css';

interface BatchItem {
  id: string;
  url: string;
  platform: PlatformType;
  status: 'pending' | 'resolving' | 'ready' | 'downloading' | 'completed' | 'error';
  mediaInfo?: MediaMetadata;
  selectedFormatId?: string;
  error?: string;
}

const MAX_BATCH_URLS = 25;

const DEMO_BATCH_LINKS = [
  'https://www.youtube.com/watch?v=GLoeAJUcz38',
  'https://www.tiktok.com/t/ZP83tPtQX/',
  'https://www.youtube.com/watch?v=j18MRhEfmPk',
  'https://www.facebook.com/share/r/1Bu9dcvRh',
  'https://www.youtube.com/watch?v=0e3GPea1Tyg',
];

export default function Downloader() {
  const [activeTab, setActiveTab] = useState<'single' | 'batch'>('single');

  // Single Downloader State
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
    downloadUrl?: string;
  } | null>(null);

  // Batch Downloader State
  const [batchInput, setBatchInput] = useState('');
  const [batchItems, setBatchItems] = useState<BatchItem[]>([]);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });
  const [isBatchDownloading, setIsBatchDownloading] = useState(false);
  const [batchDownloadProgress, setBatchDownloadProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });

  // Floating Notification Toast
  const [downloadToast, setDownloadToast] = useState<{
    title: string;
    ext: string;
    isBatch?: boolean;
    batchCount?: number;
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

  // Auto-dismiss download notification toast
  useEffect(() => {
    if (downloadToast) {
      const timer = setTimeout(() => setDownloadToast(null), 5500);
      return () => clearTimeout(timer);
    }
  }, [downloadToast]);

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
            message: "Sorry, this platform isn't supported yet. Try a YouTube, TikTok, Facebook, Instagram, or Pinterest link.",
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

  // Smart multi-line paste detector
  const handlePasteEvent = (pastedText: string) => {
    const trimmed = pastedText.trim();
    if (!trimmed) return;

    // If pasted text has multiple lines or multiple URLs, suggest or auto-switch to Batch Mode
    const lines = trimmed.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (lines.length > 1) {
      setActiveTab('batch');
      setBatchInput(trimmed);
      setClipboardToast(`Switched to Batch Mode (${lines.length} links detected)`);
      return;
    }

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
        message: "Sorry, this platform isn't supported yet. Try a YouTube, TikTok, Facebook, Instagram, or Pinterest link.",
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

  // Clear Single Input
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

  // Single Link Submit Flow
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

      setLoadingStage('checking_link');
      await new Promise((r) => setTimeout(r, 100));

      setLoadingStage('detecting_platform');
      const detectResponse = await fetch('/api/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl }),
      });

      const detectData = await detectResponse.json();

      if (!detectResponse.ok || !detectData.valid) {
        const errCode = (detectData?.errorCode as ErrorType) || 'INVALID_URL';
        if (errCode === 'UNSUPPORTED_PLATFORM') {
          setError({
            type: 'UNSUPPORTED_PLATFORM',
            code: 'UNSUPPORTED_PLATFORM',
            title: "Platform Isn't Supported",
            message: "Sorry, this platform isn't supported yet. Try a YouTube, TikTok, Facebook, Instagram, or Pinterest link.",
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

      setLoadingStage('preparing_downloads');
      await new Promise((r) => setTimeout(r, 120));

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

  // Download Trigger Handler
  const handleDownloadFormat = async (formatId: string, customMedia?: MediaMetadata) => {
    const currentMedia = customMedia || mediaInfo;
    if (!currentMedia) return;

    let progressTimer: NodeJS.Timeout | null = null;

    try {
      const targetFormat = currentMedia.formats?.find((f) => f.id === formatId);
      const isAudio =
        formatId.toLowerCase().includes('mp3') ||
        formatId.toLowerCase().includes('audio') ||
        targetFormat?.format === 'mp3';
      const ext = isAudio ? 'mp3' : 'mp4';
      const safeTitle = (currentMedia.title || 'media')
        .replace(/[/\\?%*:|"<>]/g, '_')
        .replace(/\s+/g, ' ')
        .trim();
      const filename = `${safeTitle}.${ext}`;

      if (!customMedia) {
        setDownloadingFormatId(formatId);
        setState('downloading');
        setError(null);
        setCompletedInfo(null);
        setDownloadProgress({
          percent: 15,
          receivedMB: 'Connecting to media server...',
          totalMB: '',
          active: true,
          formatTitle: targetFormat?.quality || formatId,
        });

        // Smoothly advance progress bar while server processes conversion/stream
        progressTimer = setInterval(() => {
          setDownloadProgress((prev) => {
            if (!prev.active || prev.percent >= 92) return prev;
            const nextPercent = prev.percent + Math.floor(Math.random() * 8) + 4;
            let statusText = 'Connecting to media stream...';
            if (nextPercent > 35) statusText = 'Fetching high quality media chunks...';
            if (nextPercent > 60) statusText = 'Merging video & audio tracks...';
            if (nextPercent > 80) statusText = 'Finalizing file stream...';
            return {
              ...prev,
              percent: Math.min(nextPercent, 94),
              receivedMB: statusText,
            };
          });
        }, 800);
      }

      // INSTANT SPEED FLOW:
      // If direct download URL is already provided by provider (e.g. TikTok, Instagram, Facebook),
      // launch the browser download immediately with zero lag!
      if (targetFormat?.downloadUrl && (targetFormat.downloadUrl.startsWith('http://') || targetFormat.downloadUrl.startsWith('https://') || targetFormat.downloadUrl.startsWith('/api/'))) {
        if (progressTimer) clearInterval(progressTimer);
        const finalDlUrl = targetFormat.downloadUrl;

        const dlAnchor = document.createElement('a');
        dlAnchor.href = finalDlUrl;
        dlAnchor.setAttribute('download', filename);
        document.body.appendChild(dlAnchor);
        dlAnchor.click();
        setTimeout(() => {
          try {
            document.body.removeChild(dlAnchor);
          } catch {}
        }, 1000);

        setDownloadToast({ title: safeTitle, ext });

        if (!customMedia) {
          setState('completed');
          setCompletedInfo({ title: safeTitle, ext, formatId, downloadUrl: finalDlUrl });
        }
        return true;
      }

      // Fast-path API stream: trigger background streaming download
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: currentMedia.sourceUrl,
          formatId,
        }),
      });

      if (progressTimer) clearInterval(progressTimer);

      const data = await response.json();

      if (!response.ok || !data.success || !data.data?.downloadUrl) {
        const errCode = (data?.error?.code as ErrorType) || 'DOWNLOAD_ERROR';
        if (!customMedia) {
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
        }
        return false;
      }

      const rawDlUrl = data.data.downloadUrl;

      // Update progress to 100% complete
      setDownloadProgress((prev) => ({
        ...prev,
        percent: 100,
        receivedMB: 'Download ready! Starting download...',
      }));

      // Native browser background download - Channel 1: Hidden iframe (bypasses async popup blockers)
      try {
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = rawDlUrl;
        document.body.appendChild(iframe);
        setTimeout(() => {
          try {
            document.body.removeChild(iframe);
          } catch {}
        }, 30000);
      } catch {}

      // Channel 2: Anchor click
      try {
        const dlAnchor = document.createElement('a');
        dlAnchor.href = rawDlUrl;
        dlAnchor.setAttribute('download', filename);
        document.body.appendChild(dlAnchor);
        dlAnchor.click();
        setTimeout(() => {
          try {
            document.body.removeChild(dlAnchor);
          } catch {}
        }, 1000);
      } catch {}

      // Trigger floating top premium toast notification immediately
      setDownloadToast({
        title: safeTitle,
        ext,
      });

      if (!customMedia) {
        setState('completed');
        setCompletedInfo({
          title: safeTitle,
          ext,
          formatId,
          downloadUrl: rawDlUrl,
        });
      }
      return true;
    } catch {
      if (progressTimer) clearInterval(progressTimer);
      if (!customMedia) {
        setError({
          type: 'NETWORK_ERROR',
          code: 'NETWORK_ERROR',
          title: 'Download Interrupted',
          message: 'A network error occurred while downloading. Please try again.',
          retryable: true,
        });
        setState('ready');
      }
      return false;
    } finally {
      if (progressTimer) clearInterval(progressTimer);
      if (!customMedia) {
        setDownloadingFormatId(null);
        setDownloadProgress((prev) => ({ ...prev, active: false }));
      }
    }
  };

  // --- BATCH DOWNLOADER HANDLERS ---
  const parsedBatchUrls = batchInput
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const handleBatchPaste = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text && text.trim()) {
          setBatchInput((prev) => (prev ? `${prev}\n${text.trim()}` : text.trim()));
          setClipboardToast('Pasted links from clipboard');
        }
      }
    } catch {
      setClipboardToast('Press Ctrl+V to paste your links');
    }
  };

  const handleLoadDemoLinks = () => {
    setBatchInput(DEMO_BATCH_LINKS.join('\n'));
    setClipboardToast('Loaded 5 Demo Video Links!');
  };

  const handleClearBatch = () => {
    setBatchInput('');
    setBatchItems([]);
    setIsBatchProcessing(false);
    setIsBatchDownloading(false);
    setBatchProgress({ current: 0, total: 0 });
    setBatchDownloadProgress({ current: 0, total: 0 });
  };

  // Process all batch URLs concurrently with pooling (Max 5 Links)
  const handleProcessBatch = async () => {
    const urls = Array.from(new Set(parsedBatchUrls)).slice(0, MAX_BATCH_URLS);
    if (urls.length === 0) return;

    if (parsedBatchUrls.length > MAX_BATCH_URLS) {
      setClipboardToast(`Processing first ${MAX_BATCH_URLS} links (batch limit)`);
    }

    setIsBatchProcessing(true);
    setBatchProgress({ current: 0, total: urls.length });

    // Initialize items
    const initialItems: BatchItem[] = urls.map((u, i) => {
      const det = detectPlatform(u);
      return {
        id: `batch-${i}-${Date.now()}`,
        url: u,
        platform: det.platform,
        status: det.valid ? 'pending' : 'error',
        error: det.valid ? undefined : det.error || 'Invalid video link',
      };
    });

    setBatchItems(initialItems);

    let completedCount = 0;
    const concurrency = 3;
    const queue = [...initialItems];

    const worker = async () => {
      while (queue.length > 0) {
        const item = queue.shift();
        if (!item || item.status === 'error') {
          if (item) {
            completedCount++;
            setBatchProgress({ current: completedCount, total: urls.length });
          }
          continue;
        }

        // Set resolving
        setBatchItems((prev) =>
          prev.map((it) => (it.id === item.id ? { ...it, status: 'resolving' } : it))
        );

        try {
          const res = await fetch('/api/media-info', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: item.url, platform: item.platform }),
          });
          const data = await res.json();

          if (res.ok && data.success && data.data) {
            const media: MediaMetadata = data.data;
            const defaultFormat = media.formats?.[0]?.id || 'hd';
            setBatchItems((prev) =>
              prev.map((it) =>
                it.id === item.id
                  ? {
                      ...it,
                      status: 'ready',
                      mediaInfo: media,
                      selectedFormatId: defaultFormat,
                    }
                  : it
              )
            );
          } else {
            setBatchItems((prev) =>
              prev.map((it) =>
                it.id === item.id
                  ? {
                      ...it,
                      status: 'error',
                      error: data?.error?.message || 'Could not fetch video info',
                    }
                  : it
              )
            );
          }
        } catch {
          setBatchItems((prev) =>
            prev.map((it) =>
              it.id === item.id
                ? {
                    ...it,
                    status: 'error',
                    error: 'Network connection failed',
                  }
                : it
            )
          );
        } finally {
          completedCount++;
          setBatchProgress({ current: completedCount, total: urls.length });
        }
      }
    };

    const workers = Array.from({ length: concurrency }).map(() => worker());
    await Promise.all(workers);

    setIsBatchProcessing(false);
  };

  // Download a single item within the batch
  const handleDownloadBatchItem = async (item: BatchItem) => {
    if (!item.mediaInfo || !item.selectedFormatId) return;

    setBatchItems((prev) =>
      prev.map((it) => (it.id === item.id ? { ...it, status: 'downloading' } : it))
    );

    const success = await handleDownloadFormat(item.selectedFormatId, item.mediaInfo);

    setBatchItems((prev) =>
      prev.map((it) =>
        it.id === item.id ? { ...it, status: success ? 'completed' : 'error' } : it
      )
    );
  };

  // Download All Batch items sequentially with stagger delay
  const handleDownloadAllBatch = async () => {
    const readyItems = batchItems.filter(
      (it) => it.status === 'ready' || it.status === 'completed'
    );
    if (readyItems.length === 0) return;

    setIsBatchDownloading(true);
    setBatchDownloadProgress({ current: 0, total: readyItems.length });

    // Show top notification toast
    setDownloadToast({
      title: `${readyItems.length} Videos Batch Download`,
      ext: 'mp4',
      isBatch: true,
      batchCount: readyItems.length,
    });

    for (let i = 0; i < readyItems.length; i++) {
      const item = readyItems[i];
      setBatchDownloadProgress({ current: i + 1, total: readyItems.length });

      setBatchItems((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, status: 'downloading' } : it))
      );

      if (item.mediaInfo && item.selectedFormatId) {
        const ok = await handleDownloadFormat(item.selectedFormatId, item.mediaInfo);
        setBatchItems((prev) =>
          prev.map((it) => (it.id === item.id ? { ...it, status: ok ? 'completed' : 'error' } : it))
        );
      }

      // 600ms stagger between browser triggers so browser download manager doesn't reject
      if (i < readyItems.length - 1) {
        await new Promise((r) => setTimeout(r, 600));
      }
    }

    setIsBatchDownloading(false);
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
      case 'pinterest':
        return <PinterestIcon size={14} />;
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

  const readyBatchCount = batchItems.filter((i) => i.status === 'ready' || i.status === 'completed').length;

  return (
    <section id="downloader" className={styles.downloaderSection} aria-label="Media Downloader">
      {/* Sleek Dynamic Island Floating Download Toast */}
      {downloadToast && (
        <div className={styles.downloadToast} role="alert" aria-live="assertive">
          <div className={styles.toastPill}>
            <div className={styles.toastIconWrapper}>
              <ArrowDownToLine size={15} className={styles.toastDownloadIcon} />
            </div>
            <div className={styles.toastInfo}>
              <span className={styles.toastTag}>
                {downloadToast.isBatch ? 'BATCH' : downloadToast.ext.toUpperCase()}
              </span>
              <span className={styles.toastTitle} title={downloadToast.title}>
                {downloadToast.title}
              </span>
            </div>
            <div className={styles.toastActivePulse} title="Downloading in background" />
            <button
              type="button"
              onClick={() => setDownloadToast(null)}
              className={styles.toastCloseBtn}
              aria-label="Close notification"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      <div className="app-container">
        <div className={styles.downloaderContainer}>
          {/* Mode Switcher Tabs */}
          <div className={styles.modeTabsWrapper}>
            <button
              type="button"
              onClick={() => setActiveTab('single')}
              className={`${styles.modeTab} ${activeTab === 'single' ? styles.modeTabActive : ''}`}
            >
              <LinkIcon size={16} />
              <span>Single Video</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('batch')}
              className={`${styles.modeTab} ${activeTab === 'batch' ? styles.modeTabActive : ''}`}
            >
              <Layers size={16} />
              <span>Batch Download</span>
              <span className={styles.modeBadge}>25 Max</span>
            </button>
          </div>

          {/* TAB 1: SINGLE DOWNLOADER */}
          {activeTab === 'single' && (
            <>
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
                    placeholder="Paste YouTube, TikTok, Facebook, Instagram, or Pinterest link..."
                    className={styles.urlInput}
                    aria-label="Paste media link"
                    autoComplete="off"
                    spellCheck={false}
                    disabled={state === 'processing'}
                  />

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

              {/* Terminal Loader (From Uiverse.io by jeremyssocial - styled for MediaKit) */}
              {state === 'processing' && (
                <div className={styles.terminalLoaderWrapper} role="status" aria-live="polite">
                  <div className={styles.terminalLoader}>
                    <div className={styles.terminalHeader}>
                      <div className={styles.terminalControls}>
                        <span className={`${styles.control} ${styles.controlClose}`} />
                        <span className={`${styles.control} ${styles.controlMinimize}`} />
                        <span className={`${styles.control} ${styles.controlMaximize}`} />
                      </div>
                      <div className={styles.terminalTitle}>mediakit-cli --fetch</div>
                    </div>
                    <div className={styles.terminalBody}>
                      <span className={styles.terminalPrompt}>&gt;</span>
                      <span className={styles.terminalText}>
                        {loadingStage === 'fetching_media'
                          ? 'Fetching media stream...'
                          : loadingStage === 'preparing_downloads'
                          ? 'Resolving quality & sizes...'
                          : loadingStage === 'detecting_platform'
                          ? 'Detecting video link...'
                          : 'Analyzing media URL...'}
                      </span>
                    </div>
                  </div>
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

              {/* Sleek Download Started Banner */}
              {state === 'completed' && completedInfo && (
                <div className={styles.downloadCompleteCard} role="status" aria-live="polite">
                  <div className={styles.completeHeader}>
                    <div className={styles.completeHeaderIcon}>
                      <CheckCircle2 size={18} />
                    </div>
                    <div className={styles.completeTextGroup}>
                      <span className={styles.completeTitle}>Download Started!</span>
                      <p className={styles.completeSubtext} title={`${completedInfo.title}.${completedInfo.ext}`}>
                        <strong>{completedInfo.title}.{completedInfo.ext}</strong> is downloading in your browser background.
                      </p>
                    </div>
                  </div>
                  <div className={styles.completeActions}>
                    {completedInfo.downloadUrl && (
                      <a
                        href={completedInfo.downloadUrl}
                        download={`${completedInfo.title}.${completedInfo.ext}`}
                        className={styles.actionBtnPrimary}
                        style={{ textDecoration: 'none' }}
                        title="Save file directly to device"
                      >
                        <Download size={13} />
                        <span>Save File</span>
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDownloadFormat(completedInfo.formatId)}
                      className={styles.actionBtnSecondary}
                      title="Download again"
                    >
                      <RefreshCw size={13} />
                      <span>Download Again</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleClear}
                      className={styles.actionBtnSecondary}
                      title="Download another video"
                    >
                      <span>New Link</span>
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

              {/* Single Result Card */}
              {mediaInfo && (
                <DownloadResult
                  media={mediaInfo}
                  onDownloadFormat={handleDownloadFormat}
                  isDownloading={state === 'downloading'}
                  downloadingFormatId={downloadingFormatId}
                />
              )}
            </>
          )}

          {/* TAB 2: BATCH DOWNLOADER (MAX 5 VIDEOS) */}
          {activeTab === 'batch' && (
            <div className={styles.batchContainer}>
              <div className={styles.batchCard}>
                <div className={styles.batchHeader}>
                  <div className={styles.batchHeaderLeft}>
                    <h2 className={styles.batchHeading}>Multi-Link Batch Downloader</h2>
                    <p className={styles.batchSubtitle}>
                      Paste up to 25 video links (one per line) from YouTube, TikTok, Facebook, Instagram, or Pinterest.
                    </p>
                  </div>
                  <div className={styles.batchCounterBadge}>
                    <span>{Math.min(parsedBatchUrls.length, MAX_BATCH_URLS)} / {MAX_BATCH_URLS} Links</span>
                  </div>
                </div>

                <div className={styles.batchTextareaWrapper}>
                  <textarea
                    value={batchInput}
                    onChange={(e) => setBatchInput(e.target.value)}
                    placeholder="Paste up to 25 video links here (one URL per line)...&#10;https://www.youtube.com/watch?v=GLoeAJUcz38&#10;https://www.tiktok.com/@creator/video/1234567&#10;https://www.facebook.com/share/r/...&#10;https://www.instagram.com/reel/...&#10;https://www.pinterest.com/pin/..."
                    className={styles.batchTextarea}
                    rows={5}
                    disabled={isBatchProcessing || isBatchDownloading}
                  />
                </div>

                <div className={styles.batchToolBar}>
                  <div className={styles.batchToolBarLeft}>
                    <button
                      type="button"
                      onClick={handleBatchPaste}
                      className={styles.batchSecondaryBtn}
                      disabled={isBatchProcessing || isBatchDownloading}
                    >
                      <ClipboardPaste size={15} />
                      <span>Paste Links</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleLoadDemoLinks}
                      className={styles.batchDemoBtn}
                      disabled={isBatchProcessing || isBatchDownloading}
                    >
                      <Sparkles size={15} />
                      <span>Load 5 Demo Videos</span>
                    </button>
                    {batchInput && (
                      <button
                        type="button"
                        onClick={handleClearBatch}
                        className={styles.batchClearBtn}
                        disabled={isBatchProcessing || isBatchDownloading}
                      >
                        <X size={15} />
                        <span>Clear</span>
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleProcessBatch}
                    className={styles.batchProcessBtn}
                    disabled={isBatchProcessing || isBatchDownloading || parsedBatchUrls.length === 0}
                  >
                    {isBatchProcessing ? (
                      <>
                        <div className={styles.loadingSpinner} />
                        <span>Analyzing {batchProgress.current}/{batchProgress.total}...</span>
                      </>
                    ) : (
                      <>
                        <Play size={16} />
                        <span>Process {parsedBatchUrls.length} {parsedBatchUrls.length === 1 ? 'Video' : 'Videos'}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Batch Progress Bar while resolving */}
                {isBatchProcessing && (
                  <div className={styles.batchProgressContainer}>
                    <div className={styles.batchProgressBarTrack}>
                      <div
                        className={styles.batchProgressBarFill}
                        style={{
                          width: `${Math.round(
                            (batchProgress.current / Math.max(batchProgress.total, 1)) * 100
                          )}%`,
                        }}
                      />
                    </div>
                    <span className={styles.batchProgressText}>
                      Fetching video information ({batchProgress.current} of {batchProgress.total} completed)...
                    </span>
                  </div>
                )}
              </div>

              {/* BATCH RESULTS SECTION */}
              {batchItems.length > 0 && (
                <div className={styles.batchResultsSection}>
                  {/* Master Action Header */}
                  <div className={styles.batchActionBar}>
                    <div className={styles.batchActionBarLeft}>
                      <span className={styles.batchReadyCount}>
                        <CheckCircle2 size={18} color="#10B981" />
                        <strong>{readyBatchCount} of {batchItems.length}</strong> Videos Ready
                      </span>
                      {isBatchDownloading && (
                        <span className={styles.batchDownloadingStatus}>
                          Downloading {batchDownloadProgress.current} of {batchDownloadProgress.total}...
                        </span>
                      )}
                    </div>

                    <div className={styles.batchActionBarRight}>
                      <button
                        type="button"
                        onClick={handleDownloadAllBatch}
                        disabled={readyBatchCount === 0 || isBatchDownloading}
                        className={styles.batchDownloadAllBtn}
                      >
                        <ArrowDownToLine size={18} />
                        <span>Download All ({readyBatchCount} Videos)</span>
                      </button>
                    </div>
                  </div>

                  {/* Cards Grid */}
                  <div className={styles.batchCardsGrid}>
                    {batchItems.map((item, idx) => (
                      <div
                        key={item.id}
                        className={`${styles.batchCardItem} ${
                          item.status === 'completed'
                            ? styles.batchCardItemCompleted
                            : item.status === 'error'
                            ? styles.batchCardItemError
                            : ''
                        }`}
                      >
                        <div className={styles.batchCardThumbWrapper}>
                          {item.mediaInfo?.thumbnailUrl ? (
                            <img
                              src={item.mediaInfo.thumbnailUrl}
                              alt={item.mediaInfo.title || 'Video thumbnail'}
                              className={styles.batchCardThumb}
                              loading="lazy"
                            />
                          ) : (
                            <div className={styles.batchCardThumbPlaceholder}>
                              <FileVideo size={32} opacity={0.4} />
                            </div>
                          )}
                          <div className={styles.batchPlatformPill}>
                            {renderPlatformBadgeIcon(item.platform)}
                            <span>{getPlatformDisplayName(item.platform)}</span>
                          </div>
                          {item.mediaInfo?.duration && (
                            <span className={styles.batchDurationBadge}>
                              {item.mediaInfo.duration}
                            </span>
                          )}
                        </div>

                        <div className={styles.batchCardBody}>
                          <span className={styles.batchItemIndex}>#{idx + 1}</span>
                          <h3 className={styles.batchItemTitle} title={item.mediaInfo?.title || item.url}>
                            {item.mediaInfo?.title || item.url}
                          </h3>

                          {item.mediaInfo?.author && (
                            <span className={styles.batchItemAuthor}>
                              {item.mediaInfo.author}
                            </span>
                          )}

                          {item.status === 'error' && (
                            <div className={styles.batchItemError}>
                              <AlertCircle size={14} />
                              <span>{item.error || 'Failed to process link'}</span>
                            </div>
                          )}

                          {item.mediaInfo?.formats && item.mediaInfo.formats.length > 0 && (
                            <div className={styles.batchFormatSelector}>
                              <label htmlFor={`format-${item.id}`} className={styles.batchFormatLabel}>
                                Format:
                              </label>
                              <select
                                id={`format-${item.id}`}
                                value={item.selectedFormatId}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setBatchItems((prev) =>
                                    prev.map((it) =>
                                      it.id === item.id ? { ...it, selectedFormatId: val } : it
                                    )
                                  );
                                }}
                                className={styles.batchSelect}
                                disabled={item.status === 'downloading' || isBatchDownloading}
                              >
                                {item.mediaInfo.formats.map((fmt) => (
                                  <option key={fmt.id} value={fmt.id}>
                                    {fmt.quality} ({fmt.format.toUpperCase()})
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}

                          <div className={styles.batchCardFooter}>
                            <div className={styles.batchStatusPill}>
                              {item.status === 'resolving' && (
                                <span className={styles.statusResolving}>
                                  <div className={styles.statusDotPulse} /> Resolving...
                                </span>
                              )}
                              {item.status === 'ready' && (
                                <span className={styles.statusReady}>Ready</span>
                              )}
                              {item.status === 'downloading' && (
                                <span className={styles.statusDownloading}>
                                  <div className={styles.statusDotPulse} /> Downloading...
                                </span>
                              )}
                              {item.status === 'completed' && (
                                <span className={styles.statusCompleted}>
                                  <Check size={12} /> Downloaded
                                </span>
                              )}
                              {item.status === 'error' && (
                                <span className={styles.statusError}>Error</span>
                              )}
                            </div>

                            {item.status === 'ready' && (
                              <button
                                type="button"
                                onClick={() => handleDownloadBatchItem(item)}
                                className={styles.batchItemDownloadBtn}
                                title="Download this file"
                              >
                                <Download size={14} />
                                <span>Download</span>
                              </button>
                            )}

                            {item.status === 'completed' && (
                              <button
                                type="button"
                                onClick={() => handleDownloadBatchItem(item)}
                                className={styles.batchItemDownloadBtnSecondary}
                                title="Download again"
                              >
                                <RefreshCw size={13} />
                                <span>Again</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Toast Notification (Clipboard/Mobile) */}
          {clipboardToast && (
            <div className={styles.clipboardToast} role="status">
              <span>{clipboardToast}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
