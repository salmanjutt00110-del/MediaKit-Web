import type { Metadata } from 'next';
import SeoLandingPage from '@/components/SeoLandingPage';

export const metadata: Metadata = {
  title: 'YouTube Video Downloader — Fast & Free 1080p, 4K MP4 | MediaKit',
  description:
    'Download YouTube videos in high definition (1080p, 720p, 4K) or extract clear audio with MediaKit. 100% free, fast, and no registration required.',
  alternates: {
    canonical: 'https://mediakit.website/youtube-video-downloader',
  },
  openGraph: {
    title: 'YouTube Video Downloader — Fast & Free 1080p, 4K MP4 | MediaKit',
    description:
      'Download YouTube videos in high definition (1080p, 720p, 4K) or extract clear audio with MediaKit. 100% free, fast, and no registration required.',
    url: 'https://mediakit.website/youtube-video-downloader',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      name: 'MediaKit YouTube Downloader',
      url: 'https://mediakit.website/youtube-video-downloader',
      applicationCategory: 'MultimediaApplication',
      operatingSystem: 'All',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'How do I download YouTube videos in 1080p or 4K?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Simply copy the YouTube video link, paste it into MediaKit, and select 1080p or 4K from the format list.',
          },
        },
        {
          '@type': 'Question',
          name: 'Does MediaKit require any software or browser extensions?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No installation is needed. MediaKit runs entirely in your web browser across Windows, Mac, Android, and iOS.',
          },
        },
      ],
    },
  ],
};

export default function YouTubeDownloaderPage() {
  return (
    <SeoLandingPage
      badgeText="YouTube Video Downloader"
      title="Download YouTube Videos in High Definition"
      highlightWord="High Definition"
      subtitle="Save your favorite YouTube videos directly to your device in crisp 1080p, 720p, 480p, or high-bitrate MP3 audio."
      supportedUrls={[
        'https://www.youtube.com/watch?v=VIDEO_ID',
        'https://youtu.be/VIDEO_ID',
        'https://m.youtube.com/watch?v=VIDEO_ID',
      ]}
      features={[
        {
          title: 'Full 1080p & 4K Video Quality',
          description: 'Preserves the highest resolution and frame rates uploaded by creators with pristine color depth.',
        },
        {
          title: 'Direct Video & Audio Merging',
          description: 'Automatically synchronizes video and audio streams seamlessly so you never get muted video files.',
        },
        {
          title: 'Zero Ads or Software Installs',
          description: 'A clean, web-based experience without intrusive pop-ups, malicious software, or accounts.',
        },
      ]}
      faqs={[
        {
          question: 'Can I download YouTube videos on my smartphone?',
          answer: 'Yes! MediaKit is fully responsive and functions smoothly on mobile browsers including Safari on iOS and Chrome on Android.',
        },
        {
          question: 'Is there a limit on how many YouTube videos I can download?',
          answer: 'There are no artificial daily limits. You can download as many videos as you need for personal offline viewing.',
        },
        {
          question: 'What video formats are supported?',
          answer: 'We provide MP4 video containers with standard H.264/AAC encoding, compatible with all modern media players, TVs, and editing suites.',
        },
      ]}
      structuredData={jsonLd}
    />
  );
}
