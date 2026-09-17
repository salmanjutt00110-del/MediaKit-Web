import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafbfc' },
    { media: '(prefers-color-scheme: dark)', color: '#0b0f17' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: 'MediaKit — Download from Any Platform',
  description:
    'MediaKit makes it simple to process supported media links with automatic platform detection and available download options.',
  keywords: [
    'media downloader',
    'video downloader',
    'youtube downloader',
    'tiktok downloader',
    'facebook video download',
    'instagram reels download',
    'auto detect media',
  ],
  authors: [{ name: 'MediaKit Team' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
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
    title: 'MediaKit — Download from Any Platform',
    description:
      'MediaKit makes it simple to process supported media links with automatic platform detection and available download options.',
    url: '/',
    siteName: 'MediaKit',
    images: [
      {
        url: '/logo.png',
        width: 512,
        height: 512,
        alt: 'MediaKit — All-In-One Media Downloader',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'MediaKit — Download from Any Platform',
    description:
      'MediaKit makes it simple to process supported media links with automatic platform detection and available download options.',
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
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
