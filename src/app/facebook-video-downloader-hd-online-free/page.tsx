import type { Metadata } from 'next';
import SeoLandingPage from '@/components/SeoLandingPage';

export const metadata: Metadata = {
  title: 'Facebook Video Downloader HD Online Free | MediaKit',
  description:
    'Download Facebook videos in HD online for free. Fast Facebook video and Reels downloader. No registration, no software needed. Works on mobile & PC.',
  keywords: [
    'facebook video downloader hd online free',
    'facebook video downloader hd online',
    'download facebook video 1080p free',
    'fb hd video downloader online',
    'free facebook video downloader hd',
  ],
  alternates: {
    canonical: 'https://mediakit.website/facebook-video-downloader-hd-online-free',
  },
  openGraph: {
    title: 'Facebook Video Downloader HD Online Free | MediaKit',
    description: 'Download Facebook videos in Full HD online for free. No registration required.',
    url: 'https://mediakit.website/facebook-video-downloader-hd-online-free',
    type: 'website',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      name: 'MediaKit Facebook HD Downloader',
      url: 'https://mediakit.website/facebook-video-downloader-hd-online-free',
      applicationCategory: 'MultimediaApplication',
      operatingSystem: 'All',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

export default function FacebookVideoDownloaderHdOnlineFreePage() {
  return (
    <SeoLandingPage
      badgeText="Full HD Downloader"
      title="Facebook Video Downloader HD Online Free"
      highlightWord="HD Online Free"
      subtitle="Save Facebook public videos and Reels in Full 1080p High Definition directly to your device without quality loss, accounts, or software."
      supportedUrls={[
        'https://www.facebook.com/watch/?v=1234567890',
        'https://www.facebook.com/reel/1234567890',
        'https://fb.watch/exampleID/',
      ]}
      steps={[
        {
          number: 1,
          title: 'Copy Facebook URL',
          description: 'Tap Share on any Facebook video or Reel and click "Copy Link".',
        },
        {
          number: 2,
          title: 'Paste into MediaKit',
          description: 'Paste into MediaKit. The link is analyzed for highest HD bitrate streams.',
        },
        {
          number: 3,
          title: 'Select HD Quality',
          description: 'Choose Full HD (1080p/720p) option.',
        },
        {
          number: 4,
          title: 'Instant Download',
          description: 'Click Download to save the clean MP4 directly to your device.',
        },
      ]}
      faqs={[
        {
          question: 'What is the maximum resolution for Facebook downloads?',
          answer: 'MediaKit retrieves up to 1080p Full HD depending on the highest quality uploaded by the creator.',
        },
        {
          question: 'Are Facebook Reels supported?',
          answer: 'Yes! Vertical Facebook Reels and regular timeline videos are fully supported.',
        },
      ]}
      structuredData={jsonLd}
    />
  );
}
