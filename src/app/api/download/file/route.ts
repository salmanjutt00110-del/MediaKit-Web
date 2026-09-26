import { NextRequest } from 'next/server';
import { logger } from '@/lib/logger';
import { sanitizeAsciiFilename, sanitizeFilename } from '@/lib/string-utils';

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
      host.endsWith('.internal') ||
      host.endsWith('.lan')
    ) {
      return false;
    }

    // Check for private IPv4 patterns
    const ipv4Match = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if (ipv4Match) {
      const a = Number(ipv4Match[1]);
      const b = Number(ipv4Match[2]);
      if (
        a === 0 || // 0.0.0.0/8
        a === 10 || // 10.0.0.0/8
        a === 127 || // 127.0.0.0/8
        (a === 172 && b >= 16 && b <= 31) || // 172.16.0.0/12
        (a === 192 && b === 168) || // 192.168.0.0/16
        (a === 169 && b === 254) // 169.254.0.0/16 (Link Local / Cloud Metadata)
      ) {
        return false;
      }
    }

    // Check IPv6 private/link-local
    if (host.startsWith('[') && host.endsWith(']')) {
      const ipv6 = host.slice(1, -1).toLowerCase();
      if (
        ipv6 === '::1' ||
        ipv6.startsWith('fe80:') ||
        ipv6.startsWith('fc') ||
        ipv6.startsWith('fd') ||
        ipv6.includes('127.0.0.1')
      ) {
        return false;
      }
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
    const title = searchParams.get('title') || 'media';
    const ext = (searchParams.get('ext') || 'mp4').toLowerCase().replace(/[^a-z0-9]/g, '');

    if (!targetUrl) {
      return new Response('Media URL parameter is required', { status: 400 });
    }

    // If targetUrl is an internal serve endpoint, redirect cleanly to it
    if (targetUrl.includes('/api/download/serve')) {
      const serveUrl = new URL(targetUrl, request.url);
      return Response.redirect(serveUrl.toString(), 302);
    }

    const reqHost = request.headers.get('host')?.toLowerCase();
    const isSelfHost = reqHost && (targetUrl.includes(`://${reqHost}/`) || targetUrl.startsWith('/'));

    if (!isSelfHost && !isSafeUrl(targetUrl)) {
      logger.warn('Disallowed media URL rejected in download proxy', { targetUrl: targetUrl.slice(0, 100) });
      return new Response('Invalid media link. Please verify the URL and try again.', { status: 400 });
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
    } else if (targetUrl.includes('cdninstagram.com') || targetUrl.includes('instagram.com') || targetUrl.includes('fbcdn.net')) {
      upstreamHeaders['Referer'] = 'https://www.instagram.com/';
      upstreamHeaders['Origin'] = 'https://www.instagram.com';
    } else if (targetUrl.includes('fbcdn.net') || targetUrl.includes('facebook.com')) {
      upstreamHeaders['Referer'] = 'https://www.facebook.com/';
      upstreamHeaders['Origin'] = 'https://www.facebook.com';
    } else if (targetUrl.includes('pinimg.com') || targetUrl.includes('pinterest.com')) {
      upstreamHeaders['Referer'] = 'https://www.pinterest.com/';
      upstreamHeaders['Origin'] = 'https://www.pinterest.com';
    } else if (targetUrl.includes('ssscdn.io') || targetUrl.includes('getmyfb')) {
      upstreamHeaders['Referer'] = 'https://getmyfb.com/';
    } else if (targetUrl.includes('rapidcdn') || targetUrl.includes('snapinsta') || targetUrl.includes('snapsave')) {
      upstreamHeaders['Referer'] = 'https://snapinsta.app/';
    } else if (targetUrl.includes('ymcdn.org')) {
      upstreamHeaders['Referer'] = 'https://c.ymcdn.org/';
      upstreamHeaders['Origin'] = 'https://c.ymcdn.org';
    }

    const upstreamRes = await fetch(targetUrl, {
      headers: upstreamHeaders,
      redirect: 'follow',
    });

    // Verify redirected URL against SSRF
    if (upstreamRes.url) {
      const isRedirectSelf = reqHost && (upstreamRes.url.includes(`://${reqHost}/`) || upstreamRes.url.startsWith('/'));
      if (!isRedirectSelf && !isSafeUrl(upstreamRes.url)) {
        logger.warn('Redirection to unsafe host blocked', { redirectUrl: upstreamRes.url.slice(0, 80) });
        return new Response('Unable to download from redirected source.', { status: 403 });
      }
    }

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
      (ext === 'mp3' ? 'audio/mpeg' : (ext === 'jpg' || ext === 'jpeg') ? 'image/jpeg' : ext === 'png' ? 'image/png' : 'video/mp4');

    if (contentType.includes('text/html') || contentType.includes('text/plain')) {
      logger.warn('Upstream media response is HTML instead of media', { targetUrl: targetUrl.slice(0, 80) });
      return new Response('Unable to extract direct media stream from this link. Content may be restricted or require authentication.', {
        status: 422,
      });
    }

    const isImageExt = ext === 'jpg' || ext === 'jpeg' || ext === 'png' || ext === 'webp';
    if (contentType.startsWith('image/') && !isImageExt) {
      logger.warn('Upstream returned image instead of video', { targetUrl: targetUrl.slice(0, 80), contentType });
      return new Response('Upstream source delivered an image preview instead of a video stream.', {
        status: 422,
      });
    }

    const contentLength = upstreamRes.headers.get('content-length');
    const contentLengthNum = Number(contentLength);
    const minBytes = isImageExt ? 5120 : ext === 'mp3' ? 15360 : 35840;
    if (contentLengthNum && contentLengthNum < minBytes) {
      logger.warn('Upstream media response size is suspiciously small', { targetUrl: targetUrl.slice(0, 80), contentLengthNum });
      return new Response('The source media provider returned an incomplete or truncated stream. Please choose another format or try again.', {
        status: 422,
      });
    }

    const safeAscii = sanitizeAsciiFilename(title, ext);
    const safeUtf8 = sanitizeFilename(title, ext);

    const headers = new Headers();
    // Authentic MIME type ensures Android and mobile OS save file to Downloads and register in video gallery
    const mimeType = ext === 'mp3'
      ? 'audio/mpeg'
      : ext === 'm4a'
      ? 'audio/mp4'
      : (ext === 'jpg' || ext === 'jpeg')
      ? 'image/jpeg'
      : ext === 'png'
      ? 'image/png'
      : 'video/mp4';
    headers.set('Content-Type', mimeType);
    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('Accept-Ranges', 'bytes');
    headers.set(
      'Content-Disposition',
      `attachment; filename="${safeAscii}"; filename*=UTF-8''${encodeURIComponent(safeUtf8)}`
    );

    headers.set('Cache-Control', 'public, max-age=86400, stale-while-revalidate=3600');
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Headers', 'Range, Content-Type');
    headers.set('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Accept-Ranges, Content-Disposition');

    if (rangeHeader && upstreamRes.status === 206) {
      if (contentLength) headers.set('Content-Length', contentLength);
      const contentRange = upstreamRes.headers.get('content-range');
      if (contentRange) headers.set('Content-Range', contentRange);
      return new Response(upstreamRes.body, { status: 206, headers });
    }

    // Direct streaming response gives instantaneous download start in browser
    if (contentLength) {
      headers.set('Content-Length', contentLength);
    }

    return new Response(upstreamRes.body, {
      status: 200,
      headers,
    });
  } catch (err: unknown) {
    const error = err as Error;
    logger.error('Error in /api/download/file proxy', error);
    return new Response('Streaming proxy error: ' + (error.message || 'Unknown error'), {
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
    const ext = (searchParams.get('ext') || 'mp4').toLowerCase().replace(/[^a-z0-9]/g, '');

    if (!targetUrl || !isSafeUrl(targetUrl)) {
      return new Response(null, { status: 400 });
    }

    if (targetUrl.includes('/api/download/serve')) {
      const serveUrl = new URL(targetUrl, request.url);
      return Response.redirect(serveUrl.toString(), 302);
    }

    if (targetUrl.includes('savenow.to') || targetUrl.includes('loader.to')) {
      return Response.redirect(targetUrl, 302);
    }

    const upstreamRes = await fetch(targetUrl, {
      method: 'HEAD',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      },
      redirect: 'follow',
    });

    if (upstreamRes.url && !isSafeUrl(upstreamRes.url)) {
      return new Response(null, { status: 403 });
    }

    const headers = new Headers();
    const mimeType = ext === 'mp3'
      ? 'audio/mpeg'
      : ext === 'm4a'
      ? 'audio/mp4'
      : (ext === 'jpg' || ext === 'jpeg')
      ? 'image/jpeg'
      : ext === 'png'
      ? 'image/png'
      : ext === 'webp'
      ? 'image/webp'
      : 'video/mp4';
    headers.set('Content-Type', mimeType);
    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('Accept-Ranges', 'bytes');
    const contentLength = upstreamRes.headers.get('content-length');
    if (contentLength) {
      headers.set('Content-Length', contentLength);
    }

    const safeAscii = sanitizeAsciiFilename(title, ext);
    const safeUtf8 = sanitizeFilename(title, ext);

    headers.set(
      'Content-Disposition',
      `attachment; filename="${safeAscii}"; filename*=UTF-8''${encodeURIComponent(safeUtf8)}`
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
