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

const baseUrl = 'https://mediakit.website';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'MediaKit – Free Online Video Downloader | YouTube, TikTok, Instagram & More',
    template: '%s',
  },
  description:
    'Download videos online from supported platforms with MediaKit. Paste a link, detect the platform automatically and choose available media formats.',
  keywords: [
    'video downloader',
    'free video downloader',
    'online video downloader',
    'youtube video downloader',
    'tiktok video downloader',
    'instagram video downloader',
    'facebook video downloader',
    'pinterest video downloader',
    'youtube shorts downloader',
    'instagram reels downloader',
    'facebook reels downloader',
    'youtube to mp3',
    'mp4 video downloader',
    'mp3 downloader',
  ],
  authors: [{ name: 'MediaKit', url: baseUrl }],
  creator: 'MediaKit Team',
  publisher: 'MediaKit',
  applicationName: 'MediaKit',
  alternates: {
    canonical: 'https://mediakit.website/',
    languages: {
      'en': 'https://mediakit.website/',
      'x-default': 'https://mediakit.website/',
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '',
  },
  other: {
    'google-adsense-account': 'ca-pub-6288952495721129',
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
    url: 'https://mediakit.website/',
    siteName: 'MediaKit',
    title: 'MediaKit – Free Online Video Downloader | YouTube, TikTok, Instagram & More',
    description:
      'Download videos online from supported platforms with MediaKit. Paste a link, detect the platform automatically and choose available media formats.',
    images: [
      {
        url: 'https://mediakit.website/logo.png',
        width: 512,
        height: 512,
        alt: 'MediaKit Online Video Downloader',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MediaKit – Free Online Video Downloader | YouTube, TikTok, Instagram & More',
    description:
      'Download videos online from supported platforms with MediaKit. Paste a link, detect the platform automatically and choose available media formats.',
    images: ['https://mediakit.website/logo.png'],
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

const rootIdentitySchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': 'https://mediakit.website/#website',
      url: 'https://mediakit.website/',
      name: 'MediaKit',
      description: 'Free Online Video Downloader for YouTube, TikTok, Instagram, Facebook, and Pinterest.',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://mediakit.website/?url={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'Organization',
      '@id': 'https://mediakit.website/#organization',
      name: 'MediaKit',
      url: 'https://mediakit.website/',
      logo: 'https://mediakit.website/logo.png',
      sameAs: [
        'https://x.com/mediakit',
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'Customer Support',
        availableLanguage: ['English'],
      },
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(rootIdentitySchema) }}
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
