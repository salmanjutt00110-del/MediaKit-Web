import { NextRequest } from 'next/server';
import { detectPlatform } from '@/lib/detect';
import { ytDlpRunner } from '@/lib/ytdlp';
import { ProviderRegistry } from '@/lib/providers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawUrl = searchParams.get('url');
    const formatId = searchParams.get('formatId') || '720p';

    if (!rawUrl) {
      return new Response('URL parameter is required', { status: 400 });
    }

    const detection = detectPlatform(rawUrl);
    if (!detection.valid) {
      return new Response('Invalid media URL', { status: 400 });
    }

    const provider = ProviderRegistry.getProviderForUrl(detection.normalizedUrl);
    if (!provider) {
      return new Response('Unsupported platform', { status: 400 });
    }

    // Get media metadata for clean filename
    const info = await provider.getMediaInfo(detection.normalizedUrl);
    const isAudio =
      formatId.toLowerCase().includes('mp3') ||
      formatId.toLowerCase().includes('audio');
    const ext = isAudio ? 'mp3' : 'mp4';
    const cleanTitle = (info.title || 'media')
      .replace(/[/\\?%*:|"<>]/g, '_')
      .trim();
    const filename = `${cleanTitle}.${ext}`;

    // Extract stream URL
    if (!ytDlpRunner.isAvailable()) {
      return new Response('Engine binary initializing on server.', { status: 503 });
    }

    const streamUrl = await ytDlpRunner.getStreamUrl(
      detection.normalizedUrl,
      formatId
    );

    // Fetch stream from CDN and pipe to client with attachment headers
    const streamRes = await fetch(streamUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',
      },
    });

    if (!streamRes.ok || !streamRes.body) {
      return new Response('Stream extraction failed from media source', {
        status: 502,
      });
    }

    const headers = new Headers();
    headers.set('Content-Type', isAudio ? 'audio/mpeg' : 'video/mp4');
    headers.set(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(filename)}"; filename*=UTF-8''${encodeURIComponent(filename)}`
    );

    const contentLength = streamRes.headers.get('content-length');
    if (contentLength) {
      headers.set('Content-Length', contentLength);
    }

    return new Response(streamRes.body, {
      status: 200,
      headers,
    });
  } catch (err: any) {
    return new Response(err.message || 'Stream processing error', { status: 500 });
  }
}
