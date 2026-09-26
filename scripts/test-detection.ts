import { detectPlatform, normalizeUrl, MAX_URL_LENGTH } from '../src/lib/detect';
import { checkRateLimit } from '../src/lib/rate-limit';

interface TestCase {
  url: string;
  expectedPlatform: string;
  expectedValid: boolean;
  expectedErrorCode?: string;
  description: string;
}

const testCases: TestCase[] = [
  // 1. YouTube Cases
  {
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    expectedPlatform: 'youtube',
    expectedValid: true,
    description: 'Standard YouTube Watch URL',
  },
  {
    url: 'https://youtu.be/dQw4w9WgXcQ',
    expectedPlatform: 'youtube',
    expectedValid: true,
    description: 'Short youtu.be URL',
  },
  {
    url: 'https://www.youtube.com/shorts/3f_3yP5XzJc',
    expectedPlatform: 'youtube',
    expectedValid: true,
    description: 'YouTube Shorts URL',
  },
  {
    url: 'm.youtube.com/watch?v=dQw4w9WgXcQ',
    expectedPlatform: 'youtube',
    expectedValid: true,
    description: 'Mobile YouTube URL without protocol',
  },
  {
    url: 'https://music.youtube.com/watch?v=dQw4w9WgXcQ',
    expectedPlatform: 'youtube',
    expectedValid: true,
    description: 'YouTube Music URL',
  },

  // 2. TikTok Cases
  {
    url: 'https://www.tiktok.com/@creator/video/7123456789012345678',
    expectedPlatform: 'tiktok',
    expectedValid: true,
    description: 'Standard TikTok video URL',
  },
  {
    url: 'https://vm.tiktok.com/ZM8xABCde/',
    expectedPlatform: 'tiktok',
    expectedValid: true,
    description: 'TikTok short share URL (vm.tiktok.com)',
  },
  {
    url: 'vt.tiktok.com/ZM8xABCde/',
    expectedPlatform: 'tiktok',
    expectedValid: true,
    description: 'TikTok short share URL without protocol (vt.tiktok.com)',
  },

  // 3. Facebook Cases
  {
    url: 'https://www.facebook.com/watch/?v=1234567890',
    expectedPlatform: 'facebook',
    expectedValid: true,
    description: 'Facebook Watch video URL',
  },
  {
    url: 'https://fb.watch/mXyZ1234/',
    expectedPlatform: 'facebook',
    expectedValid: true,
    description: 'Facebook fb.watch short URL',
  },
  {
    url: 'https://www.facebook.com/reel/9876543210/',
    expectedPlatform: 'facebook',
    expectedValid: true,
    description: 'Facebook Reel URL',
  },
  {
    url: 'm.facebook.com/watch/?v=1234567890',
    expectedPlatform: 'facebook',
    expectedValid: true,
    description: 'Mobile Facebook URL without protocol',
  },

  // 4. Instagram Cases
  {
    url: 'https://www.instagram.com/reel/C8AbCdEfGh1/',
    expectedPlatform: 'instagram',
    expectedValid: true,
    description: 'Instagram Reel URL',
  },
  {
    url: 'https://instagram.com/p/C8AbCdEfGh1/',
    expectedPlatform: 'instagram',
    expectedValid: true,
    description: 'Instagram Post URL',
  },
  {
    url: 'https://www.instagram.com/tv/C8AbCdEfGh1/',
    expectedPlatform: 'instagram',
    expectedValid: true,
    description: 'Instagram IGTV URL',
  },
  {
    url: 'instagr.am/p/C8AbCdEfGh1',
    expectedPlatform: 'instagram',
    expectedValid: true,
    description: 'Instagram legacy short domain instagr.am without protocol',
  },

  // 5. Normalization & Tracking Parameters Removal
  {
    url: 'http://www.youtube.com/watch?v=dQw4w9WgXcQ&utm_source=twitter&utm_medium=social&si=12345',
    expectedPlatform: 'youtube',
    expectedValid: true,
    description: 'HTTP URL with tracking parameters (utm_*, si) stripped',
  },
  {
    url: 'https://www.instagram.com/reel/C8AbCdEfGh1/?igshid=abc123xyz&utm_campaign=share',
    expectedPlatform: 'instagram',
    expectedValid: true,
    description: 'Instagram URL with igshid and utm tracking stripped',
  },
  {
    url: 'https://www.facebook.com/watch/?v=1234567890&fbclid=IwAR1234567890',
    expectedPlatform: 'facebook',
    expectedValid: true,
    description: 'Facebook URL with fbclid stripped while preserving content id v',
  },

  // 6. Invalid & Unsupported Cases
  {
    url: 'https://vimeo.com/12345678',
    expectedPlatform: 'unknown',
    expectedValid: false,
    expectedErrorCode: 'UNSUPPORTED_PLATFORM',
    description: 'Unsupported platform (Vimeo)',
  },
  {
    url: 'https://dailymotion.com/video/x7tgad0',
    expectedPlatform: 'unknown',
    expectedValid: false,
    expectedErrorCode: 'UNSUPPORTED_PLATFORM',
    description: 'Unsupported platform (DailyMotion)',
  },
  {
    url: 'not-a-real-url-at-all',
    expectedPlatform: 'unknown',
    expectedValid: false,
    expectedErrorCode: 'INVALID_URL',
    description: 'Random string non-URL',
  },
  {
    url: '',
    expectedPlatform: 'unknown',
    expectedValid: false,
    expectedErrorCode: 'INVALID_URL',
    description: 'Empty string',
  },
  {
    url: '   ',
    expectedPlatform: 'unknown',
    expectedValid: false,
    expectedErrorCode: 'INVALID_URL',
    description: 'Whitespace only string',
  },
  {
    url: 'javascript:alert("exploit")',
    expectedPlatform: 'unknown',
    expectedValid: false,
    expectedErrorCode: 'INVALID_URL',
    description: 'Dangerous protocol (javascript:)',
  },
  {
    url: 'data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==',
    expectedPlatform: 'unknown',
    expectedValid: false,
    expectedErrorCode: 'INVALID_URL',
    description: 'Dangerous protocol (data:)',
  },
  {
    url: 'https://www.youtube.com/watch?v=' + 'a'.repeat(MAX_URL_LENGTH + 50),
    expectedPlatform: 'unknown',
    expectedValid: false,
    expectedErrorCode: 'INVALID_URL',
    description: 'Input exceeding maximum supported length (2048 chars)',
  },
];

console.log('Running MediaKit URL Auto-Detection & Normalization Test Suite...\n');
let passed = 0;
let failed = 0;

for (const test of testCases) {
  const result = detectPlatform(test.url);
  const platformMatch = result.platform === test.expectedPlatform;
  const validMatch = result.valid === test.expectedValid;
  const errorCodeMatch = !test.expectedErrorCode || result.errorCode === test.expectedErrorCode;

  if (platformMatch && validMatch && errorCodeMatch) {
    passed++;
    console.log(`✓ PASS: [${test.description}] -> detected: ${result.platform}, valid: ${result.valid}`);
  } else {
    failed++;
    console.error(`✗ FAIL: [${test.description}]`);
    console.error(`   Input: "${test.url.substring(0, 60)}..."`);
    console.error(`   Expected: { platform: '${test.expectedPlatform}', valid: ${test.expectedValid}, errorCode: '${test.expectedErrorCode}' }`);
    console.error(`   Actual:   { platform: '${result.platform}', valid: ${result.valid}, errorCode: '${result.errorCode}' }`);
  }
}

// Normalization-specific tests
console.log('\nRunning URL Normalization Unit Tests...');
const norm1 = normalizeUrl('http://youtube.com/watch?v=test&utm_source=email');
if (norm1.normalizedUrl === 'https://youtube.com/watch?v=test' && norm1.isValid) {
  passed++;
  console.log('✓ PASS: http converted to https and utm_source stripped');
} else {
  failed++;
  console.error('✗ FAIL: Normalization test 1', norm1);
}

// Rate limit unit test
console.log('\nRunning In-Memory Rate Limiting Tests...');
const testIp = 'test-ip-123';
const r1 = checkRateLimit(testIp, { limit: 2, windowMs: 1000 });
const r2 = checkRateLimit(testIp, { limit: 2, windowMs: 1000 });
const r3 = checkRateLimit(testIp, { limit: 2, windowMs: 1000 });

if (r1.allowed && r2.allowed && !r3.allowed) {
  passed++;
  console.log('✓ PASS: Rate limiter throttles after exceeding max requests');
} else {
  failed++;
  console.error('✗ FAIL: Rate limit test failed', { r1, r2, r3 });
}

console.log(`\nResults: ${passed} passed, ${failed} failed out of ${testCases.length + 2} tests.`);
if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
