'use client';

import React from 'react';
import Link from 'next/link';
import {
  Download,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Sparkles,
  Layers,
  ArrowRight,
  Link2,
} from 'lucide-react';
import Header from '@/components/Header';
import Downloader from '@/components/Downloader';
import FinalCTA from '@/components/FinalCTA';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import AIChatbot from '@/components/AIChatbot';
import AnimationObserver from '@/components/AnimationObserver';
import styles from './SeoLandingPage.module.css';

export interface SeoLandingPageProps {
  badgeText: string;
  title: string;
  highlightWord?: string;
  subtitle: string;
  supportedUrls: string[];
  features?: { title: string; description: string }[];
  steps?: { number: number; title: string; description: string }[];
  faqs: { question: string; answer: string }[];
  structuredData?: any;
}

const defaultRelatedTools = [
  { name: 'YouTube Downloader', href: '/youtube-video-downloader' },
  { name: 'YouTube Shorts', href: '/youtube-shorts-downloader' },
  { name: 'TikTok Downloader', href: '/tiktok-video-downloader' },
  { name: 'Instagram Reels', href: '/instagram-reels-downloader' },
  { name: 'Instagram Video', href: '/instagram-video-downloader' },
  { name: 'Facebook Downloader', href: '/facebook-video-downloader' },
  { name: 'Pinterest Downloader', href: '/pinterest-video-downloader' },
  { name: 'YouTube to MP3', href: '/youtube-mp3' },
];

export default function SeoLandingPage({
  badgeText,
  title,
  highlightWord,
  subtitle,
  supportedUrls,
  features,
  steps,
  faqs,
  structuredData,
}: SeoLandingPageProps) {
  const displayTitle = highlightWord && title.includes(highlightWord) ? (
    <>
      {title.substring(0, title.indexOf(highlightWord))}
      <span className={styles.blueAccent}>{highlightWord}</span>
      {title.substring(title.indexOf(highlightWord) + highlightWord.length)}
    </>
  ) : (
    title
  );

  return (
    <div className={styles.pageWrapper}>
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}

      <AnimationObserver />
      <Header />

      <main style={{ flex: 1 }}>
        {/* HERO */}
        <section className={styles.heroSection}>
          <div className="app-container">
            <div className={styles.heroContent}>
              <div className={styles.badge}>
                <Sparkles size={14} />
                <span>{badgeText}</span>
              </div>
              <h1 className={styles.h1}>{displayTitle}</h1>
              <p className={styles.subheading}>{subtitle}</p>
            </div>

            {/* Embedded Interactive Downloader */}
            <Downloader />
          </div>
        </section>

        {/* SUPPORTED URL EXAMPLES */}
        {supportedUrls && supportedUrls.length > 0 && (
          <section className={styles.guideSection}>
            <div className="app-container">
              <div className={styles.urlBox}>
                <h3 className={styles.urlBoxHeading}>
                  <Link2 size={18} color="#2563EB" />
                  <span>Supported Link Formats</span>
                </h3>
                <ul className={styles.urlList}>
                  {supportedUrls.map((ex, idx) => (
                    <li key={idx} className={styles.urlItem}>
                      {ex}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        )}

        {/* HOW TO DOWNLOAD STEPS */}
        <section className={`${styles.guideSection} ${styles.altSection}`}>
          <div className="app-container">
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>How to Download in 3 Steps</h2>
              <p className={styles.sectionSubtitle}>
                MediaKit gives you lightning-fast direct downloads with no account or software required.
              </p>
            </div>

            <div className={styles.stepsGrid}>
              {(steps || [
                {
                  number: 1,
                  title: 'Copy the Media Link',
                  description: 'Navigate to the video or audio clip on the platform, tap Share, and copy the link.',
                },
                {
                  number: 2,
                  title: 'Paste into MediaKit',
                  description: 'Paste the copied URL into the box above. MediaKit automatically detects the format.',
                },
                {
                  number: 3,
                  title: 'Save Instant Download',
                  description: 'Select your preferred resolution or MP3 quality tier and click Download.',
                },
              ]).map((st) => (
                <div key={st.number} className={styles.stepCard}>
                  <div className={styles.stepNumber}>{st.number}</div>
                  <h3 className={styles.stepTitle}>{st.title}</h3>
                  <p className={styles.stepDesc}>{st.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES / BENEFITS */}
        {features && features.length > 0 && (
          <section className={styles.guideSection}>
            <div className="app-container">
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Engineered for Peak Performance</h2>
                <p className={styles.sectionSubtitle}>
                  Every download is processed through our high-speed media pipeline with real format validation.
                </p>
              </div>

              <div className={styles.featuresGrid}>
                {features.map((ft, idx) => (
                  <div key={idx} className={styles.featureCard}>
                    <div className={styles.featureIconWrap}>
                      {idx === 0 ? <Zap size={22} /> : idx === 1 ? <ShieldCheck size={22} /> : <CheckCircle2 size={22} />}
                    </div>
                    <h3 className={styles.featureTitle}>{ft.title}</h3>
                    <p className={styles.featureDesc}>{ft.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* FREQUENTLY ASKED QUESTIONS */}
        {faqs && faqs.length > 0 && (
          <section className={`${styles.guideSection} ${styles.altSection}`}>
            <div className="app-container">
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
                <p className={styles.sectionSubtitle}>
                  Answers to common questions regarding this downloader tool.
                </p>
              </div>

              <div className={styles.faqContainer}>
                {faqs.map((faq, idx) => (
                  <div key={idx} className={styles.faqCard}>
                    <h3 className={styles.faqQuestion}>{faq.question}</h3>
                    <p className={styles.faqAnswer}>{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* RELATED DOWNLOAD TOOLS */}
        <section className={styles.guideSection}>
          <div className="app-container">
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Explore Other Media Tools</h2>
              <p className={styles.sectionSubtitle}>
                Download from your other favorite social networks and video platforms with ease.
              </p>
            </div>

            <div className={styles.relatedGrid}>
              {defaultRelatedTools.map((tool, idx) => (
                <Link key={idx} href={tool.href} className={styles.relatedCard}>
                  <span>{tool.name}</span>
                  <ArrowRight size={14} style={{ marginLeft: 'auto' }} />
                </Link>
              ))}
            </div>
          </div>
        </section>

        <FinalCTA />
      </main>

      <Footer />
      <ScrollToTop />
      <AIChatbot />
    </div>
  );
}
