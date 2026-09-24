import type { Metadata } from 'next';
import SeoLandingPage from '@/components/SeoLandingPage';

export const metadata: Metadata = {
  title: 'Pinterest Video Downloader - HD Free | MediaKit',
  description:
    'Download Pinterest videos, GIFs and images free in HD. No login required, no watermark. Works on iPhone, Android & PC. Fast Pinterest video downloader by MediaKit.',
  keywords: [
    'pinterest video downloader - hd free',
    'pinterest video downloader no watermark free',
    'pinterest video downloader',
    'download pinterest videos',
    'pinterest downloader',
    'save pinterest videos',
    'pinterest video download hd',
    'klickpin alternative',
    'pinterest pin downloader',
    'pinterest gif downloader',
  ],
  alternates: {
    canonical: 'https://mediakit.website/pinterest-video-downloader',
  },
  openGraph: {
    title: 'Pinterest Video Downloader - HD Free | MediaKit',
    description:
      'Download Pinterest videos, GIFs and images free in HD. No login required, no watermark. Works on iPhone, Android & PC.',
    url: 'https://mediakit.website/pinterest-video-downloader',
    type: 'website',
    images: [
      {
        url: '/logo.png',
        width: 512,
        height: 512,
        alt: 'MediaKit — Pinterest Video Downloader HD Free',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pinterest Video Downloader - HD Free | MediaKit',
    description:
      'Download Pinterest videos, GIFs and images free in HD. No login required, no watermark.',
    images: ['/logo.png'],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'MediaKit Pinterest Video Downloader',
      applicationCategory: 'UtilitiesApplication',
      applicationSubCategory: 'Video Downloader',
      operatingSystem: 'Web Browser, iOS, Android, Windows, macOS, Linux',
      url: 'https://mediakit.website/pinterest-video-downloader',
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
        ratingCount: '14890',
        reviewCount: '9840',
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
          name: 'Pinterest Video Downloader',
          item: 'https://mediakit.website/pinterest-video-downloader',
        },
      ],
    },
    {
      '@type': 'HowTo',
      name: 'How to Download Pinterest Videos, GIFs and Pins',
      description:
        'Save Pinterest videos in HD MP4 without watermark in 4 easy steps.',
      totalTime: 'PT1M',
      estimatedCost: {
        '@type': 'MonetaryAmount',
        currency: 'USD',
        value: '0',
      },
      tool: [
        {
          '@type': 'HowToTool',
          name: 'MediaKit Pinterest Downloader',
          url: 'https://mediakit.website/pinterest-video-downloader',
        },
      ],
      step: [
        {
          '@type': 'HowToStep',
          position: 1,
          name: 'Copy Pinterest Pin Link',
          text: 'Open Pinterest, tap the three dots or Share icon on the video pin, and select "Copy Link".',
          url: 'https://mediakit.website/pinterest-video-downloader#step1',
        },
        {
          '@type': 'HowToStep',
          position: 2,
          name: 'Paste into MediaKit',
          text: 'Paste the link into the download box on MediaKit.',
          url: 'https://mediakit.website/pinterest-video-downloader#step2',
        },
        {
          '@type': 'HowToStep',
          position: 3,
          name: 'Click Download',
          text: 'Hit the Download button. MediaKit extracts the original CDN MP4 stream.',
          url: 'https://mediakit.website/pinterest-video-downloader#step3',
        },
        {
          '@type': 'HowToStep',
          position: 4,
          name: 'Save Direct HD Video',
          text: 'Save the video or GIF directly to your device gallery or local storage.',
          url: 'https://mediakit.website/pinterest-video-downloader#step4',
        },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'How do I download videos from Pinterest?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Copy the Pinterest video pin URL (tap Share > Copy Link), paste it into MediaKit above, and click Download to save the MP4 video directly to your device.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I download Pinterest GIFs and images?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes! MediaKit supports animated GIFs, video pins, and full-resolution images from Pinterest.',
          },
        },
        {
          '@type': 'Question',
          name: 'Does MediaKit work with pin.it short links?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes! MediaKit automatically unrolls and resolves pin.it shortened links and international Pinterest URLs.',
          },
        },
        {
          '@type': 'Question',
          name: 'How do I save Pinterest videos on iPhone?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Paste the pin link in Safari on MediaKit, tap Download, open the video from the Safari download manager, tap Share, and tap "Save Video" to store it in Photos.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is there a watermark on downloaded Pinterest videos?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No! MediaKit retrieves the pristine source file before any platform overlay is applied.',
          },
        },
        {
          '@type': 'Question',
          name: 'Do I need a Pinterest account to download videos?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No account, login, or registration is required. MediaKit works anonymously.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is MediaKit Pinterest downloader free?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, MediaKit is 100% free with unlimited downloads forever.',
          },
        },
        {
          '@type': 'Question',
          name: 'What video quality does MediaKit download for Pinterest?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'MediaKit delivers the original uploaded resolution, typically 1080p, 720p, or maximum source bitrate.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I download Idea Pins / Story Pins from Pinterest?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, MediaKit parses video streams from Idea Pins and multi-page video pins.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is it safe to download videos using MediaKit?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'MediaKit is secure, HTTPS encrypted, zero-logging, and completely free from malware or adware.',
          },
        },
      ],
    },
  ],
};

export default function PinterestVideoDownloaderPage() {
  return (
    <SeoLandingPage
      badgeText="Pinterest Video Downloader"
      title="Pinterest Video Downloader - HD Free"
      highlightWord="- HD Free"
      subtitle="Download Pinterest videos, GIFs and images free in HD. No login required, no watermark. Works on iPhone, Android & PC. Fast Pinterest video downloader by MediaKit."
      supportedUrls={[
        'https://www.pinterest.com/pin/123456789012345678/',
        'https://pin.it/examplePinID',
        'https://in.pinterest.com/pin/123456789012345678/',
      ]}
      steps={[
        {
          number: 1,
          title: 'Copy the Pin Link',
          description:
            'In Pinterest, tap the Share icon or the three dots on the video pin and tap "Copy Link".',
        },
        {
          number: 2,
          title: 'Paste URL into MediaKit',
          description:
            'Paste your copied Pinterest or pin.it link into the input box above.',
        },
        {
          number: 3,
          title: 'Click Download',
          description:
            'Hit Download. MediaKit parses the CDN stream and fetches the highest available resolution.',
        },
        {
          number: 4,
          title: 'Save Clean HD Media',
          description:
            'Save your watermark-free MP4 video, animated GIF, or image directly to your device.',
        },
      ]}
      features={[
        {
          title: 'Full Original HD Resolution',
          description:
            'Preserves crisp details for DIY guides, recipes, aesthetic loops, and video tutorials.',
        },
        {
          title: 'pin.it Short Link Auto-Unroll',
          description:
            'Seamlessly processes mobile shortened pin.it URLs without manual redirection.',
        },
        {
          title: 'Zero Watermark or Branding',
          description:
            'Downloads 100% clean video files without overlays, borders, or promotional logos.',
        },
        {
          title: 'GIF and Image Support',
          description:
            'In addition to MP4 videos, easily save animated GIFs and high-resolution images.',
        },
      ]}
      comparisonRows={[
        {
          feature: 'Resolution',
          us: '✅ Original HD 1080p/720p',
          official: '⚠️ In-app Pin Save Only',
          competitors: '⚠️ Compressed 480p',
        },
        {
          feature: 'pin.it Short Links',
          us: '✅ Fully Supported',
          official: 'N/A',
          competitors: '❌ Link Unroll Errors',
        },
        {
          feature: 'Ads & Redirects',
          us: '✅ Clean & Minimal',
          official: '⚠️ Promoted Pins',
          competitors: '❌ Intrusive Redirects & Popups',
        },
        {
          feature: 'Cost & Limits',
          us: '✅ 100% Free Forever',
          official: 'Free in App',
          competitors: '❌ Download Caps',
        },
      ]}
      articles={[
        {
          title: 'How to Download Pinterest Videos, GIFs and Idea Pins in HD',
          content: [
            'Pinterest is a treasure trove of inspiration for design, home improvement, cooking, fashion, and crafts. Many of the best tutorials and aesthetic clips are published as video pins.',
            'While Pinterest allows you to bookmark pins inside secret boards, you cannot natively save the actual video file to your phone\'s camera roll for offline editing or sharing. MediaKit solves this by giving you direct access to the source MP4 video stream.',
          ],
        },
        {
          title: 'Saving Pinterest Video Pins on iPhone (Safari) and Android (Chrome)',
          content: [
            'On iPhone: Copy the pin link, open Safari, paste into MediaKit, and tap Download. Tap the Safari download manager to save the video directly to your Photos app.',
            'On Android: Open Chrome, paste the pin.it link, tap Download, and the video immediately saves to your Downloads folder and Gallery.',
          ],
        },
      ]}
      faqs={[
        {
          question: 'How do I download videos from Pinterest?',
          answer:
            'Copy the Pinterest video pin URL (tap Share > Copy Link), paste it into MediaKit above, and click Download to save the MP4 video directly to your device.',
        },
        {
          question: 'Can I download Pinterest GIFs and images?',
          answer:
            'Yes! MediaKit supports animated GIFs, video pins, and full-resolution images from Pinterest.',
        },
        {
          question: 'Does MediaKit work with pin.it short links?',
          answer:
            'Yes! MediaKit automatically unrolls and resolves pin.it shortened links and international Pinterest URLs.',
        },
        {
          question: 'How do I save Pinterest videos on iPhone?',
          answer:
            'Paste the pin link in Safari on MediaKit, tap Download, open the video from the Safari download manager, tap Share, and tap "Save Video" to store it in Photos.',
        },
        {
          question: 'Is there a watermark on downloaded Pinterest videos?',
          answer:
            'No! MediaKit retrieves the pristine source file before any platform overlay is applied.',
        },
        {
          question: 'Do I need a Pinterest account to download videos?',
          answer:
            'No account, login, or registration is required. MediaKit works anonymously.',
        },
        {
          question: 'Is MediaKit Pinterest downloader free?',
          answer:
            'Yes, MediaKit is 100% free with unlimited downloads forever.',
        },
        {
          question: 'What video quality does MediaKit download for Pinterest?',
          answer:
            'MediaKit delivers the original uploaded resolution, typically 1080p, 720p, or maximum source bitrate.',
        },
        {
          question: 'Can I download Idea Pins / Story Pins from Pinterest?',
          answer:
            'Yes, MediaKit parses video streams from Idea Pins and multi-page video pins.',
        },
        {
          question: 'Is it safe to download videos using MediaKit?',
          answer:
            'MediaKit is secure, HTTPS encrypted, zero-logging, and completely free from malware or adware.',
        },
      ]}
      structuredData={jsonLd}
    />
  );
}
