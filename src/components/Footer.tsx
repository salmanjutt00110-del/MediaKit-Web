'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  YouTubeIcon,
  TikTokIcon,
  InstagramIcon,
  FacebookIcon,
  XTwitterIcon,
} from './PlatformIcons';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footerWrapper}>
      <div className="app-container">
        <div className={styles.footerGrid}>
          {/* LEFT: Logo + Title + Tagline */}
          <div className={styles.brandCol}>
            <Image
              src="/logo.png"
              alt="MediaKit"
              width={36}
              height={36}
              className={styles.brandLogo}
            />
            <div className={styles.brandTextGroup}>
              <span className={styles.brandName}>MediaKit</span>
              <span className={styles.tagline}>Download. Keep. Enjoy.</span>
            </div>
          </div>

          {/* CENTER: Navigation Links */}
          <div className={styles.navCenter}>
            <Link href="#home" className={styles.footerLink}>
              Home
            </Link>
            <Link href="#faq" className={styles.footerLink}>
              FAQ
            </Link>
            <Link href="#disclaimer" className={styles.footerLink}>
              Disclaimer
            </Link>
            <Link href="#privacy" className={styles.footerLink}>
              Privacy
            </Link>
            <Link href="#contact" className={styles.footerLink}>
              Contact
            </Link>
          </div>

          {/* RIGHT: Social Media Icons */}
          <div className={styles.socialRow}>
            <Link href="#youtube" className={styles.socialLink} aria-label="YouTube">
              <YouTubeIcon size={19} color="currentColor" />
            </Link>
            <Link href="#tiktok" className={styles.socialLink} aria-label="TikTok">
              <TikTokIcon size={17} color="currentColor" />
            </Link>
            <Link href="#instagram" className={styles.socialLink} aria-label="Instagram">
              <InstagramIcon size={18} color="currentColor" />
            </Link>
            <Link href="#facebook" className={styles.socialLink} aria-label="Facebook">
              <FacebookIcon size={18} color="currentColor" />
            </Link>
            <Link href="#x" className={styles.socialLink} aria-label="X (Twitter)">
              <XTwitterIcon size={16} color="currentColor" />
            </Link>
          </div>
        </div>

        {/* BOTTOM ROW */}
        <div className={styles.bottomRow}>
          <div />
          <span className={styles.creatorsTag}>
            Made for creators. By creators. &#10084;&#65039;
          </span>
        </div>
      </div>
    </footer>
  );
}
