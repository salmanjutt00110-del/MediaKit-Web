'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Download,
  Clock,
  User,
  Check,
  Info,
  Film,
  Image as ImageIcon,
  FileText,
  Hash,
  Copy,
  ExternalLink,
  Sparkles,
  RefreshCw,
  ArrowDownToLine,
  ChevronRight,
  ArrowLeft,
  AlignLeft,
} from 'lucide-react';
import { MediaFormat, MediaMetadata, PlatformType } from '@/lib/types';
import { YouTubeIcon, TikTokIcon, FacebookIcon, InstagramIcon } from './PlatformIcons';
import { cleanAndDecodeTitle } from '@/lib/string-utils';
import styles from './DownloadResult.module.css';

interface DownloadResultProps {
  media: MediaMetadata;
  onDownloadFormat?: (formatId: string) => void;
  isDownloading?: boolean;
  downloadingFormatId?: string | null;
}

export type ResultOption = 'select' | 'video' | 'thumbnail' | 'title' | 'script';

interface ScriptData {
  loading: boolean;
  scriptText: string;
  timedLines?: { time: string; text: string }[];
  srtText?: string;
  hashtags: string[];
  source?: string;
  language?: string;
  error?: string;
}

export default function DownloadResult({
  media,
  onDownloadFormat,
  isDownloading,
  downloadingFormatId,
}: DownloadResultProps) {
  // Start on 'select' choice view by default so the user is explicitly asked what they want!
  const [selectedOption, setSelectedOption] = useState<ResultOption>('select');
  const [scriptData, setScriptData] = useState<ScriptData | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const getPlatformBadge = (platform: PlatformType) => {
    switch (platform) {
      case 'youtube':
        return (
          <span className={`${styles.platformPill} ${styles.pillYouTube}`}>
            <YouTubeIcon size={13} />
            <span>YouTube</span>
          </span>
        );
      case 'tiktok':
        return (
          <span className={`${styles.platformPill} ${styles.pillTikTok}`}>
            <TikTokIcon size={13} />
            <span>TikTok</span>
          </span>
        );
      case 'facebook':
        return (
          <span className={`${styles.platformPill} ${styles.pillFacebook}`}>
            <FacebookIcon size={13} />
            <span>Facebook</span>
          </span>
        );
      case 'instagram':
        return (
          <span className={`${styles.platformPill} ${styles.pillInstagram}`}>
            <InstagramIcon size={13} />
            <span>Instagram</span>
          </span>
        );
      default:
        return (
          <span className={styles.platformPill}>
            <span>Media</span>
          </span>
        );
    }
  };

  const availableFormats = media.formats || [];
  const mp4Formats = availableFormats.filter((f) => f.format === 'mp4');
  const mp3Formats = availableFormats.filter((f) => f.format === 'mp3');
  const otherFormats = availableFormats.filter(
    (f) => f.format !== 'mp4' && f.format !== 'mp3'
  );

  const displayTitle = cleanAndDecodeTitle(media.title);

  // Thumbnail states
  const [imgSrc, setImgSrc] = useState<string | undefined>(media.thumbnailUrl);
  const [imgError, setImgError] = useState(false);
  const [isImgLoading, setIsImgLoading] = useState(true);
  const [hasTriedProxy, setHasTriedProxy] = useState(false);

  // Reset state on new media
  useEffect(() => {
    setImgSrc(media.thumbnailUrl);
    setImgError(!media.thumbnailUrl);
    setIsImgLoading(!!media.thumbnailUrl);
    setHasTriedProxy(false);
    setSelectedOption('select');
    setScriptData(null);
  }, [media.id, media.sourceUrl, media.thumbnailUrl]);

  const handleImageError = () => {
    if (!hasTriedProxy && media.thumbnailUrl && !media.thumbnailUrl.startsWith('/api/thumbnail')) {
      setHasTriedProxy(true);
      setImgSrc(`/api/thumbnail?url=${encodeURIComponent(media.thumbnailUrl)}`);
    } else {
      setImgError(true);
      setIsImgLoading(false);
    }
  };

  // Fetch Voiceover Script on tab activation
  const fetchScript = async () => {
    if (scriptData && !scriptData.loading && !scriptData.error && scriptData.scriptText) return;

    setScriptData({
      loading: true,
      scriptText: '',
      hashtags: media.hashtags || [],
    });

    try {
      const res = await fetch('/api/transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: media.sourceUrl }),
      });
      const json = await res.json();

      if (json.success && json.data) {
        setScriptData({
          loading: false,
          scriptText: json.data.scriptText || '',
          timedLines: json.data.timedLines || [],
          srtText: json.data.srtText || '',
          hashtags: json.data.hashtags || media.hashtags || [],
          source: json.data.source || 'captions',
          language: json.data.language,
        });
      } else {
        setScriptData({
          loading: false,
          scriptText: media.description || media.title || '',
          hashtags: media.hashtags || [],
          error: json.error?.message || 'Voiceover script not available for this video.',
        });
      }
    } catch {
      setScriptData({
        loading: false,
        scriptText: media.description || media.title || '',
        hashtags: media.hashtags || [],
        error: 'Unable to connect to script server. Please try again.',
      });
    }
  };

  const handleSelectOption = (opt: ResultOption) => {
    setSelectedOption(opt);
    if (opt === 'script') {
      fetchScript();
    }
  };

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2200);
    } catch {
      // Fallback
    }
  };

  const downloadTextFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const safeFilePrefix = (media.title || 'media')
    .replace(/[/\\?%*:|"<>]/g, '_')
    .replace(/\s+/g, ' ')
    .trim();

  const allHashtags = Array.from(
    new Set([...(media.hashtags || []), ...(scriptData?.hashtags || [])])
  );

  return (
    <div className={styles.resultCard} role="region" aria-label="Media Download Information">
      {/* Top Preview Banner */}
      <div className={styles.resultGrid}>
        {/* Guaranteed Thumbnail Preview */}
        <div className={styles.thumbnailWrapper}>
          {isImgLoading && !imgError && <div className={styles.thumbnailSkeleton} />}
          {imgSrc && !imgError ? (
            <Image
              src={imgSrc}
              alt={displayTitle}
              fill
              unoptimized
              referrerPolicy="no-referrer"
              className={styles.thumbnailImg}
              style={{ opacity: isImgLoading ? 0 : 1 }}
              onLoad={() => setIsImgLoading(false)}
              onError={handleImageError}
            />
          ) : (
            <div className={`${styles.fallbackThumbnail} ${styles[`fallback_${media.platform}`] || ''}`}>
              <div className={styles.fallbackIcon}>
                {media.platform === 'tiktok' && <TikTokIcon size={34} color="#ffffff" />}
                {media.platform === 'youtube' && <YouTubeIcon size={34} color="#ffffff" />}
                {media.platform === 'facebook' && <FacebookIcon size={34} color="#ffffff" />}
                {media.platform === 'instagram' && <InstagramIcon size={34} color="#ffffff" />}
              </div>
              <span className={styles.fallbackText}>{media.platform} video</span>
            </div>
          )}
        </div>

        {/* Media Details */}
        <div className={styles.contentWrapper}>
          <div className={styles.headerBlock}>
            {getPlatformBadge(media.platform)}
            <h3 className={styles.mediaTitle}>{displayTitle}</h3>
          </div>

          <div className={styles.metaRow}>
            {media.author && (
              <span className={styles.metaItem}>
                <User size={13} color="#64748B" />
                <span>{media.author}</span>
              </span>
            )}
            {media.duration && (
              <span className={styles.metaItem}>
                <Clock size={13} color="#64748B" />
                <span>{media.duration}</span>
              </span>
            )}
            <span className={styles.metaItem}>
              <Check size={13} color="#10B981" />
              <span>Link Ready</span>
            </span>
          </div>

          {/* Quick-Switch Header Pills (Visible when an option is selected) */}
          {selectedOption !== 'select' && (
            <div className={styles.optionPillNav}>
              <button
                type="button"
                onClick={() => setSelectedOption('select')}
                className={styles.backToChoiceBtn}
                title="Back to all extraction options"
              >
                <ArrowLeft size={13} />
                <span>All Options</span>
              </button>

              <div className={styles.optionPillGroup}>
                <button
                  type="button"
                  onClick={() => handleSelectOption('video')}
                  className={`${styles.navPill} ${selectedOption === 'video' ? styles.navPillActive : ''}`}
                >
                  <Film size={13} />
                  <span>Video & Audio</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectOption('thumbnail')}
                  className={`${styles.navPill} ${selectedOption === 'thumbnail' ? styles.navPillActive : ''}`}
                >
                  <ImageIcon size={13} />
                  <span>Thumbnail</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectOption('title')}
                  className={`${styles.navPill} ${selectedOption === 'title' ? styles.navPillActive : ''}`}
                >
                  <AlignLeft size={13} />
                  <span>Title & Info</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectOption('script')}
                  className={`${styles.navPill} ${selectedOption === 'script' ? styles.navPillActive : ''}`}
                >
                  <FileText size={13} />
                  <span>Voiceover Script</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ====================================================================
          STEP 1: USER CHOICE SCREEN ("What would you like to extract?")
         ==================================================================== */}
      {selectedOption === 'select' && (
        <div className={styles.promptSection}>
          <div className={styles.promptHeader}>
            <div className={styles.promptBadge}>
              <Sparkles size={14} />
              <span>Choose What to Extract</span>
            </div>
            <h4 className={styles.promptHeading}>What would you like to get from this video?</h4>
            <p className={styles.promptSubtext}>
              Select any option below to view and download it instantly in professional quality:
            </p>
          </div>

          <div className={styles.choiceCardsGrid}>
            {/* Card 1: Video & Audio */}
            <button
              type="button"
              onClick={() => handleSelectOption('video')}
              className={`${styles.choiceCard} ${styles.choiceCardVideo}`}
            >
              <div className={`${styles.choiceIconCircle} ${styles.choiceIconCircleVideo}`}>
                <Film size={26} />
              </div>
              <div className={styles.choiceCardBody}>
                <div className={styles.choiceCardTop}>
                  <h5 className={styles.choiceCardTitle}>Video & Audio</h5>
                  <span className={styles.choiceBadgePopular}>MP4 / MP3</span>
                </div>
                <p className={styles.choiceCardDesc}>
                  Download video in 1080p, 720p, 480p, 360p, or high-definition MP3 audio.
                </p>
              </div>
              <div className={styles.choiceCardArrow}>
                <ChevronRight size={18} />
              </div>
            </button>

            {/* Card 2: HD Thumbnail */}
            <button
              type="button"
              onClick={() => handleSelectOption('thumbnail')}
              className={`${styles.choiceCard} ${styles.choiceCardThumb}`}
            >
              <div className={`${styles.choiceIconCircle} ${styles.choiceIconCircleThumb}`}>
                <ImageIcon size={26} />
              </div>
              <div className={styles.choiceCardBody}>
                <div className={styles.choiceCardTop}>
                  <h5 className={styles.choiceCardTitle}>HD Thumbnail</h5>
                  <span className={styles.choiceBadgeHighRes}>High-Res</span>
                </div>
                <p className={styles.choiceCardDesc}>
                  Download the original high-resolution cover image or copy image URL.
                </p>
              </div>
              <div className={styles.choiceCardArrow}>
                <ChevronRight size={18} />
              </div>
            </button>

            {/* Card 3: Title & Info (Text) */}
            <button
              type="button"
              onClick={() => handleSelectOption('title')}
              className={`${styles.choiceCard} ${styles.choiceCardTitleStyle}`}
            >
              <div className={`${styles.choiceIconCircle} ${styles.choiceIconCircleTitle}`}>
                <AlignLeft size={26} />
              </div>
              <div className={styles.choiceCardBody}>
                <div className={styles.choiceCardTop}>
                  <h5 className={styles.choiceCardTitle}>Title, Tags & Info</h5>
                  <span className={styles.choiceBadgeText}>Clean Text</span>
                </div>
                <p className={styles.choiceCardDesc}>
                  Extract clean video title, creator info, description, and hashtags as text.
                </p>
              </div>
              <div className={styles.choiceCardArrow}>
                <ChevronRight size={18} />
              </div>
            </button>

            {/* Card 4: Voiceover Script & Transcript (Text) */}
            <button
              type="button"
              onClick={() => handleSelectOption('script')}
              className={`${styles.choiceCard} ${styles.choiceCardScript}`}
            >
              <div className={`${styles.choiceIconCircle} ${styles.choiceIconCircleScript}`}>
                <FileText size={26} />
              </div>
              <div className={styles.choiceCardBody}>
                <div className={styles.choiceCardTop}>
                  <h5 className={styles.choiceCardTitle}>Voiceover Script</h5>
                  <span className={styles.choiceBadgeScript}>Script & Subtitles</span>
                </div>
                <p className={styles.choiceCardDesc}>
                  Extract speech-to-text transcript, spoken voiceover, and subtitle text.
                </p>
              </div>
              <div className={styles.choiceCardArrow}>
                <ChevronRight size={18} />
              </div>
            </button>
          </div>
        </div>
      )}

      {/* ====================================================================
          VIEW 1: VIDEO & AUDIO DOWNLOADS
         ==================================================================== */}
      {selectedOption === 'video' && (
        <div className={styles.downloadsSection}>
          <div className={styles.viewSectionHeader}>
            <div>
              <h4 className={styles.downloadsHeading}>Full Video & Audio Downloads</h4>
              <p className={styles.viewSectionSub}>
                Select your preferred resolution or audio format for instant download:
              </p>
            </div>
            <span className={styles.formatsCountBadge}>{availableFormats.length} Formats Available</span>
          </div>

          {availableFormats.length > 0 ? (
            <div className={styles.formatsList}>
              {/* MP4 Section */}
              {mp4Formats.length > 0 && (
                <div className={styles.formatGroup}>
                  <span className={styles.groupLabel}>Video Formats (MP4)</span>
                  <div className={styles.groupItems}>
                    {mp4Formats.map((fmt: MediaFormat) => (
                      <div key={fmt.id} className={styles.formatRow}>
                        <div className={styles.formatInfo}>
                          <span className={styles.qualityLabel}>{fmt.quality}</span>
                          {fmt.fileSize && (
                            <span className={styles.fileSizeLabel}>{fmt.fileSize}</span>
                          )}
                        </div>
                        <button
                          type="button"
                          className={styles.rowDownloadBtn}
                          onClick={() => onDownloadFormat && onDownloadFormat(fmt.id)}
                          disabled={isDownloading}
                          aria-label={`Download MP4 ${fmt.quality}`}
                        >
                          <Download size={14} />
                          <span>
                            {isDownloading && downloadingFormatId === fmt.id
                              ? 'Starting...'
                              : 'Instant Download'}
                          </span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MP3 Section */}
              {mp3Formats.length > 0 && (
                <div className={styles.formatGroup}>
                  <span className={styles.groupLabel}>Audio Only (MP3)</span>
                  <div className={styles.groupItems}>
                    {mp3Formats.map((fmt: MediaFormat) => (
                      <div key={fmt.id} className={styles.formatRow}>
                        <div className={styles.formatInfo}>
                          <span className={styles.qualityLabel}>{fmt.quality}</span>
                          {fmt.fileSize && (
                            <span className={styles.fileSizeLabel}>{fmt.fileSize}</span>
                          )}
                        </div>
                        <button
                          type="button"
                          className={styles.rowDownloadBtn}
                          onClick={() => onDownloadFormat && onDownloadFormat(fmt.id)}
                          disabled={isDownloading}
                          aria-label={`Download MP3 ${fmt.quality}`}
                        >
                          <Download size={14} />
                          <span>
                            {isDownloading && downloadingFormatId === fmt.id
                              ? 'Starting...'
                              : 'Download MP3'}
                          </span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Other Formats Section */}
              {otherFormats.length > 0 && (
                <div className={styles.formatGroup}>
                  <span className={styles.groupLabel}>Other Formats</span>
                  <div className={styles.groupItems}>
                    {otherFormats.map((fmt: MediaFormat) => (
                      <div key={fmt.id} className={styles.formatRow}>
                        <div className={styles.formatInfo}>
                          <span className={styles.qualityLabel}>{fmt.quality}</span>
                          {fmt.fileSize && (
                            <span className={styles.fileSizeLabel}>{fmt.fileSize}</span>
                          )}
                        </div>
                        <button
                          type="button"
                          className={styles.rowDownloadBtn}
                          onClick={() => onDownloadFormat && onDownloadFormat(fmt.id)}
                          disabled={isDownloading}
                          aria-label={`Download ${fmt.format} ${fmt.quality}`}
                        >
                          <Download size={14} />
                          <span>Download</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.providerNotice}>
              <Info size={16} color="#2563EB" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Platform stream ready.</strong>
                <p style={{ marginTop: '2px' }}>
                  {media.providerStatusMessage ||
                    'Extracting stream details. Click download to trigger direct media file.'}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ====================================================================
          VIEW 2: HD THUMBNAIL DOWNLOAD
         ==================================================================== */}
      {selectedOption === 'thumbnail' && (
        <div className={styles.assetTabContent}>
          <div className={styles.thumbnailCardBig}>
            <div className={styles.viewSectionHeader}>
              <div>
                <h4 className={styles.downloadsHeading}>High-Resolution Video Cover</h4>
                <p className={styles.viewSectionSub}>
                  Original HD thumbnail preview ready for saving:
                </p>
              </div>
            </div>

            {imgSrc ? (
              <div className={styles.thumbnailLargeWrapper}>
                <img
                  src={imgSrc}
                  alt={displayTitle}
                  className={styles.thumbnailLargeImg}
                  loading="lazy"
                />
              </div>
            ) : (
              <p className={styles.tabEmptyState}>No high-resolution thumbnail found for this link.</p>
            )}

            <div className={styles.assetActionsBar}>
              <div className={styles.assetMetaInfo}>
                <span className={styles.assetTag}>High Quality (HD)</span>
                <span className={styles.assetDimText}>Cover Image / Thumbnail</span>
              </div>

              <div className={styles.assetButtonsRight}>
                {imgSrc && (
                  <>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(imgSrc, 'thumb-url')}
                      className={styles.assetBtnSecondary}
                    >
                      {copiedKey === 'thumb-url' ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
                      <span>{copiedKey === 'thumb-url' ? 'Copied URL!' : 'Copy Image Link'}</span>
                    </button>

                    <a
                      href={`/api/thumbnail?url=${encodeURIComponent(imgSrc)}`}
                      download={`${safeFilePrefix}_thumbnail.jpg`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.assetBtnPrimary}
                    >
                      <ArrowDownToLine size={15} />
                      <span>Download HD Thumbnail</span>
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          VIEW 3: TITLE, CREATOR, DESCRIPTION & HASHTAGS (TEXT)
         ==================================================================== */}
      {selectedOption === 'title' && (
        <div className={styles.assetTabContent}>
          <div className={styles.infoTextCard}>
            <div className={styles.viewSectionHeader}>
              <div>
                <h4 className={styles.downloadsHeading}>Title, Creator & Text Info</h4>
                <p className={styles.viewSectionSub}>
                  Clean text extracted from video metadata with 1-click copy:
                </p>
              </div>
            </div>

            {/* Title Block */}
            <div className={styles.textDataBlock}>
              <div className={styles.textDataHeader}>
                <span className={styles.textDataLabel}>Video Title</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(displayTitle, 'title-copy')}
                  className={styles.assetBtnSecondary}
                >
                  {copiedKey === 'title-copy' ? <Check size={13} color="#10B981" /> : <Copy size={13} />}
                  <span>{copiedKey === 'title-copy' ? 'Copied Title!' : 'Copy Title'}</span>
                </button>
              </div>
              <div className={styles.textDataContent}>{displayTitle}</div>
            </div>

            {/* Creator / Channel Block */}
            {media.author && (
              <div className={styles.textDataBlock}>
                <div className={styles.textDataHeader}>
                  <span className={styles.textDataLabel}>Creator / Channel</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(media.author || '', 'author-copy')}
                    className={styles.assetBtnSecondary}
                  >
                    {copiedKey === 'author-copy' ? <Check size={13} color="#10B981" /> : <Copy size={13} />}
                    <span>{copiedKey === 'author-copy' ? 'Copied!' : 'Copy Creator'}</span>
                  </button>
                </div>
                <div className={styles.textDataContent}>{media.author}</div>
              </div>
            )}

            {/* Hashtags Block */}
            {allHashtags.length > 0 && (
              <div className={styles.textDataBlock}>
                <div className={styles.textDataHeader}>
                  <span className={styles.textDataLabel}>
                    Hashtags ({allHashtags.length} detected)
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(allHashtags.join(' '), 'tags-copy')}
                    className={styles.assetBtnPrimary}
                  >
                    {copiedKey === 'tags-copy' ? <Check size={13} color="#ffffff" /> : <Copy size={13} />}
                    <span>{copiedKey === 'tags-copy' ? 'Copied All!' : 'Copy All Hashtags'}</span>
                  </button>
                </div>
                <div className={styles.hashtagsGrid}>
                  {allHashtags.map((tag, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => copyToClipboard(tag, `tag-${idx}`)}
                      className={styles.hashtagPill}
                      title="Click to copy hashtag"
                    >
                      <Hash size={12} className={styles.hashtagIcon} />
                      <span>{tag.replace(/^#/, '')}</span>
                      {copiedKey === `tag-${idx}` && (
                        <Check size={12} color="#10B981" style={{ marginLeft: '4px' }} />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Description / Caption Block */}
            {media.description && (
              <div className={styles.textDataBlock}>
                <div className={styles.textDataHeader}>
                  <span className={styles.textDataLabel}>Description / Caption</span>
                  <div className={styles.textDataActions}>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(media.description || '', 'desc-copy')}
                      className={styles.assetBtnSecondary}
                    >
                      {copiedKey === 'desc-copy' ? <Check size={13} color="#10B981" /> : <Copy size={13} />}
                      <span>{copiedKey === 'desc-copy' ? 'Copied Text!' : 'Copy Description'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        downloadTextFile(
                          media.description || '',
                          `${safeFilePrefix}_description.txt`
                        )
                      }
                      className={styles.assetBtnSecondary}
                    >
                      <FileText size={13} />
                      <span>Download .TXT</span>
                    </button>
                  </div>
                </div>
                <div className={styles.textDataContentLong}>{media.description}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ====================================================================
          VIEW 4: VOICEOVER SCRIPT & TRANSCRIPT (TEXT)
         ==================================================================== */}
      {selectedOption === 'script' && (
        <div className={styles.assetTabContent}>
          <div className={styles.scriptCard}>
            {scriptData?.loading ? (
              <div className={styles.scriptLoadingContainer}>
                <div className={styles.stageSpinner} />
                <span className={styles.scriptLoadingText}>
                  Extracting voiceover script and speech-to-text transcript...
                </span>
              </div>
            ) : scriptData?.scriptText ? (
              <>
                <div className={styles.scriptHeader}>
                  <div className={styles.scriptHeaderLeft}>
                    <span className={styles.scriptSourceBadge}>
                      <Sparkles size={13} />
                      <span>
                        {scriptData.source === 'subtitles'
                          ? 'Official Captions / Transcript'
                          : scriptData.source === 'captions'
                          ? 'Video Spoken Captions'
                          : 'Voiceover Text'}
                      </span>
                    </span>
                    {scriptData.language && (
                      <span className={styles.scriptLangBadge}>
                        Language: {scriptData.language.toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className={styles.scriptHeaderRight}>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(scriptData.scriptText, 'script-text')}
                      className={styles.assetBtnSecondary}
                      title="Copy full script"
                    >
                      {copiedKey === 'script-text' ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
                      <span>{copiedKey === 'script-text' ? 'Copied Script!' : 'Copy Script Text'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        downloadTextFile(
                          scriptData.scriptText,
                          `${safeFilePrefix}_voiceover_script.txt`
                        )
                      }
                      className={styles.assetBtnSecondary}
                      title="Download script as .TXT file"
                    >
                      <FileText size={14} />
                      <span>Download .TXT</span>
                    </button>

                    {scriptData.srtText && (
                      <button
                        type="button"
                        onClick={() =>
                          downloadTextFile(scriptData.srtText!, `${safeFilePrefix}_subtitles.srt`)
                        }
                        className={styles.assetBtnPrimary}
                        title="Download Subtitles as .SRT file"
                      >
                        <ArrowDownToLine size={14} />
                        <span>Download .SRT</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Script Reader Body (Professional Text) */}
                <div className={styles.scriptBodyWrapper}>
                  {scriptData.timedLines && scriptData.timedLines.length > 0 ? (
                    <div className={styles.timedLinesList}>
                      {scriptData.timedLines.map((tl, idx) => (
                        <div key={idx} className={styles.timedLineRow}>
                          <span className={styles.timedTimePill}>{tl.time}</span>
                          <span className={styles.timedLineText}>{tl.text}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className={styles.scriptPlainText}>{scriptData.scriptText}</p>
                  )}
                </div>
              </>
            ) : (
              <div className={styles.scriptEmptyState}>
                <FileText size={32} opacity={0.4} />
                <p>
                  {scriptData?.error ||
                    'No voiceover script or subtitles were detected for this video.'}
                </p>
                <button
                  type="button"
                  onClick={fetchScript}
                  className={styles.assetBtnSecondary}
                  style={{ marginTop: '8px' }}
                >
                  <RefreshCw size={13} />
                  <span>Retry Fetching Script</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
