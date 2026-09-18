import type { Metadata } from 'next';
import SeoLandingPage from '@/components/SeoLandingPage';

export const metadata: Metadata = {
  title: 'Instagram Video Downloader — Save IG Posts & Videos in HD | MediaKit',
  description:
    'Download Instagram videos and carousel posts in full quality. Free, fast online Instagram downloader for reels, posts, and IG video content.',
  alternates: {
    canonical: 'https://mediakit.website/instagram-video-downloader',
  },
  openGraph: {
    title: 'Instagram Video Downloader — Save IG Posts & Videos in HD | MediaKit',
    description:
      'Download Instagram videos and carousel posts in full quality. Free, fast online Instagram downloader for reels, posts, and IG video content.',
    url: 'https://mediakit.website/instagram-video-downloader',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      name: 'MediaKit Instagram Video Downloader',
      url: 'https://mediakit.website/instagram-video-downloader',
      applicationCategory: 'MultimediaApplication',
      operatingSystem: 'All',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'How do I download a video from Instagram?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Open the Instagram app or website, tap the three dots on the post or the Share icon, select "Copy Link", and paste it into MediaKit.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I download private Instagram posts?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No. In strict accordance with platform privacy and security policies, only public Instagram media can be processed.',
          },
        },
      ],
    },
  ],
};

export default function InstagramVideoDownloaderPage() {
  return (
    <SeoLandingPage
      badgeText="Instagram Video Downloader"
      title="Download Instagram Videos in Original Quality"
      highlightWord="Original Quality"
      subtitle="Save public Instagram video posts, carousel videos, and clips directly to your phone or computer."
      supportedUrls={[
        'https://www.instagram.com/p/POST_ID/',
        'https://www.instagram.com/tv/VIDEO_ID/',
      ]}
      features={[
        {
          title: 'Full Resolution Video Stream',
          description: 'Extract the uncompressed MP4 source file directly from CDN servers for maximum clarity.',
        },
        {
          title: 'Authentic Creator Attribution',
          description: 'Shows accurate author handles, real captions, and preview thumbnails where available.',
        },
        {
          title: 'No Instagram Login Required',
          description: 'Never share your Instagram password or connect accounts. Completely anonymous and private.',
        },
      ]}
      faqs={[
        {
          question: 'Do I need to install any app to download Instagram videos?',
          answer: 'No apps or browser extensions are needed. MediaKit functions 100% online through your browser.',
        },
        {
          question: 'Are downloaded Instagram videos saved with audio?',
          answer: 'Yes! All downloaded MP4 files include the authentic stereo audio track recorded by the creator.',
        },
      ]}
      structuredData={jsonLd}
    />
  );
}
