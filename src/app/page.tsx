import React from 'react';
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

export default function HomePage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* 1. Navigation Header (Logo click scrolls to top, GitHub link) */}
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

        {/* 7. Statistics Strip (Global users, downloads, uptime) */}
        <StatsStrip />

        {/* 8. Frequently Asked Questions */}
        <FAQ />

        {/* 9. Legal Transparency: Disclaimer & Privacy Policy */}
        <LegalSection />

        {/* 10. Contact Us (WhatsApp Direct Chat + Message Form) */}
        <ContactSection />

        {/* 11. Final CTA Card */}
        <FinalCTA />
      </main>

      {/* 12. Footer with navigation, GitHub, WhatsApp, and social links */}
      <Footer />

      {/* 13. Floating Back to Top Button */}
      <ScrollToTop />

      {/* 14. Interactive AI Chatbot Assistant */}
      <AIChatbot />
    </div>
  );
}

