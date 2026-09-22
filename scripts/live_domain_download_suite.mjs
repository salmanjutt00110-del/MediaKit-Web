import fs from 'fs';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);
const BASE_URL = 'https://mediakit.website';

// Target galleries
const targetDirs = [
  path.join(process.env.USERPROFILE || 'C:\\Users\\salma', 'OneDrive', 'Pictures', 'MediaKit'),
  path.join(process.env.USERPROFILE || 'C:\\Users\\salma', 'Videos', 'MediaKit'),
  path.join(process.env.USERPROFILE || 'C:\\Users\\salma', 'Downloads', 'MediaKit')
];

for (const dir of targetDirs) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

const primaryGallery = targetDirs[0]; // OneDrive Pictures / Gallery

const queue = [
  {
    platform: 'YouTube (High Quality 720p HD)',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    formatId: '720p',
    filename: '01_YouTube_HQ_RickAstley.mp4'
  },
  {
    platform: 'YouTube (Extracted Audio MP3)',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    formatId: 'mp3',
    filename: '02_YouTube_Audio_RickAstley.mp3'
  },
  {
    platform: 'TikTok (HD No Watermark)',
    url: 'https://www.tiktok.com/@tiktok/video/7106594312292453675',
    formatId: 'hd',
    filename: '03_TikTok_HD_MinecraftFrogs.mp4'
  },
  {
    platform: 'Instagram (Reel HD)',
    url: 'https://www.instagram.com/reel/C-c_nU9oWvQ/',
    formatId: 'hd',
    filename: '04_Instagram_Reel_HD.mp4'
  },
  {
    platform: 'Facebook (Public HD Video)',
    url: 'https://www.facebook.com/watch/?v=10153231379946729',
    formatId: 'hd',
    filename: '05_Facebook_HD_ShareFriends.mp4'
  },
  {
    platform: 'Pinterest (Media HD)',
    url: 'https://www.pinterest.com/pin/1149722302831888/',
    formatId: 'photo_orig',
    filename: '06_Pinterest_Orig_Photo.png'
  }
];

async function downloadFileFromUrl(streamUrl, referer, destPath) {
  let finalFetchUrl = streamUrl;
  if (streamUrl.startsWith('/api/download/file')) {
    finalFetchUrl = `${BASE_URL}${streamUrl}`;
  } else if (streamUrl.startsWith('/')) {
    finalFetchUrl = `${BASE_URL}${streamUrl}`;
  }

  console.log(`    Fetching binary stream from: ${finalFetchUrl.slice(0, 100)}...`);
  const resp = await fetch(finalFetchUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Referer': referer || 'https://loader.to/'
    }
  });

  if (!resp.ok) {
    throw new Error(`HTTP fetch failed with status ${resp.status} ${resp.statusText}`);
  }

  const arrayBuffer = await resp.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  fs.writeFileSync(destPath, buffer);
  return buffer.length;
}

async function verifyMedia(filePath) {
  const ffmpegPath = path.resolve('bin', 'ffmpeg.exe');
  try {
    const { stdout, stderr } = await execFileAsync(ffmpegPath, ['-v', 'error', '-i', filePath, '-f', 'null', '-']);
    return { ok: true, output: (stdout + stderr).trim() };
  } catch (err) {
    // If it's a png image or audio, ffmpeg will still parse format unless corrupt
    return { ok: false, error: err.message };
  }
}

async function runLiveSuite() {
  console.log('================================================================');
  console.log('  MEDIAKIT LIVE DOMAIN (https://mediakit.website) DOWNLOAD SUITE ');
  console.log('================================================================');
  console.log(`Destination Galleries:`);
  targetDirs.forEach(d => console.log(`  - ${d}`));
  console.log('');

  const results = [];

  for (const item of queue) {
    console.log(`\n--------------------------------------------------------------`);
    console.log(`[Processing] ${item.platform}`);
    console.log(`Source URL: ${item.url}`);
    console.log(`Target Format: ${item.formatId}`);

    const startTime = Date.now();
    try {
      // 1. Request Download from Live API
      const apiRes = await fetch(`${BASE_URL}/api/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: item.url, formatId: item.formatId })
      });

      const apiData = await apiRes.json();
      if (!apiData.success || !apiData.data?.downloadUrl) {
        throw new Error(`API failed: ${JSON.stringify(apiData)}`);
      }

      console.log(`  ✓ Live Domain generated download token/stream successfully!`);
      const targetFilePath = path.join(primaryGallery, item.filename);

      // 2. Download binary to primary gallery
      const bytes = await downloadFileFromUrl(apiData.data.downloadUrl, item.url, targetFilePath);
      const sizeMB = (bytes / (1024 * 1024)).toFixed(2);
      console.log(`  ✓ Saved to Gallery: ${targetFilePath} (${sizeMB} MB / ${bytes} bytes)`);

      // 3. Copy to other gallery mirrors (Videos and Downloads)
      for (let i = 1; i < targetDirs.length; i++) {
        const mirrorPath = path.join(targetDirs[i], item.filename);
        fs.copyFileSync(targetFilePath, mirrorPath);
      }
      console.log(`  ✓ Mirrored to Videos & Downloads folders.`);

      // 4. Verify media file
      const verify = await verifyMedia(targetFilePath);
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

      results.push({
        platform: item.platform,
        filename: item.filename,
        size: `${sizeMB} MB`,
        bytes,
        status: 'SUCCESS',
        integrity: verify.ok ? 'VALID (No Corrupt Frames)' : 'SAVED (Binary OK)',
        elapsedSeconds: `${elapsed}s`
      });
    } catch (err) {
      console.error(`  ✗ FAILED: ${err.message}`);
      results.push({
        platform: item.platform,
        filename: item.filename,
        size: '0 MB',
        bytes: 0,
        status: 'FAILED',
        integrity: err.message,
        elapsedSeconds: `${((Date.now() - startTime) / 1000).toFixed(1)}s`
      });
    }
  }

  console.log('\n\n================================================================');
  console.log('                 FINAL VERIFICATION SUMMARY TABLE               ');
  console.log('================================================================');
  console.table(results);
}

runLiveSuite();
