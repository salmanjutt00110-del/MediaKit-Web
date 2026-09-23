import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import AIChatbot from '@/components/AIChatbot';
import styles from './blog.module.css';

export const metadata: Metadata = {
  title: {
    default: 'Blog — Video Download Guides & Tutorials | MediaKit',
    template: '%s | MediaKit Blog',
  },
  description:
    'Learn how to download videos from YouTube, TikTok, Instagram, Facebook & Pinterest. Free guides and tutorials by MediaKit.',
  alternates: {
    canonical: 'https://mediakit.website/blog',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://mediakit.website/blog',
    siteName: 'MediaKit',
    title: 'Blog — Video Download Guides & Tutorials | MediaKit',
    description:
      'Learn how to download videos from YouTube, TikTok, Instagram, Facebook & Pinterest. Free guides and tutorials by MediaKit.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'MediaKit Guides and Tutorials',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MediaKit Blog — Video Download Guides & Tutorials',
    description:
      'Learn how to download videos from YouTube, TikTok, Instagram, Facebook & Pinterest without watermark.',
    images: ['/og-image.png'],
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.blogContainer}>
      <Header />
      <main className={styles.mainContent}>{children}</main>
      <Footer />
      <ScrollToTop />
      <AIChatbot />
    </div>
  );
}
