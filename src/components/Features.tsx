'use client';

import React from 'react';
import { Zap, FileText, Gauge, Shield } from 'lucide-react';
import styles from './Features.module.css';

const features = [
  {
    title: 'High-Speed US & UK Cloud',
    description: 'Gigabit edge CDN servers across North America and Western Europe deliver unthrottled downloads in seconds.',
    icon: <Zap size={24} />,
    iconClass: styles.iconBlue,
  },
  {
    title: 'Zero Watermark & HD 4K',
    description: 'Save TikTok, Instagram Reels, and YouTube videos in original 1080p and 4K without annoying watermarks or logos.',
    icon: <FileText size={24} />,
    iconClass: styles.iconPurple,
  },
  {
    title: 'Studio 320kbps MP3 Audio',
    description: 'Extract pristine stereo audio from music videos, podcasts, and talks with automated FFmpeg track synchronization.',
    icon: <Gauge size={24} />,
    iconClass: styles.iconGreen,
  },
  {
    title: '100% Free & Private',
    description: 'No signup, no tracking logs, and no app installs. Native mobile browser experience for iOS Safari & Android Chrome.',
    icon: <Shield size={24} />,
    iconClass: styles.iconOrange,
  },
];

export default function Features() {
  return (
    <section className={styles.sectionWrapper} aria-labelledby="features-heading">
      <div className="app-container">
        <div className={styles.sectionHeader}>
          <h2 id="features-heading" className={styles.sectionTitle}>
            Why Choose <span className={styles.blueHighlight}>MediaKit?</span>
          </h2>
          <p className={styles.sectionSubtitle}>
            A simple tool with powerful features.
          </p>
        </div>

        <div className={styles.featuresGrid}>
          {features.map((item, idx) => (
            <div key={idx} className={styles.featureCard}>
              <div className={`${styles.iconSquircle} ${item.iconClass}`}>
                {item.icon}
              </div>
              <div className={styles.contentGroup}>
                <h3 className={styles.featureTitle}>{item.title}</h3>
                <p className={styles.featureDesc}>{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
