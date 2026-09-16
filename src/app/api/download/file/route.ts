import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60 seconds on Vercel

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get('url');
    const title = searchParams.get('title') || 'media';
    const ext = searchParams.get('ext') || 'mp4';

    if (!targetUrl || !targetUrl.startsWith('http')) {
      return new Response('Valid URL parameter is required', { status: 400 });
    }

    logger.info('Proxying media download stream', { targetUrl: targetUrl.slice(0, 80), title, ext });

    // Fetch the media file from upstream CDN (e.g. savenow.to, tikwm, cdn)
    const upstreamRes = await fetch(targetUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Referer': targetUrl.includes('savenow') ? 'https://loader.to/' : '',
      },
    });

    if (!upstreamRes.ok || !upstreamRes.body) {
      logger.error('Upstream media stream returned error', {
        status: upstreamRes.status,
        targetUrl: targetUrl.slice(0, 80),
      });
      return new Response('Failed to stream media from source server', {
        status: upstreamRes.status || 502,
      });
    }

    const contentType =
      upstreamRes.headers.get('content-type') ||
      (ext.toLowerCase() === 'mp3' ? 'audio/mpeg' : 'video/mp4');

    const cleanTitle = title
      .replace(/[/\\?%*:|"<>]/g, '_')
      .replace(/\s+/g, ' ')
      .trim();
    const filename = `${cleanTitle}.${ext}`;

    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(filename)}"; filename*=UTF-8''${encodeURIComponent(filename)}`
    );

    const contentLength = upstreamRes.headers.get('content-length');
    if (contentLength) {
      headers.set('Content-Length', contentLength);
    }
    headers.set('Cache-Control', 'public, max-age=3600, immutable');

    // Stream directly to the browser
    return new Response(upstreamRes.body, {
      status: 200,
      headers,
    });
  } catch (err: any) {
    logger.error('Error in /api/download/file proxy', err);
    return new Response('Streaming proxy error: ' + (err.message || 'Unknown error'), {
      status: 500,
    });
  }
}
