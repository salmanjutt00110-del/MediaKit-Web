import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limit';
import { searchYouTubeVideos } from '@/lib/youtube-search-service';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function GET(request: NextRequest) {
  try {
    const clientId = getClientIdentifier(request.headers);
    const rateCheck = checkRateLimit(`yt-search:${clientId}`, { limit: 60, windowMs: 60 * 1000 });
    if (!rateCheck.allowed) {
      logger.warn('Rate limit exceeded on /api/youtube/search', { clientId });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMITED',
            message: 'Search is temporarily limited. Please try again shortly.',
          },
        },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const pageToken = searchParams.get('pageToken') || undefined;
    const order = (searchParams.get('order') as any) || 'relevance';
    const videoDuration = (searchParams.get('duration') as any) || 'any';
    const maxResultsParam = parseInt(searchParams.get('maxResults') || '16', 10);
    const maxResults = isNaN(maxResultsParam) ? 16 : Math.min(24, Math.max(1, maxResultsParam));

    const cleanQuery = q.trim();
    if (!cleanQuery) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_QUERY',
            message: 'Please enter a search term.',
          },
        },
        { status: 400 }
      );
    }

    if (cleanQuery.length > 200) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'QUERY_TOO_LONG',
            message: 'Search query is too long.',
          },
        },
        { status: 400 }
      );
    }

    const data = await searchYouTubeVideos({
      query: cleanQuery,
      pageToken,
      maxResults,
      order,
      videoDuration,
    });

    if (!data.results || data.results.length === 0) {
      return NextResponse.json({
        success: true,
        query: cleanQuery,
        results: [],
        totalResults: 0,
        message: 'No YouTube videos found for this search.',
      });
    }

    return NextResponse.json({
      success: true,
      query: cleanQuery,
      results: data.results,
      nextPageToken: data.nextPageToken,
      totalResults: data.totalResults,
    });
  } catch (err: any) {
    logger.error('Error in /api/youtube/search', err);
    const code = err?.code || 'API_ERROR';
    const message =
      code === 'RATE_LIMITED'
        ? 'Search is temporarily limited. Please try again shortly.'
        : err?.message || 'Unable to search YouTube right now. Please try again.';

    return NextResponse.json(
      {
        success: false,
        error: {
          code,
          message,
        },
      },
      { status: code === 'RATE_LIMITED' ? 429 : 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { query, pageToken, order, duration, maxResults } = body;

    const url = new URL(request.url);
    if (query) url.searchParams.set('q', query);
    if (pageToken) url.searchParams.set('pageToken', pageToken);
    if (order) url.searchParams.set('order', order);
    if (duration) url.searchParams.set('duration', duration);
    if (maxResults) url.searchParams.set('maxResults', String(maxResults));

    const getReq = new NextRequest(url.toString(), {
      headers: request.headers,
    });
    return GET(getReq);
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'API_ERROR',
          message: err?.message || 'Unable to search YouTube right now.',
        },
      },
      { status: 500 }
    );
  }
}
