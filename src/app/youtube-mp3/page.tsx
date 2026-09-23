import type { Metadata } from 'next';
import SeoLandingPage from '@/components/SeoLandingPage';

export const metadata: Metadata = {
  title: 'YouTube to MP3 Converter — Free 320kbps Download | MediaKit',
  description:
    'Convert YouTube videos to MP3 free. Download high quality 320kbps MP3 audio from any YouTube video. Fast, free, no registration. Best YouTube to MP3 converter.',
  keywords: [
    'youtube to mp3',
    'youtube mp3 converter',
    'youtube to mp3 free',
    'convert youtube to mp3 320kbps',
    'download youtube audio',
    'youtube audio downloader',
    'youtube to mp3 320kbps',
  ],
  alternates: {
    canonical: 'https://mediakit.website/youtube-mp3',
  },
  openGraph: {
    title: 'YouTube to MP3 Converter Free 320kbps | MediaKit',
    description: 'Convert any YouTube video to MP3. Free, 320kbps quality, instant download.',
    url: 'https://mediakit.website/youtube-mp3',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'YouTube to MP3 Converter Free 320kbps | MediaKit',
    description: 'Convert any YouTube video to MP3. Free, 320kbps quality, instant download.',
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
      operatingSystem: 'Windows, macOS, Linux, Android, iOS',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        ratingCount: '17200',
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
          name: 'YouTube to MP3 Converter',
          item: 'https://mediakit.website/youtube-mp3',
        },
      ],
    },
    {
      '@type': 'HowTo',
      name: 'How to Convert YouTube to MP3',
      description: 'Quick 3-step guide to extract MP3 audio from YouTube videos.',
      step: [
        {
          '@type': 'HowToStep',
          name: 'Copy YouTube URL',
          text: 'Copy the YouTube link from the address bar or the Share menu.',
          position: 1,
        },
        {
          '@type': 'HowToStep',
          name: 'Paste into MediaKit',
          text: 'Paste the link into the MediaKit search bar above.',
          position: 2,
        },
        {
          '@type': 'HowToStep',
          name: 'Download 320kbps MP3',
          text: 'Select the "Audio Only (MP3)" option and click Download to save the audio file.',
          position: 3,
        },
      ],
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
        {
          '@type': 'Question',
          name: 'What bitrate is the downloaded MP3 audio?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'MediaKit extracts the highest available audio stream uploaded by the creator, providing studio-grade 320kbps equivalent fidelity.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is this YouTube to MP3 converter free?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, 100% free with unlimited downloads and no registration required.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I convert YouTube Shorts to MP3 as well?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes! Simply paste any YouTube Shorts link and select "Audio Only (MP3)".',
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
      title="Convert YouTube Videos to 320kbps MP3"
      highlightWord="320kbps MP3"
      subtitle="Extract authentic, high-bitrate stereo MP3 audio from any YouTube video in seconds without installing software."
      supportedUrls={[
        'https://www.youtube.com/watch?v=VIDEO_ID',
        'https://youtu.be/VIDEO_ID',
        'https://www.youtube.com/shorts/SHORTS_ID',
      ]}
      features={[
        {
          title: 'Crystal Clear Audio Bitrates',
          description:
            'Extracts the highest available audio stream uploaded by creators, up to 320kbps equivalent fidelity.',
        },
        {
          title: 'Universal MP3 Audio Compatibility',
          description:
            'Standard MP3 files play seamlessly on iOS, Android, macOS, Windows, car audio, and offline media players.',
        },
        {
          title: 'Instant In-Browser Conversion',
          description:
            'No waiting in slow conversion queues. Streams are extracted and processed directly through fast media pipes.',
        },
      ]}
      faqs={[
        {
          question: 'Is this YouTube to MP3 converter free?',
          answer:
            'Yes, 100% free with unlimited downloads and no registration required.',
        },
        {
          question: 'Can I convert YouTube Shorts to MP3 as well?',
          answer:
            'Yes! Simply paste any YouTube Shorts link and select "Audio Only (MP3)".',
        },
        {
          question: 'Does the audio download include track metadata?',
          answer:
            'Where available, the track title and author information are preserved in the saved MP3 file.',
        },
        {
          question: 'Can I convert YouTube audio on iPhone or Android?',
          answer:
            'Yes! MediaKit works directly in Safari on iOS and Chrome on Android with zero app installs.',
        },
      ]}
      structuredData={jsonLd}
    />
  );
}
