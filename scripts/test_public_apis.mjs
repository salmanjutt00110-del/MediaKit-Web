async function testPublicAPIs() {
  const igUrl = 'https://www.instagram.com/reels/C557x-lKMPV/';
  const fbUrl = 'https://www.facebook.com/watch?v=10153231379946729';

  // 1. VKRDown
  try {
    const res = await fetch(`https://api.vkrdown.com/server?vkr=${encodeURIComponent(igUrl)}`);
    const d = await res.json();
    console.log('VKR IG:', d.status, 'video:', !!d.data?.downloadUrl);
  } catch (e) {
    console.log('VKR IG err:', e.message);
  }

  // 2. Publer / SnapSave alternative
  try {
    const res = await fetch('https://publer.io/api/v1/job_status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: igUrl })
    });
    console.log('Publer status:', res.status);
  } catch (e) {
    console.log('Publer err:', e.message);
  }

  // 3. Cobalt alternative instances (https://instances.hyper.lol/)
  const cobaltInstances = [
    'https://cobalt-api.kwiatekm.pl',
    'https://api.cobalt.tools',
    'https://cobalt.synack.cat',
    'https://dl.khann.me'
  ];

  for (const inst of cobaltInstances) {
    try {
      const res = await fetch(`${inst}/`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: igUrl })
      });
      const d = await res.json();
      console.log('Cobalt', inst, 'status:', d.status, 'url:', !!d.url);
      if (d.url) {
        console.log('Found IG stream URL from cobalt:', d.url.slice(0, 80));
        break;
      }
    } catch (e) {
      console.log('Cobalt', inst, 'err:', e.message);
    }
  }
}

testPublicAPIs();
