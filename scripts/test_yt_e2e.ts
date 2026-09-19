import fs from 'fs';
import path from 'path';
import os from 'os';
import { YouTubeAdapter } from '../src/lib/providers/youtube';
import { validateMediaFile } from '../src/lib/media-validator';

async function testYouTubeE2E() {
  console.log('--- STARTING YOUTUBE E2E TEST ---');
  const youtube = new YouTubeAdapter();
  const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

  console.log('1. Fetching authentic media-info for:', testUrl);
  const startTime = Date.now();
  const info = await youtube.getMediaInfo(testUrl);

  console.log('✓ Metadata:');
  console.log('  Title:', info.title);
  console.log('  Author:', info.author);
  console.log('  Duration:', info.duration);
  console.log('  Formats count:', info.formats.length);
  console.log('  First 4 Formats:');
  info.formats.slice(0, 4).forEach((f) => {
    console.log(`    - [${f.id}] ${f.quality} (${f.resolution}): ${f.fileSize || 'No size'}`);
  });

  if (!info.duration || info.duration === '00:15') {
    throw new Error(`Invalid duration returned: ${info.duration}`);
  }

  // Test 720p download
  console.log('\n2. Testing 720p Video Download & Remuxing...');
  const dlResult = await youtube.download(info, '720p', (prog) => {
    console.log(`  [Progress] ${prog.percent}%: ${prog.stage}`);
  });

  console.log('✓ Download result:', dlResult);
  if (!dlResult.success || !dlResult.downloadUrl) {
    throw new Error('Download failed: ' + dlResult.message);
  }

  // Resolve file from /api/download/serve?token=...
  const urlParams = new URL(dlResult.downloadUrl, 'http://localhost:3000');
  const token = urlParams.searchParams.get('token');
  const ext = urlParams.searchParams.get('ext') || 'mp4';
  const localFile = path.join(os.tmpdir(), 'mediakit_storage', `${token}.${ext}`);

  console.log('Probing generated file on disk:', localFile);
  if (!fs.existsSync(localFile)) {
    throw new Error(`Generated file does not exist at: ${localFile}`);
  }

  const validation = await validateMediaFile(localFile, { checkDecoding: true });
  console.log('✓ Validation report:', {
    isValid: validation.isValid,
    size: validation.fileSizeFormatted,
    resolution: validation.probe.resolution,
    duration: validation.probe.durationSeconds + 's',
    videoCodec: validation.probe.videoCodec,
    audioCodec: validation.probe.audioCodec,
    decodingVerified: validation.decodingVerified,
  });

  if (!validation.isValid) {
    throw new Error('Media file validation failed: ' + validation.error);
  }

  const height = parseInt(validation.probe.resolution?.split('x')[1] || '0', 10);
  if (height < 700 || height > 750) {
    throw new Error(`Expected ~720p height but got ${height}p (${validation.probe.resolution})`);
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n--- YOUTUBE 720p TEST PASSED IN ${elapsed}s ---`);

  // Test 3: Audio Extraction (MP3) for a short video
  console.log('\n3. Testing YouTube Audio (MP3) extraction for: https://www.youtube.com/watch?v=jNQXAC9IVRw');
  const shortInfo = await youtube.getMediaInfo('https://www.youtube.com/watch?v=jNQXAC9IVRw');
  console.log('✓ Title:', shortInfo.title);
  const audioResult = await youtube.download(shortInfo, 'mp3', (p) => {
    console.log(`  [Audio Progress] ${p.percent}%: ${p.stage}`);
  });
  console.log('✓ Audio Result:', audioResult);
  if (!audioResult.success || !audioResult.downloadUrl) {
    throw new Error('Audio download failed: ' + audioResult.message);
  }
  console.log('--- ALL YOUTUBE TESTS PASSED ---');
}

testYouTubeE2E().catch((err) => {
  console.error('--- YOUTUBE TEST FAILED ---', err);
  process.exit(1);
});
