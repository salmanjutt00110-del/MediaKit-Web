import type { Metadata } from 'next';
import SeoLandingPage from '@/components/SeoLandingPage';

export const metadata: Metadata = {
  title: 'Pinterest Video Downloader — Save Pinterest Videos in HD MP4 | MediaKit',
  description:
    'Download Pinterest video pins in original high-definition MP4 format. 100% free online Pinterest video downloader for pin.it and pinterest.com links.',
  alternates: {
    canonical: 'https://mediakit.website/pinterest-video-downloader',
  },
  openGraph: {
    title: 'Pinterest Video Downloader — Save Pinterest Videos in HD MP4 | MediaKit',
    description:
      'Download Pinterest video pins in original high-definition MP4 format. 100% free online Pinterest video downloader.',
    url: 'https://mediakit.website/pinterest-video-downloader',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      name: 'MediaKit Pinterest Video Downloader',
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
          name: 'How do I download a video from Pinterest?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Open the Pin, tap the Share icon or the three dots, select "Copy link", paste the URL into MediaKit, and click Download.',
          },
        },
      ],
    },
  ],
};

export default function PinterestVideoDownloaderPage() {
  return (
    <SeoLandingPage
      badgeText="Pinterest Video Downloader"
      title="Download Pinterest Videos in HD Quality"
      highlightWord="HD Quality"
      subtitle="Save creative Pinterest video pins, DIY tutorials, and inspiration clips in original MP4 resolution."
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
