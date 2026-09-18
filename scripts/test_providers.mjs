const testUrls = {
  tiktok: 'https://www.tiktok.com/@tiktok/video/7106594312292453678',
  facebook: 'https://www.facebook.com/reel/1149722302831888',
  instagram: 'https://www.instagram.com/reel/C32sJ12r2l4/',
};

async function testTikWM() {
  console.log('Testing TikWM...');
  try {
    const res = await fetch(`https://tikwm.com/api/?url=${encodeURIComponent(testUrls.tiktok)}`);
    const data = await res.json();
    console.log('TikWM status:', data.code, 'Title:', data.data?.title?.slice(0, 40));
    console.log('TikWM play:', data.data?.play?.slice(0, 60));
  } catch (err) {
    console.error('TikWM error:', err.message);
  }
}

async function testSnapSave(url) {
  console.log('Testing SnapSave with:', url);
  try {
    const formData = new URLSearchParams();
    formData.append('url', url);
    const res = await fetch('https://snapsave.app/action.php?lang=en', {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'referer': 'https://snapsave.app/'
      },
      body: formData.toString()
    });
    console.log('SnapSave status:', res.status);
    const text = await res.text();
    console.log('SnapSave raw response len:', text.length, 'sample:', text.slice(0, 100));
  } catch (err) {
    console.error('SnapSave error:', err.message);
  }
}

async function run() {
  await testTikWM();
  await testSnapSave(testUrls.facebook);
  await testSnapSave(testUrls.instagram);
}

run();
