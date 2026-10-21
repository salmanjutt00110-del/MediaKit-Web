async function test() {
  const url = 'https://www.instagram.com/reel/C557x-lKMPV/';
  const formData = new URLSearchParams();
  formData.append('id', url);
  formData.append('locale', 'en');
  const res = await fetch('https://getmyfb.com/process', {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      'x-requested-with': 'XMLHttpRequest',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'referer': 'https://getmyfb.com/'
    },
    body: formData.toString()
  });
  const html = await res.text();
  const match = html.match(/href="([^"]+)"/g);
  console.log('Matches count:', match?.length);
  if (!match) return;
  const links = match.map(m => m.slice(6, -1)).filter(l => l.includes('ssscdn.io'));
  console.log('Filtered ssscdn links:', links.length);
  for (const dlUrl of links) {
    console.log('\nTesting link:', dlUrl.slice(0, 60));
    const dlRes = await fetch(dlUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://getmyfb.com/'
      }
    });
    console.log('Status:', dlRes.status, 'Content-Type:', dlRes.headers.get('content-type'), 'Content-Length:', dlRes.headers.get('content-length'));
  }
}
test();
