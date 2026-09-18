import type { Metadata } from 'next';
import SeoLandingPage from '@/components/SeoLandingPage';

export const metadata: Metadata = {
  title: 'Instagram Reels Downloader — Save IG Reels with Audio in HD | MediaKit',
  description:
    'Download Instagram Reels videos in Full HD with synchronized sound. 100% free online Instagram Reels downloader. Fast, watermark-free, and mobile friendly.',
  alternates: {
    canonical: 'https://mediakit.website/instagram-reels-downloader',
  },
  openGraph: {
    title: 'Instagram Reels Downloader — Save IG Reels with Audio in HD | MediaKit',
    description:
      'Download Instagram Reels videos in Full HD with synchronized sound. 100% free online Instagram Reels downloader.',
    url: 'https://mediakit.website/instagram-reels-downloader',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      name: 'MediaKit Instagram Reels Downloader',
      url: 'https://mediakit.website/instagram-reels-downloader',
      applicationCategory: 'MultimediaApplication',
      operatingSystem: 'All',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'How do I download Instagram Reels with sound?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Copy the Reel link from the Instagram app or website, paste it into MediaKit, and click Download. The saved MP4 will contain both video and original audio.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I download Instagram Reels to iPhone camera roll?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes! After clicking Download in Safari, tap the download icon in the URL bar, tap the file, and choose "Save Video" to store it directly in Photos.',
          },
        },
      ],
    },
  ],
};

export default function InstagramReelsDownloaderPage() {
  return (
    <SeoLandingPage
      badgeText="Instagram Reels Downloader"
      title="Download Instagram Reels in Full HD"
      highlightWord="Full HD"
      subtitle="Save viral Instagram Reels in high definition with synchronized sound. Free, fast, and watermark-free."
      supportedUrls={[
        'https://www.instagram.com/reel/REEL_ID/',
        'https://www.instagram.com/reels/REEL_ID/',
      ]}
      features={[
        {
          title: 'Vertical 9:16 Full HD Quality',
          description: 'Preserves the vivid colors, 60fps frame rate, and crisp sharpness of original Instagram Reels.',
        },
        {
          title: 'Synchronized Stereo Audio',
          description: 'Downloads trending music, voices, and audio effects in original studio clarity without distortion.',
        },
        {
          title: 'Direct Gallery Saving',
          description: 'Standard MP4 format allows you to save reels directly into your iOS Photos or Android Gallery.',
        },
      ]}
      faqs={[
        {
          question: 'Do downloaded Instagram Reels have a watermark?',
          answer: 'No! When downloading public Reels through MediaKit, the video is saved without any superimposed watermark.',
        },
        {
          question: 'Can I extract audio only from an Instagram Reel?',
          answer: 'Yes! You can choose the MP3 audio format to download just the background sound of any Reel.',
        },
      ]}
      structuredData={jsonLd}
    />
  );
}
