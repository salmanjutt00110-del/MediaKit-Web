import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, Caveat } from 'next/font/google';
import Script from 'next/script';
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
    default: 'Free Video Downloader Online - Download 1080p, 4K & MP3 | MediaKit',
    template: '%s | MediaKit',
  },
  description:
    'Download videos from YouTube, TikTok, Instagram Reels, Facebook & Pinterest without watermark. Free HD 1080p/4K MP4, 320kbps MP3 audio converter, and batch downloads. Ultra-fast US & UK cloud servers with no registration required.',
  keywords: [
    'video downloader without watermark',
    'free video downloader online',
    'free video downloader usa',
    'free video downloader uk',
    'tiktok video downloader without watermark',
    'tiktok to mp4 hd',
    'youtube video downloader 1080p 4k',
    'youtube to mp3 converter 320kbps',
    'download youtube videos free online',
    'instagram reels downloader free',
    'save instagram reels without watermark',
    'facebook video downloader hd 1080p',
    'pinterest video downloader no watermark',
    'youtube shorts downloader free',
    'online video downloader iphone safari',
    'download videos to camera roll',
    'free mp4 video downloader',
  ],
  authors: [{ name: 'MediaKit', url: baseUrl }],
  creator: 'MediaKit Team',
  publisher: 'MediaKit',
  applicationName: 'MediaKit Video Downloader',
  alternates: {
    canonical: 'https://mediakit.website',
    languages: {
      'en-US': 'https://mediakit.website',
      'en-GB': 'https://mediakit.website',
      'en-CA': 'https://mediakit.website',
      'en-AU': 'https://mediakit.website',
      en: 'https://mediakit.website',
      'x-default': 'https://mediakit.website',
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '',
  },
  other: {
    'google-adsense-account': 'ca-pub-6288952495721129',
    'geo.region': 'US;GB',
    'geo.placename': 'United States; United Kingdom',
    'rating': 'general',
    'coverage': 'Worldwide',
    'target': 'all',
    'HandheldFriendly': 'True',
    'MobileOptimized': '320',
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
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['en_GB', 'en_CA', 'en_AU'],
    url: 'https://mediakit.website',
    siteName: 'MediaKit',
    title: 'Free Video Downloader Online - Download 1080p, 4K & MP3 | MediaKit',
    description:
      'Download YouTube, TikTok, Instagram Reels, Facebook & Pinterest videos free without watermark. HD 1080p, 4K, MP3 audio extraction, fast US & UK servers.',
    images: [
      {
        url: '/logo.png',
        width: 512,
        height: 512,
        alt: 'MediaKit — Universal Video Downloader Without Watermark (US & UK Fast CDN)',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Video Downloader Online - Download 1080p, 4K & MP3 | MediaKit',
    description:
      'Download YouTube, TikTok, Instagram Reels, Facebook & Pinterest videos free without watermark. HD quality, fast servers.',
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
      description: 'Free Online Video Downloader Without Watermark — US & UK Fast CDN',
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
      '@type': 'Organization',
      '@id': `${baseUrl}/#organization`,
      name: 'MediaKit',
      url: baseUrl,
      logo: `${baseUrl}/logo.png`,
      sameAs: [
        'https://x.com/mediakit',
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'Customer Support',
        availableLanguage: ['English'],
      },
    },
    {
      '@type': 'WebApplication',
      '@id': `${baseUrl}/#webapp`,
      name: 'MediaKit Free Video Downloader',
      url: baseUrl,
      applicationCategory: 'MultimediaApplication',
      operatingSystem: 'iOS, Android, Windows, macOS, Linux, ChromeOS',
      browserRequirements: 'Requires JavaScript and HTML5 support',
      inLanguage: ['en-US', 'en-GB'],
      countriesSupported: ['US', 'GB', 'CA', 'AU', 'NZ', 'IE'],
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        priceValidUntil: '2028-12-31',
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        ratingCount: '38450',
        bestRating: '5',
        worstRating: '1',
      },
      description:
        'Free, unlimited, and ultra-fast media downloader supporting YouTube, TikTok, Facebook, Instagram, and Pinterest with direct MP4 and MP3 stream extraction without watermark.',
      featureList: [
        'Automatic platform link detection',
        'TikTok download with no watermark in HD',
        'YouTube Full HD 1080p, 4K, and 320kbps MP3 audio',
        'Facebook Reels and Public Videos download',
        'Instagram Reels and Video stream extraction',
        'Pinterest video and pin downloader',
        'Batch multi-link downloader',
        'High-speed Edge CDN nodes across US & UK',
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
          name: 'Is MediaKit free to use in the US and UK?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, MediaKit is 100% free with no registration, subscription, or software installation required for users in the US, UK, and worldwide.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I download videos without watermark in HD 1080p or 4K?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes! MediaKit automatically extracts the clean source stream without watermarks for TikTok, Instagram Reels, Facebook videos, and YouTube in 1080p Full HD and 4K.',
          },
        },
        {
          '@type': 'Question',
          name: 'How fast are downloads from the United States and United Kingdom?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'MediaKit operates high-speed cloud edge servers in North America (US East, US West) and Western Europe (London, UK) delivering unthrottled gigabit speeds with low latency.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I convert YouTube videos to 320kbps MP3 audio?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, MediaKit allows you to extract studio-grade, high-bitrate 320kbps audio from YouTube videos directly as MP3 files.',
          },
        },
        {
          '@type': 'Question',
          name: 'Which platforms are supported?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'MediaKit supports YouTube, TikTok, Facebook, Instagram, and Pinterest videos, reels, stories, shorts, and audio.',
          },
        },
        {
          '@type': 'Question',
          name: 'How do I save videos directly to iPhone Camera Roll or Android Gallery?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'On iOS, open Safari, paste your video link into MediaKit, tap Download, tap the Safari address bar download arrow, open the file, tap Share, and tap "Save Video" to store it in Photos. On Android, files download straight to your Downloads folder and Gallery automatically.',
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://i.ytimg.com" />
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
      <body className={`${plusJakartaSans.variable} ${caveat.variable}`}>
        <Script
          id="adsbygoogle-init"
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6288952495721129"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        {children}
      </body>
    </html>
  );
}
