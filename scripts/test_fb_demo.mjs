import { FacebookAdapter } from '../src/lib/providers/facebook';

async function testUrl(fb, url) {
  console.log('\n=============================================');
  console.log('Testing Facebook link:', url);
  try {
    const res = await fb.getMediaInfo(url);
    console.log('✓ Title:', res.title);
    console.log('✓ Description:', res.description || 'None');
    console.log('✓ Formats count:', res.formats?.length);
    res.formats?.forEach((f) => {
      console.log(`  - [${f.id}] ${f.quality} (${f.resolution || 'N/A'}) - direct: ${f.downloadUrl?.includes('fbcdn.net') ? 'YES (fbcdn)' : 'SSSCdn/Proxy'}`);
    });

    // Test download preparation for first format
    if (res.formats?.length > 0) {
      const dl = await fb.download(res, res.formats[0].id);
      console.log('✓ Download result prepared:', dl.success, dl.downloadUrl?.slice(0, 100));
    }
  } catch (err) {
    console.error('FB error:', err.message);
  }
}

async function run() {
  const fb = new FacebookAdapter();
  await testUrl(fb, 'https://www.facebook.com/watch?v=10153231379946729');
  await testUrl(fb, 'https://www.facebook.com/share/r/1Bu9dcvRh/');
}

run();
