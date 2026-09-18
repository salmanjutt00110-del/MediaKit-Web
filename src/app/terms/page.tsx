import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import AIChatbot from '@/components/AIChatbot';
import AnimationObserver from '@/components/AnimationObserver';

export const metadata: Metadata = {
  title: 'Terms of Service — MediaKit',
  description:
    'Read the MediaKit terms of service. Understand acceptable personal use, intellectual property compliance, third-party rights, and legal guidelines.',
  alternates: {
    canonical: 'https://mediakit.website/terms',
  },
  openGraph: {
    title: 'Terms of Service — MediaKit',
    description: 'Read the MediaKit terms of service and acceptable personal use guidelines.',
    url: 'https://mediakit.website/terms',
  },
};

export default function TermsPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AnimationObserver />
      <Header />

      <main style={{ flex: 1, padding: '48px 0 64px 0' }}>
        <div className="app-container" style={{ maxWidth: '820px', margin: '0 auto' }}>
          <div style={{ marginBottom: '36px' }}>
            <h1 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', fontWeight: 900, marginBottom: '12px', letterSpacing: '-0.02em' }}>
              Terms of <span style={{ color: 'var(--brand-blue)' }}>Service</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Last updated: September 2026 • Please read these terms carefully before using MediaKit.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.98rem' }}>
            <section style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)', borderRadius: '18px', padding: '28px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px' }}>
                1. Acceptance of Terms
              </h2>
              <p>
                By accessing or using the MediaKit website (<Link href="/" style={{ color: 'var(--brand-blue)', fontWeight: 600 }}>https://mediakit.website</Link>) and its media extraction utilities, you agree to be bound by these Terms of Service. If you do not agree to these terms, please discontinue using the service immediately.
              </p>
            </section>

            <section style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)', borderRadius: '18px', padding: '28px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px' }}>
                2. Acceptable &amp; Authorized Use
              </h2>
              <p>
                MediaKit provides an automated technological tool to assist users in downloading and converting publicly accessible online media for legitimate, personal, non-commercial, educational, or backup purposes.
              </p>
              <p style={{ marginTop: '10px' }}>
                You agree that you will only process content that you own, have licensed, or have explicit permission to access under applicable fair use or public domain provisions. You must not use MediaKit to distribute copyrighted material commercially without authorization.
              </p>
            </section>

            <section style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)', borderRadius: '18px', padding: '28px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px' }}>
                3. DRM &amp; Technical Protection Measures
              </h2>
              <p>
                MediaKit does not bypass digital rights management (DRM) systems, access encryption mechanisms, or circumvent paywalls and private access controls. We strictly interface with publicly accessible media URLs.
              </p>
            </section>

            <section style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)', borderRadius: '18px', padding: '28px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px' }}>
                4. Third-Party Platform Affiliation
              </h2>
              <p>
                MediaKit is an independent online utility. MediaKit is not affiliated with, endorsed by, or sponsored by YouTube, Alphabet Inc., TikTok, ByteDance Ltd., Meta Platforms Inc. (Facebook, Instagram), Pinterest Inc., or any other third-party platform. All registered trademarks, logos, and brand names belong exclusively to their respective owners.
              </p>
            </section>

            <section style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)', borderRadius: '18px', padding: '28px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px' }}>
                5. Disclaimer of Warranties &amp; Limitation of Liability
              </h2>
              <p>
                MediaKit is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, whether express or implied. In no event shall MediaKit, its developers, or contributors be held liable for any damages, data loss, or legal claims resulting from user actions or third-party platform alterations.
              </p>
            </section>

            <section style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)', borderRadius: '18px', padding: '28px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px' }}>
                6. DMCA &amp; Copyright Notice
              </h2>
              <p>
                MediaKit respects intellectual property rights. We do not store or host user video files permanently on our servers. All media is temporarily streamed directly to the requesting client. If you believe your copyrighted work is being accessed inappropriately, please contact us for prompt review.
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
