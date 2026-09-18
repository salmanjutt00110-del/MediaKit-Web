import fs from 'fs';

async function inspectHtml() {
  const shortcode = 'C32sJ12r2l4';
  const u = `https://www.instagram.com/reel/${shortcode}/embed/captioned/`;
  const res = await fetch(u, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    }
  });
  const html = await res.text();
  const matches = html.match(/https:[^"'\s\\]+?\.mp4[^"'\s\\]*/g);
  console.log('mp4 matches count:', matches?.length);
  if (matches) {
    matches.forEach(m => console.log('Match:', m.replace(/\\u0026/g, '&').replace(/\\\//g, '/').slice(0, 100)));
  }

  // Also look for display_url or cdninstagram
  const cdnMatches = html.match(/https:\/\/[^"'\s\\]*?cdninstagram\.com[^"'\s\\]*/g);
  console.log('cdninstagram matches count:', cdnMatches?.length);
  if (cdnMatches) {
    const unescaped = cdnMatches.map(m => m.replace(/\\u0026/g, '&').replace(/\\\//g, '/'));
    const mp4s = unescaped.filter(m => m.includes('.mp4'));
    console.log('mp4 in cdn count:', mp4s.length);
    if (mp4s.length > 0) {
      console.log('Sample mp4:', mp4s[0].slice(0, 120));
    }
  }
}

inspectHtml();
