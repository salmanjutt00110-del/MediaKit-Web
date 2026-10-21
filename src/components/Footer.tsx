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
              Professional online media utility to download high-definition video, audio, reels, and shorts from supported platforms.
            </p>
          </div>

          {/* COLUMN 2: Video Tools */}
          <div>
            <h4 className={styles.footerColTitle}>Video Downloaders</h4>
            <ul className={styles.footerColLinks}>
              <li>
                <Link href="/youtube-video-downloader" className={styles.footerLink}>
                  YouTube Video Downloader
                </Link>
              </li>
              <li>
                <Link href="/youtube-shorts-downloader" className={styles.footerLink}>
                  YouTube Shorts Downloader
                </Link>
              </li>
              <li>
                <Link href="/youtube-mp3" className={styles.footerLink}>
                  YouTube MP3
                </Link>
              </li>
              <li>
                <Link href="/tiktok-video-downloader" className={styles.footerLink}>
                  TikTok Downloader
                </Link>
              </li>
              <li>
                <Link href="/online-video-downloader" className={styles.footerLink}>
                  Online Video Downloader
                </Link>
              </li>
              <li>
                <Link href="/mp4-video-downloader" className={styles.footerLink}>
                  MP4 Video Downloader
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUMN 3: Social & Audio */}
          <div>
            <h4 className={styles.footerColTitle}>Social &amp; Audio</h4>
            <ul className={styles.footerColLinks}>
              <li>
                <Link href="/instagram-video-downloader" className={styles.footerLink}>
                  Instagram Downloader
                </Link>
              </li>
              <li>
                <Link href="/instagram-reels-downloader" className={styles.footerLink}>
                  Instagram Reels Downloader
                </Link>
              </li>
              <li>
                <Link href="/facebook-video-downloader" className={styles.footerLink}>
                  Facebook Downloader
                </Link>
              </li>
              <li>
                <Link href="/facebook-reels-downloader" className={styles.footerLink}>
                  Facebook Reels Downloader
                </Link>
              </li>
              <li>
                <Link href="/pinterest-video-downloader" className={styles.footerLink}>
                  Pinterest Downloader
                </Link>
              </li>
              <li>
                <Link href="/mp3-video-downloader" className={styles.footerLink}>
                  MP3 Downloader
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUMN 4: Company & Legal */}
          <div>
            <h4 className={styles.footerColTitle}>Company &amp; Legal</h4>
            <ul className={styles.footerColLinks}>
              <li>
                <Link href="/about" className={styles.footerLink}>
                  About MediaKit
                </Link>
              </li>
              <li>
                <Link href="/faq" className={styles.footerLink}>
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/blog" className={styles.footerLink}>
                  Blog &amp; Articles
                </Link>
              </li>
              <li>
                <Link href="/contact" className={styles.footerLink}>
                  Contact Support
                </Link>
              </li>
              <li>
                <Link href="/privacy" className={styles.footerLink}>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className={styles.footerLink}>
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* POPULAR GUIDES ROW FOR SEO INTERNAL LINKING */}
        <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '20px', marginBottom: '24px' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Popular Guides &amp; Resources
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px', fontSize: '0.85rem' }}>
            <Link href="/download-youtube-video-without-software" className={styles.footerLink}>Download YouTube Video Without Software</Link>
            <Link href="/tiktok-to-mp4-free-online" className={styles.footerLink}>TikTok to MP4 Online</Link>
            <Link href="/youtube-to-mp4-free-online-no-registration" className={styles.footerLink}>YouTube to MP4 No Registration</Link>
            <Link href="/download-videos-for-offline-viewing-free" className={styles.footerLink}>Download Videos for Offline Viewing</Link>
            <Link href="/how-to-download-tiktok-without-watermark-iphone" className={styles.footerLink}>Download TikTok Without Watermark iPhone</Link>
            <Link href="/how-to-save-tiktok-to-camera-roll" className={styles.footerLink}>Save TikTok to Camera Roll</Link>
            <Link href="/save-instagram-story-without-knowing" className={styles.footerLink}>Save Instagram Story Anonymously</Link>
          </div>
        </div>

        {/* BOTTOM ROW */}
        <div className={styles.bottomRow}>
          <span>&copy; {new Date().getFullYear()} MediaKit. All rights reserved.</span>
          <div className={styles.socialRow}>
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
