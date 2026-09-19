import fs from 'fs';
import path from 'path';
import os from 'os';
import { PinterestAdapter } from '../src/lib/providers/pinterest';
import { validateMediaFile } from '../src/lib/media-validator';

async function runPinterestRegression() {
  console.log('--- STARTING PINTEREST REGRESSION TEST ---');
  const pinterest = new PinterestAdapter();
  // Standard public pin
  const testUrl = 'https://www.pinterest.com/pin/1149722302831888/';

  console.log('Target URL:', testUrl);
  const startTime = Date.now();

  const info = await pinterest.getMediaInfo(testUrl);
  console.log('Metadata extracted:');
  console.log('  Title:', info.title);
  console.log('  Author:', info.author);
  console.log('  Formats count:', info.formats.length);
  console.log('  Thumbnail:', info.thumbnailUrl ? 'Found' : 'Missing');

  if (!info.formats || info.formats.length === 0) {
    throw new Error('Pinterest: No formats returned');
  }

  const selectedFormat = info.formats[0];
  const dlResult = await pinterest.download(info, selectedFormat.id);
  if (!dlResult.success || !dlResult.downloadUrl) {
    throw new Error(`Pinterest: Download failed: ${dlResult.message}`);
  }
  console.log('Download URL generated:', dlResult.downloadUrl.slice(0, 100));

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`--- PINTEREST REGRESSION PASSED in ${elapsed}s ---`);
}

runPinterestRegression().catch((err) => {
  console.error('--- PINTEREST REGRESSION FAILED ---', err);
  process.exit(1);
});
