import { NextRequest, NextResponse } from 'next/server';
import { detectPlatform, MAX_URL_LENGTH } from '@/lib/detect';
import { ProviderRegistry } from '@/lib/providers';
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    // 1. High-Capacity Rate Limiting: 5,000 requests per 10 minutes per IP (supports massive batch operations)
    const clientId = getClientIdentifier(request.headers);
    const rateCheck = checkRateLimit(`download:${clientId}`, { limit: 5000, windowMs: 10 * 60 * 1000 });
    if (!rateCheck.allowed && clientId !== '127.0.0.1' && clientId !== '::1') {
      logger.warn('Rate limit exceeded on /api/download', { clientId });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMITED',
            type: 'rate_limited',
            message: 'Too many requests. Please try again later.',
          },
        },
        { status: 429 }
      );
    }

    // 2. Parse request body
    const body = await request.json().catch(() => ({}));
    const { url, formatId, prewarm, mediaInfo: clientMediaInfo } = body;

    if (!url || !formatId || typeof url !== 'string' || typeof formatId !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_URL',
            type: 'invalid_url',
            message: 'A valid URL and selected format are required.',
          },
        },
        { status: 400 }
      );
    }

    if (url.trim().length > MAX_URL_LENGTH) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_URL',
            type: 'invalid_url',
            message: 'Link exceeds maximum supported length.',
          },
        },
        { status: 400 }
      );
    }

    // 3. Platform Detection
    const detection = detectPlatform(url);
    if (!detection.valid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: detection.errorCode || 'INVALID_URL',
            type: 'invalid_url',
            message: detection.error || 'Please enter a valid link.',
          },
        },
        { status: 400 }
      );
    }

    // 4. Resolve Provider
    const provider = ProviderRegistry.getProviderForUrl(detection.normalizedUrl);
    if (!provider) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNSUPPORTED_PLATFORM',
            type: 'unsupported_url',
            message: 'Unsupported media platform.',
          },
        },
        { status: 400 }
      );
    }

    // 5. Download Stream Extraction
    logger.info('Extracting download stream', {
      platform: detection.platform,
      formatId,
      url: detection.normalizedUrl,
    });

    const isEventStream = request.headers.get('accept')?.includes('text/event-stream');

    if (isEventStream) {
      const stream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();
          const sendEvent = (payload: any) => {
            try {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
            } catch {}
          };

          try {
            sendEvent({ type: 'progress', percent: 5, stage: 'Connecting to media server...' });

            const mediaInfo = await provider.getMediaInfo(detection.normalizedUrl);
            sendEvent({ type: 'progress', percent: 8, stage: 'Stream metadata resolved...' });

            const downloadResult = await provider.download(
              mediaInfo,
              formatId,
              (prog) => {
                sendEvent({
                  type: 'progress',
                  percent: prog.percent,
                  stage: prog.stage,
                  speed: prog.speed,
                  total: prog.total,
                });
              }
            );

            if (!downloadResult.success) {
              sendEvent({
                type: 'error',
                message: downloadResult.message || 'Unable to process download request.',
              });
            } else {
              sendEvent({
                type: 'complete',
                percent: 100,
                stage: 'Download ready!',
                data: {
                  ...downloadResult,
                  downloadUrl: downloadResult.downloadUrl,
                  fileSize: downloadResult.fileSizeFormatted,
                  fileSizeBytes: downloadResult.fileSizeBytes,
                  resolution: downloadResult.resolution,
                  duration: downloadResult.duration,
                },
              });
            }
          } catch (err: any) {
            logger.error('Error in SSE download stream', err);
            sendEvent({
              type: 'error',
              message: err?.message || 'Download error. Please try again.',
            });
          } finally {
            try { controller.close(); } catch {}
          }
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream; charset=utf-8',
          'Cache-Control': 'no-cache, no-transform',
          'Connection': 'keep-alive',
        },
      });
    }

    const mediaInfo = clientMediaInfo
      ? {
          id: clientMediaInfo.id || detection.normalizedUrl,
          platform: detection.platform,
          title: clientMediaInfo.title || 'Media Video',
          author: clientMediaInfo.author || 'Creator',
          duration: clientMediaInfo.duration,
          thumbnailUrl: clientMediaInfo.thumbnailUrl,
          sourceUrl: detection.normalizedUrl,
          formats: [],
        }
      : await provider.getMediaInfo(detection.normalizedUrl);

    const downloadResult = await provider.download(mediaInfo, formatId);

    if (!downloadResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DOWNLOAD_ERROR',
            type: 'download_error',
            message: downloadResult.message,
          },
        },
        { status: 422 }
      );
    }

    const finalDownloadUrl = downloadResult.downloadUrl;

    logger.diagnostic({
      platform: detection.platform,
      normalizedUrl: detection.normalizedUrl,
      videoId: mediaInfo.id,
      operation: 'download',
      providerUsed: provider.displayName,
      responseStatus: 'success',
      selectedFormatId: formatId,
    });

    return NextResponse.json({
      success: true,
      data: {
        ...downloadResult,
        downloadUrl: finalDownloadUrl,
        fileSize: downloadResult.fileSizeFormatted,
        fileSizeBytes: downloadResult.fileSizeBytes,
        resolution: downloadResult.resolution,
        duration: downloadResult.duration,
      },
    });
  } catch (err: unknown) {
    logger.error('Error in /api/download', err);
    const error = err as { code?: string; message?: string };
    const code = error.code || 'DOWNLOAD_ERROR';
    const message = error.message || 'Unable to process download request. Please try again.';

    logger.diagnostic({
      platform: 'unknown',
      operation: 'download',
      providerUsed: 'ProviderRegistry',
      responseStatus: 'failed',
      errorCategory: code,
    });

    return NextResponse.json(
      {
        success: false,
        error: {
          code,
          type: code.toLowerCase(),
          message,
        },
      },
      { status: code === 'PRIVATE_CONTENT' || code === 'UNAVAILABLE_CONTENT' || code === 'YOUTUBE_AUTH_REQUIRED' ? 403 : 500 }
    );
  }
}


// GET endpoint to directly trigger browser download
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    const formatId = searchParams.get('formatId');

    if (!url || !formatId) {
      return new Response('URL and formatId query parameters are required', { status: 400 });
    }

    const detection = detectPlatform(url);
    if (!detection.valid) {
      return new Response('Invalid media link', { status: 400 });
    }

    const provider = ProviderRegistry.getProviderForUrl(detection.normalizedUrl);
    if (!provider) {
      return new Response('Unsupported platform', { status: 400 });
    }

    const mediaInfo = await provider.getMediaInfo(detection.normalizedUrl);
    const downloadResult = await provider.download(mediaInfo, formatId);

    if (!downloadResult.success || !downloadResult.downloadUrl) {
      return new Response(downloadResult.message || 'Stream extraction failed', { status: 422 });
    }

    const isAudio =
      formatId.toLowerCase().includes('mp3') ||
      formatId.toLowerCase().includes('audio');
    const ext = isAudio ? 'mp3' : 'mp4';
    const cleanTitle = (mediaInfo.title || 'media')
      .replace(/[/\\?%*:|"<>]/g, '_')
      .replace(/\s+/g, ' ')
      .trim();

    if (
      downloadResult.downloadUrl.startsWith('/api/download/') ||
      downloadResult.downloadUrl.startsWith('/')
    ) {
      return NextResponse.redirect(new URL(downloadResult.downloadUrl, request.url).toString(), 302);
    }

    if (
      downloadResult.downloadUrl.includes('savenow.to') ||
      downloadResult.downloadUrl.includes('loader.to')
    ) {
      return NextResponse.redirect(downloadResult.downloadUrl, 302);
    }

    const proxyPath = `/api/download/file?url=${encodeURIComponent(
      downloadResult.downloadUrl
    )}&title=${encodeURIComponent(cleanTitle)}&ext=${ext}`;

    return NextResponse.redirect(new URL(proxyPath, request.url).toString(), 302);
  } catch (err) {
    logger.error('GET /api/download stream error', err);
    return new Response('Stream extraction error', { status: 500 });
  }
}
