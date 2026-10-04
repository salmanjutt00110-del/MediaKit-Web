import type { Metadata } from 'next';
import SeoLandingPage from '@/components/SeoLandingPage';

export const metadata: Metadata = {
  title: 'Facebook Reels Downloader | MediaKit',
  description:
    'Download Facebook Reels online in HD MP4 with synchronized audio. Paste any public FB Reel link into MediaKit for fast, browser-based saving on mobile or desktop.',
  keywords: [
    'facebook reels downloader',
    'download facebook reels',
    'fb reels download',
    'save facebook reels hd',
    'facebook reels to mp4',
    'free facebook reels downloader',
  ],
  alternates: {
    canonical: 'https://mediakit.website/facebook-reels-downloader',
  },
  openGraph: {
    title: 'Facebook Reels Downloader | MediaKit',
    description:
      'Save vertical Facebook Reels clips with synchronized audio in standard MP4 format. Free, browser-based downloader with no app installation needed.',
    url: 'https://mediakit.website/facebook-reels-downloader',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Facebook Reels Downloader | MediaKit',
    description: 'Save vertical Facebook Reels clips with original synchronized audio in MP4 format.',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': 'https://mediakit.website/facebook-reels-downloader#webpage',
      url: 'https://mediakit.website/facebook-reels-downloader',
      name: 'Facebook Reels Downloader | MediaKit',
      description:
        'Download Facebook Reels online in HD MP4 with synchronized audio. Paste any public FB Reel link into MediaKit for fast, browser-based saving.',
      isPartOf: {
        '@type': 'WebSite',
        '@id': 'https://mediakit.website/#website',
      },
    },
    {
      '@type': 'WebApplication',
      name: 'MediaKit Facebook Reels Downloader',
      url: 'https://mediakit.website/facebook-reels-downloader',
      applicationCategory: 'MultimediaApplication',
      operatingSystem: 'Windows, macOS, Linux, Android, iOS',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
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
          item: 'https://mediakit.website/online-video-downloader',
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
      description: 'Quick 3-step guide to download public Facebook Reels with MediaKit.',
      step: [
        {
          '@type': 'HowToStep',
          name: 'Copy Facebook Reel Link',
          text: 'Open Facebook, navigate to the Reel, tap the Share icon, and choose "Copy Link".',
          position: 1,
        },
        {
          '@type': 'HowToStep',
          name: 'Paste into MediaKit',
          text: 'Paste the copied Facebook Reel URL into the input field above and click Download.',
          position: 2,
        },
        {
          '@type': 'HowToStep',
          name: 'Select Available Format',
          text: 'Choose your preferred video quality or audio option from the detected stream choices.',
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
            text: 'On the Facebook app or website, tap Share on the Reel, select "Copy Link", paste it into MediaKit above, and click Download to view available formats.',
          },
        },
        {
          '@type': 'Question',
          name: 'Are Facebook Reels downloaded with synchronized audio?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. MediaKit extracts the public Facebook stream containing synchronized original audio and speech.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can MediaKit download private Facebook Reels or Stories?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No. MediaKit only processes public Reels that do not require an active login or private group membership.',
          },
        },
        {
          '@type': 'Question',
          name: 'How do I save Facebook Reels on iPhone or Android?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Open Safari or Chrome on your mobile phone, open mediakit.website/facebook-reels-downloader, paste the Reel link, and save the MP4 video directly to your gallery or files folder.',
          },
        },
        {
          '@type': 'Question',
          name: 'What formats are supported for Facebook Reels?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Reels are provided in universal MP4 vertical (9:16) format, matching the resolutions provided by the source server (up to 1080p where available).',
          },
        },
      ],
    },
  ],
};

const customRelatedTools = [
  {
    name: 'Facebook Video Downloader',
    url: '/facebook-video-downloader',
    description: 'Download standard Facebook feed videos, public group posts, and watch clips.',
    icon: '📘',
  },
  {
    name: 'Instagram Reels Downloader',
    url: '/instagram-reels-downloader',
    description: 'Download public Instagram Reels with original audio in crisp vertical MP4.',
    icon: '📸',
  },
  {
    name: 'TikTok Video Downloader',
    url: '/tiktok-video-downloader',
    description: 'Save viral TikTok clips in HD MP4 without watermarks.',
    icon: '🎵',
  },
  {
    name: 'Online Video Downloader',
    url: '/online-video-downloader',
    description: 'All-in-one multi-platform downloader for YouTube, TikTok, Instagram, and more.',
    icon: '🌐',
  },
];

export default function FacebookReelsDownloaderPage() {
  return (
    <SeoLandingPage
      badgeText="Facebook Reels Tool"
      title="Facebook Reels Downloader"
      highlightWord="Downloader"
      subtitle="Save public vertical Facebook Reels clips with synchronized sound in MP4 format directly to your phone or desktop."
      supportedUrls={[
        'https://www.facebook.com/reel/1234567890/',
        'https://www.facebook.com/share/r/1234567890/',
        'https://fb.watch/example/',
      ]}
      features={[
        {
          title: 'Full Vertical 9:16 Video',
          description:
            'Extracts public Facebook Reels in standard vertical aspect ratios up to 1080p HD based on source availability.',
        },
        {
          title: 'Synchronized Stereo Audio',
          description:
            'Preserves the original vocal tracks, background music, and stereo audio without sync drift.',
        },
        {
          title: 'Direct Browser Downloads',
          description:
            'Save clips directly in Chrome, Safari, Firefox, or Edge without installing apps or browser extensions.',
        },
      ]}
      faqs={[
        {
          question: 'Are Facebook Reels downloaded with sound?',
          answer:
            'Yes. All downloaded Facebook Reels include full synchronized sound and speech.',
        },
        {
          question: 'Does MediaKit work on iPhone and Android for Facebook Reels?',
          answer:
            'Yes, MediaKit is completely optimized for all mobile browsers without requiring app installations.',
        },
        {
          question: 'Can I download private Facebook Reels?',
          answer:
            'No, MediaKit strictly adheres to platform privacy and only processes publicly viewable Reels.',
        },
        {
          question: 'What format do Facebook Reels save as?',
          answer:
            'All Reels are saved in standard MP4 video format, compatible with all mobile galleries, video editors, and media players.',
        },
      ]}
      structuredData={jsonLd}
      relatedTools={customRelatedTools}
    />
  );
}
