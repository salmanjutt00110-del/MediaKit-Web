import btch from 'btch-downloader';
import { snapsave } from 'snapsave-media-downloader';

async function test() {
  const url = 'https://www.instagram.com/reel/C557x-lKMPV/';

  console.log('Testing btch.igdl...');
  try {
    const res = await btch.igdl(url);
    console.log('btch.igdl result:', JSON.stringify(res, null, 2));
  } catch (e) {
    console.error('btch.igdl error:', e.message);
  }

  console.log('\nTesting snapsave...');
  try {
    const res = await snapsave(url);
    console.log('snapsave result:', JSON.stringify(res, null, 2));
  } catch (e) {
    console.error('snapsave error:', e.message);
  }
}

test();
