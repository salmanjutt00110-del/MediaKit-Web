'use client';

import React from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  ShieldCheck,
  Zap,
  Sparkles,
  Link2,
  Smartphone,
  Laptop,
  Check,
  X,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import Header from '@/components/Header';
import Downloader from '@/components/Downloader';
import FinalCTA from '@/components/FinalCTA';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import AIChatbot from '@/components/AIChatbot';
import AnimationObserver from '@/components/AnimationObserver';
import styles from './SeoLandingPage.module.css';

export interface DeviceGuide {
  device: string;
  iconType: 'iphone' | 'android' | 'desktop';
  steps: string[];
}

export interface ComparisonRow {
  feature: string;
  us: string;
  official: string;
  competitors: string;
}

export interface RichArticle {
  title: string;
  content: string[];
}

export interface SeoLandingPageProps {
  badgeText: string;
  title: string;
  highlightWord?: string;
  subtitle: string;
  supportedUrls: string[];
  features?: { title: string; description: string }[];
  steps?: { number: number; title: string; description: string }[];
  deviceGuides?: DeviceGuide[];
  comparisonRows?: ComparisonRow[];
  articles?: RichArticle[];
  faqs: { question: string; answer: string }[];
  structuredData?: any;
}

const defaultRelatedTools = [
  { name: 'Free Without Watermark', href: '/free-video-downloader-without-watermark' },
  { name: 'YouTube Downloader', href: '/youtube-video-downloader' },
  { name: 'YouTube Shorts', href: '/youtube-shorts-downloader' },
  { name: 'TikTok Downloader', href: '/tiktok-video-downloader' },
  { name: 'Instagram Video', href: '/instagram-video-downloader' },
  { name: 'Instagram Reels', href: '/instagram-reels-downloader' },
  { name: 'Facebook Downloader', href: '/facebook-video-downloader' },
  { name: 'Facebook Reels', href: '/facebook-reels-downloader' },
  { name: 'Pinterest Downloader', href: '/pinterest-video-downloader' },
  { name: 'YouTube to MP3', href: '/youtube-mp3' },
];

const defaultDeviceGuides: DeviceGuide[] = [
  {
    device: 'iPhone & iPad (iOS)',
    iconType: 'iphone',
    steps: [
      'Open the social app, tap Share, and choose "Copy Link".',
      'Open Safari, paste the URL into MediaKit, and tap Download.',
      'Tap Download in Safari\'s prompt, then tap the blue Download Arrow in the address bar and select "Save Video" to save directly to your Photos library.',
    ],
  },
  {
    device: 'Android (Chrome / Browser)',
    iconType: 'android',
    steps: [
      'Copy the video link from the app or browser.',
      'Paste the URL into MediaKit above — platform auto-detection identifies the source instantly.',
      'Choose your resolution (1080p, 720p, or MP3) and tap Download. The file is saved directly to your Downloads folder and Gallery.',
    ],
  },
  {
    device: 'PC, Mac & Laptops',
    iconType: 'desktop',
    steps: [
      'Copy the link from your browser address bar or right-click the video and select "Copy link address".',
      'Paste into MediaKit and select your desired format (up to 4K Ultra HD or 320kbps MP3).',
      'Click Download to save the clean MP4 directly to your computer with no watermark or software installs.',
    ],
  },
];

const defaultComparison: ComparisonRow[] = [
  {
    feature: 'Watermarks & Overlays',
    us: '100% Clean (Zero Watermarks)',
    official: 'Adds Watermark / Logo',
    competitors: 'Injects Site Watermark',
  },
  {
    feature: 'Maximum Video Resolution',
    us: 'Up to 4K / 1080p 60fps',
    official: 'Compressed 720p',
    competitors: 'Usually 360p / 720p Only',
  },
  {
    feature: 'Audio Synchronization',
    us: 'Crystal-Clear Synced Audio',
    official: 'Included',
    competitors: '1080p Often Muted / Silent',
  },
  {
    feature: 'MP3 Audio Extraction',
    us: 'Studio 320kbps MP3',
    official: 'Not Supported',
    competitors: 'Low Quality 128kbps',
  },
  {
    feature: 'Pop-up Ads & Redirects',
    us: 'Zero Pop-ups, 100% Clean',
    official: 'In-app Advertisements',
    competitors: 'Intrusive Popups & Redirects',
  },
  {
    feature: 'Software or App Required',
    us: 'None (Pure Web-Based)',
    official: 'App Required',
    competitors: 'Extensions or Apps Required',
  },
  {
    feature: 'Cost & Usage Limits',
    us: '100% Free Forever, Unlimited',
    official: 'Subscription / Paywall',
    competitors: 'Daily Limits & Paid Tiers',
  },
];

export default function SeoLandingPage({
  badgeText,
  title,
  highlightWord,
  subtitle,
  supportedUrls,
  features,
  steps,
  deviceGuides = defaultDeviceGuides,
  comparisonRows = defaultComparison,
  articles,
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

      {/* Breadcrumbs for SEO & User Navigation */}
      <nav className={styles.breadcrumbNav} aria-label="Breadcrumb">
        <div className="app-container">
          <ol className={styles.breadcrumbList}>
            <li className={styles.breadcrumbItem}>
              <Link href="/">Home</Link>
            </li>
            <li className={styles.breadcrumbSeparator}>/</li>
            <li className={styles.breadcrumbItem}>
              <Link href="/video-downloader">Tools</Link>
            </li>
            <li className={styles.breadcrumbSeparator}>/</li>
            <li className={styles.breadcrumbCurrent} aria-current="page">
              {badgeText}
            </li>
          </ol>
        </div>
      </nav>

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
          </div>
        </section>

        {/* Embedded Interactive Downloader */}
        <Downloader />

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
              <h2 className={styles.sectionTitle}>How to Download in 3 Easy Steps</h2>
              <p className={styles.sectionSubtitle}>
                MediaKit gives you lightning-fast direct downloads with no account, watermarks, or software required.
              </p>
            </div>

            <div className={styles.stepsGrid}>
              {(steps || [
                {
                  number: 1,
                  title: 'Copy the Media Link',
                  description: 'Navigate to the video, reel, or audio clip on the platform, tap Share, and copy the link.',
                },
                {
                  number: 2,
                  title: 'Paste into MediaKit',
                  description: 'Paste the copied URL into the box above. MediaKit automatically detects the format and platform.',
                },
                {
                  number: 3,
                  title: 'Save Instant Download',
                  description: 'Select your preferred resolution (1080p, 4K, 720p) or MP3 audio tier and click Download.',
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

        {/* DEVICE-SPECIFIC DOWNLOAD GUIDES (iPhone, Android, PC) */}
        <section className={styles.guideSection}>
          <div className="app-container">
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Step-by-Step Device Guides</h2>
              <p className={styles.sectionSubtitle}>
                Learn how to save videos directly to your camera roll, gallery, or local drive on any operating system.
              </p>
            </div>

            <div className={styles.deviceGrid}>
              {deviceGuides.map((guide, idx) => (
                <div key={idx} className={styles.deviceCard}>
                  <div className={styles.deviceHeader}>
                    <div className={styles.deviceIcon}>
                      {guide.iconType === 'desktop' ? (
                        <Laptop size={22} />
                      ) : (
                        <Smartphone size={22} />
                      )}
                    </div>
                    <h3 className={styles.deviceName}>{guide.device}</h3>
                  </div>
                  <ul className={styles.deviceStepList}>
                    {guide.steps.map((stepText, sIdx) => (
                      <li key={sIdx} className={styles.deviceStepItem}>
                        <span className={styles.deviceStepBadge}>{sIdx + 1}</span>
                        <span>{stepText}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* COMPARISON TABLE: MediaKit vs Competitors */}
        <section className={`${styles.guideSection} ${styles.altSection}`}>
          <div className="app-container">
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Why Choose MediaKit Over Other Tools?</h2>
              <p className={styles.sectionSubtitle}>
                See how our watermark-free technology, authentic high-definition streams, and clean experience compare.
              </p>
            </div>

            <div className={styles.tableContainer}>
              <table className={styles.compareTable}>
                <thead>
                  <tr>
                    <th>Feature</th>
                    <th className={styles.highlightCol}>MediaKit</th>
                    <th>Official App</th>
                    <th>Other Sites</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row, idx) => (
                    <tr key={idx}>
                      <td>
                        <strong>{row.feature}</strong>
                      </td>
                      <td className={styles.highlightCol}>
                        <span className={styles.checkPositive}>
                          <Check size={16} /> {row.us}
                        </span>
                      </td>
                      <td>
                        <span className={styles.checkNeutral}>
                          <AlertCircle size={15} /> {row.official}
                        </span>
                      </td>
                      <td>
                        <span className={styles.checkNegative}>
                          <X size={15} /> {row.competitors}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FEATURES / BENEFITS */}
        {features && features.length > 0 && (
          <section className={styles.guideSection}>
            <div className="app-container">
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Engineered for Maximum Speed &amp; Quality</h2>
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

        {/* RICH SEMANTIC CONTENT ARTICLES */}
        {articles && articles.length > 0 && (
          <section className={`${styles.guideSection} ${styles.altSection}`}>
            <div className="app-container">
              <div className={styles.richContentBox}>
                {articles.map((art, idx) => (
                  <article key={idx} className={styles.richArticleCard}>
                    <h2 className={styles.richArticleTitle}>{art.title}</h2>
                    {art.content.map((pText, pIdx) => (
                      <p key={pIdx} className={styles.richArticleText}>
                        {pText}
                      </p>
                    ))}
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* FREQUENTLY ASKED QUESTIONS */}
        {faqs && faqs.length > 0 && (
          <section className={styles.guideSection}>
            <div className="app-container">
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
                <p className={styles.sectionSubtitle}>
                  Answers to the most common questions regarding video and audio downloading.
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
        <section className={`${styles.guideSection} ${styles.altSection}`}>
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
