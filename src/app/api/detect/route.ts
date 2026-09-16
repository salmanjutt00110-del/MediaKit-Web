import { NextRequest, NextResponse } from 'next/server';
import { detectPlatform, MAX_URL_LENGTH } from '@/lib/detect';
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    // 1. Rate Limiting: 45 detect requests per minute per IP
    const clientId = getClientIdentifier(request.headers);
    const rateCheck = checkRateLimit(`detect:${clientId}`, { limit: 45, windowMs: 60 * 1000 });
    if (!rateCheck.allowed) {
      logger.warn('Rate limit exceeded on /api/detect', { clientId });
      return NextResponse.json(
        {
          success: false,
          platform: 'unknown',
          valid: false,
          error: 'RATE_LIMITED',
          message: 'Too many requests. Please try again later.',
        },
        { status: 429 }
      );
    }

    // 2. Parse Body safely
    const body = await request.json().catch(() => ({}));
    const { url } = body;

    // 3. Input validation
    if (!url || typeof url !== 'string' || url.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          platform: 'unknown',
          valid: false,
          error: 'INVALID_URL',
        },
        { status: 400 }
      );
    }

    if (url.trim().length > MAX_URL_LENGTH) {
      return NextResponse.json(
        {
          success: false,
          platform: 'unknown',
          valid: false,
          error: 'INVALID_URL',
        },
        { status: 400 }
      );
    }

    // 4. Platform Detection
    const detection = detectPlatform(url);

    if (!detection.valid) {
      if (detection.errorCode === 'UNSUPPORTED_PLATFORM') {
        return NextResponse.json(
          {
            success: false,
            platform: 'unknown',
            valid: true,
            error: 'UNSUPPORTED_PLATFORM',
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          platform: 'unknown',
          valid: false,
          error: 'INVALID_URL',
        },
        { status: 400 }
      );
    }

    // 5. Success
    logger.info('Platform detected successfully', {
      platform: detection.platform,
      url: detection.normalizedUrl,
    });

    return NextResponse.json({
      success: true,
      platform: detection.platform,
      valid: true,
      normalizedUrl: detection.normalizedUrl,
    });
  } catch (err) {
    logger.error('Unexpected error in /api/detect', err);
    return NextResponse.json(
      {
        success: false,
        platform: 'unknown',
        valid: false,
        error: 'PROVIDER_ERROR',
      },
      { status: 500 }
    );
  }
}
