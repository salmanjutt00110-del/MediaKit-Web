import fs from 'fs';
import path from 'path';
import os from 'os';
import { TikTokAdapter } from '../src/lib/providers/tiktok';
import { validateMediaFile } from '../src/lib/media-validator';

async function runTikTokRegression() {
  console.log('--- STARTING TIKTOK REGRESSION TEST ---');
  const tiktok = new TikTokAdapter();
  const testUrl = 'https://www.tiktok.com/t/ZP83tPtQX/';

  console.log('Target URL:', testUrl);
  const startTime = Date.now();

  const info = await tiktok.getMediaInfo(testUrl);
  console.log('Metadata extracted:');
  console.log('  Title:', info.title);
  console.log('  Author:', info.author);
  console.log('  Duration:', info.duration);
  console.log('  Formats count:', info.formats.length);

  if (!info.formats || info.formats.length === 0) {
    throw new Error('TikTok: No formats returned');
  }

  const dlResult = await tiktok.download(info, 'hd');
  if (!dlResult.success || !dlResult.downloadUrl) {
    throw new Error(`TikTok: Download failed: ${dlResult.message}`);
  }
  console.log('Download URL generated:', dlResult.downloadUrl);

  // Download the stream to temp file to validate
  let streamUrl = dlResult.downloadUrl;
  if (streamUrl.startsWith('/api/download/file')) {
    const parsed = new URL(streamUrl, 'http://localhost:3000');
    streamUrl = parsed.searchParams.get('url') || streamUrl;
  }

  console.log('Fetching raw stream from:', streamUrl.slice(0, 80) + '...');
  const res = await fetch(streamUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      Referer: 'https://www.tiktok.com/',
    },
  });

  if (!res.ok) {
    throw new Error(`Stream fetch failed: HTTP ${res.status}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const tempFile = path.join(os.tmpdir(), `tiktok_regression_${Date.now()}.mp4`);
  fs.writeFileSync(tempFile, buffer);

  console.log(`Saved ${buffer.length} bytes to ${tempFile}`);

  const validation = await validateMediaFile(tempFile, { checkDecoding: true });
  console.log('Validation result:', {
    isValid: validation.isValid,
    error: validation.error,
    fileSizeFormatted: validation.fileSizeFormatted,
    resolution: validation.probe.resolution,
    durationSeconds: validation.probe.durationSeconds,
    videoCodec: validation.probe.videoCodec,
    audioCodec: validation.probe.audioCodec,
    decodingVerified: validation.decodingVerified,
  });

  try { fs.unlinkSync(tempFile); } catch {}

  if (!validation.isValid) {
    throw new Error(`Validation failed: ${validation.error}`);
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`--- TIKTOK REGRESSION PASSED in ${elapsed}s ---`);
}

runTikTokRegression().catch((err) => {
  console.error('--- TIKTOK REGRESSION FAILED ---', err);
  process.exit(1);
});
