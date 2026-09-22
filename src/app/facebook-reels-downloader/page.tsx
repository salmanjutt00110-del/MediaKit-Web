import type { Metadata } from 'next';
import SeoLandingPage from '@/components/SeoLandingPage';

export const metadata: Metadata = {
  title: 'Facebook Reels Downloader — Download FB Reels 1080p HD Free | MediaKit',
  description:
    'Download Facebook Reels videos in 1080p Full HD with crystal-clear audio for free. No watermarks, fast browser download, works on iPhone, Android, and PC.',
  keywords: [
    'facebook reels downloader',
    'download facebook reels',
    'fb reels download',
    'save facebook reels hd',
    'download fb reels without watermark',
    'facebook reels to mp4',
    'free facebook reels downloader',
  ],
  alternates: {
    canonical: '/facebook-reels-downloader',
  },
  openGraph: {
    title: 'Facebook Reels Downloader — Download FB Reels 1080p HD Free | MediaKit',
    description:
      'Download Facebook Reels videos in Full HD with crystal clear audio. 100% free online Facebook Reels downloader.',
    url: '/facebook-reels-downloader',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Facebook Reels Downloader — MediaKit',
    description: 'Save vertical Facebook Reels in 1080p HD with no watermarks.',
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
      operatingSystem: 'Windows, macOS, Linux, Android, iOS',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        ratingCount: '11450',
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
          name: 'Facebook Reels Downloader',
          item: 'https://mediakit.website/facebook-reels-downloader',
        },
      ],
    },
    {
      '@type': 'HowTo',
      name: 'How to Download Facebook Reels',
      description: 'Quick 3-step guide to download Facebook Reels without watermark.',
      step: [
        {
          '@type': 'HowToStep',
          name: 'Copy FB Reel Link',
          text: 'On Facebook, tap Share on the Reel, and select "Copy Link".',
          position: 1,
        },
        {
          '@type': 'HowToStep',
          name: 'Paste into MediaKit',
          text: 'Paste the Reel link into the search bar above.',
          position: 2,
        },
        {
          '@type': 'HowToStep',
          name: 'Download HD Video',
          text: 'Select 1080p HD and click Download to save the vertical MP4 clip.',
          position: 3,
        },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'How do I download a Facebook Reel?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'On the Facebook app or web, tap Share on the Reel, select "Copy Link", paste it into MediaKit above, and click Download.',
          },
        },
        {
          '@type': 'Question',
          name: 'Are Facebook Reels downloaded with synchronized audio?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes! All downloaded Facebook Reels include the original high-fidelity audio track synchronized with the video.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I download Facebook Reels without watermark?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, MediaKit extracts the clean source video stream with zero site watermarks or overlay logos.',
          },
        },
        {
          '@type': 'Question',
          name: 'How do I save Facebook Reels on iPhone or iPad?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Paste the Reel link into Safari on MediaKit, download the file, and tap "Save Video" to add it to your Photos app.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is this Facebook Reels downloader free?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, MediaKit is 100% free with unlimited downloads and no registration required.',
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
      title="Download Facebook Reels in 1080p HD"
      highlightWord="1080p HD"
      subtitle="Save vertical Facebook Reels clips with crystal clear audio directly to your mobile phone or PC with zero watermarks."
      supportedUrls={[
        'https://www.facebook.com/reel/1234567890/',
        'https://www.facebook.com/share/r/1234567890/',
        'https://fb.watch/example/',
      ]}
      features={[
        {
          title: 'Full Resolution Vertical Video',
          description:
            'Extracts the highest available MP4 bitrate with authentic colors and vertical 9:16 framing.',
        },
        {
          title: 'Crystal Clear Audio Quality',
          description:
            'Preserves the complete stereo audio mix with zero compression artifacts or audio lag.',
        },
        {
          title: 'Zero Watermarks or Ads',
          description:
            'Downloads start immediately in your web browser with no watermarks and no third-party apps required.',
        },
      ]}
      faqs={[
        {
          question: 'Are Facebook Reels downloaded with sound?',
          answer:
            'Yes! All downloaded Facebook Reels include full synchronized sound and speech.',
        },
        {
          question: 'Does MediaKit work on iPhone and Android for Facebook Reels?',
          answer:
            'Yes, MediaKit is completely optimized for all mobile browsers without requiring app installations.',
        },
        {
          question: 'Can I download private Facebook Reels?',
          answer:
            'No, MediaKit strictly adheres to platform security and only processes publicly viewable Reels.',
        },
        {
          question: 'What format do Facebook Reels save as?',
          answer:
            'All Reels are saved in standard MP4 video format, compatible with all mobile galleries, video editors, and media players.',
        },
      ]}
      structuredData={jsonLd}
    />
  );
}
