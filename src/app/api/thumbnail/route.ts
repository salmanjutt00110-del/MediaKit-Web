import { NextRequest } from 'next/server';
import { logger } from '@/lib/logger';
import { sanitizeAsciiFilename, sanitizeFilename, isSafeUrl } from '@/lib/string-utils';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get('url');

    if (!targetUrl || !isSafeUrl(targetUrl)) {
      return new Response('Valid and allowed URL parameter is required', { status: 400 });
    }

    // Upstream headers customized to legitimate CDN providers
    const upstreamHeaders: Record<string, string> = {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Sec-Fetch-Dest': 'image',
      'Sec-Fetch-Mode': 'no-cors',
      'Sec-Fetch-Site': 'cross-site',
    };

    if (targetUrl.includes('pinimg.com') || targetUrl.includes('pinterest.com')) {
      upstreamHeaders['Referer'] = 'https://www.pinterest.com/';
      upstreamHeaders['Origin'] = 'https://www.pinterest.com';
    } else if (
      targetUrl.includes('instagram.com') ||
      targetUrl.includes('cdninstagram.com')
    ) {
      upstreamHeaders['Referer'] = 'https://www.instagram.com/';
      upstreamHeaders['Origin'] = 'https://www.instagram.com';
    } else if (targetUrl.includes('fbcdn.net') || targetUrl.includes('facebook.com')) {
      upstreamHeaders['Referer'] = 'https://www.facebook.com/';
      upstreamHeaders['Origin'] = 'https://www.facebook.com';
    } else if (targetUrl.includes('ytimg.com') || targetUrl.includes('youtube.com')) {
      upstreamHeaders['Referer'] = 'https://www.youtube.com/';
    } else if (targetUrl.includes('tiktokcdn') || targetUrl.includes('tiktok.com') || targetUrl.includes('tikwm.com')) {
      upstreamHeaders['Referer'] = 'https://www.tiktok.com/';
    } else if (targetUrl.includes('rapidcdn') || targetUrl.includes('snapinsta')) {
      upstreamHeaders['Referer'] = 'https://snapinsta.app/';
    } else if (targetUrl.includes('ssscdn.io') || targetUrl.includes('getmyfb')) {
      upstreamHeaders['Referer'] = 'https://getmyfb.com/';
    }

    const res = await fetch(targetUrl, {
      headers: upstreamHeaders,
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok || !res.body) {
      logger.warn('Thumbnail upstream fetch failed', { status: res.status, url: targetUrl.slice(0, 80) });
      return new Response('Failed to load thumbnail image', { status: res.status || 502 });
    }

    const contentType = res.headers.get('content-type') || 'image/jpeg';
    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set('Cache-Control', 'public, max-age=86400, stale-while-revalidate=43200');
    headers.set('Access-Control-Allow-Origin', '*');

    const isDownload = searchParams.get('download') === '1' || searchParams.get('download') === 'true';
    if (isDownload) {
      const rawFilename = searchParams.get('filename') || 'thumbnail';
      const safeAscii = sanitizeAsciiFilename(rawFilename, 'jpg');
      const safeUtf8 = sanitizeFilename(rawFilename, 'jpg');
      headers.set('Content-Disposition', `attachment; filename="${safeAscii}"; filename*=UTF-8''${encodeURIComponent(safeUtf8)}`);
    }

    const contentLength = res.headers.get('content-length');
    if (contentLength) {
      headers.set('Content-Length', contentLength);
    }

    return new Response(res.body, {
      status: 200,
      headers,
    });
  } catch (err: unknown) {
    const error = err as Error;
    logger.warn('Error in /api/thumbnail proxy:', { msg: error.message });
    return new Response('Thumbnail fetch failed', { status: 500 });
  }
}
