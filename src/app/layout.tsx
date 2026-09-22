import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, Caveat } from 'next/font/google';
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

const caveat = Caveat({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-caveat',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0b0f19' },
  ],
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mediakit.website';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'MediaKit — Free Online Video Downloader (No Watermark)',
    template: '%s | MediaKit',
  },
  description:
    'Free online video downloader without watermark for YouTube, TikTok, Facebook, Instagram, and Pinterest. Save HD 1080p / 4K videos, reels, shorts, and 320kbps MP3 audio fast.',
  keywords: [
    'free without watermark downloader',
    'free video downloader without watermark',
    'video downloader without watermark',
    'youtube video downloader',
    'facebook video downloader',
    'instagram video downloader',
    'tiktok downloader without watermark',
    'tiktok video download',
    'fb reels download',
    'instagram reels downloader',
    'pinterest video download',
    'youtube to mp3',
    'online video downloader',
    'hd video downloader',
    'batch video downloader',
  ],
  authors: [{ name: 'MediaKit Team', url: baseUrl }],
  creator: 'MediaKit',
  publisher: 'MediaKit',
  alternates: {
    canonical: '/',
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '',
  },
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' },
      { url: '/logo.png', type: 'image/png' },
    ],
    shortcut: ['/favicon.png'],
    apple: [{ url: '/logo.png' }],
  },
  openGraph: {
    title: 'MediaKit — Free Online Video Downloader Without Watermark',
    description:
      'Fast, free, and watermark-free online media downloader for YouTube, TikTok, Facebook, Instagram, and Pinterest with direct MP4 and MP3 streams.',
    url: baseUrl,
    siteName: 'MediaKit',
    images: [
      {
        url: '/logo.png',
        width: 512,
        height: 512,
        alt: 'MediaKit — Universal Video and Audio Downloader',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MediaKit — Free Online Video Downloader (No Watermark)',
    description:
      'Fast, free, and watermark-free online media downloader for YouTube, TikTok, Facebook, Instagram, and Pinterest.',
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const jsonLdSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${baseUrl}/#website`,
      url: baseUrl,
      name: 'MediaKit',
      description: 'Free Online Video Downloader Without Watermark',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${baseUrl}/?url={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'WebApplication',
      '@id': `${baseUrl}/#webapp`,
      name: 'MediaKit',
      url: baseUrl,
      applicationCategory: 'MultimediaApplication',
      operatingSystem: 'Windows, macOS, Linux, Android, iOS',
      browserRequirements: 'Requires JavaScript and HTML5 support',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        ratingCount: '24680',
        bestRating: '5',
        worstRating: '1',
      },
      description:
        'Free, unlimited, and ultra-fast media downloader supporting YouTube, TikTok, Facebook, Instagram, and Pinterest with direct MP4 and MP3 stream extraction without watermark.',
      featureList: [
        'Automatic platform link detection',
        'TikTok download with no watermark',
        'YouTube Full HD 1080p and 320kbps MP3 audio',
        'Facebook Reels and Public Videos download',
        'Instagram Reels and Video stream extraction',
        'Pinterest video and pin downloader',
        'Batch multi-link downloader',
      ],
    },
    {
      '@type': 'HowTo',
      name: 'How to Download Any Video with MediaKit',
      description: 'Step-by-step instructions to download videos from YouTube, TikTok, Facebook, or Instagram in seconds.',
      step: [
        {
          '@type': 'HowToStep',
          name: 'Copy Video Link',
          text: 'Copy the URL of the video, Reel, or Short from YouTube, TikTok, Facebook, or Instagram.',
          position: 1,
        },
        {
          '@type': 'HowToStep',
          name: 'Paste Link into MediaKit',
          text: 'Paste the link into the MediaKit search bar. MediaKit instantly auto-detects the platform.',
          position: 2,
        },
        {
          '@type': 'HowToStep',
          name: 'Select Quality and Download',
          text: 'Choose your desired resolution (1080p, 720p, 4K) or MP3 audio and click Download.',
          position: 3,
        },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Is MediaKit free to use?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, MediaKit is 100% free with no registration, subscription, or software installation required.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I download videos without watermark?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes! MediaKit automatically extracts the clean source stream without watermarks for TikTok, Instagram Reels, Facebook videos, and YouTube.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I convert YouTube videos to MP3 audio?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, MediaKit allows you to extract high-bitrate 320kbps audio from YouTube videos directly as MP3 files.',
          },
        },
        {
          '@type': 'Question',
          name: 'Which platforms are supported?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'MediaKit supports YouTube, TikTok, Facebook, Instagram, and Pinterest videos, reels, and audio.',
          },
        },
        {
          '@type': 'Question',
          name: 'How do I download videos on iPhone or Android?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'On iOS, open Safari, paste the link into MediaKit, tap Download, and use Safari download manager to Save Video to your Photos app. On Android, the file downloads directly to your Downloads folder and Gallery.',
          },
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('mediakit-theme');
                  var theme = saved || 'light';
                  document.documentElement.setAttribute('data-theme', theme);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${plusJakartaSans.variable} ${caveat.variable}`}>{children}</body>
    </html>
  );
}
