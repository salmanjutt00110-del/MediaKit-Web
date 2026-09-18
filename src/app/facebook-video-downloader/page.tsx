import type { Metadata } from 'next';
import SeoLandingPage from '@/components/SeoLandingPage';

export const metadata: Metadata = {
  title: 'Facebook Video Downloader — Save FB Videos in 1080p HD | MediaKit',
  description:
    'Download Facebook videos in HD and SD quality for free. Fast online FB video downloader for public videos, watch clips, and posts on mobile and PC.',
  alternates: {
    canonical: 'https://mediakit.website/facebook-video-downloader',
  },
  openGraph: {
    title: 'Facebook Video Downloader — Save FB Videos in 1080p HD | MediaKit',
    description:
      'Download Facebook videos in HD and SD quality for free. Fast online FB video downloader for public videos and watch clips.',
    url: 'https://mediakit.website/facebook-video-downloader',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      name: 'MediaKit Facebook Video Downloader',
      url: 'https://mediakit.website/facebook-video-downloader',
      applicationCategory: 'MultimediaApplication',
      operatingSystem: 'All',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'How do I download a video from Facebook?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Click Share below the Facebook video, select "Copy link", paste the URL into MediaKit, and choose your preferred video quality.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I download private Facebook group videos?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No. To ensure user privacy and security, MediaKit strictly processes publicly available Facebook videos and posts.',
          },
        },
      ],
    },
  ],
};

export default function FacebookVideoDownloaderPage() {
  return (
    <SeoLandingPage
      badgeText="Facebook Video Downloader"
      title="Download Facebook Videos in 1080p HD"
      highlightWord="1080p HD"
      subtitle="Save public Facebook videos, Watch clips, and timeline posts in high quality MP4 format."
      supportedUrls={[
        'https://www.facebook.com/watch/?v=1234567890',
        'https://www.facebook.com/username/videos/1234567890/',
        'https://fb.watch/example/',
      ]}
      features={[
        {
          title: 'HD & SD Quality Selection',
          description: 'Download in full 1080p / 720p High Definition or lightweight Standard Definition when saving bandwidth.',
        },
        {
          title: 'Support for fb.watch & Mobile Links',
          description: 'Handles desktop URLs, mobile m.facebook links, and short fb.watch redirection URLs automatically.',
        },
        {
          title: 'Direct MP4 File Output',
          description: 'Plays anywhere: Windows Media Player, QuickTime, VLC, smartphones, and home media systems.',
        },
      ]}
      faqs={[
        {
          question: 'Are Facebook live streams supported?',
          answer: 'You can download Facebook live videos once the stream has concluded and is saved as a recorded public video.',
        },
        {
          question: 'Do I have to log in to Facebook to download?',
          answer: 'No login is ever required. MediaKit processes the public media stream directly without accessing your account.',
        },
      ]}
      structuredData={jsonLd}
    />
  );
}
