import type { Metadata } from 'next';
import SeoLandingPage from '@/components/SeoLandingPage';

export const metadata: Metadata = {
  title: 'Download YouTube Video Without Software Free | MediaKit',
  description:
    'Download YouTube videos without software, apps, or browser extensions. 100% online in your browser. Fast 1080p MP4 downloads on mobile and PC.',
  keywords: [
    'download youtube video without software',
    'download youtube videos online without app',
    'free youtube video downloader no software',
    'save youtube videos without installing anything',
  ],
  alternates: {
    canonical: 'https://mediakit.website/download-youtube-video-without-software',
  },
  openGraph: {
    title: 'Download YouTube Video Without Software Free | MediaKit',
    description: 'Download YouTube videos online without installing any software or apps. 1080p HD quality.',
    url: 'https://mediakit.website/download-youtube-video-without-software',
    type: 'website',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      name: 'MediaKit Online Downloader',
      url: 'https://mediakit.website/download-youtube-video-without-software',
      applicationCategory: 'MultimediaApplication',
      operatingSystem: 'All',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

export default function DownloadYouTubeVideoWithoutSoftwarePage() {
  return (
    <SeoLandingPage
      badgeText="Zero Software Needed"
      title="Download YouTube Video Without Software Free"
      highlightWord="Without Software"
      subtitle="Save YouTube videos directly through your web browser without installing programs, APKs, desktop software, or risky browser extensions."
      supportedUrls={[
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        'https://youtu.be/dQw4w9WgXcQ',
        'https://www.youtube.com/shorts/3i_bS97sF94',
      ]}
      steps={[
        {
          number: 1,
          title: 'Copy the YouTube Link',
          description: 'Copy the URL from YouTube\'s address bar or share sheet.',
        },
        {
          number: 2,
          title: 'Paste into Browser Tool',
          description: 'Paste into MediaKit directly in Chrome, Safari, or Firefox.',
        },
        {
          number: 3,
          title: 'Choose Resolution',
          description: 'Pick Full HD 1080p, 720p, or 320kbps MP3 audio.',
        },
        {
          number: 4,
          title: 'Direct Browser Download',
          description: 'The file downloads safely through your standard browser download manager.',
        },
      ]}
      faqs={[
        {
          question: 'Why is downloading without software safer?',
          answer: 'Desktop programs and browser extensions often bundle adware, crypto miners, or telemetry trackers. MediaKit executes purely on server nodes, keeping your computer 100% clean.',
        },
        {
          question: 'Does this work on mobile phones without installing apps?',
          answer: 'Yes! It runs smoothly inside Safari on iPhone and Chrome on Android with zero app installations.',
        },
      ]}
      structuredData={jsonLd}
    />
  );
}
