import React from 'react';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Downloader from '@/components/Downloader';
import SupportedPlatforms from '@/components/SupportedPlatforms';
import HowItWorks from '@/components/HowItWorks';
import Features from '@/components/Features';
import DedicatedTools from '@/components/DedicatedTools';
import StatsStrip from '@/components/StatsStrip';
import FAQ from '@/components/FAQ';
import LegalSection from '@/components/LegalSection';
import ContactSection from '@/components/ContactSection';
import ReviewsSection from '@/components/ReviewsSection';
import FinalCTA from '@/components/FinalCTA';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import AIChatbot from '@/components/AIChatbot';
import AnimationObserver from '@/components/AnimationObserver';

export const metadata: Metadata = {
  title: 'MediaKit – Free Online Video Downloader | YouTube, TikTok, Instagram & More',
  description:
    'Download videos online from supported platforms with MediaKit. Paste a link, detect the platform automatically and choose available media formats.',
  alternates: {
    canonical: 'https://mediakit.website/',
  },
  openGraph: {
    title: 'MediaKit – Free Online Video Downloader | YouTube, TikTok, Instagram & More',
    description:
      'Download videos online from supported platforms with MediaKit. Paste a link, detect the platform automatically and choose available media formats.',
    url: 'https://mediakit.website/',
    locale: 'en_US',
    siteName: 'MediaKit',
    images: [
      {
        url: 'https://mediakit.website/logo.png',
        width: 512,
        height: 512,
        alt: 'MediaKit – Free Online Video Downloader',
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
};

const homeSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': 'https://mediakit.website/#webpage',
      url: 'https://mediakit.website/',
      name: 'MediaKit – Free Online Video Downloader | YouTube, TikTok, Instagram & More',
      description:
        'Download videos online from supported platforms with MediaKit. Paste a link, detect the platform automatically and choose available media formats.',
      isPartOf: {
        '@type': 'WebSite',
        '@id': 'https://mediakit.website/#website',
      },
    },
    {
      '@type': 'WebApplication',
      '@id': 'https://mediakit.website/#app',
      name: 'MediaKit Online Video Downloader',
      url: 'https://mediakit.website/',
      applicationCategory: 'MultimediaApplication',
      operatingSystem: 'iOS, Android, Windows, macOS, Linux, ChromeOS',
      browserRequirements: 'Requires JavaScript and HTML5 support',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      featureList: [
        'Automatic platform link detection for YouTube, TikTok, Instagram, Facebook, and Pinterest',
        'Clean source stream extraction with zero platform watermarks',
        'Multi-format support for MP4 video and MP3 audio',
        'High-resolution downloads up to 1080p and 4K where supported by source',
        'Multi-link batch processing mode',
        'No registration, software, or extensions required',
      ],
    },
    {
      '@type': 'HowTo',
      name: 'How to Download Any Online Video with MediaKit',
      description: 'Follow these 3 easy steps to download videos from YouTube, TikTok, Instagram, Facebook or Pinterest.',
      step: [
        {
          '@type': 'HowToStep',
          position: 1,
          name: 'Copy Video Link',
          text: 'Open YouTube, TikTok, Instagram, Facebook, or Pinterest, and copy the link to the video, reel, or short.',
        },
        {
          '@type': 'HowToStep',
          position: 2,
          name: 'Paste URL into MediaKit',
          text: 'Paste the copied URL into the search bar at the top of MediaKit. MediaKit automatically detects the platform and fetches available media streams.',
        },
        {
          '@type': 'HowToStep',
          position: 3,
          name: 'Choose Format and Download',
          text: 'Select your preferred format (e.g. 1080p Full HD MP4 or MP3 audio) and click Download to save the file directly to your device.',
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
            text: 'Yes, MediaKit is 100% free with no registration, paid tiers, or hidden subscriptions.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I download videos without watermark in HD 1080p and 4K?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes! MediaKit extracts the original source stream without watermarks for TikTok, Instagram Reels, Facebook videos, and YouTube where available from the source.',
          },
        },
        {
          '@type': 'Question',
          name: 'How do I save videos directly to iPhone Camera Roll or Android Gallery?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'On iPhone (iOS Safari): paste your link into MediaKit, tap Download, tap the Safari address bar download arrow, open the file, tap Share, and choose "Save Video". On Android: files download directly into your Downloads folder and Gallery automatically.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I convert YouTube videos to MP3 audio?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, MediaKit includes a high-bitrate audio extractor that converts supported videos into MP3 files for offline listening.',
          },
        },
        {
          '@type': 'Question',
          name: 'What platforms does MediaKit support?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'MediaKit supports YouTube (videos, Shorts), TikTok, Instagram (Reels, stories, posts), Facebook (public videos, Reels), and Pinterest pins.',
          },
        },
        {
          '@type': 'Question',
          name: 'Do I need to install any app or browser extension?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No. MediaKit is 100% web-based and runs in any modern browser without downloading any software or extensions.',
          },
        },
      ],
    },
  ],
};

export default function HomePage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeSchema) }}
      />
      {/* Scroll animation engine */}
      <AnimationObserver />

      {/* 1. Navigation Header */}
      <Header />

      <main style={{ flex: 1 }}>
        {/* 2. Hero */}
        <Hero />

        {/* 3. Main Downloader (Pill bar with auto-detection) */}
        <Downloader />

        {/* 4. Supported Platforms (YouTube, TikTok, Facebook, Instagram) */}
        <SupportedPlatforms />

        {/* 5. How It Works (Step-by-step process) */}
        <HowItWorks />

        {/* 6. Why Choose MediaKit? (Key features) */}
        <Features />

        {/* 6b. Platform-Specific Downloader Links (SEO Internal Linking) */}
        <DedicatedTools />

        {/* 7. Platform Highlights (5 Platforms, Dynamic Quality, 100% Free, Safe) */}
        <StatsStrip />

        {/* 8. User Reviews & Community Trust */}
        <ReviewsSection />

        {/* 9. Frequently Asked Questions */}
        <FAQ />

        {/* 10. Legal Transparency: Disclaimer & Privacy Policy */}
        <LegalSection />

        {/* 11. Contact Us (Priority Support & Feedback Form) */}
        <ContactSection />

        {/* 12. Final CTA Card */}
        <FinalCTA />
      </main>

      {/* 13. Footer with navigation, GitHub, and social links */}
      <Footer />

      {/* 14. Floating Back to Top Button */}
      <ScrollToTop />

      {/* 15. Interactive AI Chatbot Assistant */}
      <AIChatbot />
    </div>
  );
}

