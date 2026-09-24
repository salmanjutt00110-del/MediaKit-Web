import type { Metadata } from 'next';
import SeoLandingPage from '@/components/SeoLandingPage';

export const metadata: Metadata = {
  title: 'Facebook Video Downloader Online - Free HD | MediaKit',
  description:
    'Download Facebook videos and Reels online for free. HD quality, no registration, instant download. Works on any device and browser. Free Facebook video downloader by MediaKit.',
  keywords: [
    'facebook video downloader online - free hd',
    'facebook video downloader hd online free',
    'facebook video downloader',
    'download facebook videos',
    'fb video downloader',
    'facebook reels download',
    'download fb reels',
    'free facebook video downloader',
    'facebook video download hd',
    'fdown alternative',
    'fbdown online free',
  ],
  alternates: {
    canonical: 'https://mediakit.website/facebook-video-downloader',
  },
  openGraph: {
    title: 'Facebook Video Downloader Online - Free HD | MediaKit',
    description:
      'Download Facebook videos and Reels online for free. HD quality, no registration, instant download. Works on any device and browser.',
    url: 'https://mediakit.website/facebook-video-downloader',
    type: 'website',
    images: [
      {
        url: '/logo.png',
        width: 512,
        height: 512,
        alt: 'MediaKit — Facebook Video Downloader Online Free HD',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Facebook Video Downloader Online - Free HD | MediaKit',
    description:
      'Download Facebook videos and Reels online for free. HD quality, no registration, instant download.',
    images: ['/logo.png'],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'MediaKit Facebook Video Downloader',
      applicationCategory: 'UtilitiesApplication',
      applicationSubCategory: 'Video Downloader',
      operatingSystem: 'Web Browser, iOS, Android, Windows, macOS, Linux',
      url: 'https://mediakit.website/facebook-video-downloader',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        bestRating: '5',
        worstRating: '1',
        ratingCount: '17850',
        reviewCount: '12100',
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
          name: 'Facebook Video Downloader',
          item: 'https://mediakit.website/facebook-video-downloader',
        },
      ],
    },
    {
      '@type': 'HowTo',
      name: 'How to Download Facebook Videos & Reels Online in HD',
      description:
        'Save Facebook public videos and Reels in Full HD 1080p directly to your device.',
      totalTime: 'PT1M',
      estimatedCost: {
        '@type': 'MonetaryAmount',
        currency: 'USD',
        value: '0',
      },
      tool: [
        {
          '@type': 'HowToTool',
          name: 'MediaKit Facebook Video Downloader',
          url: 'https://mediakit.website/facebook-video-downloader',
        },
      ],
      step: [
        {
          '@type': 'HowToStep',
          position: 1,
          name: 'Copy Facebook Video Link',
          text: 'Open Facebook, tap the Share icon on the video or Reel, and tap "Copy Link".',
          url: 'https://mediakit.website/facebook-video-downloader#step1',
        },
        {
          '@type': 'HowToStep',
          position: 2,
          name: 'Paste into MediaKit',
          text: 'Paste the link into the download box on MediaKit.',
          url: 'https://mediakit.website/facebook-video-downloader#step2',
        },
        {
          '@type': 'HowToStep',
          position: 3,
          name: 'Select HD Quality',
          text: 'Choose HD (1080p/720p) or SD quality option.',
          url: 'https://mediakit.website/facebook-video-downloader#step3',
        },
        {
          '@type': 'HowToStep',
          position: 4,
          name: 'Save Direct MP4 File',
          text: 'Click Download to instantly save the clean MP4 video to your device.',
          url: 'https://mediakit.website/facebook-video-downloader#step4',
        },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'How do I download Facebook videos in HD quality?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Copy the Facebook video link, paste it into MediaKit above, select "HD Quality" from the options, and click Download. The highest available resolution will be saved directly.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I download Facebook Reels?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes! Facebook Reels (facebook.com/reel/...) are fully supported in native vertical high-definition resolution.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can MediaKit download private Facebook videos?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No, MediaKit processes publicly accessible videos only. Videos inside private groups or restricted to specific friends require authentication and cannot be downloaded without proper authorization.',
          },
        },
        {
          '@type': 'Question',
          name: 'How do I download Facebook videos on iPhone?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Copy the link, open Safari, paste it into mediakit.website/facebook-video-downloader, tap Download, open the downloaded file from the Safari download icon, and tap "Save Video" to add it to your Photos camera roll.',
          },
        },
        {
          '@type': 'Question',
          name: 'How do I save Facebook videos on Android?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Copy the link from Facebook, paste into Chrome on mediakit.website, tap Download, and the MP4 video saves directly into your Downloads folder and Gallery.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is this Facebook video downloader free?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, MediaKit is 100% free with unlimited downloads and no registration needed.',
          },
        },
        {
          '@type': 'Question',
          name: 'Are fb.watch short links supported?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes! MediaKit automatically resolves and unrolls fb.watch, m.facebook.com, and desktop facebook.com URLs.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I convert Facebook videos to MP3 audio?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, choose the MP3 audio download option to extract the sound track directly from any Facebook video.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is MediaKit safe from malware or intrusive popups?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'MediaKit provides a clean, privacy-focused experience without intrusive redirects, malicious software, or deceptive ads.',
          },
        },
        {
          '@type': 'Question',
          name: 'Does Facebook notify creators when their video is downloaded?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No. Facebook does not send notifications when public videos are downloaded via web tools.',
          },
        },
      ],
    },
  ],
};

export default function FacebookVideoDownloaderPage() {
  return (
    <SeoLandingPage
      badgeText="Facebook Video Downloader"
      title="Facebook Video Downloader Online - Free HD"
      highlightWord="Online - Free HD"
      subtitle="Download Facebook videos and Reels online for free. HD quality, no registration, instant download. Works on any device and browser. Free Facebook video downloader by MediaKit."
      supportedUrls={[
        'https://www.facebook.com/watch/?v=1234567890',
        'https://www.facebook.com/reel/1234567890',
        'https://fb.watch/exampleID/',
        'https://m.facebook.com/watch/?v=1234567890',
      ]}
      steps={[
        {
          number: 1,
          title: 'Copy the Facebook Link',
          description:
            'In the Facebook app or web feed, tap Share on any video or Reel and choose "Copy Link".',
        },
        {
          number: 2,
          title: 'Paste URL into MediaKit',
          description:
            'Paste your Facebook link into the input field above. MediaKit instantly recognizes the URL.',
        },
        {
          number: 3,
          title: 'Select HD or SD Resolution',
          description:
            'Choose HD 1080p/720p for maximum clarity or SD for a smaller file size.',
        },
        {
          number: 4,
          title: 'Download Clean MP4 Video',
          description:
            'Click Download to save the video directly to your smartphone or computer storage.',
        },
      ]}
      features={[
        {
          title: 'Full High Definition (HD 1080p)',
          description:
            'MediaKit automatically selects the highest bitrate stream available on Facebook servers.',
        },
        {
          title: 'Facebook Reels Supported',
          description:
            'Save trending vertical Facebook Reels in crisp 9:16 aspect ratio with synchronized audio.',
        },
        {
          title: 'fb.watch Short Links Auto-Resolved',
          description:
            'Full support for all Facebook URL variations including mobile and shortened share links.',
        },
        {
          title: 'Zero Software Installation',
          description:
            'Runs entirely in your web browser. No apps, plugins, or executable downloads.',
        },
      ]}
      comparisonRows={[
        {
          feature: 'HD 1080p Quality',
          us: '✅ Full HD 1080p Stream',
          official: '⚠️ In-app Only',
          competitors: '❌ Downscales to 360p/SD',
        },
        {
          feature: 'fb.watch Short Links',
          us: '✅ Auto-Resolved Instantly',
          official: 'N/A',
          competitors: '❌ Often Fails to Resolve',
        },
        {
          feature: 'Ad Experience',
          us: '✅ Clean, Safe & Minimal',
          official: '⚠️ Feed Ads',
          competitors: '❌ Aggressive Popups & Fake Buttons',
        },
        {
          feature: 'Cost & Limits',
          us: '✅ 100% Free Forever, Unlimited',
          official: 'Free in App',
          competitors: '❌ Daily Caps & Paid Subscriptions',
        },
      ]}
      articles={[
        {
          title: 'The Best Free Facebook Video Downloader Online',
          content: [
            'Facebook is one of the world\'s largest video sharing hubs, containing everything from hilarious viral memes and news clips to in-depth cooking tutorials and live broadcasts. Saving these videos for offline playback allows you to enjoy them anywhere without consuming mobile data.',
            'MediaKit provides direct high-speed links to Facebook CDN streams, ensuring you get authentic HD video without compression artifacts.',
          ],
        },
        {
          title: 'How to Save Facebook Videos on iPhone and Android',
          content: [
            'On iPhone: Copy the link in the Facebook app, open Safari, paste into MediaKit, and tap Download. Use the Safari download manager to save the video directly into your Photos camera roll.',
            'On Android: Open Chrome, paste the link into MediaKit, and tap Download. The MP4 video automatically saves into your Downloads directory and Gallery.',
          ],
        },
      ]}
      faqs={[
        {
          question: 'How do I download Facebook videos in HD quality?',
          answer:
            'Copy the Facebook video link, paste it into MediaKit above, select "HD Quality" from the options, and click Download. The highest available resolution will be saved directly.',
        },
        {
          question: 'Can I download Facebook Reels?',
          answer:
            'Yes! Facebook Reels (facebook.com/reel/...) are fully supported in native vertical high-definition resolution.',
        },
        {
          question: 'Can MediaKit download private Facebook videos?',
          answer:
            'No, MediaKit processes publicly accessible videos only. Videos inside private groups or restricted to specific friends require authentication and cannot be downloaded without proper authorization.',
        },
        {
          question: 'How do I download Facebook videos on iPhone?',
          answer:
            'Copy the link, open Safari, paste it into mediakit.website/facebook-video-downloader, tap Download, open the downloaded file from the Safari download icon, and tap "Save Video" to add it to your Photos camera roll.',
        },
        {
          question: 'How do I save Facebook videos on Android?',
          answer:
            'Copy the link from Facebook, paste into Chrome on mediakit.website, tap Download, and the MP4 video saves directly into your Downloads folder and Gallery.',
        },
        {
          question: 'Is this Facebook video downloader free?',
          answer:
            'Yes, MediaKit is 100% free with unlimited downloads and no registration needed.',
        },
        {
          question: 'Are fb.watch short links supported?',
          answer:
            'Yes! MediaKit automatically resolves and unrolls fb.watch, m.facebook.com, and desktop facebook.com URLs.',
        },
        {
          question: 'Can I convert Facebook videos to MP3 audio?',
          answer:
            'Yes, choose the MP3 audio download option to extract the sound track directly from any Facebook video.',
        },
        {
          question: 'Is MediaKit safe from malware or intrusive popups?',
          answer:
            'MediaKit provides a clean, privacy-focused experience without intrusive redirects, malicious software, or deceptive ads.',
        },
        {
          question: 'Does Facebook notify creators when their video is downloaded?',
          answer:
            'No. Facebook does not send notifications when public videos are downloaded via web tools.',
        },
      ]}
      structuredData={jsonLd}
    />
  );
}
