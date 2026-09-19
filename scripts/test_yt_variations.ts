import { detectPlatform, normalizeUrl } from '../src/lib/detect';
import { YouTubeAdapter } from '../src/lib/providers/youtube';

const sampleUrls = [
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'https://youtube.com/watch?v=dQw4w9WgXcQ',
  'https://m.youtube.com/watch?v=dQw4w9WgXcQ',
  'https://youtu.be/dQw4w9WgXcQ',
  'https://youtu.be/dQw4w9WgXcQ?si=xXvYp123',
  'https://www.youtube.com/shorts/3f_3yP5XzJc',
  'https://youtube.com/shorts/3f_3yP5XzJc',
  'https://youtube.com/shorts/3f_3yP5XzJc?feature=share',
  'https://m.youtube.com/shorts/3f_3yP5XzJc',
  'https://www.youtube.com/live/dQw4w9WgXcQ',
  'https://youtube.com/live/dQw4w9WgXcQ',
  'youtube.com/watch?v=dQw4w9WgXcQ',
  'youtu.be/dQw4w9WgXcQ',
  'www.youtube.com/watch?v=dQw4w9WgXcQ',
  'Check out this video: https://youtu.be/dQw4w9WgXcQ',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ&feature=youtu.be',
];

console.log('--- TESTING YOUTUBE URL DETECTION VARIATIONS ---');
for (const url of sampleUrls) {
  const norm = normalizeUrl(url);
  const det = detectPlatform(url);
  console.log(`Input: "${url}"`);
  console.log(`  Valid: ${det.valid}, Platform: ${det.platform}, Normalized: "${det.normalizedUrl}"`);
  if (!det.valid) {
    console.log(`  ERROR: ${det.error} (${det.errorCode})`);
  }
}
