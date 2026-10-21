import { detectPlatform } from '../src/lib/detect';
import { ProviderRegistry } from '../src/lib/providers';

async function main() {
  const testUrls = [
    'https://www.instagram.com/reel/C557x-lKMPV/',
    'https://www.instagram.com/reels/C557x-lKMPV/',
    'https://www.instagram.com/p/C32sJ12r2l4/',
    'https://instagram.com/reel/DA2aNqQSiV9/'
  ];

  for (const url of testUrls) {
    console.log(`\n========================================`);
    console.log(`Testing URL: ${url}`);
    const detection = detectPlatform(url);
    console.log('Detection:', detection);

    const provider = ProviderRegistry.getProviderForUrl(detection.normalizedUrl);
    console.log('Provider:', provider?.displayName);

    if (!provider) {
      console.log('NO PROVIDER FOUND!');
      continue;
    }

    try {
      console.log('Calling getMediaInfo...');
      const mediaInfo = await provider.getMediaInfo(detection.normalizedUrl);
      console.log('MediaInfo result:', {
        id: mediaInfo.id,
        title: mediaInfo.title,
        formatsCount: mediaInfo.formats?.length,
        formats: mediaInfo.formats?.map(f => ({ id: f.id, quality: f.quality, dlUrl: f.downloadUrl?.slice(0, 50) }))
      });

      if (mediaInfo.formats && mediaInfo.formats.length > 0) {
        const firstFmt = mediaInfo.formats[0];
        console.log(`Calling download for format ${firstFmt.id}...`);
        const dlRes = await provider.download(mediaInfo, firstFmt.id);
        console.log('Download result:', {
          success: dlRes.success,
          downloadUrl: dlRes.downloadUrl?.slice(0, 80),
          message: dlRes.message
        });
      }
    } catch (err: any) {
      console.error('Error testing URL:', err.message, err.stack);
    }
  }
}

main();
