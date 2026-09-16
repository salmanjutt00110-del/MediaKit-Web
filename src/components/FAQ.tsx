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
    question: 'What platforms does MediaKit support?',
    answer:
      'MediaKit is built to support YouTube, TikTok, Facebook, and Instagram. When you enter a link, MediaKit identifies which platform it belongs to and handles extraction accordingly.',
  },
  {
    question: 'Do I need to select a platform?',
    answer:
      'No. MediaKit features smart auto-detection. You simply paste your link, and our URL analysis engine automatically recognizes the platform without any manual dropdown or button selection.',
  },
  {
    question: 'What formats are available?',
    answer:
      'Available formats depend directly on what the media provider offers for that specific content (commonly MP4 video in various resolutions and MP3 audio). MediaKit only shows formats actually available from the provider.',
  },
  {
    question: "Why can't some links be processed?",
    answer:
      'Links may fail to process if the URL is mistyped, the media was deleted, access is restricted by region, or the content violates platform terms. Ensure your link points directly to public media.',
  },
  {
    question: 'Can private content be downloaded?',
    answer:
      'No. MediaKit strictly respects platform privacy and access controls. It does not bypass paywalls, authentication, or private account restrictions. Only publicly viewable content can be processed.',
  },
  {
    question: 'Do I need an account?',
    answer:
      'No registration is required to use the basic downloader. You can paste public links and process media directly from the homepage.',
  },
  {
    question: 'How does automatic platform detection work?',
    answer:
      'MediaKit analyzes the URL structure, host domain, path hierarchy, and query parameters to verify genuine platform signatures from YouTube, TikTok, Facebook, or Instagram, normalizing the link in real time.',
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
