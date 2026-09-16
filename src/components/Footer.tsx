'use client';

import React from 'react';
import Image from 'next/image';
import {
  YouTubeIcon,
  TikTokIcon,
  InstagramIcon,
  FacebookIcon,
  XTwitterIcon,
  GitHubIcon,
  WhatsAppIcon,
} from './PlatformIcons';
import styles from './Footer.module.css';

export default function Footer() {
  const scrollToTop = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className={styles.footerWrapper}>
      <div className="app-container">
        <div className={styles.footerGrid}>
          {/* LEFT: Logo + Title + Tagline (Click scrolls to top) */}
          <a
            href="#home"
            onClick={scrollToTop}
            className={styles.brandCol}
            style={{ textDecoration: 'none', cursor: 'pointer' }}
            title="Scroll to Top"
          >
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
          </a>

          {/* CENTER: Navigation Links */}
          <div className={styles.navCenter}>
            <a href="#home" onClick={scrollToTop} className={styles.footerLink}>
              Home
            </a>
            <a href="#how-it-works" className={styles.footerLink}>
              How It Works
            </a>
            <a href="#faq" className={styles.footerLink}>
              FAQ
            </a>
            <a href="#disclaimer" className={styles.footerLink}>
              Disclaimer
            </a>
            <a href="#privacy" className={styles.footerLink}>
              Privacy
            </a>
            <a href="#contact" className={styles.footerLink}>
              Contact
            </a>
          </div>

          {/* RIGHT: Social Media & Repository Icons */}
          <div className={styles.socialRow}>
            <a
              href="https://github.com/salmanjutt00110-del/MediaKit-Web"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
              aria-label="GitHub Repository"
              title="MediaKit on GitHub"
            >
              <GitHubIcon size={18} color="currentColor" />
            </a>
            <a
              href="https://wa.me/?text=Hello%20MediaKit%20Support"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
              aria-label="WhatsApp Support"
              title="WhatsApp Direct"
            >
              <WhatsAppIcon size={18} color="currentColor" />
            </a>
            <a href="#youtube" className={styles.socialLink} aria-label="YouTube">
              <YouTubeIcon size={19} color="currentColor" />
            </a>
            <a href="#tiktok" className={styles.socialLink} aria-label="TikTok">
              <TikTokIcon size={17} color="currentColor" />
            </a>
            <a href="#instagram" className={styles.socialLink} aria-label="Instagram">
              <InstagramIcon size={18} color="currentColor" />
            </a>
            <a href="#facebook" className={styles.socialLink} aria-label="Facebook">
              <FacebookIcon size={18} color="currentColor" />
            </a>
            <a href="#x" className={styles.socialLink} aria-label="X (Twitter)">
              <XTwitterIcon size={16} color="currentColor" />
            </a>
          </div>
        </div>

        {/* BOTTOM ROW */}
        <div className={styles.bottomRow}>
          <span>&copy; {new Date().getFullYear()} MediaKit. All rights reserved.</span>
          <span className={styles.creatorsTag}>
            Made for creators. By creators. &#10084;&#65039;
          </span>
        </div>
      </div>
    </footer>
  );
}

