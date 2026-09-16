const { execFile } = require('child_process');
const path = require('path');

const ytDlpPath = path.resolve(__dirname, '../bin/yt-dlp.exe');
const testUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

console.log('Testing yt-dlp execution on:', testUrl);

execFile(
  ytDlpPath,
  ['--js-runtimes', 'node', '-j', '--skip-download', testUrl],
  { maxBuffer: 10 * 1024 * 1024 },
  (error, stdout, stderr) => {
    if (error) {
      console.error('Execution failed:', error.message);
      return;
    }

    try {
      const data = JSON.parse(stdout);
      console.log('SUCCESS!');
      console.log('Title:', data.title);
      console.log('Duration:', data.duration_string || data.duration);
      console.log('Thumbnail:', data.thumbnail);
      console.log('Formats found:', data.formats ? data.formats.length : 0);

      const mp4s = (data.formats || []).filter(f => f.ext === 'mp4' && f.vcodec !== 'none');
      console.log('MP4 Video Formats:');
      mp4s.slice(0, 5).forEach(f => {
        console.log(`- Format ${f.format_id}: ${f.format_note || f.resolution || f.height + 'p'} (ext: ${f.ext}, acodec: ${f.acodec})`);
      });

      const audio = (data.formats || []).filter(f => f.acodec !== 'none' && f.vcodec === 'none');
      console.log('Audio Formats:');
      audio.slice(0, 3).forEach(f => {
        console.log(`- Audio ${f.format_id}: ${f.format_note || f.abr + 'k'} (ext: ${f.ext})`);
      });
    } catch (e) {
      console.error('Parse error:', e.message);
    }
  }
);
