import fs from 'fs';
import path from 'path';
import os from 'os';
import { YouTubeAdapter } from '../src/lib/providers/youtube';
import { TikTokAdapter } from '../src/lib/providers/tiktok';
import { InstagramAdapter } from '../src/lib/providers/instagram';
import { FacebookAdapter } from '../src/lib/providers/facebook';
import { PinterestAdapter } from '../src/lib/providers/pinterest';
import { validateMediaFile } from '../src/lib/media-validator';

interface TestResult {
  platform: string;
  url: string;
  title: string;
  format: string;
  fileSize: string;
  resolution: string;
  codecs: string;
  duration: string;
  decodingVerified: boolean;
  status: 'PASS' | 'FAIL';
  timeSeconds: string;
}

async function verifyPlatformDownload(
  platformName: string,
  provider: any,
  url: string,
  preferredFormat?: string
): Promise<TestResult> {
  const t0 = Date.now();
  console.log(`\n======================================================`);
  console.log(`[${platformName}] Testing download: ${url}`);
  console.log(`======================================================`);

  const info = await provider.getMediaInfo(url);
  console.log(`  ✓ Title: "${info.title}"`);
  console.log(`  ✓ Formats: ${info.formats?.length} available`);

  const format = preferredFormat
    ? (info.formats.find((f: any) => f.id === preferredFormat || f.quality === preferredFormat) || info.formats[0])
    : info.formats[0];

  console.log(`  → Selected Format: ${format.id} (${format.quality || format.resolution || 'default'})`);

  const dlResult = await provider.download(info, format.id);
  if (!dlResult.success || !dlResult.downloadUrl) {
    throw new Error(`Download generation failed: ${dlResult.message}`);
  }

  let tempFile = '';
  if (dlResult.downloadUrl.includes('/api/download/serve')) {
    const tokenMatch = dlResult.downloadUrl.match(/token=([a-zA-Z0-9_-]+)/);
    const extMatch = dlResult.downloadUrl.match(/ext=([a-zA-Z0-9]+)/);
    const filename = `${tokenMatch[1]}.${extMatch ? extMatch[1] : 'mp4'}`;
    tempFile = path.join(os.tmpdir(), 'mediakit_storage', filename);
  } else {
    let fetchUrl = dlResult.downloadUrl;
    if (fetchUrl.startsWith('/api/download/file')) {
      const parsed = new URL(fetchUrl, 'http://localhost:3000');
      fetchUrl = parsed.searchParams.get('url') || fetchUrl;
    }

    const resp = await fetch(fetchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Referer: url,
      },
    });

    if (!resp.ok) {
      throw new Error(`Stream fetch returned HTTP ${resp.status}`);
    }

    const buf = Buffer.from(await resp.arrayBuffer());
    tempFile = path.join(os.tmpdir(), `master_${platformName.toLowerCase()}_${Date.now()}.mp4`);
    fs.writeFileSync(tempFile, buf);
  }

  const stat = fs.statSync(tempFile);
  const isAudio = format.id.includes('mp3') || format.id.includes('audio');
  const isPhoto = format.id.includes('photo') || format.id.includes('image');

  const validation = await validateMediaFile(tempFile, {
    checkDecoding: true,
    isAudioOnly: isAudio,
    isPhoto: isPhoto,
  });

  const elapsed = ((Date.now() - t0) / 1000).toFixed(2);
  const codecs = [validation.probe.videoCodec, validation.probe.audioCodec].filter(Boolean).join(' / ') || 'N/A';

  console.log(`  ✓ File Size: ${validation.fileSizeFormatted}`);
  console.log(`  ✓ Resolution: ${validation.probe.resolution || 'N/A'}`);
  console.log(`  ✓ Codecs: ${codecs}`);
  console.log(`  ✓ Playback Decoding: ${validation.decodingVerified ? 'PASS (100% playable)' : 'FAIL'}`);
  console.log(`  >>> Status: PASS in ${elapsed}s`);

  return {
    platform: platformName,
    url,
    title: (info.title || '').slice(0, 35),
    format: format.id,
    fileSize: validation.fileSizeFormatted,
    resolution: validation.probe.resolution || 'N/A',
    codecs,
    duration: validation.probe.durationSeconds ? `${validation.probe.durationSeconds}s` : 'N/A',
    decodingVerified: validation.decodingVerified,
    status: validation.isValid ? 'PASS' : 'FAIL',
    timeSeconds: `${elapsed}s`,
  };
}

async function runMasterVerification() {
  const summary: TestResult[] = [];

  // 1. YouTube Video
  try {
    const r = await verifyPlatformDownload('YouTube (Video)', new YouTubeAdapter(), 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', '720p');
    summary.push(r);
  } catch (err: any) {
    console.error('YouTube Video FAILED:', err.message);
  }

  // 2. YouTube Audio (MP3)
  try {
    const r = await verifyPlatformDownload('YouTube (Audio)', new YouTubeAdapter(), 'https://www.youtube.com/watch?v=jNQXAC9IVRw', 'mp3');
    summary.push(r);
  } catch (err: any) {
    console.error('YouTube Audio FAILED:', err.message);
  }

  // 3. TikTok Video
  try {
    const r = await verifyPlatformDownload('TikTok', new TikTokAdapter(), 'https://www.tiktok.com/t/ZP83tPtQX/', 'hd');
    summary.push(r);
  } catch (err: any) {
    console.error('TikTok FAILED:', err.message);
  }

  // 4. Instagram Reel
  try {
    const r = await verifyPlatformDownload('Instagram', new InstagramAdapter(), 'https://www.instagram.com/reel/C557x-lKMPV/', 'hd');
    summary.push(r);
  } catch (err: any) {
    console.error('Instagram FAILED:', err.message);
  }

  // 5. Facebook Video
  try {
    const r = await verifyPlatformDownload('Facebook', new FacebookAdapter(), 'https://www.facebook.com/watch/?v=10153231379946729', 'hd');
    summary.push(r);
  } catch (err: any) {
    console.error('Facebook FAILED:', err.message);
  }

  // 6. Pinterest Pin
  try {
    const r = await verifyPlatformDownload('Pinterest', new PinterestAdapter(), 'https://www.pinterest.com/pin/1149722302831888/');
    summary.push(r);
  } catch (err: any) {
    console.error('Pinterest FAILED:', err.message);
  }

  console.log('\n\n========================================================================================');
  console.log('                          ALL PLATFORMS LIVE DOWNLOAD MATRIX');
  console.log('========================================================================================');
  console.table(summary);
}

runMasterVerification().catch(console.error);
