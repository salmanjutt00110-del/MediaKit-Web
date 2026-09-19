import { YouTubeAdapter } from '../src/lib/providers/youtube';
import { TikTokAdapter } from '../src/lib/providers/tiktok';
import { InstagramAdapter } from '../src/lib/providers/instagram';
import { FacebookAdapter } from '../src/lib/providers/facebook';
import { PinterestAdapter } from '../src/lib/providers/pinterest';

async function verifyAll() {
  console.log('========================================================');
  console.log('       MEDIAKIT MULTI-PLATFORM VERIFICATION SUITE       ');
  console.log('========================================================\n');

  const tests = [
    {
      name: 'TikTok Video',
      adapter: new TikTokAdapter(),
      url: 'https://www.tiktok.com/t/ZP83tPtQX/',
    },
    {
      name: 'Pinterest Pin',
      adapter: new PinterestAdapter(),
      url: 'https://www.pinterest.com/pin/1149722302831888/',
    },
    {
      name: 'YouTube Video',
      adapter: new YouTubeAdapter(),
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    },
    {
      name: 'YouTube Shorts',
      adapter: new YouTubeAdapter(),
      url: 'https://www.youtube.com/shorts/0e3GPea1Tyg',
    },
    {
      name: 'Facebook Video/Reel',
      adapter: new FacebookAdapter(),
      url: 'https://www.facebook.com/share/r/1Bu9dcvRh/',
    },
    {
      name: 'Instagram Reel',
      adapter: new InstagramAdapter(),
      url: 'https://www.instagram.com/reel/C-c_nU9oWvQ/',
    },
  ];

  let passed = 0;
  let failed = 0;

  for (const t of tests) {
    console.log(`Testing [${t.name}]`);
    console.log(`URL: ${t.url}`);
    const start = Date.now();
    try {
      const info = await t.adapter.getMediaInfo(t.url);
      const elapsed = ((Date.now() - start) / 1000).toFixed(2);
      console.log(`  ✓ Detected: ${info.platform}`);
      console.log(`  ✓ Title: ${info.title}`);
      console.log(`  ✓ Author: ${info.author}`);
      console.log(`  ✓ Duration: ${info.duration || 'N/A'}`);
      console.log(`  ✓ Thumbnail: ${info.thumbnailUrl ? 'Found (' + info.thumbnailUrl.slice(0, 40) + '...)' : 'None'}`);
      console.log(`  ✓ Formats count: ${info.formats?.length || 0}`);
      if (info.formats && info.formats.length > 0) {
        console.log(`  ✓ Top format: [${info.formats[0].id}] ${info.formats[0].quality} (${info.formats[0].resolution || 'no res'})`);
      }
      console.log(`  ✓ Time: ${elapsed}s\n`);
      passed++;
    } catch (err: any) {
      const elapsed = ((Date.now() - start) / 1000).toFixed(2);
      console.error(`  ✗ FAILED in ${elapsed}s: ${err.message}\n`);
      failed++;
    }
  }

  console.log('========================================================');
  console.log(`RESULTS: ${passed} passed, ${failed} failed`);
  console.log('========================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

verifyAll().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
