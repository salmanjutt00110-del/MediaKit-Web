import type { Metadata } from 'next';
import SeoLandingPage from '@/components/SeoLandingPage';

export const metadata: Metadata = {
  title: 'YouTube Shorts Downloader — Save Vertical Shorts in HD | MediaKit',
  description:
    'Download YouTube Shorts videos in authentic 9:16 vertical HD quality with audio. Fast, free, watermark-free, and works on all mobile and desktop devices.',
  alternates: {
    canonical: 'https://mediakit.website/youtube-shorts-downloader',
  },
  openGraph: {
    title: 'YouTube Shorts Downloader — Save Vertical Shorts in HD | MediaKit',
    description:
      'Download YouTube Shorts videos in authentic 9:16 vertical HD quality with audio. Fast, free, watermark-free, and works on all mobile and desktop devices.',
    url: 'https://mediakit.website/youtube-shorts-downloader',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      name: 'MediaKit YouTube Shorts Downloader',
      url: 'https://mediakit.website/youtube-shorts-downloader',
      applicationCategory: 'MultimediaApplication',
      operatingSystem: 'All',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'How do I copy a YouTube Shorts link?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'On the YouTube app or website, tap the Share icon on the Short and tap "Copy link". Paste it into MediaKit.',
          },
        },
        {
          '@type': 'Question',
          name: 'Are YouTube Shorts downloaded in vertical aspect ratio?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes! All YouTube Shorts retain their native 9:16 vertical resolution (up to 1080x1920) with synchronized audio.',
          },
        },
      ],
    },
  ],
};

export default function YouTubeShortsDownloaderPage() {
  return (
    <SeoLandingPage
      badgeText="YouTube Shorts Downloader"
      title="Download YouTube Shorts in Vertical HD"
      highlightWord="Vertical HD"
      subtitle="Save fast-paced YouTube Shorts straight to your photo gallery or computer in original vertical dimensions."
      supportedUrls={[
        'https://www.youtube.com/shorts/SHORTS_ID',
        'https://youtube.com/shorts/SHORTS_ID',
      ]}
      features={[
        {
          title: 'Native 9:16 Portrait Aspect',
          description: 'No black letterboxing or cropped edges. Download pure vertical video designed for mobile screens.',
        },
        {
          title: 'High Bitrate Audio Track',
          description: 'Extract the complete sound track and voiceover in crystal-clear quality alongside the video.',
        },
        {
          title: 'Instant Download Speeds',
          description: 'Short clips process in just seconds directly through high-speed content delivery streams.',
        },
      ]}
      faqs={[
        {
          question: 'Do downloaded YouTube Shorts include audio?',
          answer: 'Yes. MediaKit processes both the high-definition video track and audio track into a single MP4 file ready for playback.',
        },
        {
          question: 'Can I convert YouTube Shorts into MP3 sound?',
          answer: 'Yes! Select the "MP3" format option to extract only the audio track from any Short.',
        },
      ]}
      structuredData={jsonLd}
    />
  );
}
