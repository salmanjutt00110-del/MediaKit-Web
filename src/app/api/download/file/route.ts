import { NextRequest } from 'next/server';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Max allowed serverless duration

// SSRF Protection: Prevent accessing internal/private network addresses
function isSafeUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }

    const host = parsed.hostname.toLowerCase();
    // Block loopback, localhost, and internal names
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

    // Check for private IPv4 patterns
    const ipv4Match = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if (ipv4Match) {
      const [_, a, b] = ipv4Match.map(Number);
      if (
        a === 10 || // 10.0.0.0/8
        a === 127 || // 127.0.0.0/8
        (a === 172 && b >= 16 && b <= 31) || // 172.16.0.0/12
        (a === 192 && b === 168) || // 192.168.0.0/16
        (a === 169 && b === 254) || // 169.254.0.0/16 (Link Local / Cloud Metadata)
        a === 0
      ) {
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }
}

// Build clean sanitized filename for Content-Disposition
function buildSafeFilename(title: string, ext: string): string {
  const cleanTitle = (title || 'media')
    .replace(/[/\\?%*:|"<>]/g, '_')
    .replace(/[\x00-\x1f\x80-\x9f]/g, '')
    .replace(/\s+/g, ' ')
    .trim() || 'media';
  return `${cleanTitle}.${ext}`;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get('url');
    const title = searchParams.get('title') || 'media';
    const ext = (searchParams.get('ext') || 'mp4').toLowerCase();

    if (!targetUrl || !isSafeUrl(targetUrl)) {
      return new Response('Invalid or disallowed media URL parameter', { status: 400 });
    }

    const rangeHeader = request.headers.get('range');
    logger.info('Proxying media download stream', {
      targetUrl: targetUrl.slice(0, 80),
      range: rangeHeader || 'none',
      ext,
    });

    // Forward upstream request with Range support
    const upstreamHeaders: Record<string, string> = {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      Accept: '*/*',
    };

    if (rangeHeader) {
      upstreamHeaders['Range'] = rangeHeader;
    }

    // Pass appropriate referer when needed by known hosts
    if (targetUrl.includes('savenow') || targetUrl.includes('loader.to')) {
      upstreamHeaders['Referer'] = 'https://loader.to/';
    } else if (targetUrl.includes('googlevideo.com') || targetUrl.includes('youtube.com')) {
      upstreamHeaders['Referer'] = 'https://www.youtube.com/';
      upstreamHeaders['Origin'] = 'https://www.youtube.com';
    } else if (targetUrl.includes('tiktokcdn') || targetUrl.includes('tiktok.com') || targetUrl.includes('tikwm.com')) {
      upstreamHeaders['Referer'] = 'https://www.tiktok.com/';
    } else if (targetUrl.includes('cdninstagram.com') || targetUrl.includes('instagram.com')) {
      upstreamHeaders['Referer'] = 'https://www.instagram.com/';
      upstreamHeaders['Origin'] = 'https://www.instagram.com';
    } else if (targetUrl.includes('fbcdn.net') || targetUrl.includes('facebook.com')) {
      upstreamHeaders['Referer'] = 'https://www.facebook.com/';
      upstreamHeaders['Origin'] = 'https://www.facebook.com';
    } else if (targetUrl.includes('pinimg.com') || targetUrl.includes('pinterest.com')) {
      upstreamHeaders['Referer'] = 'https://www.pinterest.com/';
      upstreamHeaders['Origin'] = 'https://www.pinterest.com';
    }

    const upstreamRes = await fetch(targetUrl, {
      headers: upstreamHeaders,
    });

    if (!upstreamRes.ok && upstreamRes.status !== 206) {
      logger.error('Upstream media returned error status', {
        status: upstreamRes.status,
        targetUrl: targetUrl.slice(0, 80),
      });
      return new Response(`Source media server returned status ${upstreamRes.status}`, {
        status: upstreamRes.status || 502,
      });
    }

    const contentType =
      upstreamRes.headers.get('content-type') ||
      (ext === 'mp3' ? 'audio/mpeg' : 'video/mp4');

    if (contentType.includes('text/html') || contentType.includes('text/plain')) {
      logger.warn('Upstream media response is HTML instead of media', { targetUrl: targetUrl.slice(0, 80) });
      return new Response('Unable to extract direct media stream from this link. Content may be restricted or require authentication.', {
        status: 422,
      });
    }

    const asciiTitle = (title || 'media')
      .replace(/[^a-zA-Z0-9_\-\s]/g, '')
      .replace(/\s+/g, '_')
      .trim() || 'media';
    const asciiFilename = `${asciiTitle}.${ext}`;
    const utf8Filename = buildSafeFilename(title, ext);

    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set('Accept-Ranges', 'bytes');
    headers.set(
      'Content-Disposition',
      `attachment; filename="${asciiFilename}"; filename*=UTF-8''${encodeURIComponent(utf8Filename)}`
    );

    // Forward caching and range parameters
    const contentLength = upstreamRes.headers.get('content-length');
    if (contentLength) {
      headers.set('Content-Length', contentLength);
    }

    const contentRange = upstreamRes.headers.get('content-range');
    if (contentRange) {
      headers.set('Content-Range', contentRange);
    }

    const etag = upstreamRes.headers.get('etag');
    if (etag) {
      headers.set('ETag', etag);
    }

    headers.set('Cache-Control', 'public, max-age=86400, stale-while-revalidate=3600');
    // Enable CORS for client-side fetch progress tracking
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Headers', 'Range, Content-Type');
    headers.set('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Accept-Ranges, Content-Disposition');

    const status = rangeHeader && upstreamRes.status === 206 ? 206 : 200;

    return new Response(upstreamRes.body, {
      status,
      headers,
    });
  } catch (err: any) {
    logger.error('Error in /api/download/file proxy', err);
    return new Response('Streaming proxy error: ' + (err.message || 'Unknown error'), {
      status: 500,
    });
  }
}

// Handle HEAD requests (used by Android Download Manager and mobile browsers before starting download)
export async function HEAD(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get('url');
    const title = searchParams.get('title') || 'media';
    const ext = (searchParams.get('ext') || 'mp4').toLowerCase();

    if (!targetUrl || !isSafeUrl(targetUrl)) {
      return new Response(null, { status: 400 });
    }

    const upstreamRes = await fetch(targetUrl, {
      method: 'HEAD',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      },
    });

    const headers = new Headers();
    headers.set('Content-Type', upstreamRes.headers.get('content-type') || (ext === 'mp3' ? 'audio/mpeg' : 'video/mp4'));
    headers.set('Accept-Ranges', 'bytes');
    const contentLength = upstreamRes.headers.get('content-length');
    if (contentLength) {
      headers.set('Content-Length', contentLength);
    }
    const asciiTitle = (title || 'media')
      .replace(/[^a-zA-Z0-9_\-\s]/g, '')
      .replace(/\s+/g, '_')
      .trim() || 'media';
    const asciiFilename = `${asciiTitle}.${ext}`;
    const utf8Filename = buildSafeFilename(title, ext);

    headers.set(
      'Content-Disposition',
      `attachment; filename="${asciiFilename}"; filename*=UTF-8''${encodeURIComponent(utf8Filename)}`
    );
    headers.set('Access-Control-Allow-Origin', '*');

    return new Response(null, {
      status: 200,
      headers,
    });
  } catch {
    return new Response(null, { status: 500 });
  }
}
