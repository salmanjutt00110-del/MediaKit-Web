import type { Metadata } from 'next';
import SeoLandingPage from '@/components/SeoLandingPage';

export const metadata: Metadata = {
  title: 'YouTube to MP4 Free Online No Registration | MediaKit',
  description:
    'Download YouTube to MP4 free online with no registration. Fast 1080p Full HD & 4K downloads. Works on iPhone, Android, and PC. 100% free with MediaKit.',
  keywords: [
    'youtube to mp4 free online no registration',
    'youtube to mp4',
    'youtube mp4 free online',
    'download youtube video without software',
    'youtube to mp4 1080p free online',
  ],
  alternates: {
    canonical: 'https://mediakit.website/youtube-to-mp4-free-online-no-registration',
  },
  openGraph: {
    title: 'YouTube to MP4 Free Online No Registration | MediaKit',
    description: 'Convert and download YouTube to MP4 in 1080p & 4K free online without registration.',
    url: 'https://mediakit.website/youtube-to-mp4-free-online-no-registration',
    type: 'website',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      name: 'MediaKit YouTube to MP4 Downloader',
      url: 'https://mediakit.website/youtube-to-mp4-free-online-no-registration',
      applicationCategory: 'MultimediaApplication',
      operatingSystem: 'All',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

export default function YouTubeToMp4FreeOnlineNoRegistrationPage() {
  return (
    <SeoLandingPage
      badgeText="No Registration Required"
      title="YouTube to MP4 Free Online No Registration"
      highlightWord="No Registration"
      subtitle="Download YouTube videos directly as MP4 files in crisp 1080p and 4K resolution. Zero sign-up, zero software, and 100% free forever."
      supportedUrls={[
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        'https://youtu.be/dQw4w9WgXcQ',
        'https://www.youtube.com/shorts/3i_bS97sF94',
      ]}
      steps={[
        {
          number: 1,
          title: 'Copy the YouTube Link',
          description: 'Open YouTube, tap Share under the video, and click "Copy link".',
        },
        {
          number: 2,
          title: 'Paste into MediaKit',
          description: 'Paste the link into the download box. No account or email needed.',
        },
        {
          number: 3,
          title: 'Choose 1080p or 4K Quality',
          description: 'Select your preferred MP4 resolution with synchronized high-bitrate audio.',
        },
        {
          number: 4,
          title: 'Instant Direct Download',
          description: 'Click Download to save the complete MP4 file to your device.',
        },
      ]}
      faqs={[
        {
          question: 'Do I really not need to sign up or register?',
          answer: 'Yes! MediaKit is completely open and anonymous. No email, passwords, or personal details are ever requested.',
        },
        {
          question: 'Are 1080p and 4K videos saved with audio?',
          answer: 'Yes, MediaKit automatically merges the video and high-fidelity audio streams into a single MP4 container.',
        },
      ]}
      structuredData={jsonLd}
    />
  );
}
