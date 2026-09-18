async function testPublerTool() {
  const url = 'https://www.instagram.com/reels/C557x-lKMPV/';
  try {
    const res = await fetch('https://app.publer.com/api/v1/tools/media-download', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      body: JSON.stringify({ url })
    });
    console.log('Publer tool status:', res.status);
    const d = await res.json();
    console.log('Publer tool data:', d);
  } catch (e) {
    console.log('Publer tool err:', e.message);
  }
}

testPublerTool();
