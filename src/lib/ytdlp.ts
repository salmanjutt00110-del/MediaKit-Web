import { execFile, spawnSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';
import crypto from 'crypto';
import { MediaFormat, MediaMetadata, PlatformType } from './types';
import { sanitizeFilename, cleanAndDecodeTitle } from './string-utils';
import { validateMediaFile } from './media-validator';

const isWin = process.platform === 'win32';

export function getCookiesPath(): string | null {
  const candidates = [
    path.resolve(process.cwd(), 'bin', 'cookies.txt'),
    path.resolve(process.cwd(), 'bin', 'instagram_cookies.txt'),
    path.resolve(process.cwd(), 'cookies.txt'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}

interface YtDlpCommand {
  cmd: string;
  prefixArgs: string[];
}

let cachedCommand: YtDlpCommand | null = null;

function getYtDlpCommand(): YtDlpCommand | null {
  if (cachedCommand) return cachedCommand;

  // 1. Check native python with yt_dlp module (fastest, zero PyInstaller unpack overhead)
  try {
    const check = spawnSync('python', ['-m', 'yt_dlp', '--version'], { timeout: 3000 });
    if (check.status === 0) {
      cachedCommand = { cmd: 'python', prefixArgs: ['-m', 'yt_dlp'] };
      return cachedCommand;
    }
  } catch {}

  // 2. Windows standalone binary
  if (isWin) {
    const winPath = path.resolve(process.cwd(), 'bin', 'yt-dlp.exe');
    if (fs.existsSync(winPath)) {
      try {
        const check = spawnSync(winPath, ['--version'], { timeout: 3000 });
        if (check.status === 0) {
          cachedCommand = { cmd: winPath, prefixArgs: [] };
          return cachedCommand;
        }
      } catch {}
    }
  }

  // 3. Linux / Vercel Serverless environment
  const tmpBinary = '/tmp/yt-dlp';
  if (fs.existsSync(tmpBinary)) {
    try {
      fs.chmodSync(tmpBinary, 0o755);
    } catch {}
    cachedCommand = { cmd: tmpBinary, prefixArgs: [] };
    return cachedCommand;
  }

  // Bundled Linux binary
  const bundledPath = path.resolve(process.cwd(), 'bin', 'yt-dlp');
  if (fs.existsSync(bundledPath)) {
    try {
      fs.copyFileSync(bundledPath, tmpBinary);
      fs.chmodSync(tmpBinary, 0o755);
      cachedCommand = { cmd: tmpBinary, prefixArgs: [] };
      return cachedCommand;
    } catch {
      try {
        fs.chmodSync(bundledPath, 0o755);
      } catch {}
      cachedCommand = { cmd: bundledPath, prefixArgs: [] };
      return cachedCommand;
    }
  }

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
      if (isYouTube) {
        args.push('--js-runtimes', `node:${process.execPath}`);
      }

      const cookies = getCookiesPath();
      if (cookies) {
        args.push('--cookies', cookies);
      }

      args.push(targetUrl);

      execFile(
        runner.cmd,
        [...runner.prefixArgs, ...args],
        { maxBuffer: 25 * 1024 * 1024, timeout: 22000 },
        (error, stdout, stderr) => {
          if (error) {
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
                // Find highest matching video format for this height tier
                const matchingFmt = rawFormats.find((f) => f.height === tier.height && f.vcodec && f.vcodec !== 'none');
                // Also check if any format reaches this height
                const hasTier = matchingFmt || rawFormats.some((f) => f.height && f.height >= tier.height);

                if (hasTier && !seenQualities.has(tier.id)) {
                  seenQualities.add(tier.id);
                  const videoBytes = matchingFmt ? (matchingFmt.filesize || matchingFmt.filesize_approx) : undefined;
                  const totalBytes = videoBytes ? videoBytes + audioBytes : undefined;

                  formats.push({
                    id: tier.id,
                    format: 'mp4',
                    quality: tier.label,
                    resolution: tier.res,
                    hasAudio: true,
                    hasVideo: true,
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
                  downloadUrl: undefined, // Enforces server-side audio conversion
                  fileSize: formatBytes(bestAudio.filesize || bestAudio.filesize_approx),
                });
              }
            }

            // 2. Instagram Formats
            if (isInstagram) {
              const igProgressive = rawFormats.filter(
                (f) => f.ext === 'mp4' && f.url && (f.vcodec && f.vcodec !== 'none')
              );
              igProgressive.sort((a, b) => (b.height || 0) - (a.height || 0));

              for (const f of igProgressive) {
                const height = f.height || 720;
                const label = height >= 1080 ? '1080p HD (High Definition)' : height >= 720 ? '720p HD (Standard HD)' : `${height}p SD`;
                if (!seenQualities.has(label)) {
                  seenQualities.add(label);
                  formats.push({
                    id: f.format_id || `${height}p`,
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

              // If progressive formats found, also add MP3 option
              if (formats.length > 0 && formats[0].downloadUrl) {
                formats.push({
                  id: 'mp3',
                  format: 'mp3',
                  quality: 'Original Audio (MP3)',
                  hasAudio: true,
                  hasVideo: false,
                  downloadUrl: formats[0].downloadUrl,
                });
              }
            }

            // 3. Other Platforms (TikTok, Facebook, Pinterest)
            if (!isYouTube && !isInstagram) {
              const videoFormats = rawFormats.filter(
                (f) =>
                  f.vcodec &&
                  f.vcodec !== 'none' &&
                  (!f.protocol || !f.protocol.includes('m3u8'))
              );

              videoFormats.sort((a, b) => (b.height || 0) - (a.height || 0));

              for (const f of videoFormats) {
                const height = f.height;
                if (!height || height < 144) continue;
                const qualityLabel = `${height}p`;

                if (!seenQualities.has(qualityLabel)) {
                  seenQualities.add(qualityLabel);
                  formats.push({
                    id: f.format_id,
                    format: 'mp4',
                    quality: `${qualityLabel} HD`,
                    resolution: f.resolution || `${f.width || ''}x${height}`,
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
              duration: data.duration_string || (data.duration ? `${Math.floor(data.duration / 60)}:${String(data.duration % 60).padStart(2, '0')}` : undefined),
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
   * Saves to ephemeral temp storage and returns the local secure serve URL.
   */
  async downloadMedia(media: MediaMetadata, formatId: string): Promise<string> {
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
    const cleanId = videoId.replace(/[^a-zA-Z0-9_-]/g, '_');
    const cleanFormat = formatId.replace(/[^a-zA-Z0-9_-]/g, '_');
    const cacheToken = `${cleanId}_${cleanFormat}`;
    const cachedFilePath = path.join(storageDir, `${cacheToken}.${targetExt}`);

    // Return instant cached file if already processed
    if (fs.existsSync(cachedFilePath)) {
      const stats = fs.statSync(cachedFilePath);
      if (stats.size > 1024) {
        const cleanTitle = sanitizeFilename(media.title || 'media', targetExt);
        return `/api/download/serve?token=${encodeURIComponent(cacheToken)}&title=${encodeURIComponent(cleanTitle)}&ext=${targetExt}`;
      }
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

    const ffmpegPath = path.resolve(process.cwd(), 'bin', 'ffmpeg.exe');

    return new Promise((resolve, reject) => {
      const args = [
        '--js-runtimes',
        'node',
        '--no-playlist',
        '--no-part',
        '--windows-filenames',
      ];

      if (fs.existsSync(ffmpegPath)) {
        args.push('--ffmpeg-location', ffmpegPath);
      }

      const cookies = getCookiesPath();
      if (cookies) {
        args.push('--cookies', cookies);
      }

      if (isMp3) {
        args.push(
          '-x',
          '--audio-format',
          'mp3',
          '--audio-quality',
          '0',
          '--concurrent-fragments',
          '5',
          '-o',
          tempOutputFile,
          media.sourceUrl
        );
      } else {
        let height = 720;
        if (formatId.includes('2160') || formatId.includes('4k')) height = 2160;
        else if (formatId.includes('1440')) height = 1440;
        else if (formatId.includes('1080')) height = 1080;
        else if (formatId.includes('720')) height = 720;
        else if (formatId.includes('480')) height = 480;
        else if (formatId.includes('360')) height = 360;

        const formatArg = `bestvideo[height<=${height}][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=${height}]+bestaudio/best[height<=${height}]/best`;
        args.push(
          '-f',
          formatArg,
          '--merge-output-format',
          'mp4',
          '--concurrent-fragments',
          '5',
          '-o',
          tempOutputFile,
          media.sourceUrl
        );
      }

      const isYouTube = media.sourceUrl.includes('youtube.com') || media.sourceUrl.includes('youtu.be');
      if (isYouTube) {
        args.push('--extractor-args', 'youtube:player_client=android,web');
      }

      const runner = getYtDlpCommand();
      if (!runner) {
        return reject(new Error('yt-dlp engine executable not found.'));
      }

      execFile(
        runner.cmd,
        [...runner.prefixArgs, ...args],
        { timeout: 240000 },
        async (error, _stdout, stderr) => {
          // Check if file was produced despite non-zero exit or minor warning
          if (fs.existsSync(tempOutputFile)) {
            try {
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
                checkDecoding: true,
                timeoutMs: 15000,
              });

              if (!validation.isValid) {
                try { fs.unlinkSync(tempOutputFile); } catch {}
                return reject(new Error(`Download validation failed: ${validation.error}`));
              }

              fs.copyFileSync(tempOutputFile, cachedFilePath);
              try { fs.unlinkSync(tempOutputFile); } catch {}
              const cleanTitle = sanitizeFilename(media.title || 'media', targetExt);
              return resolve(`/api/download/serve?token=${encodeURIComponent(cacheToken)}&title=${encodeURIComponent(cleanTitle)}&ext=${targetExt}`);
            } catch (e: unknown) {
              try { if (fs.existsSync(tempOutputFile)) fs.unlinkSync(tempOutputFile); } catch {}
              const err = e as Error;
              return reject(new Error(`Failed to process validated media file: ${err.message}`));
            }
          }

          if (error) {
            const rawMsg = stderr ? stderr.split('\n')[0] : error.message;
            return reject(new Error(`Download failed: ${rawMsg}`));
          }

          reject(new Error('Download completed but target file was not generated.'));
        }
      );
    });
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
        args.push('--js-runtimes', 'node');
        if (isMp3) {
          formatArg = 'bestaudio/ba/140/251';
        } else if (formatId.includes('1080')) {
          formatArg = 'bestvideo[height<=1080]+bestaudio/best[height<=1080]/best';
        } else if (formatId.includes('720')) {
          formatArg = 'bestvideo[height<=720]+bestaudio/best[height<=720]/best';
        } else if (formatId.includes('480')) {
          formatArg = 'bestvideo[height<=480]+bestaudio/best[height<=480]/best';
        } else {
          formatArg = 'bestvideo[height<=360]+bestaudio/best[height<=360]/best';
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
        runner.cmd,
        [...runner.prefixArgs, ...args],
        { timeout: 18000 },
        (error, stdout, stderr) => {
          if (error) {
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
