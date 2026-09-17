import { NextRequest, NextResponse } from 'next/server';
import { detectPlatform, MAX_URL_LENGTH } from '@/lib/detect';
import { ProviderRegistry } from '@/lib/providers';
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limit';
import { extractMediaScriptAndHashtags } from '@/lib/transcript';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const clientId = getClientIdentifier(request.headers);
    const rateCheck = checkRateLimit(`transcript:${clientId}`, { limit: 60, windowMs: 60 * 1000 });
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMITED',
            message: 'Too many requests. Please wait a moment before requesting another script.',
          },
        },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { url } = body;

    if (!url || typeof url !== 'string' || url.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_URL',
            message: 'A valid media link is required to extract script or voiceover.',
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
            message: 'Link exceeds maximum supported length.',
          },
        },
        { status: 400 }
      );
    }

    const detection = detectPlatform(url);
    if (!detection.valid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_URL',
            message: detection.error || 'Please enter a valid media link.',
          },
        },
        { status: 400 }
      );
    }

    const provider = ProviderRegistry.getProviderForUrl(detection.normalizedUrl);
    let mediaInfo = undefined;
    if (provider) {
      try {
        mediaInfo = await provider.getMediaInfo(detection.normalizedUrl);
      } catch (err: any) {
        logger.warn('Failed to retrieve media info for transcript', err.message);
      }
    }

    const scriptResult = await extractMediaScriptAndHashtags(
      detection.normalizedUrl,
      detection.platform,
      mediaInfo
    );

    if (!scriptResult.scriptText || scriptResult.scriptText.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'NO_TRANSCRIPT',
          message: 'No spoken dialogue or subtitles were detected for this video.',
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: scriptResult,
    });
  } catch (error: any) {
    logger.error('Error in /api/transcript', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'TRANSCRIPT_ERROR',
          message: 'Unable to extract voiceover script or subtitles for this video right now.',
        },
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  if (!url) {
    return NextResponse.json({ success: false, error: 'Missing url parameter' }, { status: 400 });
  }

  const detection = detectPlatform(url);
  if (!detection.valid) {
    return NextResponse.json({ success: false, error: 'Invalid URL' }, { status: 400 });
  }

  const provider = ProviderRegistry.getProviderForUrl(detection.normalizedUrl);
  let mediaInfo = undefined;
  if (provider) {
    try {
      mediaInfo = await provider.getMediaInfo(detection.normalizedUrl);
    } catch {}
  }

  const scriptResult = await extractMediaScriptAndHashtags(
    detection.normalizedUrl,
    detection.platform,
    mediaInfo
  );

  if (!scriptResult.scriptText || scriptResult.scriptText.trim().length === 0) {
    return NextResponse.json({
      success: false,
      error: {
        code: 'NO_TRANSCRIPT',
        message: 'No spoken dialogue or subtitles were detected for this video.',
      },
    });
  }

  return NextResponse.json({
    success: true,
    data: scriptResult,
  });
}
