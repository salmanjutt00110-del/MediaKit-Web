import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import AIChatbot from '@/components/AIChatbot';
import AnimationObserver from '@/components/AnimationObserver';

export const metadata: Metadata = {
  title: 'Privacy Policy — MediaKit',
  description:
    'MediaKit privacy policy. Learn how we handle your data with zero permanent logs, stateless streaming, and strict user confidentiality.',
  alternates: {
    canonical: 'https://mediakit.website/privacy',
  },
  openGraph: {
    title: 'Privacy Policy — MediaKit',
    description: 'Learn how MediaKit protects user confidentiality with zero permanent storage.',
    url: 'https://mediakit.website/privacy',
  },
};

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AnimationObserver />
      <Header />

      <main style={{ flex: 1, padding: '48px 0 64px 0' }}>
        <div className="app-container" style={{ maxWidth: '820px', margin: '0 auto' }}>
          <div style={{ marginBottom: '36px' }}>
            <h1 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', fontWeight: 900, marginBottom: '12px', letterSpacing: '-0.02em' }}>
              Privacy <span style={{ color: 'var(--brand-blue)' }}>Policy</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Last updated: September 2026 • Your privacy and confidentiality are foundational to MediaKit.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.98rem' }}>
            <section style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)', borderRadius: '18px', padding: '28px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px' }}>
                1. Zero Account &amp; Identity Tracking
              </h2>
              <p>
                MediaKit does not require account creation, registration, email addresses, phone numbers, or passwords. We do not maintain user profiles, identity databases, or personal user histories.
              </p>
            </section>

            <section style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)', borderRadius: '18px', padding: '28px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px' }}>
                2. Media Processing &amp; Temporary Storage
              </h2>
              <p>
                Media downloaded or converted through MediaKit is streamed statelessly to your browser. Whenever an intermediary format merge is required (such as synchronizing YouTube DASH video and audio), the resulting temporary file is stored in a sandboxed, ephemeral temporary directory and automatically purged after 20 minutes.
              </p>
              <p style={{ marginTop: '10px' }}>
                We never retain a permanent catalog, copy, or archive of media requested or downloaded by our users.
              </p>
            </section>

            <section style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)', borderRadius: '18px', padding: '28px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px' }}>
                3. Browser Storage &amp; Cookies
              </h2>
              <p>
                MediaKit uses browser LocalStorage solely to preserve your selected visual theme preference (Light or Dark mode). We do not use persistent tracking cookies or cross-site fingerprinting mechanisms.
              </p>
            </section>

            <section style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)', borderRadius: '18px', padding: '28px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px' }}>
                4. Server Security &amp; Transmission Protection
              </h2>
              <p>
                All communications between your device and MediaKit are encrypted end-to-end using industry-standard TLS (HTTPS). Our backend enforces server-side request filtering (SSRF protection), file path traversal sanitation, and strict request rate-limiting to protect infrastructure integrity.
              </p>
            </section>

            <section style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)', borderRadius: '18px', padding: '28px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px' }}>
                5. Changes to This Privacy Policy
              </h2>
              <p>
                We may periodically update this Privacy Policy to reflect technical optimizations or regulatory changes. Any modifications will be posted directly to this page with an updated timestamp.
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
