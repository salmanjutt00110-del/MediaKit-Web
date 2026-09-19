import type { Metadata } from 'next';
import SeoLandingPage from '@/components/SeoLandingPage';

export const metadata: Metadata = {
  title: 'Pinterest Video & Image Downloader — Save Pinterest Videos & HD Photos | MediaKit',
  description:
    'Download Pinterest video pins and full-resolution image pins in original HD quality. 100% free online Pinterest downloader for pin.it and pinterest.com links.',
  alternates: {
    canonical: 'https://mediakit.website/pinterest-video-downloader',
  },
  openGraph: {
    title: 'Pinterest Video & Image Downloader — Save Pinterest Videos & HD Photos | MediaKit',
    description:
      'Download Pinterest video pins and full-resolution image pins in original HD quality. 100% free online Pinterest downloader.',
    url: 'https://mediakit.website/pinterest-video-downloader',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      name: 'MediaKit Pinterest Video and Image Downloader',
      url: 'https://mediakit.website/pinterest-video-downloader',
      applicationCategory: 'MultimediaApplication',
      operatingSystem: 'All',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'How do I download videos or images from Pinterest?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Open any Pinterest pin, tap the Share icon or the three dots, select "Copy link", paste the URL into MediaKit, and click Download. You can download both HD MP4 videos and full-resolution master photos.',
          },
        },
      ],
    },
  ],
};

export default function PinterestVideoDownloaderPage() {
  return (
    <SeoLandingPage
      badgeText="Pinterest Video & Photo Downloader"
      title="Download Pinterest Videos & HD Photos"
      highlightWord="HD Photos"
      subtitle="Save Pinterest video pins, DIY tutorials, and full-resolution master images in authentic HD quality."
      supportedUrls={[
        'https://www.pinterest.com/pin/1234567890/',
        'https://pin.it/example',
      ]}
      features={[
        {
          title: 'Full Original Resolution',
          description: 'Extracts the authentic MP4 video stream uploaded by the creator with high clarity.',
        },
        {
          title: 'pin.it Short Link Support',
          description: 'Supports both standard pinterest.com/pin URLs and mobile pin.it redirection links.',
        },
        {
          title: 'Direct Gallery & Drive Saving',
          description: 'Save downloaded media files directly to your device storage, cloud drive, or photo album.',
        },
      ]}
      faqs={[
        {
          question: 'Does this tool support short pin.it links?',
          answer: 'Yes! MediaKit automatically resolves shortened pin.it URLs to their original pin and extracts the video stream.',
        },
        {
          question: 'Are downloaded Pinterest videos saved with sound?',
          answer: 'Yes, if the original Pinterest video contains an audio track, the downloaded MP4 will have full synchronized audio.',
        },
      ]}
      structuredData={jsonLd}
    />
  );
}
