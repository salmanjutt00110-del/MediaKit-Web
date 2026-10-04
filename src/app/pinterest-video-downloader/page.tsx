import type { Metadata } from 'next';
import SeoLandingPage from '@/components/SeoLandingPage';

export const metadata: Metadata = {
  title: 'Pinterest Video Downloader | MediaKit',
  description:
    'Download Pinterest videos, Idea Pins, and animated GIFs in original MP4 quality with MediaKit. Paste any pin link or pin.it short URL for fast browser-based saving.',
  keywords: [
    'pinterest video downloader',
    'download pinterest videos',
    'pinterest downloader',
    'save pinterest videos',
    'pinterest pin downloader',
    'pinterest gif downloader',
  ],
  alternates: {
    canonical: 'https://mediakit.website/pinterest-video-downloader',
  },
  openGraph: {
    title: 'Pinterest Video Downloader | MediaKit',
    description:
      'Download Pinterest videos, Idea Pins, and animated GIFs in original MP4 quality. Works with pin.it short links on iPhone, Android, and PC.',
    url: 'https://mediakit.website/pinterest-video-downloader',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pinterest Video Downloader | MediaKit',
    description:
      'Download Pinterest videos and GIFs with MediaKit. Free, fast, and works with standard and pin.it links.',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': 'https://mediakit.website/pinterest-video-downloader#webpage',
      url: 'https://mediakit.website/pinterest-video-downloader',
      name: 'Pinterest Video Downloader | MediaKit',
      description:
        'Download Pinterest videos, Idea Pins, and animated GIFs in original MP4 quality with MediaKit. Paste any pin link or pin.it short URL.',
      isPartOf: {
        '@type': 'WebSite',
        '@id': 'https://mediakit.website/#website',
      },
    },
    {
      '@type': 'WebApplication',
      name: 'MediaKit Pinterest Video Downloader',
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Web Browser, iOS, Android, Windows, macOS, Linux',
      url: 'https://mediakit.website/pinterest-video-downloader',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
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
          item: 'https://mediakit.website/online-video-downloader',
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
      description: 'Save Pinterest video pins in HD MP4 in 4 easy steps.',
      step: [
        {
          '@type': 'HowToStep',
          position: 1,
          name: 'Copy Pinterest Pin Link',
          text: 'Open Pinterest, tap the three dots or Share icon on the video pin, and select "Copy Link". Both pin.it and pinterest.com links are supported.',
        },
        {
          '@type': 'HowToStep',
          position: 2,
          name: 'Paste into MediaKit',
          text: 'Paste the copied URL into the MediaKit search bar above.',
        },
        {
          '@type': 'HowToStep',
          position: 3,
          name: 'Inspect Detected Formats',
          text: 'MediaKit parses the Pinterest CDN stream and presents the available video resolutions and media types.',
        },
        {
          '@type': 'HowToStep',
          position: 4,
          name: 'Download File',
          text: 'Click Download to save the MP4 video, animated GIF, or image directly to your local storage.',
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
            text: 'Copy the Pinterest video pin URL (tap Share > Copy Link), paste it into MediaKit above, and click Download to inspect and save the source MP4 video file.',
          },
        },
        {
          '@type': 'Question',
          name: 'Does MediaKit work with pin.it short links?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes! MediaKit automatically unrolls and resolves pin.it mobile shortened links as well as international Pinterest domains.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I download Pinterest GIFs and images as well as videos?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. MediaKit detects whether a pin contains an MP4 video, an animated GIF, or a static high-resolution image.',
          },
        },
        {
          '@type': 'Question',
          name: 'How do I save Pinterest videos on iPhone or iPad?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Paste the pin link in Safari on MediaKit, tap Download, tap the Safari downloads manager, and select "Save Video" to store it in your iOS Photos gallery.',
          },
        },
        {
          '@type': 'Question',
          name: 'Do I need a Pinterest account to download videos?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No Pinterest account or login is required. Any publicly accessible pin can be processed anonymously.',
          },
        },
      ],
    },
  ],
};

const customRelatedTools = [
  {
    name: 'Online Video Downloader',
    url: '/online-video-downloader',
    description: 'Multi-platform media downloader supporting Pinterest, YouTube, TikTok, Instagram, and Facebook.',
    icon: '🌐',
  },
  {
    name: 'TikTok Video Downloader',
    url: '/tiktok-video-downloader',
    description: 'Download viral TikTok videos and sound clips in clean MP4 format.',
    icon: '🎵',
  },
  {
    name: 'Instagram Video Downloader',
    url: '/instagram-video-downloader',
    description: 'Save public Instagram reels, carousel clips, and stories in high definition.',
    icon: '📸',
  },
  {
    name: 'YouTube Video Downloader',
    url: '/youtube-video-downloader',
    description: 'Download YouTube videos in available resolutions from 1080p down to 360p.',
    icon: '▶️',
  },
];

export default function PinterestVideoDownloaderPage() {
  return (
    <SeoLandingPage
      badgeText="Pinterest Video Tool"
      title="Pinterest Video Downloader"
      highlightWord="Downloader"
      subtitle="Download Pinterest videos, Idea Pins, and animated GIFs in original MP4 quality. Works with standard Pinterest and mobile pin.it links."
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
            'In Pinterest, tap the Share icon or the three dots on the video pin and tap "Copy Link". Both pin.it and pinterest.com links are supported.',
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
          title: 'Save Clean Media',
          description:
            'Save your clean MP4 video, animated GIF, or image directly to your device storage.',
        },
      ]}
      features={[
        {
          title: 'Full Original Resolution',
          description:
            'Preserves crisp source details for DIY guides, recipes, aesthetic loops, and video tutorials.',
        },
        {
          title: 'pin.it Short Link Auto-Unroll',
          description:
            'Seamlessly processes mobile shortened pin.it URLs without manual redirection.',
        },
        {
          title: 'Direct Browser Downloads',
          description:
            'Downloads start immediately in your web browser with no watermarks and no third-party extensions required.',
        },
        {
          title: 'GIF and Image Support',
          description:
            'In addition to MP4 videos, easily save animated GIFs and high-resolution images.',
        },
      ]}
      articles={[
        {
          title: 'How to Download Pinterest Videos and Idea Pins',
          content: [
            'Pinterest is a treasure trove of inspiration for design, home improvement, cooking, fashion, and crafts. Many tutorials and creative clips are published as video pins.',
            'While Pinterest allows you to bookmark pins inside boards, you cannot natively save the actual video file to your camera roll for offline editing or sharing. MediaKit solves this by providing direct access to the source MP4 video stream.',
          ],
        },
        {
          title: 'Saving Pinterest Video Pins on Mobile Devices',
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
          question: 'Do I need a Pinterest account to download videos?',
          answer:
            'No account, login, or registration is required. MediaKit works anonymously.',
        },
      ]}
      structuredData={jsonLd}
      relatedTools={customRelatedTools}
    />
  );
}
