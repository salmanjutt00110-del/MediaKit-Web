import { FacebookAdapter } from '../src/lib/providers/facebook';

async function testFB() {
  const fb = new FacebookAdapter();
  const url = 'https://www.facebook.com/share/r/1Bu9dcvRh/';
  console.log('Testing Facebook link:', url);
  try {
    const res = await fb.getMediaInfo(url);
    console.log('Facebook result title:', res.title);
    console.log('Facebook formats count:', res.formats?.length);
    res.formats?.forEach(f => {
      console.log('Format:', f.id, f.quality, 'hasUrl:', !!f.downloadUrl, f.downloadUrl?.slice(0, 80));
    });
  } catch (err) {
    console.error('FB error:', err);
  }
}

testFB();
