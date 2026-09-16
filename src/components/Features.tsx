'use client';

import React from 'react';
import { Zap, FileText, Gauge, Shield } from 'lucide-react';
import styles from './Features.module.css';

const features = [
  {
    title: 'Auto Detection',
    description: "Just paste the link, we'll detect the platform automatically.",
    icon: <Zap size={24} />,
    iconClass: styles.iconBlue,
  },
  {
    title: 'Multiple Formats',
    description: 'Download in MP4, MP3 and more formats.',
    icon: <FileText size={24} />,
    iconClass: styles.iconPurple,
  },
  {
    title: 'Blazing Fast',
    description: 'Our servers ensure the highest download speed possible.',
    icon: <Gauge size={24} />,
    iconClass: styles.iconGreen,
  },
  {
    title: 'No Registration',
    description: '100% free to use. No signup required.',
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
