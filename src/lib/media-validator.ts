import { execFile } from 'child_process';
import path from 'path';
import fs from 'fs';
import { logger } from './logger';

const isWin = process.platform === 'win32';

export function getFfmpegPath(): string | null {
  const candidates = [
    path.resolve(process.cwd(), 'bin', isWin ? 'ffmpeg.exe' : 'ffmpeg'),
    path.resolve(process.cwd(), 'bin', 'ffmpeg'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}

export interface MediaProbeInfo {
  container?: string;
  durationSeconds: number;
  bitrateKbps?: number;
  hasVideo: boolean;
  hasAudio: boolean;
  videoCodec?: string;
  audioCodec?: string;
  resolution?: string;
}

export interface ValidationOptions {
  expectedDurationSeconds?: number;
  isAudioOnly?: boolean;
  minDurationSeconds?: number;
  minFileSizeBytes?: number;
  checkDecoding?: boolean;
  timeoutMs?: number;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  fileSizeBytes: number;
  fileSizeFormatted: string;
  probe: MediaProbeInfo;
  decodingVerified: boolean;
}

function formatBytes(bytes: number): string {
  if (bytes <= 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Probes media container, streams, and codec details using FFmpeg.
 */
export function probeMediaFile(filePath: string, timeoutMs: number = 10000): Promise<MediaProbeInfo> {
  return new Promise((resolve, reject) => {
    const ffmpeg = getFfmpegPath();
    if (!ffmpeg) {
      return reject(new Error('FFmpeg binary not found on server'));
    }

    if (!fs.existsSync(filePath)) {
      return reject(new Error(`Target file does not exist: ${filePath}`));
    }

    // Run ffmpeg -i <file>
    execFile(
      ffmpeg,
      ['-hide_banner', '-i', filePath],
      { timeout: timeoutMs },
      (_error, _stdout, stderr) => {
        const output = stderr || '';

        // Extract container
        const inputMatch = output.match(/Input #\d+,\s*([^,]+),/i);
        const container = inputMatch ? inputMatch[1].trim() : undefined;

        // Extract duration: "Duration: 00:03:33.34"
        let durationSeconds = 0;
        const durMatch = output.match(/Duration:\s*(\d{2}):(\d{2}):(\d{2}(?:\.\d+)?)/i);
        if (durMatch) {
          const hours = parseFloat(durMatch[1]);
          const minutes = parseFloat(durMatch[2]);
          const seconds = parseFloat(durMatch[3]);
          durationSeconds = Math.round((hours * 3600 + minutes * 60 + seconds) * 100) / 100;
        }

        // Extract bitrate: "bitrate: 1420 kb/s"
        let bitrateKbps: number | undefined;
        const brMatch = output.match(/bitrate:\s*(\d+)\s*kb\/s/i);
        if (brMatch) {
          bitrateKbps = parseInt(brMatch[1], 10);
        }

        // Extract video stream: "Stream #0:0...: Video: h264... 1280x720"
        const videoMatch = output.match(/Stream #\d+:\d+.*?: Video:\s*([a-zA-Z0-9_\-]+)[^,\n]*,[^,\n]*,?\s*(\d{3,4}x\d{3,4})/i);
        const hasVideo = Boolean(videoMatch || output.includes('Video:'));
        const videoCodec = videoMatch ? videoMatch[1].trim() : (output.match(/Video:\s*([a-zA-Z0-9_\-]+)/i)?.[1] || undefined);
        const resolution = videoMatch ? videoMatch[2].trim() : (output.match(/(\d{3,4}x\d{3,4})/)?.[1] || undefined);

        // Extract audio stream: "Stream #0:1...: Audio: aac..."
        const audioMatch = output.match(/Stream #\d+:\d+.*?: Audio:\s*([a-zA-Z0-9_\-]+)/i);
        const hasAudio = Boolean(audioMatch || output.includes('Audio:'));
        const audioCodec = audioMatch ? audioMatch[1].trim() : undefined;

        resolve({
          container,
          durationSeconds,
          bitrateKbps,
          hasVideo,
          hasAudio,
          videoCodec,
          audioCodec,
          resolution,
        });
      }
    );
  });
}

/**
 * Validates playback/decoding of a media file by having FFmpeg decode audio and video streams.
 */
export function verifyDecoding(filePath: string, sampleDurationSeconds: number = 3, timeoutMs: number = 8000): Promise<boolean> {
  return new Promise((resolve) => {
    const ffmpeg = getFfmpegPath();
    if (!ffmpeg || !fs.existsSync(filePath)) {
      return resolve(false);
    }

    // Test decoding sample using null muxer: ffmpeg -v error -t 15 -i <file> -f null -
    execFile(
      ffmpeg,
      ['-v', 'error', '-t', String(sampleDurationSeconds), '-i', filePath, '-f', 'null', '-'],
      { timeout: timeoutMs },
      (error, _stdout, stderr) => {
        if (error) {
          logger.warn('Media decoding verification failed', { error: error.message, stderr });
          return resolve(false);
        }
        if (stderr && stderr.toLowerCase().includes('moov atom not found')) {
          logger.warn('Corrupt media file: missing moov atom', { stderr });
          return resolve(false);
        }
        resolve(true);
      }
    );
  });
}

/**
 * Server-side complete validation of downloaded media file.
 * Catches truncated files (e.g. 200 KB on a 16-min video), missing audio/video, and corrupt containers.
 */
export async function validateMediaFile(
  filePath: string,
  options: ValidationOptions = {}
): Promise<ValidationResult> {
  if (!fs.existsSync(filePath)) {
    return {
      isValid: false,
      error: 'File does not exist on disk.',
      fileSizeBytes: 0,
      fileSizeFormatted: '0 Bytes',
      probe: { durationSeconds: 0, hasVideo: false, hasAudio: false },
      decodingVerified: false,
    };
  }

  const stats = fs.statSync(filePath);
  const fileSizeBytes = stats.size;
  const fileSizeFormatted = formatBytes(fileSizeBytes);

  // 1. Sane minimum size check: absolute minimum 25 KB for any media container
  if (fileSizeBytes < 25 * 1024) {
    return {
      isValid: false,
      error: `File is too small (${fileSizeFormatted}). Likely an error page or empty response.`,
      fileSizeBytes,
      fileSizeFormatted,
      probe: { durationSeconds: 0, hasVideo: false, hasAudio: false },
      decodingVerified: false,
    };
  }

  // 2. Probe streams and duration
  let probe: MediaProbeInfo;
  try {
    probe = await probeMediaFile(filePath, options.timeoutMs || 10000);
  } catch (err: unknown) {
    const e = err as Error;
    return {
      isValid: false,
      error: `Media probe failed: ${e.message}`,
      fileSizeBytes,
      fileSizeFormatted,
      probe: { durationSeconds: 0, hasVideo: false, hasAudio: false },
      decodingVerified: false,
    };
  }

  // 3. Verify Video stream existence when video expected
  if (!options.isAudioOnly && !probe.hasVideo) {
    return {
      isValid: false,
      error: 'Downloaded file contains no video stream (audio-only file received).',
      fileSizeBytes,
      fileSizeFormatted,
      probe,
      decodingVerified: false,
    };
  }

  // 4. Verify Audio stream existence when full video expected
  if (!options.isAudioOnly && !probe.hasAudio) {
    return {
      isValid: false,
      error: 'Downloaded file contains no audio stream (unmerged DASH video received).',
      fileSizeBytes,
      fileSizeFormatted,
      probe,
      decodingVerified: false,
    };
  }

  // 5. Verify Audio stream when audio-only expected
  if (options.isAudioOnly && !probe.hasAudio) {
    return {
      isValid: false,
      error: 'Audio file contains no recognizable audio stream.',
      fileSizeBytes,
      fileSizeFormatted,
      probe,
      decodingVerified: false,
    };
  }

  // 6. Probed Duration vs File Size Sanity (Catch the 200 KB on 16-min video bug!)
  // For any video longer than 30 seconds, a standard MP4 requires at least 25 KB per second (~200 kbps).
  // A 16-minute (960s) video requires at least 15–25 MB. 200 KB is less than 0.25 KB/s (completely truncated!)
  if (!options.isAudioOnly && probe.durationSeconds > 30) {
    const minExpectedBytes = Math.min(1.5 * 1024 * 1024, probe.durationSeconds * 20 * 1024); // at least 20 KB/sec
    if (fileSizeBytes < minExpectedBytes) {
      return {
        isValid: false,
        error: `Incomplete media stream: Video duration is ${Math.round(probe.durationSeconds)}s but file is only ${fileSizeFormatted} (truncated stream).`,
        fileSizeBytes,
        fileSizeFormatted,
        probe,
        decodingVerified: false,
      };
    }
  }

  // 7. Expected Duration Comparison (if expected duration passed from metadata)
  if (options.expectedDurationSeconds && options.expectedDurationSeconds > 10) {
    const ratio = probe.durationSeconds / options.expectedDurationSeconds;
    if (ratio < 0.65) {
      return {
        isValid: false,
        error: `Truncated media: Received ${Math.round(probe.durationSeconds)}s out of expected ${Math.round(options.expectedDurationSeconds)}s.`,
        fileSizeBytes,
        fileSizeFormatted,
        probe,
        decodingVerified: false,
      };
    }
  }

  // 8. Decoding / Playback Verification
  let decodingVerified = true;
  if (options.checkDecoding !== false) {
    decodingVerified = await verifyDecoding(filePath, 3, 8000);
    if (!decodingVerified) {
      return {
        isValid: false,
        error: 'Media file failed playback/decoding test (corrupt bitstream or missing headers).',
        fileSizeBytes,
        fileSizeFormatted,
        probe,
        decodingVerified: false,
      };
    }
  }

  return {
    isValid: true,
    fileSizeBytes,
    fileSizeFormatted,
    probe,
    decodingVerified,
  };
}
