async function testInstagramServices() {
  const shortcode = 'C32sJ12r2l4';
  const url = `https://www.instagram.com/reel/${shortcode}/`;

  // 1. SaveIG
  try {
    const formData = new URLSearchParams();
    formData.append('q', url);
    formData.append('t', 'media');
    formData.append('lang', 'en');
    const res = await fetch('https://saveig.app/api/ajaxSearch', {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'x-requested-with': 'XMLHttpRequest',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: formData.toString()
    });
    const d = await res.json();
    console.log('SaveIG status:', d.status, 'data length:', d.data?.length);
    if (d.data) {
      const match = d.data.match(/href="([^"]+)"[^>]*class="[^"]*abtn/i) || d.data.match(/href="([^"]+)"/i);
      console.log('SaveIG extracted link:', match?.[1]?.slice(0, 80));
    }
  } catch (e) {
    console.log('SaveIG error:', e.message);
  }

  // 2. SnapSave with url
  try {
    const formData = new URLSearchParams();
    formData.append('url', url);
    const res = await fetch('https://snapsave.app/action.php?lang=en', {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'origin': 'https://snapsave.app',
        'referer': 'https://snapsave.app/',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: formData.toString()
    });
    console.log('SnapSave status:', res.status);
  } catch (e) {
    console.log('SnapSave error:', e.message);
  }

  // 3. Cobalt API (free public instance)
  try {
    const res = await fetch('https://api.cobalt.tools/api/json', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url })
    });
    const d = await res.json();
    console.log('Cobalt status:', d.status, 'url:', d.url?.slice(0, 60));
  } catch (e) {
    console.log('Cobalt error:', e.message);
  }
}

testInstagramServices();
