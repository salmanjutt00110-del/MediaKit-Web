async function testTikwmDownload() {
  const url = 'https://www.tiktok.com/@scout2015/video/6718335390845095173';
  const res = await fetch(`https://tikwm.com/api/?url=${encodeURIComponent(url)}`);
  const data = await res.json();
  const playUrl = data.data?.play || data.data?.hdplay;
  console.log('TikWM playUrl:', playUrl);

  const videoRes = await fetch(playUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Referer': 'https://www.tiktok.com/'
    }
  });
  console.log('Video stream status:', videoRes.status);
  console.log('Content-Type:', videoRes.headers.get('content-type'));
  console.log('Content-Length:', videoRes.headers.get('content-length'));
}

testTikwmDownload();
