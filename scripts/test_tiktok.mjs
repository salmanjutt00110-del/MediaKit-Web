async function testAPIs() {
  const url = 'https://www.tiktok.com/@scout2015/video/6718335390845095173';

  // 1. TikWM with different params or headers
  try {
    const res = await fetch(`https://tikwm.com/api/?url=${encodeURIComponent(url)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1'
      }
    });
    const d = await res.json();
    console.log('TikWM test with valid video:', d.code, d.msg, d.data?.title?.slice(0, 30), 'play:', !!d.data?.play);
  } catch (e) {
    console.log('TikWM err:', e.message);
  }

  // 2. Tiklydown
  try {
    const res = await fetch(`https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(url)}`);
    const d = await res.json();
    console.log('Tiklydown test:', d.status || d.code, 'video:', !!(d.video || d.video_hd));
  } catch (e) {
    console.log('Tiklydown err:', e.message);
  }

  // 3. Lovetik
  try {
    const formData = new URLSearchParams();
    formData.append('query', url);
    const res = await fetch('https://lovetik.com/api/analyze', {
      method: 'POST',
      body: formData
    });
    const d = await res.json();
    console.log('Lovetik test:', d.mess || 'ok', 'links count:', d.links?.length);
  } catch (e) {
    console.log('Lovetik err:', e.message);
  }
}

testAPIs();
