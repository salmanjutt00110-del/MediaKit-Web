import React from 'react';
import Image from 'next/image';
import { PinterestIcon } from './PlatformIcons';
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
        </div>

        {/* RIGHT COLUMN: 3D Artwork Composition (Visible on Desktop & Mobile) */}
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

            {/* 3D Floating Pinterest Badge (Completes the 5 platforms: YT, TikTok, Insta, FB, Pinterest) */}
            <div className={styles.floatingPinterestBadge} title="Pinterest Video Downloader Supported">
              <PinterestIcon size={26} color="#ffffff" />
            </div>

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
