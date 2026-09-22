'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  YouTubeIcon,
  TikTokIcon,
  InstagramIcon,
  FacebookIcon,
  PinterestIcon,
  XTwitterIcon,
  GitHubIcon,
  WhatsAppIcon,
} from './PlatformIcons';
import styles from './Footer.module.css';

export default function Footer() {
  const scrollToTop = (e: React.MouseEvent) => {
    if (typeof window !== 'undefined' && window.location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className={styles.footerWrapper} role="contentinfo">
      <div className="app-container">
        <div className={styles.footerColumns}>
          {/* COLUMN 1: Brand Info */}
          <div className={styles.brandCol}>
            <Link
              href="/"
              onClick={scrollToTop}
              className={styles.brandHeader}
              title="MediaKit Home"
            >
              <Image
                src="/logo.png"
                alt="MediaKit Logo"
                width={38}
                height={38}
                className={styles.brandLogo}
              />
              <div className={styles.brandTextGroup}>
                <span className={styles.brandName}>MediaKit</span>
                <span className={styles.tagline}>Download. Keep. Enjoy.</span>
              </div>
            </Link>
            <p className={styles.brandDescription}>
              Professional-grade online media utility to download high-definition video, audio, reels, and shorts from across the web.
            </p>
          </div>

          {/* COLUMN 2: Video Tools */}
          <div>
            <h4 className={styles.footerColTitle}>Video Downloaders</h4>
            <ul className={styles.footerColLinks}>
              <li>
                <Link href="/free-video-downloader-without-watermark" className={styles.footerLink}>
                  Free Without Watermark
                </Link>
              </li>
              <li>
                <Link href="/youtube-video-downloader" className={styles.footerLink}>
                  YouTube Downloader
                </Link>
              </li>
              <li>
                <Link href="/youtube-shorts-downloader" className={styles.footerLink}>
                  YouTube Shorts
                </Link>
              </li>
              <li>
                <Link href="/tiktok-video-downloader" className={styles.footerLink}>
                  TikTok Downloader
                </Link>
              </li>
              <li>
                <Link href="/video-downloader" className={styles.footerLink}>
                  All-in-One Downloader
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUMN 3: Social Media Tools */}
          <div>
            <h4 className={styles.footerColTitle}>Social & Audio</h4>
            <ul className={styles.footerColLinks}>
              <li>
                <Link href="/instagram-video-downloader" className={styles.footerLink}>
                  Instagram Downloader
                </Link>
              </li>
              <li>
                <Link href="/instagram-reels-downloader" className={styles.footerLink}>
                  Instagram Reels
                </Link>
              </li>
              <li>
                <Link href="/facebook-video-downloader" className={styles.footerLink}>
                  Facebook Downloader
                </Link>
              </li>
              <li>
                <Link href="/facebook-reels-downloader" className={styles.footerLink}>
                  Facebook Reels
                </Link>
              </li>
              <li>
                <Link href="/pinterest-video-downloader" className={styles.footerLink}>
                  Pinterest Downloader
                </Link>
              </li>
              <li>
                <Link href="/youtube-mp3" className={styles.footerLink}>
                  YouTube to MP3
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUMN 4: Legal & Help */}
          <div>
            <h4 className={styles.footerColTitle}>Help & Legal</h4>
            <ul className={styles.footerColLinks}>
              <li>
                <Link href="/faq" className={styles.footerLink}>
                  FAQ & Guides
                </Link>
              </li>
              <li>
                <Link href="/terms" className={styles.footerLink}>
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className={styles.footerLink}>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <a
                  href="https://wa.me/923100128702?text=Hello%20MediaKit%20Support"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.footerLink}
                >
                  WhatsApp Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* BOTTOM ROW */}
        <div className={styles.bottomRow}>
          <span>&copy; {new Date().getFullYear()} MediaKit. All rights reserved.</span>
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
              href="https://wa.me/923100128702?text=Hello%20MediaKit%20Support"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
              aria-label="WhatsApp Support"
              title="WhatsApp Direct (+92 310 0128702)"
            >
              <WhatsAppIcon size={18} color="currentColor" />
            </a>
            <Link href="/youtube-video-downloader" className={styles.socialLink} aria-label="YouTube Downloader">
              <YouTubeIcon size={19} color="currentColor" />
            </Link>
            <Link href="/tiktok-video-downloader" className={styles.socialLink} aria-label="TikTok Downloader">
              <TikTokIcon size={17} color="currentColor" />
            </Link>
            <Link href="/instagram-video-downloader" className={styles.socialLink} aria-label="Instagram Downloader">
              <InstagramIcon size={18} color="currentColor" />
            </Link>
            <Link href="/facebook-video-downloader" className={styles.socialLink} aria-label="Facebook Downloader">
              <FacebookIcon size={18} color="currentColor" />
            </Link>
            <Link href="/pinterest-video-downloader" className={styles.socialLink} aria-label="Pinterest Downloader">
              <PinterestIcon size={18} color="currentColor" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

