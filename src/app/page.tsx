import React from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Downloader from '@/components/Downloader';
import SupportedPlatforms from '@/components/SupportedPlatforms';
import Features from '@/components/Features';
import StatsStrip from '@/components/StatsStrip';
import FinalCTA from '@/components/FinalCTA';
import Footer from '@/components/Footer';

export default function HomePage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 1. Header */}
      <Header />

      <main style={{ flex: 1 }}>
        {/* 2. Hero (with 3D artwork composition) */}
        <Hero />

        {/* 3. Main Downloader (Pill bar with ambient glow) */}
        <Downloader />

        {/* 4. Supported Platforms (4 large cards with squircle icons) */}
        <SupportedPlatforms />

        {/* 5. Why Choose MediaKit? (4 feature cards) */}
        <Features />

        {/* 6. Statistics Strip (10M+, 50M+, 4.9/5, 100%) */}
        <StatsStrip />

        {/* 7. Start Downloading Now (CTA Card) */}
        <FinalCTA />
      </main>

      {/* 8. Footer */}
      <Footer />
    </div>
  );
}
