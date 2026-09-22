import type { Metadata } from 'next';
import SeoLandingPage from '@/components/SeoLandingPage';

export const metadata: Metadata = {
  title: 'Free Video Downloader Without Watermark — Universal Online Tool | MediaKit',
  description:
    'Universal online video downloader for YouTube, TikTok, Facebook, Instagram, and Pinterest. 100% free, no watermarks, fast auto-detection, and HD 1080p MP4 / MP3 output.',
  keywords: [
    'video downloader',
    'free video downloader',
    'online video downloader',
    'universal video downloader',
    'free without watermark downloader',
    'video downloader without watermark',
    'all in one video downloader',
    'download videos online free',
    'batch video downloader',
    'hd video downloader',
  ],
  alternates: {
    canonical: '/video-downloader',
  },
  openGraph: {
    title: 'Free Video Downloader Without Watermark — Universal Online Tool | MediaKit',
    description:
      'Universal online video downloader for YouTube, TikTok, Facebook, Instagram, and Pinterest.',
    url: '/video-downloader',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Universal Video Downloader — MediaKit',
    description:
      'Download high-definition videos from any platform with zero watermarks.',
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
      operatingSystem: 'Windows, macOS, Linux, Android, iOS',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        ratingCount: '21500',
        bestRating: '5',
        worstRating: '1',
      },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://mediakit.website/',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Tools',
          item: 'https://mediakit.website/video-downloader',
        },
      ],
    },
    {
      '@type': 'HowTo',
      name: 'How to Download Videos from Any Platform',
      description: 'Quick guide to download videos from YouTube, TikTok, Facebook, Instagram, and Pinterest.',
      step: [
        {
          '@type': 'HowToStep',
          name: 'Copy Video Link',
          text: 'Copy the link of any public video from your favorite social media platform.',
          position: 1,
        },
        {
          '@type': 'HowToStep',
          name: 'Paste into MediaKit',
          text: 'Paste the link into the search box. MediaKit instantly identifies the platform automatically.',
          position: 2,
        },
        {
          '@type': 'HowToStep',
          name: 'Download HD MP4 / MP3',
          text: 'Select your preferred quality (4K, 1080p, 720p, or MP3 audio) and click Download.',
          position: 3,
        },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'How does MediaKit detect video platforms automatically?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'MediaKit inspects the URL structure in real-time as you paste it, instantly matching the video provider domain (YouTube, TikTok, Facebook, Instagram, Pinterest) and tailoring the extraction engine accordingly.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I download videos without watermark from any platform?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes! MediaKit extracts the original source stream before watermark overlays are injected, providing clean, watermark-free videos across all supported platforms.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I download multiple video links at once (batch download)?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes! Switch to the Batch tab on the downloader to paste up to 25 video links from different platforms and process them simultaneously.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is there any software or app installation required?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No installation is ever required. MediaKit functions 100% online through your browser across Windows, Mac, Android, and iOS.',
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
      title="Download Videos from Any Platform Without Watermark"
      highlightWord="Without Watermark"
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
          description:
            'No need to manually choose which website your video came from. MediaKit identifies the platform instantly.',
        },
        {
          title: 'Dynamic Multi-Quality Options',
          description:
            'Select from 4K, 1440p, 1080p, 720p, 480p, and MP3 audio based on authentic stream availability.',
        },
        {
          title: 'Multi-Link Batch Downloader',
          description:
            'Switch to the Batch tab to queue up to 25 video links from different platforms and download in bulk.',
        },
      ]}
      articles={[
        {
          title: 'The All-In-One Universal Video Downloader',
          content: [
            'Instead of juggling 5 different websites with pop-up ads and broken download links, MediaKit provides a single, high-performance media hub for all your video downloading needs.',
            'Our engine is optimized for high-bandwidth downloads, automated format detection, and privacy protection, making it the premier choice for creators, educators, and everyday users worldwide.',
          ],
        },
      ]}
      faqs={[
        {
          question: 'Can I download from multiple platforms at once?',
          answer:
            'Yes! Use the "Batch Download" mode to paste links from YouTube, TikTok, Facebook, and Instagram all in one go.',
        },
        {
          question: 'Are there any hidden costs or paywalls?',
          answer:
            'MediaKit is 100% free with no subscriptions, trials, or hidden fees.',
        },
        {
          question: 'What video quality is available?',
          answer:
            'We provide the highest quality streams available from the provider, up to 4K Ultra HD and 1080p 60fps.',
        },
        {
          question: 'Is it safe to use MediaKit?',
          answer:
            'Yes, MediaKit uses secure SSL encryption and never stores your personal files or downloads.',
        },
      ]}
      structuredData={jsonLd}
    />
  );
}
