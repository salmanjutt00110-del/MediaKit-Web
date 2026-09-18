import type { Metadata } from 'next';
import SeoLandingPage from '@/components/SeoLandingPage';

export const metadata: Metadata = {
  title: 'YouTube to MP3 Converter — Free High Quality Audio Downloader | MediaKit',
  description:
    'Convert and download YouTube videos to high-bitrate MP3 audio files. Free, lightning-fast YouTube to MP3 converter with no limits and no software needed.',
  alternates: {
    canonical: 'https://mediakit.website/youtube-mp3',
  },
  openGraph: {
    title: 'YouTube to MP3 Converter — Free High Quality Audio Downloader | MediaKit',
    description:
      'Convert and download YouTube videos to high-bitrate MP3 audio files. Free, lightning-fast YouTube to MP3 converter.',
    url: 'https://mediakit.website/youtube-mp3',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      name: 'MediaKit YouTube to MP3 Converter',
      url: 'https://mediakit.website/youtube-mp3',
      applicationCategory: 'MultimediaApplication',
      operatingSystem: 'All',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'How do I convert a YouTube video to MP3?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Paste the YouTube URL into MediaKit, click Download, and choose the "Audio Only (MP3)" option to save the audio file directly.',
          },
        },
      ],
    },
  ],
};

export default function YouTubeMp3Page() {
  return (
    <SeoLandingPage
      badgeText="YouTube to MP3 Converter"
      title="Convert YouTube Videos to High Quality MP3"
      highlightWord="High Quality MP3"
      subtitle="Extract authentic, high-bitrate stereo MP3 audio from any YouTube video in seconds without installing software."
      supportedUrls={[
        'https://www.youtube.com/watch?v=VIDEO_ID',
        'https://youtu.be/VIDEO_ID',
        'https://www.youtube.com/shorts/SHORTS_ID',
      ]}
      features={[
        {
          title: 'Crystal Clear Audio Bitrates',
          description: 'Extracts the highest available audio stream uploaded by creators, up to 320kbps equivalent fidelity.',
        },
        {
          title: 'Universal MP3 Audio Compatibility',
          description: 'Standard MP3 files play seamlessly on iOS, Android, macOS, Windows, car audio, and offline players.',
        },
        {
          title: 'Instant In-Browser Conversion',
          description: 'No waiting in slow conversion queues. Streams are extracted and processed directly through fast media pipes.',
        },
      ]}
      faqs={[
        {
          question: 'Is this YouTube to MP3 converter free?',
          answer: 'Yes, 100% free with unlimited downloads and no registration required.',
        },
        {
          question: 'Can I convert YouTube Shorts to MP3 as well?',
          answer: 'Yes! Simply paste any YouTube Shorts link and select "Audio Only (MP3)".',
        },
        {
          question: 'Does the audio download include album art or metadata?',
          answer: 'Where available, the track title and author information are preserved in the saved file.',
        },
      ]}
      structuredData={jsonLd}
    />
  );
}
