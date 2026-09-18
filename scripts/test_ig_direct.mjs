async function testIGDirect() {
  const shortcode = 'C32sJ12r2l4';
  const urls = [
    `https://www.instagram.com/reel/${shortcode}/embed/captioned/`,
    `https://www.instagram.com/p/${shortcode}/embed/captioned/`,
  ];

  for (const u of urls) {
    try {
      console.log('Fetching:', u);
      const res = await fetch(u, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      });
      console.log('Status:', res.status);
      const html = await res.text();
      console.log('HTML len:', html.length);
      const videoMatch = html.match(/video_url":"([^"]+)"/) ||
                         html.match(/<video[^>]+src="([^"]+)"/) ||
                         html.match(/"playable_url":"([^"]+)"/);
      console.log('Video match:', !!videoMatch);
      if (videoMatch) {
        console.log('Found video url:', videoMatch[1].replace(/\\u0026/g, '&').replace(/\\\//g, '/').slice(0, 80));
      }
    } catch (e) {
      console.log('Error:', e.message);
    }
  }
}

testIGDirect();
