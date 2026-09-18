import type { Metadata } from 'next';
import SeoLandingPage from '@/components/SeoLandingPage';

export const metadata: Metadata = {
  title: 'Facebook Reels Downloader — Save FB Reels in High Definition | MediaKit',
  description:
    'Download Facebook Reels videos in Full HD with crystal clear audio. 100% free online Facebook Reels downloader for iPhone, Android, and PC.',
  alternates: {
    canonical: 'https://mediakit.website/facebook-reels-downloader',
  },
  openGraph: {
    title: 'Facebook Reels Downloader — Save FB Reels in High Definition | MediaKit',
    description:
      'Download Facebook Reels videos in Full HD with crystal clear audio. 100% free online Facebook Reels downloader.',
    url: 'https://mediakit.website/facebook-reels-downloader',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      name: 'MediaKit Facebook Reels Downloader',
      url: 'https://mediakit.website/facebook-reels-downloader',
      applicationCategory: 'MultimediaApplication',
      operatingSystem: 'All',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'How do I download a Facebook Reel?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'On the Facebook app, tap Share on the Reel, select "Copy Link", paste it into MediaKit, and click Download.',
          },
        },
      ],
    },
  ],
};

export default function FacebookReelsDownloaderPage() {
  return (
    <SeoLandingPage
      badgeText="Facebook Reels Downloader"
      title="Download Facebook Reels in High Definition"
      highlightWord="High Definition"
      subtitle="Save vertical Facebook Reels clips with crystal clear audio directly to your mobile phone or PC."
      supportedUrls={[
        'https://www.facebook.com/reel/REEL_ID',
        'https://www.facebook.com/share/r/REEL_ID/',
      ]}
      features={[
        {
          title: 'Full Resolution Vertical Video',
          description: 'Extracts the highest available MP4 bitrate with authentic colors and vertical 9:16 framing.',
        },
        {
          title: 'Crystal Clear Audio Quality',
          description: 'Preserves the complete stereo audio mix with zero compression artifacts or audio lag.',
        },
        {
          title: 'Instant Browser Download',
          description: 'Downloads start immediately in your web browser with no third-party apps required.',
        },
      ]}
      faqs={[
        {
          question: 'Are Facebook Reels downloaded with sound?',
          answer: 'Yes! All downloaded Facebook Reels include full synchronized sound and speech.',
        },
        {
          question: 'Does MediaKit work on iPhone and Android for Facebook Reels?',
          answer: 'Yes, MediaKit is completely optimized for all mobile browsers without requiring app installations.',
        },
      ]}
      structuredData={jsonLd}
    />
  );
}
