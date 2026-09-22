const BASE_URL = 'https://mediakit.website';

const items = [
  { platform: 'YouTube HQ (720p)', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', formatId: '720p' },
  { platform: 'YouTube Audio (MP3)', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', formatId: 'mp3' },
  { platform: 'TikTok HD', url: 'https://www.tiktok.com/@tiktok/video/7106594312292453675', formatId: 'hd' },
  { platform: 'Instagram Reel', url: 'https://www.instagram.com/reel/C-c_nU9oWvQ/', formatId: 'hd' },
  { platform: 'Facebook Video', url: 'https://www.facebook.com/watch/?v=10153231379946729', formatId: 'hd' },
  { platform: 'Pinterest Pin', url: 'https://www.pinterest.com/pin/1149722302831888/', formatId: 'photo_orig' },
];

async function checkAll() {
  for (const item of items) {
    console.log(`\n========================================`);
    console.log(`Testing: ${item.platform}`);
    console.log(`URL: ${item.url} | Format: ${item.formatId}`);
    try {
      const res = await fetch(`${BASE_URL}/api/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: item.url, formatId: item.formatId })
      });
      const data = await res.json();
      console.log('Result:', JSON.stringify(data, null, 2));
    } catch (e) {
      console.log('Error:', e.message);
    }
  }
}

checkAll();
