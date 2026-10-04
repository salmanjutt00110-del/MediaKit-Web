import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import AIChatbot from '@/components/AIChatbot';
import AnimationObserver from '@/components/AnimationObserver';

export const metadata: Metadata = {
  title: 'Contact Support & Inquiries — MediaKit',
  description:
    'Get in touch with the MediaKit team for technical support, feature feedback, partnership inquiries, and copyright communications.',
  alternates: {
    canonical: 'https://mediakit.website/contact',
  },
  openGraph: {
    title: 'Contact Support & Inquiries — MediaKit',
    description:
      'Get in touch with the MediaKit team for technical support, feedback, and copyright notices.',
    url: 'https://mediakit.website/contact',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact MediaKit Support',
    description: 'Assistance, feedback, and inquiries for MediaKit.',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'ContactPage',
      '@id': 'https://mediakit.website/contact#webpage',
      url: 'https://mediakit.website/contact',
      name: 'Contact MediaKit',
      description:
        'Official contact page for MediaKit online video downloader support and inquiries.',
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
          name: 'Contact',
          item: 'https://mediakit.website/contact',
        },
      ],
    },
  ],
};

export default function ContactPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AnimationObserver />
      <Header />

      <main style={{ flex: 1, padding: '48px 0 64px 0' }}>
        <div className="app-container" style={{ maxWidth: '820px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
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
              Assistance &amp; Communication
            </span>
            <h1
              style={{
                fontSize: 'clamp(2rem, 3.8vw, 2.75rem)',
                fontWeight: 900,
                marginBottom: '14px',
                letterSpacing: '-0.02em',
              }}
            >
              Contact <span style={{ color: 'var(--brand-blue)' }}>MediaKit</span>
            </h1>
            <p
              style={{
                color: 'var(--text-secondary)',
                fontSize: '1.05rem',
                maxWidth: '620px',
                margin: '0 auto',
                lineHeight: 1.6,
              }}
            >
              Have a question about a video format, encountering an issue with a URL, or need assistance? We are here to help.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
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
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  marginBottom: '16px',
                }}
              >
                Quick Support Options
              </h2>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '16px',
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
                  <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>💬</div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px' }}>
                    Instant AI Assistant
                  </h3>
                  <p
                    style={{
                      fontSize: '0.88rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.5,
                      marginBottom: '14px',
                    }}
                  >
                    Get instant troubleshooting guidance for links, mobile downloads, and file formats using the AI chat widget in the lower right corner.
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
                  <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>📱</div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px' }}>
                    WhatsApp Direct Support
                  </h3>
                  <p
                    style={{
                      fontSize: '0.88rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.5,
                      marginBottom: '14px',
                    }}
                  >
                    Reach our technical support team directly on WhatsApp for troubleshooting and reporting platform bugs.
                  </p>
                  <a
                    href="https://wa.me/923100128702?text=Hello%20MediaKit%20Support"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      color: 'var(--brand-blue)',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      textDecoration: 'none',
                    }}
                  >
                    Open WhatsApp Chat →
                  </a>
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
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  marginBottom: '14px',
                }}
              >
                Frequently Encountered Questions
              </h2>
              <p
                style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.95rem',
                  lineHeight: 1.6,
                  marginBottom: '16px',
                }}
              >
                Before sending a message, check our FAQ section where common questions about iPhone saving, audio extraction, format availability, and platform support are answered in detail.
              </p>
              <Link
                href="/faq"
                style={{
                  color: 'var(--brand-blue)',
                  fontWeight: 700,
                  textDecoration: 'none',
                  fontSize: '0.95rem',
                }}
              >
                View Frequently Asked Questions (FAQ) →
              </Link>
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
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  marginBottom: '14px',
                }}
              >
                DMCA &amp; Content Inquiries
              </h2>
              <p
                style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.95rem',
                  lineHeight: 1.6,
                  marginBottom: '12px',
                }}
              >
                MediaKit respects intellectual property rights and only processes publicly available media without hosting or storing video files permanently on our servers.
              </p>
              <p
                style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.95rem',
                  lineHeight: 1.6,
                }}
              >
                If you are a copyright owner or designated agent and have questions regarding media accessibility, please refer to our{' '}
                <Link href="/terms" style={{ color: 'var(--brand-blue)', fontWeight: 600 }}>
                  Terms of Service
                </Link>{' '}
                and reach out via our official communication channels.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
      <ScrollToTop />
      <AIChatbot />
    </div>
  );
}
