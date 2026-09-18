import { InstagramAdapter } from '../src/lib/providers/instagram';
import { FacebookAdapter } from '../src/lib/providers/facebook';
import { TikTokAdapter } from '../src/lib/providers/tiktok';

async function testAll() {
  const tt = new TikTokAdapter();
  const ig = new InstagramAdapter();
  const fb = new FacebookAdapter();

  console.log('--- Testing TikTok ---');
  try {
    const ttres = await tt.getMediaInfo('https://www.tiktok.com/@scout2015/video/6718335390845095173');
    console.log('TikTok Success:', ttres.title, 'formats:', ttres.formats?.map(f => ({ id: f.id, hasUrl: !!f.downloadUrl, urlSample: f.downloadUrl?.slice(0, 40) })));
  } catch (e) {
    console.error('TikTok error:', e.message);
  }

  console.log('--- Testing Facebook ---');
  try {
    const fbres = await fb.getMediaInfo('https://www.facebook.com/reel/1149722302831888');
    console.log('Facebook Success:', fbres.title, 'formats:', fbres.formats?.map(f => ({ id: f.id, hasUrl: !!f.downloadUrl, urlSample: f.downloadUrl?.slice(0, 40) })));
  } catch (e) {
    console.error('Facebook error:', e.message);
  }

  console.log('--- Testing Instagram ---');
  try {
    const igres = await ig.getMediaInfo('https://www.instagram.com/reel/C32sJ12r2l4/');
    console.log('Instagram Success:', igres.title, 'formats:', igres.formats?.map(f => ({ id: f.id, hasUrl: !!f.downloadUrl, urlSample: f.downloadUrl?.slice(0, 40) })));
  } catch (e) {
    console.error('Instagram error:', e.message);
  }
}

testAll();
