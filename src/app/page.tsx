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
import FinalCTA from '@/components/FinalCTA';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import AIChatbot from '@/components/AIChatbot';
import AnimationObserver from '@/components/AnimationObserver';

export const metadata: Metadata = {
  title: 'Free Video Downloader Online - Download 1080p, 4K & MP3 | MediaKit',
  description:
    'Download videos from YouTube, TikTok, Instagram Reels, Facebook & Pinterest without watermark. Free HD 1080p/4K MP4, 320kbps MP3 audio converter, and batch downloads. Ultra-fast US & UK cloud servers.',
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
  },
};

const homeSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      name: 'MediaKit',
      url: 'https://mediakit.website',
      description: 'Free online video downloader without watermark for YouTube, TikTok, Instagram, Facebook & Pinterest with US & UK Edge Servers',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://mediakit.website/?url={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'SoftwareApplication',
      name: 'MediaKit Video Downloader',
      applicationCategory: 'UtilitiesApplication',
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
      },
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

        {/* 8. Frequently Asked Questions */}
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

