import { execFile } from 'child_process';
import path from 'path';

const files = [
  'C:\\Users\\salma\\OneDrive\\Pictures\\MediaKit\\01_YouTube_HQ_RickAstley.mp4',
  'C:\\Users\\salma\\OneDrive\\Pictures\\MediaKit\\02_YouTube_Audio_RickAstley.mp3',
  'C:\\Users\\salma\\OneDrive\\Pictures\\MediaKit\\03_TikTok_HD_MinecraftFrogs.mp4',
  'C:\\Users\\salma\\OneDrive\\Pictures\\MediaKit\\04_Instagram_Reel_HD.mp4',
  'C:\\Users\\salma\\OneDrive\\Pictures\\MediaKit\\05_Facebook_HD_ShareFriends.mp4',
  'C:\\Users\\salma\\OneDrive\\Pictures\\MediaKit\\06_Pinterest_Orig_Photo.png'
];

async function probeFile(f) {
  return new Promise((resolve) => {
    execFile('bin/ffmpeg.exe', ['-i', f], (err, stdout, stderr) => {
      const out = (stderr || '') + (stdout || '');
      const durMatch = out.match(/Duration:\s*([0-9:.]+)/);
      const videoMatch = out.match(/Stream #0:.*?: Video: ([^,\n]+).*?([0-9]{3,4}x[0-9]{3,4})/);
      const audioMatch = out.match(/Stream #0:.*?: Audio: ([^,\n]+)/);
      resolve({
        file: path.basename(f),
        duration: durMatch ? durMatch[1] : 'N/A',
        video: videoMatch ? `${videoMatch[1]} (${videoMatch[2]})` : 'None',
        audio: audioMatch ? audioMatch[1] : 'None'
      });
    });
  });
}

async function run() {
  const results = [];
  for (const f of files) {
    results.push(await probeFile(f));
  }
  console.table(results);
}

run();
