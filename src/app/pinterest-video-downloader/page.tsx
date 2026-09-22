import type { Metadata } from 'next';
import SeoLandingPage from '@/components/SeoLandingPage';

export const metadata: Metadata = {
  title: 'Pinterest Video Downloader — Save Pinterest Videos & Pins HD | MediaKit',
  description:
    'Download Pinterest video pins, Reels, and high-resolution images in authentic HD quality for free. Fast online Pinterest downloader for pin.it and pinterest.com links.',
  keywords: [
    'pinterest video downloader',
    'download pinterest video',
    'pinterest downloader',
    'save pinterest video',
    'pin it video download',
    'pinterest to mp4',
    'free pinterest video downloader',
  ],
  alternates: {
    canonical: '/pinterest-video-downloader',
  },
  openGraph: {
    title: 'Pinterest Video Downloader — Save Pinterest Videos & Pins HD | MediaKit',
    description:
      'Download Pinterest video pins and full-resolution image pins in original HD quality. 100% free online Pinterest downloader.',
    url: '/pinterest-video-downloader',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pinterest Video Downloader — MediaKit',
    description: 'Save Pinterest video pins and DIY clips in original HD quality.',
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
      operatingSystem: 'Windows, macOS, Linux, Android, iOS',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        ratingCount: '9850',
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
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Pinterest Video Downloader',
          item: 'https://mediakit.website/pinterest-video-downloader',
        },
      ],
    },
    {
      '@type': 'HowTo',
      name: 'How to Download Pinterest Videos',
      description: 'Quick 3-step guide to download Pinterest video pins.',
      step: [
        {
          '@type': 'HowToStep',
          name: 'Copy Pinterest Pin Link',
          text: 'Open the Pinterest pin, tap Share or the three dots, and select "Copy Link".',
          position: 1,
        },
        {
          '@type': 'HowToStep',
          name: 'Paste into MediaKit',
          text: 'Paste the pin URL into the MediaKit search bar above.',
          position: 2,
        },
        {
          '@type': 'HowToStep',
          name: 'Download HD Video',
          text: 'Click Download to save the MP4 video directly to your device.',
          position: 3,
        },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'How do I download videos from Pinterest?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Open any Pinterest pin, tap the Share icon or three dots, select "Copy link", paste the URL into MediaKit, and click Download.',
          },
        },
        {
          '@type': 'Question',
          name: 'Does this tool support short pin.it links?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes! MediaKit automatically resolves shortened pin.it URLs to their original pin and extracts the video stream.',
          },
        },
        {
          '@type': 'Question',
          name: 'Are downloaded Pinterest videos saved with sound?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, if the original Pinterest video contains an audio track, the downloaded MP4 will have full synchronized audio.',
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
      title="Download Pinterest Videos &amp; Pins in HD"
      highlightWord="Pins in HD"
      subtitle="Save Pinterest video pins, DIY tutorials, and clips in authentic HD MP4 format with no watermarks."
      supportedUrls={[
        'https://www.pinterest.com/pin/1234567890/',
        'https://pin.it/example',
      ]}
      features={[
        {
          title: 'Full Original Resolution',
          description:
            'Extracts the authentic MP4 video stream uploaded by the creator with pristine color depth and clarity.',
        },
        {
          title: 'pin.it Short Link Support',
          description:
            'Supports both standard pinterest.com/pin URLs and mobile pin.it redirection links seamlessly.',
        },
        {
          title: 'Direct Gallery & Drive Saving',
          description:
            'Save downloaded media files directly to your iOS Photos, Android Gallery, or local drive.',
        },
      ]}
      faqs={[
        {
          question: 'Does this tool support short pin.it links?',
          answer:
            'Yes! MediaKit automatically resolves shortened pin.it URLs to their original pin and extracts the video stream.',
        },
        {
          question: 'Are downloaded Pinterest videos saved with sound?',
          answer:
            'Yes, if the original Pinterest video contains an audio track, the downloaded MP4 will have full synchronized audio.',
        },
        {
          question: 'Can I download Pinterest videos on iPhone and Android?',
          answer:
            'Yes! MediaKit functions directly through Safari and Chrome on any smartphone without installing extra apps.',
        },
        {
          question: 'Is this Pinterest video downloader free?',
          answer:
            'Yes, MediaKit is 100% free with unlimited downloads and no hidden subscription costs.',
        },
      ]}
      structuredData={jsonLd}
    />
  );
}
