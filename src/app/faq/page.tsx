import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import AIChatbot from '@/components/AIChatbot';
import AnimationObserver from '@/components/AnimationObserver';
import styles from '@/components/FAQ.module.css';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions (FAQ) — MediaKit',
  description:
    'Got questions about downloading videos, platform support, supported resolutions, audio extraction, or device compatibility? Read our comprehensive FAQ guide.',
  alternates: {
    canonical: 'https://mediakit.website/faq',
  },
  openGraph: {
    title: 'Frequently Asked Questions (FAQ) — MediaKit',
    description:
      'Got questions about downloading videos, platform support, supported resolutions, audio extraction, or device compatibility? Read our comprehensive FAQ guide.',
    url: 'https://mediakit.website/faq',
  },
};

const faqCategories = [
  {
    category: 'General & Getting Started',
    items: [
      {
        question: 'What is MediaKit?',
        answer:
          'MediaKit is a high-speed, web-based media downloader designed to extract video, audio, reels, and shorts from platforms like YouTube, TikTok, Instagram, Facebook, and Pinterest in original high definition.',
      },
      {
        question: 'Is MediaKit free to use?',
        answer:
          'Yes, MediaKit is completely free with no registration, subscription fees, credit cards, or software installation required.',
      },
      {
        question: 'How do I download a video?',
        answer:
          'Copy the share link of any supported video, paste it into the search box on the homepage or dedicated tool page, and click Download. You will see authentic quality options (such as 1080p, 720p, or MP3) to save directly.',
      },
    ],
  },
  {
    category: 'Platform Support & Formats',
    items: [
      {
        question: 'Can I download TikTok videos without watermark?',
        answer:
          'Yes. MediaKit extracts the original source stream before TikTok burns in the watermark, delivering a clean MP4 video.',
      },
      {
        question: 'Why do some YouTube videos have higher resolutions than others?',
        answer:
          'MediaKit only displays the resolutions actually provided by YouTube and the original uploader. If a video was uploaded in 4K, 4K is available; if it was only recorded in 720p, 720p is the maximum available tier.',
      },
      {
        question: 'Can I download private or protected videos?',
        answer:
          'No. In compliance with copyright, DRM, and platform safety regulations, MediaKit strictly processes public media. We do not bypass paywalls, private account restrictions, or copyright protections.',
      },
    ],
  },
  {
    category: 'Audio & MP3 Conversion',
    items: [
      {
        question: 'How do I extract only audio or MP3?',
        answer:
          'When you paste a link, scroll to the "Audio Only (MP3)" section in the format picker and click Instant Download to save the stereo soundtrack.',
      },
      {
        question: 'What audio bitrate is provided?',
        answer:
          'MediaKit delivers the highest available source audio stream provided by the platform, typically up to 320kbps equivalent fidelity.',
      },
    ],
  },
  {
    category: 'Troubleshooting & Devices',
    items: [
      {
        question: 'Where are downloaded files saved on iPhone / iPad?',
        answer:
          'When using Safari on iOS, downloaded files appear in your Safari Downloads manager and the Files app. From Files, you can tap Share and choose "Save Video" to place it directly in the Photos app.',
      },
      {
        question: 'What should I do if a link fails to process?',
        answer:
          'Ensure the URL is a public link, verify your internet connection, and try refreshing the page. If the issue persists, the video may have been removed or restricted by the creator.',
      },
    ],
  },
];

const allQuestions = faqCategories.flatMap((c) => c.items);
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: allQuestions.map((q) => ({
    '@type': 'Question',
    name: q.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: q.answer,
    },
  })),
};

export default function FaqPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AnimationObserver />
      <Header />

      <main style={{ flex: 1, padding: '40px 0 60px 0' }}>
        <div className="app-container" style={{ maxWidth: '860px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 900, marginBottom: '14px', letterSpacing: '-0.02em' }}>
              Frequently Asked <span style={{ color: 'var(--brand-blue)' }}>Questions</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '620px', margin: '0 auto' }}>
              Find quick answers to questions about downloading, supported formats, devices, audio extraction, and legality.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {faqCategories.map((cat, catIdx) => (
              <section key={catIdx} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-light)', borderRadius: '20px', padding: '28px', boxShadow: 'var(--shadow-sm)' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-blue)', marginBottom: '20px', letterSpacing: '-0.01em' }}>
                  {cat.category}
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  {cat.items.map((item, qIdx) => (
                    <div key={qIdx} style={{ paddingBottom: '16px', borderBottom: qIdx < cat.items.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                        {item.question}
                      </h3>
                      <p style={{ fontSize: '0.94rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        {item.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '48px', padding: '32px', background: 'var(--bg-subtle)', borderRadius: '20px', border: '1px solid var(--border-card)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '8px' }}>Still Have Questions?</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '20px' }}>
              Our team and interactive AI assistant are always here to assist you.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/" className="btn-primary">
                Go to Downloader
              </Link>
              <a
                href="https://wa.me/923100128702?text=Hello%20MediaKit%20Support"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '12px 24px',
                  borderRadius: '9999px',
                  border: '1px solid var(--border-light)',
                  background: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  textDecoration: 'none',
                }}
              >
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <ScrollToTop />
      <AIChatbot />
    </div>
  );
}
