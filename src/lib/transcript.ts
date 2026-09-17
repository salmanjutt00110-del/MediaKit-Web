import fs from 'fs';
import path from 'path';
import os from 'os';
import { execFile } from 'child_process';
import { PlatformType, MediaMetadata } from './types';
import { logger } from './logger';
import { getCookiesPath } from './ytdlp';

export interface TimedLine {
  time: string;
  text: string;
}

export interface TranscriptResult {
  success: boolean;
  platform: PlatformType;
  title: string;
  scriptText: string;
  timedLines?: TimedLine[];
  srtText?: string;
  hashtags: string[];
  source: 'subtitles' | 'captions' | 'description' | 'summary';
  language?: string;
  error?: string;
}

const isWin = process.platform === 'win32';

function getExecutablePath(): string | null {
  if (isWin) {
    const winPath = path.resolve(process.cwd(), 'bin', 'yt-dlp.exe');
    return fs.existsSync(/*turbopackIgnore: true*/ winPath) ? winPath : null;
  }
  const nixPath = path.resolve(process.cwd(), 'bin', 'yt-dlp');
  return fs.existsSync(/*turbopackIgnore: true*/ nixPath) ? nixPath : null;
}

/**
 * Extracts hashtags from any text (supports English, Urdu, Arabic, etc.)
 */
export function extractHashtags(text?: string): string[] {
  if (!text) return [];
  const matches = text.match(/#([a-zA-Z0-9_\u0600-\u06FF]+)/g);
  if (!matches) return [];
  const unique = new Set<string>();
  for (const m of matches) {
    const tag = m.trim();
    if (tag.length > 1) {
      unique.add(tag);
    }
  }
  return Array.from(unique);
}

/**
 * Cleans raw WebVTT content into clean, readable sentences and timestamped blocks
 */
export function cleanVttToText(vttContent: string): {
  plainText: string;
  timedLines: TimedLine[];
  srtText: string;
} {
  const lines = vttContent.split(/\r?\n/);
  const timedLines: TimedLine[] = [];
  const plainParagraphs: string[] = [];
  const srtBlocks: string[] = [];

  let currentTimestamp = '';
  let currentCueLines: string[] = [];
  let srtIndex = 1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Timestamp header like: 00:00:00.160 --> 00:00:02.070
    if (line.includes('-->')) {
      // Flush previous cue
      if (currentCueLines.length > 0 && currentTimestamp) {
        const text = cleanCueText(currentCueLines.join(' '));
        if (text) {
          timedLines.push({ time: formatTimeLabel(currentTimestamp), text });
          plainParagraphs.push(text);
          srtBlocks.push(`${srtIndex++}\n${currentTimestamp}\n${text}\n`);
        }
      }

      currentTimestamp = line.split(' align:')[0].split(' position:')[0].trim();
      currentCueLines = [];
      continue;
    }

    // Skip WebVTT header lines
    if (
      line === 'WEBVTT' ||
      line.startsWith('Kind:') ||
      line.startsWith('Language:') ||
      line.startsWith('NOTE') ||
      line === ''
    ) {
      continue;
    }

    currentCueLines.push(line);
  }

  // Flush last cue
  if (currentCueLines.length > 0 && currentTimestamp) {
    const text = cleanCueText(currentCueLines.join(' '));
    if (text) {
      timedLines.push({ time: formatTimeLabel(currentTimestamp), text });
      plainParagraphs.push(text);
      srtBlocks.push(`${srtIndex++}\n${currentTimestamp}\n${text}\n`);
    }
  }

  // Deduplicate consecutive identical phrases common in auto-generated captions
  const dedupedParagraphs: string[] = [];
  let lastText = '';

  for (const p of plainParagraphs) {
    if (p !== lastText && !lastText.endsWith(p)) {
      dedupedParagraphs.push(p);
      lastText = p;
    }
  }

  return {
    plainText: dedupedParagraphs.join(' ').replace(/\s+/g, ' ').trim(),
    timedLines: timedLines.filter((tl, idx, arr) => idx === 0 || tl.text !== arr[idx - 1].text),
    srtText: srtBlocks.join('\n'),
  };
}

function cleanCueText(raw: string): string {
  return raw
    .replace(/<[^>]+>/g, '') // remove <00:00:01.234><c> tags
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function formatTimeLabel(rawTimestamp: string): string {
  const start = rawTimestamp.split('-->')[0]?.trim() || '';
  const parts = start.split(':');
  if (parts.length === 3) {
    const min = parts[1];
    const sec = parts[2].split('.')[0];
    return `${min}:${sec}`;
  }
  return start.split('.')[0] || '00:00';
}

/**
 * Main engine to extract voiceover script, subtitles, description, and hashtags
 */
export async function extractMediaScriptAndHashtags(
  targetUrl: string,
  platform: PlatformType,
  mediaInfo?: MediaMetadata
): Promise<TranscriptResult> {
  const rawTitle = mediaInfo?.title || 'Media Video';
  const combinedText = `${mediaInfo?.title || ''} ${mediaInfo?.description || ''}`;
  const extractedTags = extractHashtags(combinedText);

  // 1. YouTube Subtitles / Auto-Captions via local engine
  if (platform === 'youtube' && ytDlpRunnerIsAvailable()) {
    const executable = getExecutablePath();
    if (executable) {
      const tempId = `script_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const outPrefix = path.join(os.tmpdir(), tempId);

      try {
        await new Promise<void>((resolve) => {
          const args = [
            '--skip-download',
            '--write-sub',
            '--write-auto-sub',
            '--sub-lang',
            'en,en-US,en-orig,en-GB,ur,hi,pa,es,ar,fr,de',
            '--sub-format',
            'vtt',
            '-o',
            outPrefix,
            '--no-warnings',
          ];

          const cookies = getCookiesPath();
          if (cookies) {
            args.push('--cookies', cookies);
          }

          args.push(targetUrl);

          execFile(
            /*turbopackIgnore: true*/ executable,
            args,
            { timeout: 15000 },
            (error) => {
              if (error) {
                logger.warn('Subtitles extraction returned error', { error: error.message });
              }
              resolve();
            }
          );
        });

        // Check for any created .vtt file
        const tmpDir = os.tmpdir();
        const files = fs.readdirSync(tmpDir);
        const matchingVtt = files.find(
          (f) => f.startsWith(tempId) && f.endsWith('.vtt')
        );

        if (matchingVtt) {
          const vttPath = path.join(tmpDir, matchingVtt);
          const vttContent = fs.readFileSync(vttPath, 'utf8');
          try {
            fs.unlinkSync(vttPath);
          } catch {}

          const { plainText, timedLines, srtText } = cleanVttToText(vttContent);
          if (plainText.length > 20) {
            return {
              success: true,
              platform,
              title: rawTitle,
              scriptText: plainText,
              timedLines,
              srtText,
              hashtags: extractedTags,
              source: 'subtitles',
              language: matchingVtt.split('.')[1] || 'en',
            };
          }
        }
      } catch (err: any) {
        logger.warn('YouTube transcript fetch warning', { error: err.message });
      }
    }
  }

  // 2. TikTok Voiceover Script & Captions
  if (platform === 'tiktok') {
    const text = mediaInfo?.title || '';
    if (text.length > 5) {
      return {
        success: true,
        platform,
        title: rawTitle,
        scriptText: text,
        hashtags: extractedTags,
        source: 'captions',
      };
    }
  }

  return {
    success: false,
    platform,
    title: rawTitle,
    scriptText: '',
    hashtags: extractedTags,
    source: 'summary',
  };
}

function ytDlpRunnerIsAvailable(): boolean {
  return !!getExecutablePath();
}
