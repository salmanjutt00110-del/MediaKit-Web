import { snapsave } from 'snapsave-media-downloader';

async function test() {
  const url = 'https://www.instagram.com/reel/C557x-lKMPV/';
  const snapRes = await snapsave(url);
  const mediaUrl = snapRes?.data?.media?.[0]?.url;
  console.log('Testing mediaUrl:', mediaUrl?.slice(0, 80));

  // Test 1: with TelegramBot user-agent and snapinsta referer
  try {
    const res1 = await fetch(mediaUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://snapinsta.app/'
      }
    });
    console.log('Test 1 (snapinsta referer, browser UA):', res1.status, res1.headers.get('content-type'), res1.headers.get('content-length'));
  } catch (e) {
    console.log('Test 1 err:', e.message);
  }

  // Test 2: with TelegramBot UA
  try {
    const res2 = await fetch(mediaUrl, {
      headers: {
        'User-Agent': 'TelegramBot (like TwitterBot)',
      }
    });
    console.log('Test 2 (TelegramBot UA):', res2.status, res2.headers.get('content-type'), res2.headers.get('content-length'));
  } catch (e) {
    console.log('Test 2 err:', e.message);
  }

  // Test 3: direct fetch with no extra headers
  try {
    const res3 = await fetch(mediaUrl);
    console.log('Test 3 (no headers):', res3.status, res3.headers.get('content-type'), res3.headers.get('content-length'));
  } catch (e) {
    console.log('Test 3 err:', e.message);
  }
}

test();
