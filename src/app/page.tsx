import React from 'react';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Downloader from '@/components/Downloader';
import SupportedPlatforms from '@/components/SupportedPlatforms';
import HowItWorks from '@/components/HowItWorks';
import Features from '@/components/Features';
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
  title: 'Free Video Downloader Online - Download 1080p, 4K & MP3 | MediaKit',
  description:
    'Download videos from YouTube, TikTok, Instagram Reels, Facebook & Pinterest without watermark. Free HD 1080p/4K MP4, 320kbps MP3 audio converter, and batch downloads. Ultra-fast US & UK cloud servers with zero ads.',
  alternates: {
    canonical: 'https://mediakit.website/',
    languages: {
      'en-US': 'https://mediakit.website/',
      'en-GB': 'https://mediakit.website/',
      'en-CA': 'https://mediakit.website/',
      'en-AU': 'https://mediakit.website/',
      en: 'https://mediakit.website/',
      'x-default': 'https://mediakit.website/',
    },
  },
  openGraph: {
    title: 'Free Video Downloader Online - Download 1080p, 4K & MP3 | MediaKit',
    description:
      'Download videos from YouTube, TikTok, Instagram Reels, Facebook & Pinterest without watermark. Free HD 1080p/4K, MP3 audio, batch download. Fast US & UK CDN.',
    url: 'https://mediakit.website/',
    locale: 'en_US',
    siteName: 'MediaKit',
    images: [
      {
        url: '/logo.png',
        width: 512,
        height: 512,
        alt: 'MediaKit Free Video Downloader Without Watermark',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Video Downloader Online - Download 1080p, 4K & MP3 | MediaKit',
    description:
      'Download videos from YouTube, TikTok, Instagram Reels, Facebook & Pinterest without watermark. Free HD 1080p/4K MP4 and MP3 audio converter.',
    images: ['/logo.png'],
  },
};

const homeSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': 'https://mediakit.website/#website',
      name: 'MediaKit',
      url: 'https://mediakit.website',
      description: 'Free online video downloader without watermark for YouTube, TikTok, Instagram, Facebook & Pinterest with US & UK Edge Servers',
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
      url: 'https://mediakit.website',
      logo: 'https://mediakit.website/logo.png',
      sameAs: ['https://x.com/mediakit'],
    },
    {
      '@type': 'SoftwareApplication',
      '@id': 'https://mediakit.website/#app',
      name: 'MediaKit Video Downloader',
      applicationCategory: 'MultimediaApplication',
      operatingSystem: 'iOS, Android, Windows, macOS, Linux, ChromeOS',
      inLanguage: ['en-US', 'en-GB'],
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        ratingCount: '38450',
        reviewCount: '24180',
        bestRating: '5',
        worstRating: '1',
      },
      featureList: [
        'Download TikTok videos without watermark in HD',
        'Download YouTube videos in 1080p, 4K & convert to 320kbps MP3',
        'Download Instagram Reels, stories, and videos in original quality',
        'Download Facebook public videos & reels in 1080p HD',
        'Download Pinterest video pins and photos without watermark',
        'Multi-link batch downloader supporting up to 25 links simultaneously',
        'Zero ads, zero redirects, 100% free with no registration required',
      ],
    },
    {
      '@type': 'HowTo',
      name: 'How to Download Any Online Video Free Without Watermark',
      description: 'Follow these 3 easy steps to download videos from YouTube, TikTok, Instagram, Facebook or Pinterest in HD quality.',
      step: [
        {
          '@type': 'HowToStep',
          position: 1,
          name: 'Copy Video URL',
          text: 'Open YouTube, TikTok, Instagram, or Facebook, and copy the link to the video, reel, or short you want to save.',
        },
        {
          '@type': 'HowToStep',
          position: 2,
          name: 'Paste into MediaKit',
          text: 'Paste the copied URL into the search bar at the top of MediaKit. The smart detection engine immediately identifies the platform and extracts available resolutions.',
        },
        {
          '@type': 'HowToStep',
          position: 3,
          name: 'Choose Format and Download',
          text: 'Select your preferred format (e.g. 1080p Full HD MP4 or 320kbps MP3) and click Download. The file is saved directly to your device downloads folder without watermarks.',
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

