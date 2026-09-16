import { NextRequest, NextResponse } from 'next/server';
import { detectPlatform, MAX_URL_LENGTH } from '@/lib/detect';
import { ProviderRegistry } from '@/lib/providers';
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    // 1. Rate Limiting: 30 requests per minute per IP
    const clientId = getClientIdentifier(request.headers);
    const rateCheck = checkRateLimit(`download:${clientId}`, { limit: 30, windowMs: 60 * 1000 });
    if (!rateCheck.allowed) {
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
    const { url, formatId } = body;

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

    const mediaInfo = await provider.getMediaInfo(detection.normalizedUrl);
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

    return NextResponse.json({
      success: true,
      data: downloadResult,
    });
  } catch (err) {
    logger.error('Error in /api/download', err);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'DOWNLOAD_ERROR',
          type: 'download_error',
          message: 'Unable to process download request. Please try again.',
        },
      },
      { status: 500 }
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

    // Redirect browser directly to the media stream
    const redirectUrl = downloadResult.downloadUrl.startsWith('http')
      ? downloadResult.downloadUrl
      : new URL(downloadResult.downloadUrl, request.url).toString();
    return NextResponse.redirect(redirectUrl, 302);
  } catch (err) {
    logger.error('GET /api/download stream error', err);
    return new Response('Stream extraction error', { status: 500 });
  }
}
