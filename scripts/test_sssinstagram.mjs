async function testSSSInstagram() {
  const url = 'https://www.instagram.com/reel/C557x-lKMPV/';

  // 1. SSSInstagram
  try {
    const res = await fetch('https://sssinstagram.com/request', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'referer': 'https://sssinstagram.com/'
      },
      body: JSON.stringify({ link: url })
    });
    console.log('SSSInstagram status:', res.status);
    const d = await res.json();
    console.log('SSSInstagram result:', d);
  } catch (e) {
    console.log('SSSInstagram err:', e.message);
  }

  // 2. SaveClip
  try {
    const formData = new URLSearchParams();
    formData.append('q', url);
    formData.append('vt', 'instagram');
    const res = await fetch('https://saveclip.app/api/ajaxSearch', {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'x-requested-with': 'XMLHttpRequest',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'referer': 'https://saveclip.app/'
      },
      body: formData.toString()
    });
    console.log('SaveClip status:', res.status);
    const d = await res.json();
    console.log('SaveClip data:', typeof d.data, d.status);
    if (d.data) {
      const match = d.data.match(/href="([^"]+)"/gi);
      console.log('SaveClip links:', match?.slice(0, 3));
    }
  } catch (e) {
    console.log('SaveClip err:', e.message);
  }
}

testSSSInstagram();
