import type { Metadata } from 'next';
import SeoLandingPage from '@/components/SeoLandingPage';

export const metadata: Metadata = {
  title: 'Online Video Downloader — Download from Any Platform Free | MediaKit',
  description:
    'Universal online video downloader for YouTube, TikTok, Facebook, Instagram, and Pinterest. Auto-detects platform with direct 1080p MP4 and MP3 audio downloads.',
  alternates: {
    canonical: 'https://mediakit.website/video-downloader',
  },
  openGraph: {
    title: 'Online Video Downloader — Download from Any Platform Free | MediaKit',
    description:
      'Universal online video downloader for YouTube, TikTok, Facebook, Instagram, and Pinterest.',
    url: 'https://mediakit.website/video-downloader',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      name: 'MediaKit Universal Video Downloader',
      url: 'https://mediakit.website/video-downloader',
      applicationCategory: 'MultimediaApplication',
      operatingSystem: 'All',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'How does MediaKit detect video platforms automatically?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'MediaKit inspects the URL pattern in real-time as you paste it, instantly matching the video provider and tailoring the extraction engine.',
          },
        },
      ],
    },
  ],
};

export default function VideoDownloaderPage() {
  return (
    <SeoLandingPage
      badgeText="Universal Video Downloader"
      title="Download Videos from Any Platform Easily"
      highlightWord="Any Platform"
      subtitle="One unified downloader for YouTube, TikTok, Instagram, Facebook, and Pinterest. Just paste the link — we handle the rest."
      supportedUrls={[
        'https://youtube.com/watch?v=...',
        'https://tiktok.com/@user/video/...',
        'https://instagram.com/reel/...',
        'https://facebook.com/watch/...',
        'https://pinterest.com/pin/...',
      ]}
      features={[
        {
          title: 'Automated Platform Link Detection',
          description: 'No need to select which website your video came from. MediaKit identifies the platform instantly.',
        },
        {
          title: 'Dynamic Multi-Quality Options',
          description: 'Select from 4K, 1440p, 1080p, 720p, 480p, and MP3 audio based on authentic availability.',
        },
        {
          title: 'Multi-Link Batch Downloader',
          description: 'Switch to the Batch tab to queue up to 25 video links from different platforms and download in bulk.',
        },
      ]}
      faqs={[
        {
          question: 'Can I download from multiple platforms at once?',
          answer: 'Yes! Use the "Batch Download" mode to paste links from YouTube, TikTok, Facebook, and Instagram all in one go.',
        },
        {
          question: 'Are there any hidden costs or paywalls?',
          answer: 'MediaKit is 100% free with no subscriptions, trials, or hidden fees.',
        },
      ]}
      structuredData={jsonLd}
    />
  );
}
