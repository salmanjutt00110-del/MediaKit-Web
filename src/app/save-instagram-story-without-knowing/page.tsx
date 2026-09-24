import type { Metadata } from 'next';
import SeoLandingPage from '@/components/SeoLandingPage';

export const metadata: Metadata = {
  title: 'Save Instagram Story Without Them Knowing Free | MediaKit',
  description:
    'Download and save Instagram Stories anonymously without them knowing. 100% free, no login required, no notification sent. High quality HD download.',
  keywords: [
    'save instagram story without them knowing free',
    'save instagram story without knowing',
    'download instagram stories anonymously',
    'anonymous instagram story viewer and downloader',
    'view instagram story without them knowing free',
  ],
  alternates: {
    canonical: 'https://mediakit.website/save-instagram-story-without-knowing',
  },
  openGraph: {
    title: 'Save Instagram Story Without Them Knowing Free | MediaKit',
    description: 'Download Instagram Stories anonymously without notifying the creator. 100% free, no login.',
    url: 'https://mediakit.website/save-instagram-story-without-knowing',
    type: 'website',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      name: 'MediaKit Anonymous Story Downloader',
      url: 'https://mediakit.website/save-instagram-story-without-knowing',
      applicationCategory: 'MultimediaApplication',
      operatingSystem: 'All',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

export default function SaveInstagramStoryWithoutKnowingPage() {
  return (
    <SeoLandingPage
      badgeText="100% Anonymous"
      title="Save Instagram Story Without Them Knowing Free"
      highlightWord="Without Them Knowing"
      subtitle="View and download public Instagram Stories anonymously. The account owner is never notified, your name never appears in viewers, and no login is required."
      supportedUrls={[
        'https://www.instagram.com/stories/username/1234567890/',
        'https://www.instagram.com/reel/Cxxxxxxxxx/',
      ]}
      steps={[
        {
          number: 1,
          title: 'Copy Story Link',
          description: 'Copy the Story URL from Instagram using the Share option.',
        },
        {
          number: 2,
          title: 'Paste into Anonymous Downloader',
          description: 'Paste into MediaKit. We query the media servers via isolated anonymous proxy nodes.',
        },
        {
          number: 3,
          title: 'Direct Video/Photo Fetch',
          description: 'MediaKit resolves the raw video or image asset in full resolution.',
        },
        {
          number: 4,
          title: 'Save Privately',
          description: 'Save the media directly to your phone or computer. Zero footprints left.',
        },
      ]}
      faqs={[
        {
          question: 'Does the creator know if I view or download their Story?',
          answer: 'No. Because MediaKit queries the CDN directly through anonymous proxy servers, your Instagram profile is never connected and you never appear in their Story viewer list.',
        },
        {
          question: 'Do I need to sign in with my Instagram account?',
          answer: 'Never. MediaKit operates completely without your credentials, cookies, or account logins.',
        },
      ]}
      structuredData={jsonLd}
    />
  );
}
