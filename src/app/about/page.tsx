import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import AIChatbot from '@/components/AIChatbot';
import AnimationObserver from '@/components/AnimationObserver';

export const metadata: Metadata = {
  title: 'About MediaKit — High-Speed Online Media Tools',
  description:
    'Learn about MediaKit, our mission to build fast, clean, and reliable media extraction tools for creators, researchers, and everyday web users worldwide.',
  alternates: {
    canonical: 'https://mediakit.website/about',
  },
  openGraph: {
    title: 'About MediaKit — High-Speed Online Media Tools',
    description:
      'Learn about MediaKit, our mission, values, and cross-platform video extraction infrastructure.',
    url: 'https://mediakit.website/about',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About MediaKit',
    description:
      'Fast, clean, and reliable online video tools for creators and web users.',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'AboutPage',
      '@id': 'https://mediakit.website/about#webpage',
      url: 'https://mediakit.website/about',
      name: 'About MediaKit',
      description:
        'Learn about MediaKit, our mission, values, and cross-platform video extraction infrastructure.',
      isPartOf: {
        '@type': 'WebSite',
        '@id': 'https://mediakit.website/#website',
      },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://mediakit.website/',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'About',
          item: 'https://mediakit.website/about',
        },
      ],
    },
  ],
};

export default function AboutPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AnimationObserver />
      <Header />

      <main style={{ flex: 1, padding: '48px 0 64px 0' }}>
        <div className="app-container" style={{ maxWidth: '840px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span
              style={{
                display: 'inline-block',
                padding: '6px 14px',
                borderRadius: '9999px',
                background: 'rgba(59, 130, 246, 0.1)',
                color: 'var(--brand-blue)',
                fontWeight: 700,
                fontSize: '0.85rem',
                marginBottom: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Our Mission &amp; Infrastructure
            </span>
            <h1
              style={{
                fontSize: 'clamp(2rem, 3.8vw, 2.75rem)',
                fontWeight: 900,
                marginBottom: '14px',
                letterSpacing: '-0.02em',
              }}
            >
              About <span style={{ color: 'var(--brand-blue)' }}>MediaKit</span>
            </h1>
            <p
              style={{
                color: 'var(--text-secondary)',
                fontSize: '1.05rem',
                maxWidth: '640px',
                margin: '0 auto',
                lineHeight: 1.6,
              }}
            >
              MediaKit is built to make downloading and saving public web media seamless, transparent, and completely free of spam.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <section
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-light)',
                borderRadius: '20px',
                padding: '32px',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <h2
                style={{
                  fontSize: '1.35rem',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  marginBottom: '14px',
                }}
              >
                Why We Built MediaKit
              </h2>
              <p
                style={{
                  color: 'var(--text-secondary)',
                  lineHeight: 1.7,
                  fontSize: '0.98rem',
                  marginBottom: '14px',
                }}
              >
                The modern internet is flooded with online downloaders overwhelmed by deceptive clickbait, broken redirects, and intrusive pop-up advertisements. Finding a straightforward, honest utility to save a video for offline reference, presentations, research, or travel should not be a frustrating experience.
              </p>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.98rem' }}>
                MediaKit was founded on a simple principle: build a fast, modern, and privacy-conscious media tool that works directly inside the browser without requiring app installations or account sign-ups.
              </p>
            </section>

            <section
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-light)',
                borderRadius: '20px',
                padding: '32px',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <h2
                style={{
                  fontSize: '1.35rem',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  marginBottom: '14px',
                }}
              >
                Our Core Principles
              </h2>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '20px',
                  marginTop: '16px',
                }}
              >
                <div
                  style={{
                    padding: '20px',
                    borderRadius: '14px',
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-card)',
                  }}
                >
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '8px' }}>
                    ⚡ Instant &amp; Lightweight
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    Zero bloat. Fast cloud-assisted parsing with quick responses across mobile and desktop devices.
                  </p>
                </div>

                <div
                  style={{
                    padding: '20px',
                    borderRadius: '14px',
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-card)',
                  }}
                >
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '8px' }}>
                    🔒 Privacy-First Architecture
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    No account registration, no user profiles, and no permanent media retention on our servers.
                  </p>
                </div>

                <div
                  style={{
                    padding: '20px',
                    borderRadius: '14px',
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-card)',
                  }}
                >
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '8px' }}>
                    🎯 Honest Information
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    We never promise artificial upscaling. Available resolutions match what the original author uploaded.
                  </p>
                </div>

                <div
                  style={{
                    padding: '20px',
                    borderRadius: '14px',
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-card)',
                  }}
                >
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '8px' }}>
                    🌐 Universal Compatibility
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    Standards-compliant MP4 and MP3 files that run cleanly across iOS, Android, macOS, and Windows.
                  </p>
                </div>
              </div>
            </section>

            <section
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-light)',
                borderRadius: '20px',
                padding: '32px',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <h2
                style={{
                  fontSize: '1.35rem',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  marginBottom: '14px',
                }}
              >
                Supported Platforms
              </h2>
              <p
                style={{
                  color: 'var(--text-secondary)',
                  lineHeight: 1.7,
                  fontSize: '0.98rem',
                  marginBottom: '16px',
                }}
              >
                MediaKit currently provides specialized support for publicly accessible media on:
              </p>
              <ul
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '12px',
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                }}
              >
                <li>
                  <Link
                    href="/youtube-video-downloader"
                    style={{ color: 'var(--brand-blue)', fontWeight: 600, textDecoration: 'none' }}
                  >
                    → YouTube Video Downloader
                  </Link>
                </li>
                <li>
                  <Link
                    href="/youtube-shorts-downloader"
                    style={{ color: 'var(--brand-blue)', fontWeight: 600, textDecoration: 'none' }}
                  >
                    → YouTube Shorts Downloader
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tiktok-video-downloader"
                    style={{ color: 'var(--brand-blue)', fontWeight: 600, textDecoration: 'none' }}
                  >
                    → TikTok Video Downloader
                  </Link>
                </li>
                <li>
                  <Link
                    href="/instagram-video-downloader"
                    style={{ color: 'var(--brand-blue)', fontWeight: 600, textDecoration: 'none' }}
                  >
                    → Instagram Video Downloader
                  </Link>
                </li>
                <li>
                  <Link
                    href="/facebook-video-downloader"
                    style={{ color: 'var(--brand-blue)', fontWeight: 600, textDecoration: 'none' }}
                  >
                    → Facebook Video Downloader
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pinterest-video-downloader"
                    style={{ color: 'var(--brand-blue)', fontWeight: 600, textDecoration: 'none' }}
                  >
                    → Pinterest Video Downloader
                  </Link>
                </li>
              </ul>
            </section>
          </div>

          <div
            style={{
              textAlign: 'center',
              marginTop: '44px',
              padding: '30px',
              background: 'var(--bg-subtle)',
              borderRadius: '20px',
              border: '1px solid var(--border-card)',
            }}
          >
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '8px' }}>
              Ready to Download?
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '20px' }}>
              Paste your link into the downloader and experience fast, clean media extraction.
            </p>
            <Link href="/" className="btn-primary">
              Open MediaKit Downloader
            </Link>
          </div>
        </div>
      </main>

      <Footer />
      <ScrollToTop />
      <AIChatbot />
    </div>
  );
}
