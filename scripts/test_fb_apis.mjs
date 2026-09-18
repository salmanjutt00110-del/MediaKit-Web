async function testFBApis() {
  const url = 'https://www.facebook.com/watch?v=10153231379946729';

  // 1. FDownloader
  try {
    const formData = new URLSearchParams();
    formData.append('k_exp', '');
    formData.append('k_token', '');
    formData.append('q', url);
    formData.append('lang', 'en');
    formData.append('web', 'fdownloader.net');
    formData.append('v', 'v2');
    formData.append('w', '');

    const res = await fetch('https://fdownloader.net/api/ajaxSearch', {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'x-requested-with': 'XMLHttpRequest',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'referer': 'https://fdownloader.net/'
      },
      body: formData.toString()
    });
    const d = await res.json();
    console.log('FDownloader status:', d.status, 'data length:', d.data?.length);
    if (d.data) {
      const links = d.data.match(/href="([^"]+)"[^>]*class="[^"]*download/gi) || d.data.match(/href="([^"]+)"/gi);
      console.log('FDownloader links:', links?.slice(0, 3));
    }
  } catch (e) {
    console.log('FDownloader err:', e.message);
  }

  // 2. GetMyFB
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
    console.log('GetMyFB status:', res.status, 'html len:', html.length);
    const links = html.match(/href="([^"]+)"[^>]*class="[^"]*btn-download/gi) || html.match(/href="([^"]+)"/gi);
    console.log('GetMyFB sample link:', links?.slice(0, 2));
  } catch (e) {
    console.log('GetMyFB err:', e.message);
  }
}

testFBApis();
