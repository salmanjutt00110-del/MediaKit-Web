'use client';

import React from 'react';
import Link from 'next/link';
import { Zap, ArrowRight } from 'lucide-react';
import styles from './FinalCTA.module.css';

export default function FinalCTA() {
  return (
    <section className={styles.sectionWrapper} aria-label="Call to Action">
      <div className="app-container">
        <div className={styles.ctaCard}>
          {/* Left Column: Heading & Subtitle */}
          <div className={styles.ctaLeft}>
            <h2 className={styles.ctaTitle}>
              Start Downloading <span className={styles.blueHighlight}>Now</span>
            </h2>
            <p className={styles.ctaDesc}>
              Paste your link and get your content in seconds.
            </p>
          </div>

          {/* Right Column: CTA Button & Subnote */}
          <div className={styles.ctaRight}>
            <Link href="#downloader" className={styles.ctaBtn}>
              <Zap size={18} fill="#ffffff" />
              <span>Try MediaKit Now</span>
              <ArrowRight size={18} />
            </Link>
            <span className={styles.ctaSubnote}>Fast. Free. No limits.</span>
          </div>
        </div>
      </div>
    </section>
  );
}
