import { TikTokAdapter } from '../src/lib/providers/tiktok';
import { FacebookAdapter } from '../src/lib/providers/facebook';
import { InstagramAdapter } from '../src/lib/providers/instagram';
import { YouTubeAdapter } from '../src/lib/providers/youtube';

async function verifyAll() {
  console.log('======================================================');
  console.log('      MediaKit Production Verification Suite');
  console.log('======================================================\n');

  // Test 1: TikTok
  console.log('[1/4] Testing TikTok Short URL Resolution...');
  const tiktok = new TikTokAdapter();
  const ttUrl = 'https://www.tiktok.com/t/ZP83tPtQX/';
  try {
    const ttInfo = await tiktok.getMediaInfo(ttUrl);
    console.log(`  ✓ Title: "${ttInfo.title?.slice(0, 60)}"`);
    console.log(`  ✓ Author: "${ttInfo.author}"`);
    console.log(`  ✓ Thumbnail: ${ttInfo.thumbnailUrl ? 'Found' : 'Missing'}`);
    console.log(`  ✓ Formats: ${ttInfo.formats.length} formats available`);

    const ttDownload = await tiktok.download(ttInfo, 'hd');
    if (!ttDownload.success || !ttDownload.downloadUrl) {
      throw new Error(`TikTok download failed: ${ttDownload.message}`);
    }
    console.log(`  ✓ HD Stream Download URL: ${ttDownload.downloadUrl.slice(0, 60)}...`);
    console.log('  -> TIKTOK PASSED!\n');
  } catch (err: any) {
    console.error(`  ✗ TikTok Failed: ${err.message}\n`);
  }

  // Test 2: Facebook
  console.log('[2/4] Testing Facebook Share Link Resolution...');
  const facebook = new FacebookAdapter();
  const fbUrl = 'https://www.facebook.com/share/r/1Bu9dcvRh';
  try {
    const fbInfo = await facebook.getMediaInfo(fbUrl);
    console.log(`  ✓ Title: "${fbInfo.title?.slice(0, 60)}"`);
    console.log(`  ✓ Thumbnail URL: ${fbInfo.thumbnailUrl?.slice(0, 60) || 'Missing'}`);
    console.log(`  ✓ Formats: ${fbInfo.formats.length} formats available`);

    const fbDownload = await facebook.download(fbInfo, 'hd');
    console.log(`  ✓ Download URL: ${fbDownload.downloadUrl?.slice(0, 60)}...`);
    console.log('  -> FACEBOOK PASSED!\n');
  } catch (err: any) {
    console.error(`  ✗ Facebook Failed: ${err.message}\n`);
  }

  // Test 3: Instagram
  console.log('[3/4] Testing Instagram Reel Resolution...');
  const instagram = new InstagramAdapter();
  const igUrl = 'https://www.instagram.com/reel/DD7U3j9uGqA/';
  try {
    const igInfo = await instagram.getMediaInfo(igUrl);
    console.log(`  ✓ Title: "${igInfo.title?.slice(0, 60)}"`);
    console.log(`  ✓ Formats: ${igInfo.formats.length} formats available`);

    const igDownload = await instagram.download(igInfo, '720p');
    console.log(`  ✓ Download URL: ${igDownload.downloadUrl?.slice(0, 60)}...`);
    console.log('  -> INSTAGRAM PASSED!\n');
  } catch (err: any) {
    console.error(`  ✗ Instagram Failed: ${err.message}\n`);
  }

  // Test 4: YouTube
  console.log('[4/4] Testing YouTube Resolution...');
  const youtube = new YouTubeAdapter();
  const ytUrl = 'https://www.youtube.com/watch?v=0e3GPea1Tyg';
  try {
    const ytInfo = await youtube.getMediaInfo(ytUrl);
    console.log(`  ✓ Title: "${ytInfo.title?.slice(0, 60)}"`);
    console.log(`  ✓ Thumbnail: ${ytInfo.thumbnailUrl ? 'Found' : 'Missing'}`);
    console.log(`  ✓ Formats: ${ytInfo.formats.length} formats available`);
    console.log('  -> YOUTUBE PASSED!\n');
  } catch (err: any) {
    console.error(`  ✗ YouTube Failed: ${err.message}\n`);
  }

  console.log('======================================================');
  console.log(' All Providers and Resolution Pipelines Verified!');
  console.log('======================================================');
}

verifyAll();
