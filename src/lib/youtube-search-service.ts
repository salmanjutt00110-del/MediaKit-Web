import { logger } from './logger';
import { parseIsoDuration } from './providers/youtube';

export interface YouTubeSearchResult {
  id: string;
  title: string;
  channelTitle: string;
  channelId?: string;
  thumbnailUrl: string;
  duration?: string;
  durationSeconds?: number;
  publishedAt?: string;
  publishedTimeAgo?: string;
  viewCount?: string;
  rawViewCount?: number;
  videoUrl: string;
  definition?: 'hd' | 'sd';
  maxQuality?: string;
  availableQualities?: string[];
}

export interface SearchOptions {
  query: string;
  pageToken?: string;
  maxResults?: number;
  order?: 'relevance' | 'date' | 'viewCount';
  videoDuration?: 'any' | 'short' | 'medium' | 'long';
}

// In-memory cache for search results (TTL: 15 minutes)
const searchCache = new Map<string, { data: { results: YouTubeSearchResult[]; nextPageToken?: string; totalResults?: number }; expiry: number }>();

export function formatTimeAgo(isoDate?: string): string {
  if (!isoDate) return '';
  try {
    const diffMs = Date.now() - new Date(isoDate).getTime();
    if (isNaN(diffMs)) return '';
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    const diffMonth = Math.floor(diffDay / 30);
    const diffYear = Math.floor(diffDay / 365);

    if (diffYear > 0) return `${diffYear} year${diffYear > 1 ? 's' : ''} ago`;
    if (diffMonth > 0) return `${diffMonth} month${diffMonth > 1 ? 's' : ''} ago`;
    if (diffDay > 0) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    if (diffHour > 0) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    if (diffMin > 0) return `${diffMin} min${diffMin > 1 ? 's' : ''} ago`;
    return 'Just now';
  } catch {
    return '';
  }
}

export function formatViews(viewsStr?: string): string {
  if (!viewsStr) return '';
  const num = parseInt(viewsStr, 10);
  if (isNaN(num)) return '';
  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(1).replace(/\.0$/, '')}B views`;
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, '')}M views`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1).replace(/\.0$/, '')}K views`;
  }
  return `${num.toLocaleString()} views`;
}

let innertubeInstance: any = null;

async function getInnertube() {
  if (!innertubeInstance) {
    const { Innertube, Log } = await import('youtubei.js');
    if (Log?.setLevel && Log?.Level) {
      Log.setLevel(Log.Level.NONE);
    }
    innertubeInstance = await Innertube.create();
  }
  return innertubeInstance;
}

interface InnertubeSearchSession {
  allVideos: YouTubeSearchResult[];
  lastSearchObj: any;
  expiry: number;
}
const innertubeSessions = new Map<string, InnertubeSearchSession>();

function parseInnertubeVideo(v: any): YouTubeSearchResult | null {
  const id = v.id || v.video_id;
  if (!id || typeof id !== 'string') return null;

  const title = (v.title?.text || v.title || 'YouTube Video')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'");

  const channelTitle = v.author?.name || v.channel?.name || 'YouTube Creator';
  const channelId = v.author?.id || v.channel?.id;
  const duration = v.duration?.text || 'Video';
  const durationSeconds = v.duration?.seconds || 0;
  const viewCount = v.view_count?.text || (v.views ? `${v.views} views` : undefined);
  const thumb =
    v.thumbnails?.[v.thumbnails.length - 1]?.url ||
    v.thumbnails?.[0]?.url ||
    `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
  const publishedTimeAgo = v.published?.text || '';

  return {
    id,
    title,
    channelTitle,
    channelId,
    thumbnailUrl: thumb,
    duration,
    durationSeconds,
    publishedTimeAgo,
    viewCount,
    videoUrl: `https://www.youtube.com/watch?v=${id}`,
    definition: 'hd',
    maxQuality: '720p',
    availableQualities: ['720p', '480p', '360p', 'mp3'],
  };
}

export async function searchYouTubeWithInnertube(
  query: string,
  pageToken?: string,
  maxResults: number = 16
): Promise<{
  results: YouTubeSearchResult[];
  nextPageToken?: string;
  totalResults?: number;
}> {
  try {
    const cleanKey = query.trim().toLowerCase();
    let pageNum = 1;
    if (pageToken && pageToken.startsWith('p_')) {
      pageNum = parseInt(pageToken.replace('p_', ''), 10) || 1;
    }

    let session = innertubeSessions.get(cleanKey);

    // Initial search or expired session
    if (!session || session.expiry < Date.now() || pageNum === 1) {
      const yt = await getInnertube();
      const searchRes = await yt.search(query);
      const rawVideos = searchRes.videos || searchRes.results || [];
      const parsed: YouTubeSearchResult[] = [];
      for (const v of rawVideos) {
        const item = parseInnertubeVideo(v);
        if (item) parsed.push(item);
      }

      session = {
        allVideos: parsed,
        lastSearchObj: searchRes,
        expiry: Date.now() + 30 * 60 * 1000,
      };
      innertubeSessions.set(cleanKey, session);
    }

    // If requesting subsequent pages and we need more videos
    const startIndex = (pageNum - 1) * maxResults;
    const targetEndIndex = startIndex + maxResults;

    if (targetEndIndex > session.allVideos.length && session.lastSearchObj?.has_continuation) {
      try {
        const nextCont = await session.lastSearchObj.getContinuation();
        session.lastSearchObj = nextCont;
        const contVideos = nextCont.videos || nextCont.results || [];
        for (const v of contVideos) {
          const item = parseInnertubeVideo(v);
          if (item && !session.allVideos.some((existing) => existing.id === item.id)) {
            session.allVideos.push(item);
          }
        }
      } catch (contErr) {
        logger.warn('Error fetching Innertube continuation', { error: (contErr as any)?.message });
      }
    }

    const pageResults = session.allVideos.slice(startIndex, targetEndIndex);
    const hasMore =
      targetEndIndex < session.allVideos.length ||
      session.lastSearchObj?.has_continuation === true;
    const nextPageToken = hasMore ? `p_${pageNum + 1}` : undefined;

    return {
      results: pageResults,
      nextPageToken,
      totalResults: Math.max(100, session.allVideos.length),
    };
  } catch (err: unknown) {
    const e = err as Error;
    logger.warn('Innertube search fallback failed', { error: e.message });
    return { results: [], totalResults: 0 };
  }
}

/**
 * Executes a verified YouTube search.
 * Uses official YouTube Data API v3 if configured, with automatic resilient fallback
 * to Innertube so search is always available even without an API key or when quota is depleted.
 */
export async function searchYouTubeVideos(options: SearchOptions): Promise<{
  results: YouTubeSearchResult[];
  nextPageToken?: string;
  totalResults?: number;
}> {
  const { query, pageToken, maxResults = 16, order = 'relevance', videoDuration = 'any' } = options;
  const cleanQuery = query.trim();
  if (!cleanQuery) {
    return { results: [] };
  }

  const cacheKey = `${cleanQuery.toLowerCase()}_${pageToken || '0'}_${maxResults}_${order}_${videoDuration}`;
  const cached = searchCache.get(cacheKey);
  if (cached && cached.expiry > Date.now()) {
    logger.info('Returning YouTube search results from cache', { query: cleanQuery });
    return cached.data;
  }

  const apiKey = process.env.YOUTUBE_API_KEY?.trim();
  if (!apiKey) {
    logger.info('YOUTUBE_API_KEY not configured, using resilient Innertube search engine', { query: cleanQuery });
    const fallbackData = await searchYouTubeWithInnertube(cleanQuery, pageToken, maxResults);
    if (fallbackData.results.length > 0) {
      searchCache.set(cacheKey, { data: fallbackData, expiry: Date.now() + 15 * 60 * 1000 });
      return fallbackData;
    }
    throw new Error('Search is temporarily unavailable. Please try again shortly.');
  }

  // 1. Build official YouTube Data API v3 search URL
  const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search');
  searchUrl.searchParams.set('part', 'snippet');
  searchUrl.searchParams.set('type', 'video');
  searchUrl.searchParams.set('q', cleanQuery);
  searchUrl.searchParams.set('maxResults', String(Math.min(25, Math.max(1, maxResults))));
  searchUrl.searchParams.set('key', apiKey);

  if (pageToken) {
    searchUrl.searchParams.set('pageToken', pageToken);
  }
  if (order && order !== 'relevance') {
    searchUrl.searchParams.set('order', order);
  }
  if (videoDuration && videoDuration !== 'any') {
    searchUrl.searchParams.set('videoDuration', videoDuration);
  }

  logger.info('Performing official YouTube search', { query: cleanQuery, order, videoDuration, pageToken });

  const res = await fetch(searchUrl.toString(), {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(10000),
  });

  if (!res.ok) {
    logger.warn('YouTube Data API search failed, attempting Innertube fallback', {
      status: res.status,
    });
    const fallbackData = await searchYouTubeWithInnertube(cleanQuery, pageToken, maxResults);
    if (fallbackData.results.length > 0) {
      searchCache.set(cacheKey, { data: fallbackData, expiry: Date.now() + 15 * 60 * 1000 });
      return fallbackData;
    }

    const errorBody = await res.json().catch(() => ({}));
    if (res.status === 403) {
      const isQuota = JSON.stringify(errorBody).toLowerCase().includes('quota');
      if (isQuota) {
        const err = new Error('Search is temporarily limited due to high demand. Please try again shortly.');
        (err as any).code = 'RATE_LIMITED';
        throw err;
      }
    }

    const err = new Error('Unable to search YouTube right now. Please try again.');
    (err as any).code = 'API_ERROR';
    throw err;
  }

  const data = await res.json();
  const items = data.items || [];
  const nextPageToken = data.nextPageToken;
  const totalResults = data.pageInfo?.totalResults;

  if (items.length === 0) {
    return { results: [], nextPageToken, totalResults: 0 };
  }

  // 2. Extract video IDs for batch metadata request
  const videoIds = items.map((item: any) => item.id?.videoId).filter(Boolean);

  // 3. Batch metadata lookup via /youtube/v3/videos for authentic durations, stats & high-res thumbnails
  const videoDetailsMap = new Map<
    string,
    {
      duration?: string;
      durationSeconds?: number;
      views?: string;
      rawViews?: number;
      highThumb?: string;
      definition?: 'hd' | 'sd';
      maxQuality?: string;
      availableQualities?: string[];
    }
  >();

  if (videoIds.length > 0) {
    try {
      const detailsUrl = new URL('https://www.googleapis.com/youtube/v3/videos');
      detailsUrl.searchParams.set('part', 'snippet,contentDetails,statistics');
      detailsUrl.searchParams.set('id', videoIds.join(','));
      detailsUrl.searchParams.set('key', apiKey);

      const detailsRes = await fetch(detailsUrl.toString(), {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(8000),
      });

      if (detailsRes.ok) {
        const detailsData = await detailsRes.json();
        for (const item of detailsData.items || []) {
          const vId = item.id;
          const content = item.contentDetails || {};
          const stats = item.statistics || {};
          const thumbs = item.snippet?.thumbnails || {};

          const durationInfo = parseIsoDuration(content.duration);
          const rawViews = stats.viewCount ? parseInt(stats.viewCount, 10) : undefined;
          const formattedViews = formatViews(stats.viewCount);
          const highThumb =
            thumbs.maxres?.url ||
            thumbs.standard?.url ||
            thumbs.high?.url ||
            thumbs.medium?.url ||
            thumbs.default?.url;

          const definition: 'hd' | 'sd' = content.definition === 'sd' ? 'sd' : 'hd';
          const maxQuality = thumbs.maxres ? '1080p' : definition === 'hd' ? '720p' : '480p';
          const availableQualities = thumbs.maxres
            ? ['1080p', '720p', '480p', '360p', 'mp3']
            : definition === 'hd'
            ? ['720p', '480p', '360p', 'mp3']
            : ['480p', '360p', 'mp3'];

          videoDetailsMap.set(vId, {
            duration: durationInfo.formatted,
            durationSeconds: durationInfo.seconds,
            views: formattedViews,
            rawViews,
            highThumb,
            definition,
            maxQuality,
            availableQualities,
          });
        }
      }
    } catch (detailsErr) {
      logger.warn('Failed to fetch batch video details; proceeding with search snippets', {
        error: (detailsErr as Error).message,
      });
    }
  }

  // 4. Construct rich, verified search results
  const results: YouTubeSearchResult[] = items
    .filter((item: any) => item.id?.videoId)
    .map((item: any) => {
      const vId = item.id.videoId;
      const snippet = item.snippet || {};
      const details = videoDetailsMap.get(vId) || {};
      const thumbs = snippet.thumbnails || {};

      const bestThumb =
        details.highThumb ||
        thumbs.high?.url ||
        thumbs.medium?.url ||
        thumbs.default?.url ||
        `https://i.ytimg.com/vi/${vId}/hqdefault.jpg`;

      // Decode common HTML entities in titles
      const cleanTitle = (snippet.title || 'YouTube Video')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;|&apos;/g, "'");

      return {
        id: vId,
        title: cleanTitle,
        channelTitle: snippet.channelTitle || 'YouTube Creator',
        channelId: snippet.channelId,
        thumbnailUrl: bestThumb,
        duration: details.duration || 'Video',
        durationSeconds: details.durationSeconds,
        publishedAt: snippet.publishedAt,
        publishedTimeAgo: formatTimeAgo(snippet.publishedAt),
        viewCount: details.views,
        rawViewCount: details.rawViews,
        videoUrl: `https://www.youtube.com/watch?v=${vId}`,
        definition: details.definition || 'hd',
        maxQuality: details.maxQuality || '720p',
        availableQualities: details.availableQualities || ['720p', '480p', '360p', 'mp3'],
      };
    });

  const responseData = { results, nextPageToken, totalResults };

  // Cache for 15 minutes to save quota
  searchCache.set(cacheKey, {
    data: responseData,
    expiry: Date.now() + 15 * 60 * 1000,
  });

  return responseData;
}
