const BASE_URL = 'https://mediakit.website';

async function testDownload() {
  const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
  const formatId = '720p';

  console.log(`Testing download endpoint for ${url} with format ${formatId}...`);
  const res = await fetch(`${BASE_URL}/api/download`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, formatId })
  });
  const data = await res.json();
  console.log('Download endpoint response:', data);
}

testDownload();
