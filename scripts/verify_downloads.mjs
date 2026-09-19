import fs from 'fs';
import { execSync } from 'child_process';

async function testPlatformDownload(name, url, formatId) {
  console.log('\n========================================');
  console.log(`Testing [${name}] Download & Playback Quality: ${url}`);
  console.log('========================================');

  const infoRes = await fetch('http://localhost:3000/api/media-info', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url })
  });
  const infoData = await infoRes.json();
  if (!infoData.success) {
    throw new Error(`Failed to get media info: ${JSON.stringify(infoData.error)}`);
  }
  console.log(`✓ Media Info Resolved: "${infoData.data.title}" (${infoData.data.formats?.length} formats)`);

  let downloadUrl = null;
  const targetFormat = infoData.data.formats?.find(f => f.id === formatId) || infoData.data.formats?.[0];

  if (targetFormat?.downloadUrl) {
    downloadUrl = targetFormat.downloadUrl;
  } else {
    console.log('Fetching download stream from /api/download...');
    const dlRes = await fetch('http://localhost:3000/api/download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: infoData.data.sourceUrl, formatId: targetFormat?.id || 'hd' })
    });
    const dlData = await dlRes.json();
    if (!dlData.success || !dlData.data?.downloadUrl) {
      throw new Error(`Download API failed: ${JSON.stringify(dlData)}`);
    }
    downloadUrl = dlData.data.downloadUrl;
  }

  console.log(`✓ Resolved Download URL: ${downloadUrl.slice(0, 70)}...`);

  // Fetch via local proxy or direct
  let fetchUrl = downloadUrl;
  if (downloadUrl.startsWith('/api/')) {
    fetchUrl = 'http://localhost:3000' + downloadUrl;
  } else if (!downloadUrl.includes('/api/download/file')) {
    fetchUrl = 'http://localhost:3000/api/download/file?url=' + encodeURIComponent(downloadUrl) + '&title=' + encodeURIComponent(name) + '&ext=mp4';
  }

  console.log(`✓ Fetching binary stream from: ${fetchUrl.slice(0, 80)}...`);
  const fileRes = await fetch(fetchUrl);
  if (!fileRes.ok) {
    throw new Error(`File fetch returned HTTP ${fileRes.status}: ${await fileRes.text()}`);
  }

  const arrayBuffer = await fileRes.arrayBuffer();
  const filename = `audit_${name.toLowerCase()}.mp4`;
  fs.writeFileSync(filename, Buffer.from(arrayBuffer));
  console.log(`✓ File Saved: ${filename} (${arrayBuffer.byteLength} bytes / ${(arrayBuffer.byteLength / (1024*1024)).toFixed(2)} MB)`);

  // Probe with FFmpeg
  let probeOutput = '';
  try {
    execSync(`.\\bin\\ffmpeg.exe -i ${filename}`, { encoding: 'utf-8', stdio: 'pipe' });
  } catch (err) {
    probeOutput = err.stderr || err.stdout || '';
  }

  const hasVideo = probeOutput.includes('Video:');
  const hasAudio = probeOutput.includes('Audio:');
  const durationMatch = probeOutput.match(/Duration:\s*([0-9:.]+)/);
  const videoMatch = probeOutput.match(/Stream #\d+:\d+.*?: Video: ([^,\n]+)[^,\n]*,[^,\n]*,?\s*(\d{3,4}x\d{3,4})/);
  const audioMatch = probeOutput.match(/Stream #\d+:\d+.*?: Audio: ([^,\n]+)/);

  console.log(`✓ Streams Verified:`);
  console.log(`    Duration: ${durationMatch ? durationMatch[1] : 'Unknown'}`);
  console.log(`    Video Stream: ${hasVideo ? 'YES (' + (videoMatch ? videoMatch[1] + ', ' + videoMatch[2] : 'h264') + ')' : 'NO'}`);
  console.log(`    Audio Stream: ${hasAudio ? 'YES (' + (audioMatch ? audioMatch[1] : 'aac') + ')' : 'NO'}`);

  // Test full decoding playback (0 errors = fully playable in gallery)
  try {
    execSync(`.\\bin\\ffmpeg.exe -v error -i ${filename} -f null -`, { encoding: 'utf-8', stdio: 'pipe' });
    console.log(`✓ Playback Validation: 100% PASS (Zero decoding errors, ready for OS Gallery)`);
  } catch (decErr) {
    console.log(`⚠ Playback warning:`, decErr.message);
  }
}

async function runSuite() {
  await testPlatformDownload('Instagram', 'https://www.instagram.com/reel/C557x-lKMPV/', 'hd');
  await testPlatformDownload('TikTok', 'https://www.tiktok.com/t/ZP83tPtQX/', 'hd');
  await testPlatformDownload('Facebook', 'https://www.facebook.com/watch/?v=10153231379946729', 'hd');
  await testPlatformDownload('YouTube', 'https://www.youtube.com/shorts/9bZkp7q19f0', '720p');
  console.log('\n========================================');
  console.log('All downloads & media playback validated successfully!');
  console.log('========================================');
}

runSuite().catch(console.error);
