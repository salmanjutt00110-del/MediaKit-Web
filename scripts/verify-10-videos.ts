import path from 'path';
import fs from 'fs';
import { detectPlatform } from '../src/lib/detect';
import { ytDlpRunner } from '../src/lib/ytdlp';
import { ProviderRegistry } from '../src/lib/providers';

interface TestCandidate {
  category: string;
  label: string;
  url: string;
}

const CANDIDATES: TestCandidate[] = [
  // 1. MrBeast
  {
    category: 'MrBeast',
    label: 'MrBeast - Squid Game In Real Life',
    url: 'https://www.youtube.com/watch?v=0e3GPea1Tyg',
  },
  {
    category: 'MrBeast',
    label: 'MrBeast - Press This Button To Win $100k',
    url: 'https://www.youtube.com/watch?v=GLoeAJUcz38',
  },
  {
    category: 'MrBeast',
    label: 'MrBeast - Willy Wonka Chocolate Factory',
    url: 'https://www.youtube.com/watch?v=9bqk6ZUsKyA',
  },

  // 2. IShowSpeed
  {
    category: 'IShowSpeed',
    label: 'IShowSpeed - Revealing New iPhone',
    url: 'https://www.youtube.com/watch?v=5CPAtEmHAio',
  },
  {
    category: 'IShowSpeed',
    label: 'IShowSpeed - Tests Apple Products',
    url: 'https://www.youtube.com/watch?v=XYu20kFOioY',
  },
  {
    category: 'IShowSpeed',
    label: 'IShowSpeed - In Squid Game',
    url: 'https://www.youtube.com/watch?v=9Fr-ihuFE_U',
  },

  // 3. Songs / Music
  {
    category: 'Songs / Music',
    label: 'Ishqa Ve (User Requested Song)',
    url: 'https://www.youtube.com/watch?v=j18MRhEfmPk',
  },
  {
    category: 'Songs / Music',
    label: 'Luis Fonsi - Despacito',
    url: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
  },
  {
    category: 'Songs / Music',
    label: 'Ed Sheeran - Shape of You',
    url: 'https://www.youtube.com/watch?v=JGwWNGJdvx8',
  },

  // 4. Dramas / Clips
  {
    category: 'Dramas / Clips',
    label: 'Legal Instagram Downloader (User Screenshot Video)',
    url: 'https://www.youtube.com/watch?v=zNNYy1QYKrI',
  },
  {
    category: 'Dramas / Clips',
    label: 'Rick Astley - Never Gonna Give You Up',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  },
  {
    category: 'Dramas / Clips',
    label: 'PSY - Gangnam Style',
    url: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
  },
];

async function runBatchVerification() {
  console.log('================================================================');
  console.log(' MediaKit 10-12 Batch YouTube Download Verification Test');
  console.log(' Categories: MrBeast, IShowSpeed, Songs, Dramas/Clips');
  console.log('================================================================\n');

  const results: any[] = [];
  let passedCount = 0;
  let failedCount = 0;

  for (let i = 0; i < CANDIDATES.length; i++) {
    const candidate = CANDIDATES[i];
    const index = i + 1;
    console.log(`[${index}/${CANDIDATES.length}] Testing: ${candidate.label} (${candidate.category})`);
    console.log(`URL: ${candidate.url}`);

    const startTime = Date.now();
    try {
      // Step 1: Detect
      const detection = detectPlatform(candidate.url);
      if (!detection.valid || detection.platform !== 'youtube') {
        throw new Error(`Platform detection failed: ${detection.error || 'invalid'}`);
      }

      // Step 2: Extract Info
      const provider = ProviderRegistry.getProviderForUrl(detection.normalizedUrl);
      if (!provider) throw new Error('Provider not found');

      const info = await provider.getMediaInfo(detection.normalizedUrl);
      console.log(`  ✓ Title: "${info.title.slice(0, 60)}..."`);
      console.log(`  ✓ Duration: ${info.duration || 'N/A'}, Formats found: ${info.formats?.length || 0}`);

      // Check formats
      const mp3Fmt = info.formats?.find((f) => f.format === 'mp3');
      const videoFmt =
        info.formats?.find((f) => f.quality === '720p' || f.quality === '480p' || f.quality === '360p') ||
        info.formats?.find((f) => f.format === 'mp4');

      if (!mp3Fmt && !videoFmt) {
        throw new Error('No downloadable formats available');
      }

      // Step 3: Test MP3 Download
      let mp3Path = '';
      let mp3Size = 'N/A';
      if (mp3Fmt) {
        console.log(`  → Processing MP3 (${mp3Fmt.quality})...`);
        const mp3Result = await provider.download(info, mp3Fmt.id);
        if (!mp3Result.success || !mp3Result.downloadUrl) {
          throw new Error(`MP3 processing failed: ${mp3Result.message}`);
        }
        mp3Path = mp3Result.downloadUrl;
        const localFilePath = path.join(process.cwd(), 'public', mp3Path.replace(/^\//, ''));
        if (fs.existsSync(localFilePath)) {
          const stats = fs.statSync(localFilePath);
          mp3Size = `${(stats.size / (1024 * 1024)).toFixed(2)} MB`;
          console.log(`  ✓ MP3 ready: ${mp3Path} (${mp3Size})`);
        }
      }

      // Step 4: Test Video Download (e.g. 720p / 480p)
      let vidPath = '';
      let vidSize = 'N/A';
      if (videoFmt) {
        console.log(`  → Processing Video (${videoFmt.quality})...`);
        const vidResult = await provider.download(info, videoFmt.id);
        if (!vidResult.success || !vidResult.downloadUrl) {
          throw new Error(`Video processing failed: ${vidResult.message}`);
        }
        vidPath = vidResult.downloadUrl;
        const localFilePath = path.join(process.cwd(), 'public', vidPath.replace(/^\//, ''));
        if (fs.existsSync(localFilePath)) {
          const stats = fs.statSync(localFilePath);
          vidSize = `${(stats.size / (1024 * 1024)).toFixed(2)} MB`;
          console.log(`  ✓ Video ready: ${vidPath} (${vidSize})`);
        }
      }

      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`  ✓ Completed in ${elapsed}s\n`);

      passedCount++;
      results.push({
        index,
        category: candidate.category,
        title: info.title,
        duration: info.duration,
        mp3Path,
        mp3Size,
        vidPath,
        vidSize,
        vidQuality: videoFmt?.quality,
        elapsed: `${elapsed}s`,
        status: 'SUCCESS',
      });
    } catch (err: any) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      console.error(`  ✗ Failed (${elapsed}s): ${err.message}\n`);
      failedCount++;
      results.push({
        index,
        category: candidate.category,
        label: candidate.label,
        error: err.message,
        elapsed: `${elapsed}s`,
        status: 'FAILED',
      });
    }
  }

  console.log('================================================================');
  console.log(` BATCH TEST SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED out of ${CANDIDATES.length}`);
  console.log('================================================================');

  // Save JSON report for verification artifact
  const reportPath = path.join(process.cwd(), 'scripts', 'batch-test-results.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`Report written to ${reportPath}`);
}

runBatchVerification();
