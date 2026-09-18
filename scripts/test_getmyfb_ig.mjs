async function testGetMyFBInstagram() {
  const url = 'https://www.instagram.com/reel/C557x-lKMPV/';
  try {
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
    console.log('GetMyFB IG status:', res.status, 'html len:', html.length);
    const links = html.match(/href="([^"]+)"/gi);
    console.log('GetMyFB IG links:', links?.slice(0, 3));
  } catch (e) {
    console.log('GetMyFB IG err:', e.message);
  }
}

testGetMyFBInstagram();
