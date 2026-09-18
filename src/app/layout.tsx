import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0b0f19' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'MediaKit — Best Free Video Downloader | YouTube, TikTok, Facebook, Instagram',
  description:
    'Download high-definition videos, reels, stories, shorts, and high-bitrate MP3 audio from YouTube, TikTok (no watermark), Facebook, Instagram, and Pinterest for free with blazing fast speed.',
  keywords: [
    'video downloader',
    'free video downloader',
    'youtube video downloader',
    'youtube to mp3',
    'tiktok downloader without watermark',
    'tiktok video download',
    'facebook video downloader',
    'fb reels download',
    'instagram reels downloader',
    'instagram video download',
    'pinterest video download',
    'fast media downloader',
    'online mp4 downloader',
    'online mp3 downloader',
    'hd video downloader',
    'batch video downloader',
  ],
  authors: [{ name: 'MediaKit Team', url: 'https://mediakit.website' }],
  creator: 'MediaKit',
  publisher: 'MediaKit',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://mediakit.website'),
  alternates: {
    canonical: 'https://mediakit.website/',
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
    title: 'MediaKit — Best Free Video Downloader | YouTube, TikTok, Facebook, Instagram',
    description:
      'Fast, free, and watermark-free online media downloader for YouTube, TikTok, Facebook, Instagram, and Pinterest in 1080p HD and 320kbps MP3.',
    url: 'https://mediakit.website/',
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
    title: 'MediaKit — Best Free Video Downloader',
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
      '@type': 'WebApplication',
      '@id': 'https://mediakit.website/#webapp',
      name: 'MediaKit',
      url: 'https://mediakit.website',
      applicationCategory: 'MultimediaApplication',
      operatingSystem: 'Windows, macOS, Linux, Android, iOS',
      browserRequirements: 'Requires JavaScript and HTML5 support',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      description:
        'Free, unlimited, and ultra-fast media downloader supporting YouTube, TikTok, Facebook, Instagram, and Pinterest with direct MP4 and MP3 stream extraction.',
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
          text: 'Choose your desired resolution (1080p, 720p, 360p) or MP3 audio and click Download.',
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
          name: 'Can I download TikTok videos without watermark?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes! MediaKit automatically extracts TikTok videos in crystal-clear HD without any watermark.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I convert YouTube videos to MP3 audio?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, MediaKit allows you to extract high-bitrate audio from YouTube videos directly as MP3 files.',
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
      <body>{children}</body>
    </html>
  );
}
