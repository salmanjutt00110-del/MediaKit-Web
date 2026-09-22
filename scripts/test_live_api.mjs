const BASE_URL = 'https://mediakit.website';

const testUrls = [
  { platform: 'YouTube (High Quality)', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', preferAudio: false },
  { platform: 'YouTube (Audio)', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', preferAudio: true },
  { platform: 'TikTok', url: 'https://www.tiktok.com/@tiktok/video/7106594312292453675', preferAudio: false },
  { platform: 'Instagram', url: 'https://www.instagram.com/reel/C-c_nU9oWvQ/', preferAudio: false },
  { platform: 'Facebook', url: 'https://www.facebook.com/watch/?v=10153231379946729', preferAudio: false },
  { platform: 'Pinterest', url: 'https://www.pinterest.com/pin/1149722302831888/', preferAudio: false }
];

async function testAll() {
  for (const t of testUrls) {
    console.log(`\nTesting ${t.platform}: ${t.url}`);
    try {
      const res = await fetch(`${BASE_URL}/api/media-info`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: t.url })
      });
      const data = await res.json();
      if (!data.success) {
        console.log(`  [FAIL] media-info:`, data.error?.message || data);
        continue;
      }
      console.log(`  [OK] Title: ${data.data.title}`);
      console.log(`  Available formats (${data.data.formats?.length || 0}):`);
      data.data.formats?.slice(0, 5).forEach(f => {
        console.log(`    - ID: ${f.id}, Quality: ${f.quality || f.resolution}, Container: ${f.container}, Type: ${f.type || f.hasVideo}`);
      });
    } catch (e) {
      console.log(`  [ERROR]:`, e.message);
    }
  }
}

testAll();
