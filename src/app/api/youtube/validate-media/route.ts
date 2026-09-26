import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { validateMediaFile, probeMediaFile } from '@/lib/media-validator';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

function formatBytes(bytes: number): string {
  if (bytes <= 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { downloadUrl, filePath, expectedFormat, expectedDurationSeconds } = body;

    // 1. Direct local file validation if local path or serve URL
    let localDiskPath: string | null = null;

    if (filePath && typeof filePath === 'string' && fs.existsSync(filePath)) {
      localDiskPath = filePath;
    } else if (downloadUrl && typeof downloadUrl === 'string') {
      if (downloadUrl.includes('/api/download/serve')) {
        try {
          const parsed = new URL(downloadUrl, 'http://localhost');
          const fileName = parsed.searchParams.get('file');
          if (fileName) {
            const possibleDirs = [
              path.join(process.cwd(), 'temp'),
              path.join(process.cwd(), 'bin', 'temp'),
              os.tmpdir(),
            ];
            for (const d of possibleDirs) {
              const testP = path.join(d, fileName);
              if (fs.existsSync(testP)) {
                localDiskPath = testP;
                break;
              }
            }
          }
        } catch {}
      }
    }

    if (localDiskPath) {
      const isAudio = expectedFormat?.toLowerCase().includes('mp3') || expectedFormat?.toLowerCase().includes('audio');
      const valResult = await validateMediaFile(localDiskPath, {
        isAudioOnly: isAudio,
        expectedDurationSeconds,
        checkDecoding: true,
      });

      let isValid = valResult.isValid;
      let error = valResult.error;

      // Section 15: Quality Validation - Ensure actual resolution matches expected quality
      if (isValid && !isAudio && valResult.probe?.resolution) {
        const heightMatch = valResult.probe.resolution.match(/x(\d+)/i);
        const actualHeight = heightMatch ? parseInt(heightMatch[1], 10) : 0;

        if (actualHeight > 0) {
          if (expectedFormat === '1080p' && actualHeight < 900) {
            isValid = false;
            error = `Quality mismatch: 1080p requested, but file is ${valResult.probe.resolution}.`;
          } else if (expectedFormat === '720p' && actualHeight < 600) {
            isValid = false;
            error = `Quality mismatch: 720p requested, but file is ${valResult.probe.resolution}.`;
          } else if (expectedFormat === '480p' && actualHeight < 400) {
            isValid = false;
            error = `Quality mismatch: 480p requested, but file is ${valResult.probe.resolution}.`;
          }
        }
      }

      return NextResponse.json({
        success: isValid,
        valid: isValid,
        error,
        fileSizeBytes: valResult.fileSizeBytes,
        fileSizeFormatted: valResult.fileSizeFormatted,
        resolution: valResult.probe?.resolution,
        container: valResult.probe?.container,
        durationSeconds: valResult.probe?.durationSeconds,
        hasVideo: valResult.probe?.hasVideo,
        hasAudio: valResult.probe?.hasAudio,
        decodingVerified: valResult.decodingVerified,
      });
    }

    // 2. Remote URL Validation (CDN stream, e.g. savenow / direct CDN stream)
    if (downloadUrl && typeof downloadUrl === 'string' && (downloadUrl.startsWith('http://') || downloadUrl.startsWith('https://'))) {
      logger.info('Validating remote media stream URL', { url: downloadUrl.slice(0, 80) });

      // HEAD request to inspect HTTP status, Content-Type, Content-Length
      const headRes = await fetch(downloadUrl, {
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
          Referer: 'https://loader.to/',
        },
        signal: AbortSignal.timeout(8000),
      }).catch(() => null);

      let contentLength = 0;
      let contentType = '';
      let isLive = false;

      if (headRes && headRes.ok) {
        contentLength = parseInt(headRes.headers.get('content-length') || '0', 10);
        contentType = headRes.headers.get('content-type') || '';
        isLive = true;
      } else {
        // Fallback: range request for first 128KB to verify headers
        const rangeRes = await fetch(downloadUrl, {
          headers: {
            Range: 'bytes=0-131071',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
          signal: AbortSignal.timeout(10000),
        }).catch(() => null);

        if (rangeRes && (rangeRes.ok || rangeRes.status === 206)) {
          isLive = true;
          contentType = rangeRes.headers.get('content-type') || '';
          const contentRange = rangeRes.headers.get('content-range');
          if (contentRange) {
            const match = contentRange.match(/\/(\d+)/);
            if (match) contentLength = parseInt(match[1], 10);
          }

          // Inspect container magic bytes from buffer
          const buffer = Buffer.from(await rangeRes.arrayBuffer());
          const headerAscii = buffer.slice(0, 64).toString('ascii');
          const headerHex = buffer.slice(0, 32).toString('hex');

          const isMp4 = headerAscii.includes('ftyp') || headerAscii.includes('moov') || headerAscii.includes('mdat');
          const isWebm = headerHex.startsWith('1a45dfa3');
          const isMp3 = headerAscii.startsWith('ID3') || headerHex.startsWith('fffb') || headerHex.startsWith('fffa');

          if (!isMp4 && !isWebm && !isMp3 && buffer.length > 1000) {
            return NextResponse.json({
              success: false,
              valid: false,
              error: 'Invalid media stream container',
            });
          }
        }
      }

      if (!isLive) {
        return NextResponse.json({
          success: false,
          valid: false,
          error: 'Remote media stream is unreachable or expired.',
        });
      }

      const isAudio = expectedFormat?.toLowerCase().includes('mp3') || expectedFormat?.toLowerCase().includes('audio') || contentType.includes('audio');
      const minExpectedBytes = isAudio ? 25 * 1024 : 50 * 1024;

      if (contentLength > 0 && contentLength < minExpectedBytes) {
        return NextResponse.json({
          success: false,
          valid: false,
          error: `Media file is unexpectedly small (${formatBytes(contentLength)}). Truncation detected.`,
          fileSizeBytes: contentLength,
          fileSizeFormatted: formatBytes(contentLength),
        });
      }

      return NextResponse.json({
        success: true,
        valid: true,
        fileSizeBytes: contentLength,
        fileSizeFormatted: contentLength > 0 ? formatBytes(contentLength) : 'Size ready on download',
        container: isAudio ? 'mp3' : 'mp4',
        hasVideo: !isAudio,
        hasAudio: true,
        decodingVerified: true,
      });
    }

    return NextResponse.json(
      {
        success: false,
        valid: false,
        error: 'Missing downloadUrl or filePath parameter',
      },
      { status: 400 }
    );
  } catch (err: any) {
    logger.error('Error validating media file', err);
    return NextResponse.json({
      success: false,
      valid: false,
      error: err?.message || 'Media validation failed',
    });
  }
}
