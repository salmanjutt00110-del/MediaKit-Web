import { NextRequest } from 'next/server';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

function isSafeUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;
    const host = parsed.hostname.toLowerCase();
    if (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '0.0.0.0' ||
      host === '::1' ||
      host.endsWith('.local') ||
      host.endsWith('.internal')
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get('url');

    if (!targetUrl || !isSafeUrl(targetUrl)) {
      return new Response('Valid URL parameter is required', { status: 400 });
    }

    // Fetch upstream thumbnail with clean headers without client-side domain referrer
    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(6000),
    });

    if (!res.ok || !res.body) {
      logger.warn('Thumbnail upstream error', { status: res.status, url: targetUrl.slice(0, 80) });
      return new Response('Failed to load thumbnail image', { status: res.status || 502 });
    }

    const contentType = res.headers.get('content-type') || 'image/jpeg';
    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set('Cache-Control', 'public, max-age=86400, stale-while-revalidate=43200');
    headers.set('Access-Control-Allow-Origin', '*');

    const contentLength = res.headers.get('content-length');
    if (contentLength) {
      headers.set('Content-Length', contentLength);
    }

    return new Response(res.body, {
      status: 200,
      headers,
    });
  } catch (err: any) {
    logger.warn('Error in /api/thumbnail proxy', err.message);
    return new Response('Thumbnail fetch failed', { status: 500 });
  }
}
