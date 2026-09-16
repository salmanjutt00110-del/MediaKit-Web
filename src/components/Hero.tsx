'use client';

import React from 'react';
import Image from 'next/image';
import { Zap, ShieldCheck, Infinity as InfinityIcon, Lock } from 'lucide-react';
import styles from './Hero.module.css';

export default function Hero() {
  return (
    <section id="home" className={styles.heroSection}>
      <div className={`app-container ${styles.heroGrid}`}>
        {/* LEFT COLUMN: Headline & Features */}
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <span>ALL-IN-ONE MEDIA DOWNLOADER</span>
          </div>

          <h1 className={styles.heroHeading}>
            Download from
            <span className={styles.headingBlue}> Any Platform.</span>
          </h1>

          <p className={styles.supportingText}>
            Just paste the link — we&apos;ll detect the platform automatically.
          </p>

          <p className={styles.secondaryText}>
            No selection needed. Fast. Simple. Free.
          </p>

          {/* 4 Feature Indicators Row */}
          <div className={styles.featuresRow}>
            <div className={styles.featureItem}>
              <Zap size={18} className={styles.featureIcon} />
              <div className={styles.featureTextBox}>
                <span className={styles.featureTitle}>Auto Detect</span>
                <span className={styles.featureSub}>Any Platform</span>
              </div>
            </div>

            <div className={styles.featureItem}>
              <ShieldCheck size={18} className={styles.featureIcon} />
              <div className={styles.featureTextBox}>
                <span className={styles.featureTitle}>100% Free</span>
                <span className={styles.featureSub}>No Registration</span>
              </div>
            </div>

            <div className={styles.featureItem}>
              <InfinityIcon size={18} className={styles.featureIcon} />
              <div className={styles.featureTextBox}>
                <span className={styles.featureTitle}>High Speed</span>
                <span className={styles.featureSub}>Unlimited Downloads</span>
              </div>
            </div>

            <div className={styles.featureItem}>
              <Lock size={18} className={styles.featureIcon} />
              <div className={styles.featureTextBox}>
                <span className={styles.featureTitle}>Safe &amp; Private</span>
                <span className={styles.featureSub}>Your Data Is Secure</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: 3D Artwork from Reference 2 */}
        <div className={styles.visualWrapper}>
          <div className={styles.stageContainer}>
            <Image
              src="/hero-artwork-light.png"
              alt="MediaKit 3D Platform Composition"
              width={440}
              height={440}
              className={`${styles.artworkImg} ${styles.artworkLight}`}
              priority
            />
            <Image
              src="/hero-artwork-dark.png"
              alt="MediaKit 3D Platform Composition"
              width={440}
              height={440}
              className={`${styles.artworkImg} ${styles.artworkDark}`}
              priority
            />

            {/* Handwritten Annotations */}
            <div className={styles.annotationOneLink}>
              One Link
              <span>All Platforms &#10549;</span>
            </div>

            <div className={styles.verticalPillsColumn}>
              <span>VIDEOS</span>
              <span>REELS</span>
              <span>SHORTS</span>
              <span>AUDIO</span>
              <span>PHOTOS</span>
              <span>STORIES</span>
            </div>

            <div className={styles.annotationSaveWhat}>
              Save What You Love &#9825;
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
