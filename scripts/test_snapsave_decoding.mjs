import { extractSnapSave } from '../src/lib/snapsave-native';

async function testFacebook() {
  const url = 'https://www.facebook.com/reel/1149722302831888';
  console.log('Testing SnapSave FB:', url);
  try {
    const res = await extractSnapSave(url);
    console.log('SnapSave FB result count:', res?.length);
    if (res && res[0]) {
      console.log('First item resolution:', res[0].resolution);
      console.log('First item url:', res[0].url?.slice(0, 80));
    }
  } catch (err) {
    console.error('FB error:', err);
  }
}

async function testInstagram() {
  const url = 'https://www.instagram.com/reel/C32sJ12r2l4/';
  console.log('Testing SnapSave IG:', url);
  try {
    const res = await extractSnapSave(url);
    console.log('SnapSave IG result count:', res?.length);
    if (res && res[0]) {
      console.log('First item resolution:', res[0].resolution);
      console.log('First item url:', res[0].url?.slice(0, 80));
    }
  } catch (err) {
    console.error('IG error:', err);
  }
}

async function main() {
  await testFacebook();
  await testInstagram();
}

main();
