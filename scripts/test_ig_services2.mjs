async function testIGDownloaders() {
  const url = 'https://www.instagram.com/reels/C557x-lKMPV/';

  // 1. InDown.io
  try {
    const getRes = await fetch('https://indown.io/download');
    const html = await getRes.text();
    const tokenMatch = html.match(/name="_token"\s+value="([^"]+)"/i);
    if (tokenMatch) {
      const token = tokenMatch[1];
      const formData = new URLSearchParams();
      formData.append('_token', token);
      formData.append('link', url);
      const postRes = await fetch('https://indown.io/download', {
        method: 'POST',
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'cookie': getRes.headers.get('set-cookie') || '',
          'referer': 'https://indown.io/'
        },
        body: formData.toString()
      });
      const resultHtml = await postRes.text();
      console.log('InDown status:', postRes.status, 'html len:', resultHtml.length);
      const links = resultHtml.match(/href="([^"]+)"[^>]*class="[^"]*btn-group-sm/gi) || resultHtml.match(/href="([^"]+)"/gi);
      console.log('InDown sample link:', links?.slice(0, 2));
    }
  } catch (e) {
    console.log('InDown err:', e.message);
  }

  // 2. FastDL
  try {
    const res = await fetch('https://fastdl.app/c/', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'referer': 'https://fastdl.app/'
      },
      body: JSON.stringify({ url, ts: Date.now() })
    });
    console.log('FastDL status:', res.status);
    const data = await res.json();
    console.log('FastDL data:', data);
  } catch (e) {
    console.log('FastDL err:', e.message);
  }

  // 3. igram
  try {
    const formData = new URLSearchParams();
    formData.append('url', url);
    formData.append('action', 'post');
    const res = await fetch('https://igram.world/api/convert', {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'referer': 'https://igram.world/'
      },
      body: formData.toString()
    });
    console.log('igram status:', res.status);
    const d = await res.json();
    console.log('igram result:', d);
  } catch (e) {
    console.log('igram err:', e.message);
  }
}

testIGDownloaders();
