import type { Metadata } from 'next';
import SeoLandingPage from '@/components/SeoLandingPage';

export const metadata: Metadata = {
  title: 'Pinterest Video Downloader No Watermark Free | MediaKit',
  description:
    'Download Pinterest videos without watermark free in HD quality. Save Pinterest pins, Idea Pins, and GIFs directly to your phone or PC. Fast & easy.',
  keywords: [
    'pinterest video downloader no watermark free',
    'pinterest video downloader no watermark',
    'download pinterest videos without watermark',
    'free pinterest video downloader no watermark',
    'save pinterest video without watermark',
  ],
  alternates: {
    canonical: 'https://mediakit.website/pinterest-video-downloader-no-watermark-free',
  },
  openGraph: {
    title: 'Pinterest Video Downloader No Watermark Free | MediaKit',
    description: 'Download Pinterest videos without watermark in HD quality free. Works on all devices.',
    url: 'https://mediakit.website/pinterest-video-downloader-no-watermark-free',
    type: 'website',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      name: 'MediaKit Pinterest Downloader Without Watermark',
      url: 'https://mediakit.website/pinterest-video-downloader-no-watermark-free',
      applicationCategory: 'MultimediaApplication',
      operatingSystem: 'All',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

export default function PinterestVideoDownloaderNoWatermarkFreePage() {
  return (
    <SeoLandingPage
      badgeText="Pinterest No Watermark"
      title="Pinterest Video Downloader No Watermark Free"
      highlightWord="No Watermark Free"
      subtitle="Extract clean, watermark-free videos, Idea Pins, and animated GIFs from Pinterest in original high definition with zero branding."
      supportedUrls={[
        'https://www.pinterest.com/pin/123456789012345678/',
        'https://pin.it/examplePinID',
      ]}
      steps={[
        {
          number: 1,
          title: 'Copy the Pin Link',
          description: 'Tap the three dots or Share icon on Pinterest and choose "Copy Link".',
        },
        {
          number: 2,
          title: 'Paste into MediaKit',
          description: 'Paste your Pinterest or pin.it link into the download box.',
        },
        {
          number: 3,
          title: 'Direct Stream Parsing',
          description: 'MediaKit retrieves the uncompressed source stream from the CDN.',
        },
        {
          number: 4,
          title: 'Download Clean MP4',
          description: 'Save the watermark-free video or GIF directly to your camera roll or PC.',
        },
      ]}
      faqs={[
        {
          question: 'Are downloaded Pinterest videos clean with zero watermark?',
          answer: 'Yes! MediaKit delivers 100% untouched video files with no added logos or platform watermarks.',
        },
        {
          question: 'Are shortened pin.it links supported?',
          answer: 'Yes, MediaKit automatically resolves mobile shortened pin.it links seamlessly.',
        },
      ]}
      structuredData={jsonLd}
    />
  );
}
