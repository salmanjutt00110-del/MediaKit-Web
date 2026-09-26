'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search,
  X,
  Clock,
  Sparkles,
  Download,
  Filter,
  CheckSquare,
  Square,
  AlertCircle,
  Loader2,
  RefreshCw,
  ChevronDown,
} from 'lucide-react';
import { YouTubeSearchResult } from '@/lib/youtube-search-service';
import SearchResultCard from './SearchResultCard';
import VideoPreviewModal from './VideoPreviewModal';
import FormatSelectionModal, { FormatSelectionResult } from './FormatSelectionModal';
import BatchDownloadQueueModal from './BatchDownloadQueueModal';
import styles from './YouTubeSearch.module.css';

const EXAMPLE_SEARCHES = [
  'Perza Qadri',
  'Naat',
  'Bayan',
  'Quran Recitation',
  'Islamic Lecture',
  'Podcast',
  'Tech Tutorial',
];

const RECENT_SEARCHES_KEY = 'mediakit_recent_yt_searches';

export default function YouTubeSearch() {
  const [query, setQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Search Results & State
  const [results, setResults] = useState<YouTubeSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSlow, setIsSlow] = useState(false);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>(undefined);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<{ code: string; message: string } | null>(null);

  // Filters
  const [sortBy, setSortBy] = useState<'relevance' | 'date' | 'viewCount'>('relevance');
  const [durationFilter, setDurationFilter] = useState<'any' | 'short' | 'medium' | 'long'>('any');

  // Multi-Selection State
  const [selectedMap, setSelectedMap] = useState<Map<string, YouTubeSearchResult>>(new Map());

  // Modals
  const [previewVideo, setPreviewVideo] = useState<YouTubeSearchResult | null>(null);
  const [showFormatModal, setShowFormatModal] = useState(false);
  const [activeBatchConfig, setActiveBatchConfig] = useState<FormatSelectionResult | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const slowTimerRef = useRef<NodeJS.Timeout | null>(null);
  const scrollSentinelRef = useRef<HTMLDivElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch {}
  }, []);

  const saveRecentSearch = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    try {
      const updated = [trimmed, ...recentSearches.filter((s) => s.toLowerCase() !== trimmed.toLowerCase())].slice(0, 8);
      setRecentSearches(updated);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch {}
  };

  const handleClearRecent = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {}
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Manage body class for mobile floating element collision prevention
  useEffect(() => {
    if (selectedCount > 0) {
      document.body.classList.add('has-yt-selection');
    } else {
      document.body.classList.remove('has-yt-selection');
    }
    return () => {
      document.body.classList.remove('has-yt-selection');
    };
  }, [selectedCount]);

  // Fetch suggestions with debounce
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/youtube/suggestions?q=${encodeURIComponent(trimmed)}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.suggestions)) {
          setSuggestions(data.suggestions);
        }
      } catch {}
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Main search execution
  const executeSearch = async (
    searchTerm: string,
    pageToken?: string,
    append: boolean = false,
    customSort?: 'relevance' | 'date' | 'viewCount',
    customDuration?: 'any' | 'short' | 'medium' | 'long'
  ) => {
    const clean = searchTerm.trim();
    if (!clean) return;

    if (!append) {
      setIsLoading(true);
      setIsSlow(false);
      setError(null);
      setActiveQuery(clean);
      setShowSuggestions(false);

      if (slowTimerRef.current) clearTimeout(slowTimerRef.current);
      slowTimerRef.current = setTimeout(() => {
        setIsSlow(true);
      }, 2500);
    } else {
      setIsLoadingMore(true);
    }

    try {
      saveRecentSearch(clean);

      const params = new URLSearchParams({
        q: clean,
        maxResults: '16',
        order: customSort || sortBy,
        duration: customDuration || durationFilter,
      });
      if (pageToken) params.set('pageToken', pageToken);

      const res = await fetch(`/api/youtube/search?${params.toString()}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        const code = data?.error?.code || 'API_ERROR';
        let msg = data?.error?.message || 'Unable to search YouTube right now.';
        if (code === 'RATE_LIMITED') {
          msg = 'Search is temporarily limited. Please try again shortly.';
        }
        setError({ code, message: msg });
        if (!append) setResults([]);
      } else {
        setError(null);
        if (append) {
          // Append without duplicate IDs
          setResults((prev) => {
            const existingIds = new Set(prev.map((v) => v.id));
            const newUnique = (data.results || []).filter((v: YouTubeSearchResult) => !existingIds.has(v.id));
            return [...prev, ...newUnique];
          });
        } else {
          setResults(data.results || []);
        }
        setNextPageToken(data.nextPageToken || undefined);
      }
    } catch {
      setError({
        code: 'NETWORK_ERROR',
        message: 'Check your connection and try again.',
      });
      if (!append) setResults([]);
    } finally {
      if (slowTimerRef.current) clearTimeout(slowTimerRef.current);
      setIsLoading(false);
      setIsSlow(false);
      setIsLoadingMore(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      executeSearch(query.trim());
    }
  };

  const handleSelectSuggestion = (term: string) => {
    setQuery(term);
    setShowSuggestions(false);
    executeSearch(term);
  };

  const handleLoadMore = useCallback(() => {
    if (nextPageToken && !isLoadingMore && !isLoading && activeQuery) {
      executeSearch(activeQuery, nextPageToken, true);
    }
  }, [nextPageToken, isLoadingMore, isLoading, activeQuery, sortBy, durationFilter]);

  // Infinite Scroll: IntersectionObserver triggers auto-load when sentinel enters viewport
  useEffect(() => {
    const sentinel = scrollSentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          handleLoadMore();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [handleLoadMore]);

  const handleSortChange = (newSort: 'relevance' | 'date' | 'viewCount') => {
    setSortBy(newSort);
    if (activeQuery) {
      executeSearch(activeQuery, undefined, false, newSort, durationFilter);
    }
  };

  const handleDurationChange = (newDuration: 'any' | 'short' | 'medium' | 'long') => {
    setDurationFilter(newDuration);
    if (activeQuery) {
      executeSearch(activeQuery, undefined, false, sortBy, newDuration);
    }
  };

  // Selection Handlers (Section 1 & 2)
  const handleToggleSelect = (video: YouTubeSearchResult) => {
    setSelectedMap((prev) => {
      const next = new Map(prev);
      if (next.has(video.id)) {
        next.delete(video.id);
      } else {
        next.set(video.id, video);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    setSelectedMap((prev) => {
      const next = new Map(prev);
      for (const item of results) {
        next.set(item.id, item);
      }
      return next;
    });
  };

  const handleClearSelection = () => {
    setSelectedMap(new Map());
  };

  const selectedVideos = Array.from(selectedMap.values());
  const selectedCount = selectedVideos.length;

  return (
    <div
      className={styles.searchContainer}
      ref={containerRef}
      style={{ paddingBottom: selectedCount > 0 ? '90px' : undefined }}
    >
      {/* 1. Main Search Header */}
      <div className={styles.searchHeader}>
        <form onSubmit={handleSubmit} className={styles.searchBarWrapper}>
          <div className={styles.searchCapsule}>
            <div className={styles.searchIconLeft}>
              <Search size={20} />
            </div>

            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => {
                setIsFocused(true);
                setShowSuggestions(true);
              }}
              placeholder="Search YouTube videos, channels or creators..."
              className={styles.searchInput}
              aria-label="Search YouTube videos"
              autoComplete="off"
              spellCheck={false}
            />

            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  searchInputRef.current?.focus();
                }}
                className={styles.clearInputBtn}
                aria-label="Clear search input"
              >
                <X size={16} />
              </button>
            )}

            <button
              type="submit"
              className={styles.searchSubmitBtn}
              disabled={isLoading || !query.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className={styles.loadingSpinnerSmall} />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search size={18} />
                  <span>Search</span>
                </>
              )}
            </button>
          </div>

          {/* Autocomplete / Suggestions Dropdown */}
          {showSuggestions && (suggestions.length > 0 || recentSearches.length > 0) && (
            <div className={styles.suggestionsDropdown}>
              {/* Live suggestions */}
              {suggestions.length > 0 && (
                <div>
                  <div className={styles.suggestionsSectionTitle}>Suggestions</div>
                  {suggestions.map((item, idx) => (
                    <button
                      key={`sugg-${idx}`}
                      type="button"
                      className={styles.suggestionItem}
                      onClick={() => handleSelectSuggestion(item)}
                    >
                      <Search size={15} className={styles.suggestionIcon} />
                      <span>{item}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Recent searches */}
              {recentSearches.length > 0 && (
                <div>
                  <div className={styles.suggestionsSectionTitle}>
                    <span>Recent Searches</span>
                    <button
                      type="button"
                      onClick={handleClearRecent}
                      className={styles.clearHistoryBtn}
                    >
                      Clear
                    </button>
                  </div>
                  {recentSearches.map((item, idx) => (
                    <button
                      key={`rec-${idx}`}
                      type="button"
                      className={styles.suggestionItem}
                      onClick={() => handleSelectSuggestion(item)}
                    >
                      <Clock size={14} className={styles.suggestionIcon} />
                      <span>{item}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </form>

        {/* Quick Example Searches */}
        <div className={styles.examplePillsWrapper}>
          <span className={styles.examplePillsLabel}>Examples:</span>
          {EXAMPLE_SEARCHES.map((example) => (
            <button
              key={example}
              type="button"
              className={styles.examplePill}
              onClick={() => {
                setQuery(example);
                executeSearch(example);
              }}
            >
              <Sparkles size={11} color="#0284c7" />
              <span>{example}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Global Loading Status */}
      {isLoading && (
        <div className={styles.statusMessageBanner}>
          <Loader2 size={18} className={styles.loadingSpinnerSmall} />
          <span>{isSlow ? 'Still searching YouTube...' : 'Searching YouTube...'}</span>
        </div>
      )}

      {/* 3. Error Alert */}
      {error && !isLoading && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            color: '#dc2626',
            marginBottom: '20px',
            fontSize: '0.92rem',
          }}
          role="alert"
        >
          <AlertCircle size={20} style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>{error.message}</div>
          <button
            type="button"
            onClick={() => executeSearch(activeQuery || query)}
            style={{
              background: '#ffffff',
              border: '1px solid #fca5a5',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '0.82rem',
              fontWeight: 600,
              color: '#b91c1c',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <RefreshCw size={12} />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* 4. Controls Strip (Filters & Multi-Select Bar) */}
      {results.length > 0 && !isLoading && (
        <div className={styles.controlsStrip}>
          <div className={styles.filterGroup}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#64748b' }}>
              <Filter size={14} />
              <span>Filters:</span>
            </div>
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value as any)}
              className={styles.filterSelect}
              aria-label="Sort search results"
            >
              <option value="relevance">Relevance</option>
              <option value="date">Upload Date</option>
              <option value="viewCount">View Count</option>
            </select>

            <select
              value={durationFilter}
              onChange={(e) => handleDurationChange(e.target.value as any)}
              className={styles.filterSelect}
              aria-label="Filter by duration"
            >
              <option value="any">Any Duration</option>
              <option value="short">Short (&lt; 4 min)</option>
              <option value="medium">Medium (4–20 min)</option>
              <option value="long">Long (&gt; 20 min)</option>
            </select>
          </div>

          <div className={styles.selectionControls}>
            {selectedCount > 0 && (
              <span className={styles.selectionCountBadge}>
                {selectedCount} {selectedCount === 1 ? 'video selected' : 'videos selected'}
              </span>
            )}

            <button
              type="button"
              className={styles.textActionBtn}
              onClick={handleSelectAll}
              title="Select all loaded results"
            >
              Select All
            </button>

            <button
              type="button"
              className={styles.textActionBtn}
              onClick={handleClearSelection}
              disabled={selectedCount === 0}
              title="Clear all selections"
            >
              Clear All
            </button>

            {/* Desktop Download Selected Button (Section 4) */}
            <button
              type="button"
              className={styles.desktopDownloadBtn}
              disabled={selectedCount === 0}
              onClick={() => setShowFormatModal(true)}
              title={selectedCount === 0 ? 'Select at least 1 video to download' : `Download ${selectedCount} selected videos`}
            >
              <Download size={15} />
              <span>
                {selectedCount > 0
                  ? `Download Selected (${selectedCount})`
                  : 'Download Selected'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* 5. Results Grid or Skeleton Loading Cards */}
      {isLoading ? (
        <div className={styles.resultsGrid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={`skel-${i}`} className={styles.skeletonCard}>
              <div className={styles.skeletonThumb} />
              <div className={styles.skeletonBody}>
                <div className={`${styles.skeletonLine} ${styles.skeletonLineTitle}`} />
                <div className={`${styles.skeletonLine} ${styles.skeletonLineSubtitle}`} />
                <div className={`${styles.skeletonLine} ${styles.skeletonLineMeta}`} />
              </div>
            </div>
          ))}
        </div>
      ) : results.length > 0 ? (
        <>
          <div className={styles.resultsGrid}>
            {results.map((video) => (
              <SearchResultCard
                key={video.id}
                video={video}
                isSelected={selectedMap.has(video.id)}
                onToggleSelect={handleToggleSelect}
                onPreview={(v) => setPreviewVideo(v)}
              />
            ))}
          </div>

          {/* Show More Videos Button & Infinite Scroll Sentinel */}
          {nextPageToken && (
            <div className={styles.showMoreContainer}>
              <button
                type="button"
                className={styles.showMoreBtn}
                onClick={() => {
                  if (activeQuery && nextPageToken && !isLoadingMore) {
                    executeSearch(activeQuery, nextPageToken, true);
                  }
                }}
                disabled={isLoadingMore}
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 size={16} className={styles.loadingSpinnerSmall} />
                    <span>Loading more videos...</span>
                  </>
                ) : (
                  <>
                    <ChevronDown size={18} />
                    <span>Show More Videos (مزید نتائج دیکھیں)</span>
                  </>
                )}
              </button>
              <div ref={scrollSentinelRef} className={styles.infiniteScrollSentinel} />
            </div>
          )}
        </>
      ) : activeQuery && !error ? (
        <div
          style={{
            textAlign: 'center',
            padding: '48px 20px',
            background: '#f8fafc',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            color: '#64748b',
          }}
        >
          <Search size={36} color="#94a3b8" style={{ marginBottom: '12px' }} />
          <h4 style={{ margin: '0 0 6px 0', fontSize: '1.1rem', color: '#0f172a' }}>
            No YouTube videos found for this search.
          </h4>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>
            Try different keywords or check out one of the example topics above.
          </p>
        </div>
      ) : null}

      {/* 5. Comprehensive How to Use Guide */}
      <div className={styles.howToUse}>
        <span className={styles.howToUseTitle}>📖 یوٹیوب ڈاؤنلوڈر استعمال کرنے کا طریقہ (How to Use)</span>
        <div className={styles.howToUseSteps}>
          <div className={styles.howToUseStep}>
            <span className={styles.howToUseStepNum}>1</span>
            <span><strong>سرچ کریں (Search):</strong> اوپر سرچ بار میں کوئی بھی لفظ (مثلاً نعت، بیان، تلاوت یا گانا) لکھ کر سرچ کریں۔</span>
          </div>
          <div className={styles.howToUseStep}>
            <span className={styles.howToUseStepNum}>2</span>
            <span><strong>سلیکٹ کریں (Select):</strong> مطلوبہ ویڈیوز کے کارڈ یا 'Select' بٹن پر ٹیپ کریں، ایک ساتھ متعدد ویڈیوز منتخب ہو جائیں گی۔</span>
          </div>
          <div className={styles.howToUseStep}>
            <span className={styles.howToUseStepNum}>3</span>
            <span><strong>ڈاؤن لوڈ (Download):</strong> نیچے فلوٹنگ بار میں 'Download Selected' دبائیں اور MP4 (ویڈیو) یا MP3 (آڈیو) کا انتخاب کریں۔</span>
          </div>
          <div className={styles.howToUseStep}>
            <span className={styles.howToUseStepNum}>4</span>
            <span><strong>مزید رزلٹس (Show More):</strong> مزید ویڈیوز دیکھنے کے لیے نیچے اسکرول کریں یا 'Show More Videos' بٹن پر کلک کریں۔</span>
          </div>
        </div>
      </div>

      {/* 6. Sticky Action Bar Spacer & Bar */}
      {selectedCount > 0 && <div className={styles.stickyBarSpacer} aria-hidden="true" />}
      {selectedCount > 0 && (
        <div className={styles.stickyActionBar} role="region" aria-label="Batch actions">
          <div className={styles.stickyCountGroup}>
            <span className={styles.stickyCountBadge}>{selectedCount}</span>
            <span className={styles.stickyCountText}>
              {selectedCount === 1 ? 'video selected' : 'videos selected'}
            </span>
          </div>

          <div className={styles.stickyBtnGroup}>
            <button
              type="button"
              className={styles.stickyClearBtn}
              onClick={handleClearSelection}
            >
              Clear All
            </button>
            <button
              type="button"
              className={styles.stickyDownloadBtn}
              onClick={() => setShowFormatModal(true)}
            >
              <Download size={16} />
              <span>Download Selected ({selectedCount})</span>
            </button>
          </div>
        </div>
      )}

      {/* 7. Video Preview Modal */}
      {previewVideo && (
        <VideoPreviewModal
          video={previewVideo}
          onClose={() => setPreviewVideo(null)}
        />
      )}

      {/* 8. Format Selection Modal */}
      {showFormatModal && (
        <FormatSelectionModal
          selectedVideos={selectedVideos}
          onConfirm={(config) => {
            setShowFormatModal(false);
            setActiveBatchConfig(config);
          }}
          onClose={() => setShowFormatModal(false)}
        />
      )}

      {/* 9. Controlled Batch Download Queue Modal */}
      {activeBatchConfig && (
        <BatchDownloadQueueModal
          selectedVideos={selectedVideos}
          formatConfig={activeBatchConfig}
          onClose={() => {
            setActiveBatchConfig(null);
            handleClearSelection();
          }}
        />
      )}
    </div>
  );
}
