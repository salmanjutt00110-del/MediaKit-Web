'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import styles from './FAQ.module.css';

interface FAQEntry {
  question: string;
  answer: string;
}

const faqList: FAQEntry[] = [
  {
    question: 'Is MediaKit free to use in the United States and United Kingdom?',
    answer:
      'Yes, MediaKit is 100% free with no registration, paid tiers, or hidden subscriptions. Users in the US, UK, Canada, and globally can download unlimited videos and MP3 audio streams at full gigabit speeds.',
  },
  {
    question: 'Can I download videos without watermark in HD 1080p and 4K?',
    answer:
      'Absolutely! MediaKit extracts the original source stream without watermarks, promotional stamps, or logos for TikTok, Instagram Reels, Facebook videos, and YouTube. High-resolution streams up to 1080p Full HD and 4K 60fps are fully supported.',
  },
  {
    question: 'How fast are downloads from US and UK cloud servers?',
    answer:
      'Our distributed cloud architecture runs on high-speed edge nodes in North America (US East, US West) and Western Europe (London, UK). Video streams and audio muxing are handled with dedicated low-latency pipelines, delivering downloads in seconds.',
  },
  {
    question: 'How do I save videos directly to iPhone Camera Roll or Android Gallery?',
    answer:
      'On iPhone (iOS Safari): paste your link into MediaKit, tap Download, tap the Safari address bar download arrow, open the MP4 file, tap the Share icon, and choose "Save Video" to place it into your Photos camera roll. On Android: files download directly into your device Downloads folder and appear in your Gallery automatically.',
  },
  {
    question: 'Can I convert YouTube videos to 320kbps MP3 audio?',
    answer:
      'Yes! MediaKit includes a built-in high-bitrate audio extractor that converts YouTube videos into studio-grade 320kbps MP3 files, ideal for offline listening on mobile phones and cars.',
  },
  {
    question: 'What platforms does MediaKit support?',
    answer:
      'MediaKit supports YouTube (videos, Shorts, playlists), TikTok (no watermark), Instagram (Reels, stories, posts), Facebook (public videos, Reels), and Pinterest pins.',
  },
  {
    question: 'Do I need to install any app or browser extension?',
    answer:
      'No. MediaKit is 100% web-based and runs in any modern browser (Safari, Chrome, Firefox, Edge) on mobile and desktop without downloading any suspicious software or extensions.',
  },
];

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggleItem = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section id="faq" className={styles.sectionWrapper} aria-labelledby="faq-heading">
      <div className="app-container">
        <div className={styles.sectionHeader}>
          <h2 id="faq-heading" className={styles.sectionTitle}>
            Frequently Asked Questions
          </h2>
          <p className={styles.sectionSubtitle}>
            Everything you need to know about how MediaKit operates and handles links.
          </p>
        </div>

        <div className={styles.faqContainer}>
          {faqList.map((item, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className={`${styles.faqItem} ${isOpen ? styles.faqItemOpen : ''}`}
              >
                <button
                  type="button"
                  className={styles.faqTrigger}
                  onClick={() => toggleItem(idx)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${idx}`}
                >
                  <span>{item.question}</span>
                  <ChevronDown
                    size={18}
                    className={`${styles.faqIcon} ${
                      isOpen ? styles.faqIconExpanded : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div
                    id={`faq-answer-${idx}`}
                    className={styles.faqContent}
                    role="region"
                  >
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
