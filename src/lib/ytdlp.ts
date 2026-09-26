import { execFile, spawn, spawnSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';
import crypto from 'crypto';
import { MediaFormat, MediaMetadata, PlatformType } from './types';
import { sanitizeFilename, cleanAndDecodeTitle, safeEncodeURIComponent } from './string-utils';
import { validateMediaFile, probeMediaFile } from './media-validator';
import { logger } from './logger';

const isWin = process.platform === 'win32';

// In-memory map of validated cached file heights: cacheToken -> actualHeight
// Avoids running FFmpeg probe on every cache hit (was causing multi-second latency)
const validatedCacheHeights = new Map<string, number>();

// In-flight download deduplication map: cacheToken -> Promise<DownloadedMediaFile>
// Prevents duplicate concurrent yt-dlp processes from competing for bandwidth on the same media
const inflightDownloads = new Map<string, Promise<DownloadedMediaFile>>();

export function getCookiesPath(platform?: string): string | null {
  const candidates: string[] = [];
  if (platform === 'youtube') {
    candidates.push(
      path.resolve(process.cwd(), 'bin', 'youtube_cookies.txt'),
      path.resolve(process.cwd(), 'bin', 'cookies.txt')
    );
  } else if (platform === 'instagram') {
    candidates.push(
      path.resolve(process.cwd(), 'bin', 'instagram_cookies.txt'),
      path.resolve(process.cwd(), 'bin', 'cookies.txt')
    );
  } else {
    candidates.push(
      path.resolve(process.cwd(), 'bin', 'cookies.txt'),
      path.resolve(process.cwd(), 'bin', 'instagram_cookies.txt'),
      path.resolve(process.cwd(), 'bin', 'youtube_cookies.txt')
    );
  }
  for (const c of candidates) {
    if (fs.existsSync(c)) {
      if (platform === 'instagram' && !c.includes('instagram_cookies.txt')) {
        try {
          const content = fs.readFileSync(c, 'utf-8');
          if (!content.includes('instagram.com')) {
            continue;
          }
        } catch {}
      }
      return c;
    }
  }
  return null;
}

export function getFfmpegPath(): string | null {
  if (isWin) {
    const winBin = path.resolve(process.cwd(), 'bin', 'ffmpeg.exe');
    if (fs.existsSync(winBin)) return winBin;
  }
  const linuxBin = path.resolve(process.cwd(), 'bin', 'ffmpeg');
  if (fs.existsSync(linuxBin)) return linuxBin;

  try {
    const check = spawnSync(isWin ? 'ffmpeg.exe' : 'ffmpeg', ['-version'], { timeout: 2000 });
    if (check.status === 0) return isWin ? 'ffmpeg.exe' : 'ffmpeg';
  } catch {}
  return null;
}

interface YtDlpCommand {
  cmd: string;
  prefixArgs: string[];
}

let cachedCommand: YtDlpCommand | null = null;

function getYtDlpCommand(): YtDlpCommand | null {
  if (cachedCommand) return cachedCommand;

  if (isWin) {
    // 1. Native python with yt_dlp (avoids PyInstaller temp unpacking issues)
    try {
      const check = spawnSync('python.exe', ['-m', 'yt_dlp', '--version'], { timeout: 3000 });
      if (check.status === 0) {
        cachedCommand = { cmd: 'python.exe', prefixArgs: ['-m', 'yt_dlp'] };
        return cachedCommand;
      }
    } catch {}

    try {
      const check = spawnSync('python', ['-m', 'yt_dlp', '--version'], { timeout: 3000 });
      if (check.status === 0) {
        cachedCommand = { cmd: 'python', prefixArgs: ['-m', 'yt_dlp'] };
        return cachedCommand;
      }
    } catch {}

    // 2. Windows standalone binary in bin/yt-dlp.exe
    const winPath = path.resolve(process.cwd(), 'bin', 'yt-dlp.exe');
    if (fs.existsSync(winPath)) {
      cachedCommand = { cmd: winPath, prefixArgs: [] };
      return cachedCommand;
    }

    // 3. System PATH yt-dlp.exe
    try {
      const check = spawnSync('yt-dlp.exe', ['--version'], { timeout: 3000 });
      if (check.status === 0) {
        cachedCommand = { cmd: 'yt-dlp.exe', prefixArgs: [] };
        return cachedCommand;
      }
    } catch {}

    return null;
  }

  // Non-Windows (Linux / macOS / Vercel Serverless)
  // 1. Native python3 with yt_dlp
  try {
    const check = spawnSync('python3', ['-m', 'yt_dlp', '--version'], { timeout: 3000 });
    if (check.status === 0) {
      cachedCommand = { cmd: 'python3', prefixArgs: ['-m', 'yt_dlp'] };
      return cachedCommand;
    }
  } catch {}

  // 2. Bundled Linux binary
  const tmpBinary = '/tmp/yt-dlp';
  const candidateBundledPaths = [
    path.resolve(process.cwd(), 'bin', 'yt-dlp'),
    path.resolve(__dirname, '..', '..', '..', 'bin', 'yt-dlp'),
    path.resolve(__dirname, '..', '..', 'bin', 'yt-dlp'),
    path.resolve(__dirname, '..', 'bin', 'yt-dlp'),
  ];

  let foundBundled: string | null = null;
  for (const p of candidateBundledPaths) {
    try {
      if (fs.existsSync(p)) {
        foundBundled = p;
        break;
      }
    } catch {}
  }

  if (foundBundled) {
    try {
      const srcStat = fs.statSync(foundBundled);
      let needsCopy = true;
      if (fs.existsSync(tmpBinary)) {
        try {
          const dstStat = fs.statSync(tmpBinary);
          if (dstStat.size === srcStat.size) {
            needsCopy = false;
          }
        } catch {}
      }
      if (needsCopy) {
        fs.copyFileSync(foundBundled, tmpBinary);
      }
      fs.chmodSync(tmpBinary, 0o755);
      cachedCommand = { cmd: tmpBinary, prefixArgs: [] };
      return cachedCommand;
    } catch {
      try {
        fs.chmodSync(foundBundled, 0o755);
        cachedCommand = { cmd: foundBundled, prefixArgs: [] };
        return cachedCommand;
      } catch {}
    }
  }

  // 3. Existing /tmp/yt-dlp fallback
  if (fs.existsSync(tmpBinary)) {
    try {
      fs.chmodSync(tmpBinary, 0o755);
      cachedCommand = { cmd: tmpBinary, prefixArgs: [] };
      return cachedCommand;
    } catch {}
  }

  // 4. System PATH yt-dlp
  try {
    const check = spawnSync('yt-dlp', ['--version'], { timeout: 3000 });
    if (check.status === 0) {
      cachedCommand = { cmd: 'yt-dlp', prefixArgs: [] };
      return cachedCommand;
    }
  } catch {}

  return null;
}

interface YtDlpFormatRaw {
  format_id: string;
  format_note?: string;
  ext: string;
  height?: number;
  width?: number;
  filesize?: number;
  filesize_approx?: number;
  vcodec?: string;
  acodec?: string;
  abr?: number;
  resolution?: string;
  url?: string;
  protocol?: string;
}

interface YtDlpJsonOutput {
  id: string;
  title: string;
  uploader?: string;
  uploader_id?: string;
  channel?: string;
  duration?: number;
  duration_string?: string;
  thumbnail?: string;
  formats?: YtDlpFormatRaw[];
  description?: string;
  tags?: string[];
}

function formatBytes(bytes?: number): string | undefined {
  if (!bytes || bytes <= 0) return undefined;
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function formatMediaDuration(sec?: number, str?: string): string | undefined {
  if (str && str.trim()) return str.trim();
  if (!sec || isNaN(sec) || sec <= 0) return undefined;
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
}

export interface DownloadedMediaFile {
  serveUrl: string;
  fileSizeBytes: number;
  fileSizeFormatted: string;
  resolution?: string;
  duration?: string;
}

export const ytDlpRunner = {
  isAvailable(): boolean {
    return !!getYtDlpCommand();
  },

  /**
   * Fetches authentic media metadata and available formats for any supported URL.
   */
  async getMediaInfo(targetUrl: string): Promise<MediaMetadata> {
    const runner = getYtDlpCommand();
    if (!runner) {
      throw new Error('yt-dlp engine executable not found.');
    }

    return new Promise((resolve, reject) => {
      const args = ['-j', '--skip-download', '--no-playlist'];

      const isYouTube = targetUrl.includes('youtube.com') || targetUrl.includes('youtu.be');
      const isInstagram = targetUrl.includes('instagram.com') || targetUrl.includes('instagr.am');
      const nodeRuntime = process.execPath ? `node:${process.execPath}` : 'node';
      args.push('--js-runtimes', nodeRuntime);

      if (isYouTube) {
        args.push('-4');
        args.push('--extractor-args', 'youtube:player_client=android,web');
        const ytCookies = getCookiesPath('youtube');
        if (ytCookies) {
          args.push('--cookies', ytCookies);
        }
      } else {
        const cookies = getCookiesPath(isInstagram ? 'instagram' : undefined);
        if (cookies) {
          args.push('--cookies', cookies);
        }
      }

      args.push(targetUrl);

      execFile(
        /*turbopackIgnore: true*/ runner.cmd,
        [...runner.prefixArgs, ...args],
        { maxBuffer: 25 * 1024 * 1024, timeout: 35000 },
        (error, stdout, stderr) => {
          if (error) {
            if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
              cachedCommand = null;
            }
            const rawMsg = stderr || error.message;
            const lower = rawMsg.toLowerCase();
            if (lower.includes('private video') || lower.includes('sign in if you') || lower.includes('private')) {
              const err = new Error('This content is private or requires authorization.');
              (err as unknown as { code: string }).code = 'PRIVATE_CONTENT';
              return reject(err);
            }
            if (lower.includes('unavailable') || lower.includes('not available') || lower.includes('removed') || lower.includes('does not exist')) {
              const err = new Error('This content is unavailable or has been removed.');
              (err as unknown as { code: string }).code = 'UNAVAILABLE_CONTENT';
              return reject(err);
            }
            return reject(new Error(rawMsg.slice(0, 200)));
          }

          try {
            const data: YtDlpJsonOutput = JSON.parse(stdout.trim());
            const rawFormats = data.formats || [];

            const formats: MediaFormat[] = [];
            const seenQualities = new Set<string>();

            const isInstagram = targetUrl.includes('instagram.com') || targetUrl.includes('instagr.am');

            // 1. YouTube Multi-Format Dynamic Extraction
            if (isYouTube) {
              const bestAudio =
                rawFormats.find((f) => f.format_id === '140' && f.url) ||
                rawFormats.find((f) => f.acodec && f.acodec !== 'none' && (!f.vcodec || f.vcodec === 'none') && f.url);
              const audioBytes = bestAudio?.filesize || bestAudio?.filesize_approx || 0;

              const tiers = [
                { height: 2160, id: '4k', label: '4K Ultra HD (2160p)', res: '3840x2160' },
                { height: 1440, id: '1440p', label: '2K Quad HD (1440p)', res: '2560x1440' },
                { height: 1080, id: '1080p', label: '1080p Full HD', res: '1920x1080' },
                { height: 720, id: '720p', label: '720p HD', res: '1280x720' },
                { height: 480, id: '480p', label: '480p SD', res: '854x480' },
                { height: 360, id: '360p', label: '360p Fast Download', res: '640x360' },
                { height: 240, id: '240p', label: '240p Mobile Quality', res: '426x240' },
                { height: 144, id: '144p', label: '144p Fast Download', res: '256x144' },
              ];

              for (const tier of tiers) {
                // Find matching video format at or very close to this tier's height (within ±4px)
                const matchingFmt = rawFormats.find(
                  (f) => f.height && Math.abs(f.height - tier.height) <= 4 && f.vcodec && f.vcodec !== 'none'
                );

                if (matchingFmt && !seenQualities.has(tier.id)) {
                  seenQualities.add(tier.id);
                  // Find best size estimate: prefer this format or approx
                  const videoBytes = matchingFmt.filesize || matchingFmt.filesize_approx;
                  const totalBytes = videoBytes ? videoBytes + audioBytes : undefined;

                  formats.push({
                    id: tier.id,
                    format: 'mp4',
                    quality: tier.label,
                    resolution: tier.res,
                    hasAudio: true,
                    hasVideo: true,
                    codec: matchingFmt.vcodec?.split('.')[0] || 'h264',
                    container: 'mp4',
                    downloadUrl: undefined, // Enforces server-side merged audio+video download
                    fileSize: formatBytes(totalBytes),
                  });
                }
              }

              // Fallback: If no tier matched (e.g. non-standard resolution like 304p), add best available video
              if (formats.filter((f) => f.hasVideo).length === 0) {
                const bestVideo = rawFormats
                  .filter((f) => f.vcodec && f.vcodec !== 'none' && f.height)
                  .sort((a, b) => (b.height || 0) - (a.height || 0))[0];

                if (bestVideo && bestVideo.height) {
                  const videoBytes = bestVideo.filesize || bestVideo.filesize_approx;
                  const totalBytes = videoBytes ? videoBytes + audioBytes : undefined;
                  formats.unshift({
                    id: `${bestVideo.height}p`,
                    format: 'mp4',
                    quality: `${bestVideo.height}p Standard Quality`,
                    resolution: `${bestVideo.width || ''}x${bestVideo.height}`,
                    hasAudio: true,
                    hasVideo: true,
                    codec: bestVideo.vcodec?.split('.')[0] || 'h264',
                    container: 'mp4',
                    downloadUrl: undefined,
                    fileSize: formatBytes(totalBytes),
                  });
                }
              }

              // Audio Format (MP3)
              if (bestAudio) {
                formats.push({
                  id: 'mp3',
                  format: 'mp3',
                  quality: bestAudio.abr ? `${Math.round(bestAudio.abr)} kbps (High Quality Audio)` : 'High Quality Audio',
                  hasAudio: true,
                  hasVideo: false,
                  codec: 'mp3',
                  container: 'mp3',
                  downloadUrl: undefined, // Enforces server-side audio conversion
                  fileSize: formatBytes(bestAudio.filesize || bestAudio.filesize_approx),
                });
              }
            }

            // 2. Instagram Formats
            if (isInstagram) {
              // Only consider true progressive formats (having both video AND audio codecs)
              const igProgressive = rawFormats.filter(
                (f) => f.ext === 'mp4' && f.url && f.vcodec && f.vcodec !== 'none' && f.acodec && f.acodec !== 'none'
              );
              igProgressive.sort((a, b) => (b.height || 0) - (a.height || 0));

              for (const f of igProgressive) {
                const height = f.height || 720;
                const formatId = height >= 1080 ? '1080p' : height >= 720 ? '720p' : `${height}p`;
                const label = height >= 1080 ? '1080p HD (High Definition)' : height >= 720 ? '720p HD (Standard HD)' : `${height}p SD`;
                if (!seenQualities.has(formatId)) {
                  seenQualities.add(formatId);
                  formats.push({
                    id: formatId,
                    format: 'mp4',
                    quality: label,
                    resolution: `${f.width || 720}x${height}`,
                    hasAudio: true,
                    hasVideo: true,
                    downloadUrl: f.url,
                    fileSize: formatBytes(f.filesize || f.filesize_approx),
                  });
                }
              }

              // If no progressive format with audio was found, but video formats exist (e.g. DASH video streams)
              // We expose them WITHOUT downloadUrl so the download engine merges audio + video via FFmpeg!
              if (formats.length === 0) {
                const igVideoFormats = rawFormats.filter(
                  (f) => f.vcodec && f.vcodec !== 'none' && (f.height || 0) >= 240
                );
                igVideoFormats.sort((a, b) => (b.height || 0) - (a.height || 0));

                for (const f of igVideoFormats) {
                  const height = f.height || 720;
                  const formatId = height >= 1080 ? '1080p' : height >= 720 ? '720p' : `${height}p`;
                  const label = height >= 1080 ? '1080p HD (High Definition)' : height >= 720 ? '720p HD (Standard HD)' : `${height}p SD`;
                  if (!seenQualities.has(formatId)) {
                    seenQualities.add(formatId);
                    formats.push({
                      id: formatId,
                      format: 'mp4',
                      quality: label,
                      resolution: `${f.width || 720}x${height}`,
                      hasAudio: true, // Will be merged with audio stream by download engine
                      hasVideo: true,
                      downloadUrl: undefined, // Enforces server-side FFmpeg merge with audio
                      fileSize: formatBytes(f.filesize || f.filesize_approx),
                    });
                  }
                  if (formats.length >= 3) break;
                }
              }

              // Audio Format (MP3)
              const bestAudio = rawFormats.find((f) => f.acodec && f.acodec !== 'none');
              formats.push({
                id: 'mp3',
                format: 'mp3',
                quality: 'Original Audio (MP3)',
                hasAudio: true,
                hasVideo: false,
                downloadUrl: undefined, // Enforces server-side conversion so real audio stream is extracted
                fileSize: formatBytes(bestAudio?.filesize || bestAudio?.filesize_approx),
              });
            }

            // 3. Other Platforms (TikTok, Facebook, Pinterest)
            if (!isYouTube && !isInstagram) {
              const videoFormats = rawFormats.filter(
                (f) =>
                  ((f.vcodec && f.vcodec !== 'none') || f.format_id === 'hd' || f.format_id === 'sd' || f.ext === 'mp4') &&
                  (!f.protocol || !f.protocol.includes('m3u8'))
              );

              videoFormats.sort((a, b) => {
                const hA = a.height || (a.format_id === 'hd' ? 720 : a.format_id === 'sd' ? 360 : 0);
                const hB = b.height || (b.format_id === 'hd' ? 720 : b.format_id === 'sd' ? 360 : 0);
                return hB - hA;
              });

              for (const f of videoFormats) {
                const height = f.height || (f.format_id === 'hd' ? 720 : f.format_id === 'sd' ? 360 : undefined);
                const qualityLabel = height ? `${height}p` : f.format_id.toUpperCase();

                if (!seenQualities.has(f.format_id) && !seenQualities.has(qualityLabel)) {
                  seenQualities.add(f.format_id);
                  seenQualities.add(qualityLabel);
                  formats.push({
                    id: f.format_id,
                    format: 'mp4',
                    quality: f.format_id === 'hd' ? 'HD Video (720p)' : f.format_id === 'sd' ? 'SD Video (360p)' : `${qualityLabel} HD`,
                    resolution: f.resolution || (f.width && height ? `${f.width}x${height}` : height ? `${height}p` : undefined),
                    fileSize: formatBytes(f.filesize || f.filesize_approx),
                    hasAudio: f.acodec !== 'none',
                    hasVideo: true,
                    downloadUrl: f.url && f.url.startsWith('http') ? f.url : undefined,
                  });
                }
                if (formats.length >= 4) break;
              }

              // Audio Format (if separate audio exists)
              const audioFormats = rawFormats.filter(
                (f) =>
                  f.acodec &&
                  f.acodec !== 'none' &&
                  (!f.vcodec || f.vcodec === 'none') &&
                  (!f.protocol || !f.protocol.includes('m3u8'))
              );
              audioFormats.sort((a, b) => (b.abr || 0) - (a.abr || 0));

              if (audioFormats.length > 0) {
                const bestAudio = audioFormats[0];
                formats.push({
                  id: `mp3-${bestAudio.format_id}`,
                  format: 'mp3',
                  quality: bestAudio.abr ? `${Math.round(bestAudio.abr)} kbps Audio` : 'Original Audio (MP3)',
                  fileSize: formatBytes(bestAudio.filesize || bestAudio.filesize_approx),
                  hasAudio: true,
                  hasVideo: false,
                  downloadUrl: bestAudio.url,
                });
              } else if (formats.length > 0) {
                formats.push({
                  id: 'mp3',
                  format: 'mp3',
                  quality: 'Original Audio (MP3)',
                  hasAudio: true,
                  hasVideo: false,
                  downloadUrl: undefined,
                });
              }
            }

            const rawTags = (data.tags || []).map((t: string) => (t.startsWith('#') ? t : `#${t}`));
            const combinedText = `${data.title || ''} ${data.description || ''}`;
            const textMatches = combinedText.match(/#([a-zA-Z0-9_\u0600-\u06FF]+)/g) || [];
            const hashtags = Array.from(new Set([...textMatches, ...rawTags]));

            const resolvedPlatform: PlatformType = isInstagram
              ? 'instagram'
              : targetUrl.includes('tiktok.com')
              ? 'tiktok'
              : targetUrl.includes('facebook.com') || targetUrl.includes('fb.watch')
              ? 'facebook'
              : targetUrl.includes('pinterest.com') || targetUrl.includes('pin.it')
              ? 'pinterest'
              : 'youtube';

            const safeTitle = data.title || (data.description ? cleanAndDecodeTitle(data.description.slice(0, 100)) : undefined);
            const media: MediaMetadata = {
              id: data.id || 'media',
              platform: resolvedPlatform,
              title: safeTitle || (data.id ? `${resolvedPlatform.toUpperCase()} Media (${data.id})` : 'Information unavailable'),
              author: data.uploader || data.channel || (data.uploader_id ? `@${data.uploader_id}` : 'Information unavailable'),
              duration: formatMediaDuration(data.duration, data.duration_string),
              thumbnailUrl: data.thumbnail,
              sourceUrl: targetUrl,
              description: data.description,
              hashtags,
              formats,
              requiresProviderSetup: false,
            };

            resolve(media);
          } catch (e: unknown) {
            const err = e as Error;
            reject(new Error(`Failed to parse metadata: ${err.message}`));
          }
        }
      );
    });
  },

  /**
   * Downloads, converts, and merges authentic media file (MP3 audio or merged HD MP4).
   * Saves to ephemeral temp storage and returns the local secure serve URL with verified file metrics.
   */
  async downloadMedia(
    media: MediaMetadata,
    formatId: string,
    onProgress?: (progress: { percent: number; stage: string; speed?: string; total?: string }) => void
  ): Promise<DownloadedMediaFile> {
    const videoId = media.id;
    const format = media.formats?.find((f) => f.id === formatId);
    const isMp3 =
      format?.format === 'mp3' ||
      formatId.toLowerCase().includes('mp3') ||
      formatId.toLowerCase().includes('audio');

    const storageDir = path.join(os.tmpdir(), 'mediakit_storage');
    try {
      if (!fs.existsSync(storageDir)) {
        fs.mkdirSync(storageDir, { recursive: true });
      }
    } catch {}

    const targetExt = isMp3 ? 'mp3' : 'mp4';
    const cleanId = videoId.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 24);
    const cleanFormat = formatId.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 16);
    const urlHash = crypto
      .createHash('sha256')
      .update(`${media.sourceUrl || media.id}:${formatId}`)
      .digest('hex')
      .slice(0, 12);
    const cacheToken = `${cleanId}_${cleanFormat}_${urlHash}`;
    const cachedFilePath = path.join(storageDir, `${cacheToken}.${targetExt}`);

    // Return instant cached file if already processed AND matches requested quality
    if (fs.existsSync(cachedFilePath)) {
      const stats = fs.statSync(cachedFilePath);
      if (stats.size > 1024) {
        if (!isMp3) {
          let requestedHeight = parseInt(formatId.replace(/[^0-9]/g, ''), 10);
          if (!requestedHeight) {
            requestedHeight = formatId.toLowerCase().includes('sd') ? 480 : 720;
          }
          const knownHeight = validatedCacheHeights.get(cacheToken);

          if (knownHeight !== undefined) {
            // Fast path: already validated in-memory, no FFmpeg probe needed
            if (knownHeight > 0 && requestedHeight > 0 && knownHeight < requestedHeight * 0.65) {
              validatedCacheHeights.delete(cacheToken);
              try { fs.unlinkSync(cachedFilePath); } catch {}
            } else {
              const cleanTitle = sanitizeFilename(media.title || 'media', targetExt);
              onProgress?.({ percent: 100, stage: 'Retrieved from cache ✓' });
              return {
                serveUrl: `/api/download/serve?token=${safeEncodeURIComponent(cacheToken)}&title=${safeEncodeURIComponent(cleanTitle)}&ext=${targetExt}`,
                fileSizeBytes: stats.size,
                fileSizeFormatted: formatBytes(stats.size) || 'Size unavailable',
                resolution: knownHeight ? `${knownHeight}p` : undefined,
              };
            }
          } else {
            // First access since server start: probe once, then remember result
            try {
              const cachedProbe = await probeMediaFile(cachedFilePath, 8000);
              const actualHeight = cachedProbe.resolution ? parseInt(cachedProbe.resolution.split('x')[1], 10) : 0;
              validatedCacheHeights.set(cacheToken, actualHeight);
              if (actualHeight > 0 && requestedHeight > 0 && actualHeight < requestedHeight * 0.65) {
                logger.warn('Cached file resolution mismatch, re-downloading', {
                  cached: cachedProbe.resolution, requested: `${requestedHeight}p`, token: cacheToken,
                });
                validatedCacheHeights.delete(cacheToken);
                try { fs.unlinkSync(cachedFilePath); } catch {}
              } else {
                const cleanTitle = sanitizeFilename(media.title || 'media', targetExt);
                onProgress?.({ percent: 100, stage: 'Retrieved from cache ✓' });
                return {
                  serveUrl: `/api/download/serve?token=${safeEncodeURIComponent(cacheToken)}&title=${safeEncodeURIComponent(cleanTitle)}&ext=${targetExt}`,
                  fileSizeBytes: stats.size,
                  fileSizeFormatted: formatBytes(stats.size) || 'Size unavailable',
                  resolution: cachedProbe.resolution,
                  duration: cachedProbe.durationSeconds ? `${Math.round(cachedProbe.durationSeconds)}s` : undefined,
                };
              }
            } catch {
              try { fs.unlinkSync(cachedFilePath); } catch {}
            }
          }
        } else {
          const cleanTitle = sanitizeFilename(media.title || 'media', targetExt);
          onProgress?.({ percent: 100, stage: 'Retrieved from cache ✓' });
          return {
            serveUrl: `/api/download/serve?token=${safeEncodeURIComponent(cacheToken)}&title=${safeEncodeURIComponent(cleanTitle)}&ext=${targetExt}`,
            fileSizeBytes: stats.size,
            fileSizeFormatted: formatBytes(stats.size) || 'Size unavailable',
          };
        }
      }
    }

    // Await already running in-flight download for same media & format
    const existingInflight = inflightDownloads.get(cacheToken);
    if (existingInflight) {
      logger.info('Awaiting existing in-flight download for same media & format', { cacheToken });
      onProgress?.({ percent: 50, stage: 'Download in progress...' });
      return existingInflight;
    }

    // Temporary working directory
    const tempDir = path.join(os.tmpdir(), 'mediakit_dl');
    try {
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
    } catch {}

    const randomSuffix = crypto.randomBytes(4).toString('hex');
    const tempOutputFile = path.join(tempDir, `${cacheToken}_${randomSuffix}.${targetExt}`);

    const ffmpegPath = getFfmpegPath();

    const nodeRuntime = process.execPath ? `node:${process.execPath}` : 'node';
    const isYouTube = media.sourceUrl?.includes('youtube.com') || media.sourceUrl?.includes('youtu.be');

    const downloadPromise = new Promise<DownloadedMediaFile>((resolve, reject) => {
      const args = [
        '--js-runtimes',
        nodeRuntime,
        '--no-playlist',
        '--no-warnings',
        '--no-check-certificates',
        '--prefer-free-formats',
        '--no-mtime',
        '--no-part',
        '--newline',
        '--socket-timeout',
        '15',
        '--retries',
        '3',
        '--fragment-retries',
        '3',
        '--windows-filenames',
      ];

      if (ffmpegPath) {
        args.push('--ffmpeg-location', ffmpegPath);
        args.push('--postprocessor-args', 'ffmpeg:-threads 4 -preset ultrafast');
      }

      const isInstagram = media.sourceUrl?.includes('instagram.com') || media.sourceUrl?.includes('instagr.am');

      if (isYouTube) {
        args.push('-4');
        const ytCookies = getCookiesPath('youtube');
        if (ytCookies) {
          args.push('--cookies', ytCookies);
        }
      } else {
        const cookies = getCookiesPath(isInstagram ? 'instagram' : undefined);
        if (cookies) {
          args.push('--cookies', cookies);
        }
      }

      if (isMp3) {
        args.push(
          '-f',
          'ba[ext=m4a]/ba[ext=opus]/ba/bestaudio/best',
          '-x',
          '--audio-format',
          'mp3',
          '--audio-quality',
          '0',
          '--concurrent-fragments',
          '16',
          '-o',
          tempOutputFile,
          media.sourceUrl
        );
      } else {
        let height = 720;
        if (formatId.includes('2160') || formatId.includes('4k')) height = 2160;
        else if (formatId.includes('1440')) height = 1440;
        else if (formatId.includes('1080')) height = 1080;
        else if (formatId.includes('720') || formatId.toLowerCase() === 'hd') height = 720;
        else if (formatId.includes('480') || formatId.toLowerCase() === 'sd') height = 480;
        else if (formatId.includes('360')) height = 360;
        else if (formatId.includes('240')) height = 240;
        else if (formatId.includes('144')) height = 144;

        // Prefer h264 (avc1) to guarantee remux-only merge (no transcode), with fallback to any codec at target height
        const minHeight = Math.max(144, Math.round(height * 0.72));
        const isExactId = /^\d+$/.test(formatId) || formatId.includes('+');

        const formatArg = isExactId
          ? (formatId.includes('+') ? formatId : `${formatId}+bestaudio/${formatId}/best`)
          : [
              `bestvideo[height<=${height}][height>=${minHeight}][vcodec^=avc1]+bestaudio[ext=m4a]`,
              `bestvideo[height<=${height}][height>=${minHeight}]+bestaudio`,
              `bestvideo[height<=${height}]+bestaudio`,
              `best[height<=${height}]`,
              `bestvideo+bestaudio`,
              `best`,
            ].join('/');

        logger.info('yt-dlp format selection', { formatId, height, formatArg: formatArg.slice(0, 120) });

        args.push(
          '-f',
          formatArg,
          '--merge-output-format',
          'mp4',
          '--concurrent-fragments',
          '16',
          '-o',
          tempOutputFile,
          media.sourceUrl
        );
      }

      const runner = getYtDlpCommand();
      if (!runner) {
        return reject(new Error('yt-dlp engine executable not found.'));
      }

      onProgress?.({ percent: 8, stage: 'Connecting to media server...' });

      const child = spawn(/*turbopackIgnore: true*/ runner.cmd, [...runner.prefixArgs, ...args]);
      let isAudioStream = false;
      let stderrOutput = '';

      // Safety timeout: kill child if it hangs longer than 75s (prevents stuck UI)
      const downloadTimeout = setTimeout(() => {
        try { child.kill('SIGKILL'); } catch {}
        try { if (fs.existsSync(tempOutputFile)) fs.unlinkSync(tempOutputFile); } catch {}
        logger.warn('Download killed by safety timeout (75s)', { cacheToken });
        reject(new Error('Media stream processing timed out.'));
      }, 75_000);

      child.stdout.on('data', (chunk) => {
        const text = chunk.toString();
        const lines = text.split(/[\r\n]+/);
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          // Transition to audio stream
          if (trimmed.includes('Destination:') && (trimmed.includes('f140') || trimmed.includes('.m4a') || trimmed.includes('.opus') || trimmed.includes('audio'))) {
            isAudioStream = true;
          }

          // Progress match: [download]  50.6% of   31.47MiB at    2.20MiB/s ETA 00:07
          const dlMatch = trimmed.match(/\[download\]\s+([0-9.]+)%\s+of\s+~?([0-9.]+[A-Za-z]+)\s+at\s+([0-9.]+[A-Za-z]+\/s)/);
          if (dlMatch) {
            const rawPct = parseFloat(dlMatch[1]);
            const totalSize = dlMatch[2];
            let speed = dlMatch[3];

            // Smooth out misleading initial socket handshake speed (<20% KiB/s)
            if (speed.toLowerCase().includes('kib') && rawPct < 20) {
              speed = 'High Speed';
            }

            let overallPct: number;
            let stage: string;
            if (isMp3) {
              overallPct = Math.min(88, Math.round(5 + (rawPct * 0.83)));
              stage = `Downloading audio: ${rawPct.toFixed(0)}% (${speed})`;
            } else if (!isAudioStream) {
              overallPct = Math.min(75, Math.round(5 + (rawPct * 0.70)));
              stage = `Downloading video: ${rawPct.toFixed(0)}% (${speed})`;
            } else {
              overallPct = Math.min(90, Math.round(75 + (rawPct * 0.15)));
              stage = `Downloading audio: ${rawPct.toFixed(0)}% (${speed})`;
            }

            onProgress?.({
              percent: overallPct,
              stage,
              speed,
              total: totalSize,
            });
          } else if (trimmed.includes('[Merger]') || trimmed.includes('Merging formats')) {
            onProgress?.({
              percent: 92,
              stage: 'Merging audio and video streams...',
            });
          }
        }
      });

      child.stderr.on('data', (chunk) => {
        stderrOutput += chunk.toString();
      });

      child.on('error', (err) => {
        cachedCommand = null;
        try {
          if (fs.existsSync('/tmp/yt-dlp')) fs.unlinkSync('/tmp/yt-dlp');
        } catch {}
        reject(new Error(`Failed to start yt-dlp engine: ${err.message}`));
      });

      child.on('close', async (exitCode) => {
        clearTimeout(downloadTimeout);
        if (fs.existsSync(tempOutputFile)) {
          try {
            onProgress?.({
              percent: 95,
              stage: 'Verifying file integrity and playback...',
            });

            // Parse expected duration in seconds from media metadata (e.g. "16:45" or "01:15:30")
            let expectedDurationSeconds: number | undefined;
            if (media.duration) {
              const parts = media.duration.split(':').map(Number);
              if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                expectedDurationSeconds = parts[0] * 60 + parts[1];
              } else if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
                expectedDurationSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
              }
            }

            // Server-side FFmpeg integrity, stream & playback verification
            const validation = await validateMediaFile(tempOutputFile, {
              expectedDurationSeconds,
              isAudioOnly: isMp3,
              checkDecoding: false,
              timeoutMs: 8000,
            });

            if (!validation.isValid) {
              try { fs.unlinkSync(tempOutputFile); } catch {}
              return reject(new Error(`Download validation failed: ${validation.error}`));
            }

            // Resolution validation: log if downloaded quality is below requested
            if (!isMp3 && validation.probe.resolution) {
              const requestedHeight = parseInt(formatId.replace(/[^0-9]/g, ''), 10) || 0;
              const actualHeight = parseInt(validation.probe.resolution.split('x')[1], 10) || 0;
              if (requestedHeight > 0 && actualHeight > 0 && actualHeight < requestedHeight * 0.65) {
                logger.warn('Resolution mismatch after download', {
                  requested: `${requestedHeight}p`, actual: validation.probe.resolution,
                  formatId, videoId,
                });
              }
            }

            // Store validated height so future cache hits skip FFmpeg probe entirely
            if (!isMp3 && validation.probe.resolution) {
              const validatedH = parseInt(validation.probe.resolution.split('x')[1], 10) || 0;
              if (validatedH > 0) validatedCacheHeights.set(cacheToken, validatedH);
            }

            logger.info('Download validated', {
              videoId, formatId,
              fileSize: validation.fileSizeFormatted,
              resolution: validation.probe.resolution || 'N/A',
              duration: validation.probe.durationSeconds + 's',
              codec: validation.probe.videoCodec || validation.probe.audioCodec || 'N/A',
            });

            fs.copyFileSync(tempOutputFile, cachedFilePath);
            try { fs.unlinkSync(tempOutputFile); } catch {}
            const cleanTitle = sanitizeFilename(media.title || 'media', targetExt);
            onProgress?.({
              percent: 100,
              stage: 'Completed',
              total: validation.fileSizeFormatted,
            });
            return resolve({
              serveUrl: `/api/download/serve?token=${safeEncodeURIComponent(cacheToken)}&title=${safeEncodeURIComponent(cleanTitle)}&ext=${targetExt}`,
              fileSizeBytes: validation.fileSizeBytes,
              fileSizeFormatted: validation.fileSizeFormatted,
              resolution: validation.probe.resolution,
              duration: validation.probe.durationSeconds ? `${Math.round(validation.probe.durationSeconds)}s` : undefined,
            });
          } catch (e: unknown) {
            try { if (fs.existsSync(tempOutputFile)) fs.unlinkSync(tempOutputFile); } catch {}
            const err = e as Error;
            return reject(new Error(`Failed to process validated media file: ${err.message}`));
          }
        }

        if (exitCode !== 0) {
          const errLines = stderrOutput
            .split('\n')
            .map((l) => l.trim())
            .filter((l) => Boolean(l) && !l.startsWith('WARNING:'));
          const errorLine = errLines.find((l) => l.startsWith('ERROR:')) || errLines[0] || `Process exited with code ${exitCode}`;
          const cleanErr = errorLine.replace(/^ERROR:\s*(\[.*?\]\s*)?/i, '').trim();

          let errCode = 'YOUTUBE_DOWNLOAD_FAILED';
          const lower = cleanErr.toLowerCase();
          if (lower.includes('sign in') || lower.includes('bot') || lower.includes('confirm you') || lower.includes('private')) {
            errCode = 'YOUTUBE_AUTH_REQUIRED';
          } else if (lower.includes('rate') || lower.includes('429') || lower.includes('too many')) {
            errCode = 'YOUTUBE_RATE_LIMITED';
          } else if (lower.includes('format') || lower.includes('requested format not available')) {
            errCode = 'YOUTUBE_FORMAT_UNAVAILABLE';
          } else if (lower.includes('timed out') || lower.includes('timeout')) {
            errCode = 'YOUTUBE_TIMEOUT';
          }

          logger.diagnostic({
            platform: isYouTube ? 'youtube' : 'other',
            normalizedUrl: media.sourceUrl,
            videoId,
            operation: 'download',
            providerUsed: 'yt-dlp',
            responseStatus: 'failed',
            errorCategory: errCode,
            downloaderExitCode: exitCode,
            selectedFormatId: formatId,
          });

          const err = new Error(cleanErr || `Download failed with exit code ${exitCode}`);
          (err as unknown as { code: string }).code = errCode;
          return reject(err);
        }

        reject(new Error('Download completed but target file was not generated.'));
      });
    });

    inflightDownloads.set(cacheToken, downloadPromise);
    downloadPromise.finally(() => {
      inflightDownloads.delete(cacheToken);
    });

    return downloadPromise;
  },

  /**
   * Extracts direct playable/downloadable stream URL for a given format.
   */
  async getStreamUrl(targetUrl: string, formatId: string): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error('yt-dlp engine executable not found in bin directory.');
    }

    return new Promise((resolve, reject) => {
      const isMp3 =
        formatId.toLowerCase().includes('mp3') ||
        formatId.toLowerCase().includes('audio');

      const isYouTube = targetUrl.includes('youtube.com') || targetUrl.includes('youtu.be');

      let formatArg: string;
      const args: string[] = ['-g', '--no-playlist'];

      if (isYouTube) {
        const nodeRuntime = process.execPath ? `node:${process.execPath}` : 'node';
        args.push('--js-runtimes', nodeRuntime);
        args.push('-4');
        args.push('--extractor-args', 'youtube:player_client=android,web');
        const ytCookies = getCookiesPath('youtube');
        if (ytCookies) {
          args.push('--cookies', ytCookies);
        }
        if (isMp3) {
          formatArg = 'bestaudio/ba/140/251';
        } else if (formatId.includes('1080')) {
          formatArg = 'bestvideo[height<=1080][vcodec^=avc1]+bestaudio/bestvideo[height<=1080]+bestaudio/best[height<=1080]/best';
        } else if (formatId.includes('720')) {
          formatArg = 'bestvideo[height<=720][vcodec^=avc1]+bestaudio/bestvideo[height<=720]+bestaudio/best[height<=720]/best';
        } else if (formatId.includes('480')) {
          formatArg = 'bestvideo[height<=480][vcodec^=avc1]+bestaudio/bestvideo[height<=480]+bestaudio/best[height<=480]/best';
        } else {
          formatArg = 'bestvideo[height<=360][vcodec^=avc1]+bestaudio/bestvideo[height<=360]+bestaudio/best[height<=360]/best';
        }
      } else {
        formatArg = isMp3 ? 'ba/bestaudio' : 'b/best';
      }

      args.push('-f', formatArg);

      const cookies = getCookiesPath();
      if (cookies) {
        args.push('--cookies', cookies);
      }

      args.push(targetUrl);

      const runner = getYtDlpCommand();
      if (!runner) {
        return reject(new Error('yt-dlp executable not available.'));
      }

      execFile(
        /*turbopackIgnore: true*/ runner.cmd,
        [...runner.prefixArgs, ...args],
        { timeout: 18000 },
        (error, stdout, stderr) => {
          if (error) {
            if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
              cachedCommand = null;
            }
            return reject(new Error(stderr || error.message));
          }
          const lines = stdout.trim().split(/\r?\n/).map((l) => l.trim()).filter((l) => l.startsWith('http'));
          const streamUrl = lines[0];
          if (!streamUrl) {
            return reject(new Error('Unable to extract direct stream URL'));
          }
          resolve(streamUrl);
        }
      );
    });
  },
};
