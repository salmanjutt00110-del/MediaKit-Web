import { NextRequest, NextResponse } from 'next/server';
import { detectPlatform, MAX_URL_LENGTH } from '@/lib/detect';
import { ProviderRegistry } from '@/lib/providers';
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    // 1. Rate Limiting: 60 requests per minute per IP (allows batch lookups)
    const clientId = getClientIdentifier(request.headers);
    const rateCheck = checkRateLimit(`media-info:${clientId}`, { limit: 60, windowMs: 60 * 1000 });
    if (!rateCheck.allowed) {
      logger.warn('Rate limit exceeded on /api/media-info', { clientId });
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

    // 2. Parse request body safely
    const body = await request.json().catch(() => ({}));
    const { url } = body;

    if (!url || typeof url !== 'string' || url.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_URL',
            type: 'invalid_url',
            message: 'Please enter a valid link.',
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

    // 3. Platform Detection & URL Normalization
    const detection = detectPlatform(url);

    if (!detection.valid) {
      const code = detection.errorCode === 'UNSUPPORTED_PLATFORM' ? 'UNSUPPORTED_PLATFORM' : 'INVALID_URL';
      const message =
        detection.errorCode === 'UNSUPPORTED_PLATFORM'
          ? "Sorry, this platform isn't supported yet."
          : "That link doesn't look valid.";
      return NextResponse.json(
        {
          success: false,
          error: {
            code,
            type: code === 'UNSUPPORTED_PLATFORM' ? 'unsupported_url' : 'invalid_url',
            message,
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
            message: 'MediaKit currently supports YouTube, TikTok, Facebook, and Instagram.',
          },
        },
        { status: 400 }
      );
    }

    // 5. Fetch Media Info from Provider
    logger.info('Fetching media information', {
      platform: detection.platform,
      url: detection.normalizedUrl,
    });

    const mediaInfo = await provider.getMediaInfo(detection.normalizedUrl);

    return NextResponse.json({
      success: true,
      platform: mediaInfo.platform,
      data: mediaInfo,
    });
  } catch (err) {
    logger.error('Error in /api/media-info', err);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'PROVIDER_ERROR',
          type: 'provider_error',
          message: 'Unable to process media information at this time. Please try again.',
        },
      },
      { status: 500 }
    );
  }
}
