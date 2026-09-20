import { YouTubeAdapter } from '../src/lib/providers/youtube';
import { validateMediaFile } from '../src/lib/media-validator';
import path from 'path';
import os from 'os';
import fs from 'fs';

async function testLongVideo() {
  console.log('--- STARTING LONG VIDEO TEST ---');
  const youtube = new YouTubeAdapter();
  const testUrl = 'https://www.youtube.com/watch?v=GLoeAJUcz38';

  console.log('1. Fetching authentic metadata for long video:', testUrl);
  const info = await youtube.getMediaInfo(testUrl);

  console.log('✓ Metadata:');
  console.log('  Title:', info.title);
  console.log('  Author:', info.author);
  console.log('  Duration:', info.duration);
  console.log('  Formats count:', info.formats.length);

  // Download 360p / fast format to verify complete duration and integrity
  const targetFmt = info.formats.find(f => f.id === '360p' || f.id.includes('360')) || info.formats[info.formats.length - 1];
  console.log(`\n2. Downloading format [${targetFmt.id}] (${targetFmt.quality})...`);

  const dlResult = await youtube.download(info, targetFmt.id, (prog) => {
    if (prog.percent % 20 === 0 || prog.percent === 100 || prog.stage.includes('Merging') || prog.stage.includes('Verifying')) {
      console.log(`  [Progress] ${prog.percent}%: ${prog.stage}`);
    }
  });

  console.log('✓ Download complete, verifying file on disk...');
  const urlParams = new URL(dlResult.downloadUrl!, 'http://localhost:3000');
  const token = urlParams.searchParams.get('token');
  const ext = urlParams.searchParams.get('ext') || 'mp4';
  const localFile = path.join(os.tmpdir(), 'mediakit_storage', `${token}.${ext}`);

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
    throw new Error('Validation failed: ' + validation.error);
  }

  // Duration should be approximately 15 minutes (900 seconds)
  if (validation.probe.durationSeconds < 800) {
    throw new Error(`Expected >800s duration for 15-min video, but got ${validation.probe.durationSeconds}s`);
  }

  console.log('--- LONG VIDEO TEST PASSED COMPLETELY ---');
}

testLongVideo().catch(err => {
  console.error('--- LONG VIDEO TEST FAILED ---', err);
  process.exit(1);
});
