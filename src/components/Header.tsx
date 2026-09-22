'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Moon, Sun, Zap, Menu, X, ChevronDown } from 'lucide-react';
import styles from './Header.module.css';

const toolsList = [
  { name: '✨ Free Without Watermark', href: '/free-video-downloader-without-watermark' },
  { name: 'YouTube Downloader', href: '/youtube-video-downloader' },
  { name: 'YouTube Shorts', href: '/youtube-shorts-downloader' },
  { name: 'TikTok (No Watermark)', href: '/tiktok-video-downloader' },
  { name: 'Facebook Downloader', href: '/facebook-video-downloader' },
  { name: 'Facebook Reels', href: '/facebook-reels-downloader' },
  { name: 'Instagram Downloader', href: '/instagram-video-downloader' },
  { name: 'Instagram Reels', href: '/instagram-reels-downloader' },
  { name: 'Pinterest Downloader', href: '/pinterest-video-downloader' },
  { name: 'YouTube to MP3', href: '/youtube-mp3' },
  { name: 'All-in-One Downloader', href: '/video-downloader' },
];

export default function Header() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('home');

  useEffect(() => {
    const timer = setTimeout(() => {
      const savedTheme = localStorage.getItem('mediakit-theme') as 'light' | 'dark' | null;
      if (savedTheme === 'dark' || savedTheme === 'light') {
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
      } else {
        setTheme('light');
        document.documentElement.setAttribute('data-theme', 'light');
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('mediakit-theme', nextTheme);
  };

  const scrollToTop = (e: React.MouseEvent) => {
    if (typeof window !== 'undefined' && window.location.pathname !== '/') {
      return; // Allow standard router navigation to home
    }
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setActiveNav('home');
  };

  return (
    <header className={styles.headerWrapper}>
      <div className={`app-container ${styles.headerContainer}`}>
        {/* LEFT: Logo + Title + Tagline (Click scrolls to top) */}
        <Link
          href="/"
          className={styles.brandWrapper}
          aria-label="MediaKit Home"
          onClick={scrollToTop}
          title="Scroll to Top"
        >
          <Image
            src="/logo.png"
            alt="MediaKit Logo"
            width={42}
            height={42}
            className={styles.brandLogo}
            priority
          />
          <div className={styles.brandTextGroup}>
            <span className={styles.brandName}>MediaKit</span>
            <span className={styles.brandTagline}>Download. Keep. Enjoy.</span>
          </div>
        </Link>

        {/* CENTER: Navigation Links */}
        <nav className={styles.navCenter} aria-label="Main Navigation">
          <ul className={styles.navLinks}>
            <li className={styles.navItem}>
              <Link
                href="/"
                className={`${styles.navLink} ${
                  activeNav === 'home' ? styles.navLinkActive : ''
                }`}
                onClick={(e) => {
                  if (typeof window !== 'undefined' && window.location.pathname === '/') {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    setActiveNav('home');
                  }
                }}
              >
                Home
              </Link>
            </li>

            {/* Tools Dropdown */}
            <li
              className={styles.navItem}
              onMouseEnter={() => setIsToolsOpen(true)}
              onMouseLeave={() => setIsToolsOpen(false)}
            >
              <button
                type="button"
                className={styles.dropdownTrigger}
                onClick={() => setIsToolsOpen(!isToolsOpen)}
                aria-expanded={isToolsOpen}
              >
                <span>Tools</span>
                <ChevronDown size={15} />
              </button>

              {isToolsOpen && (
                <div className={styles.dropdownMenu} role="menu">
                  {toolsList.map((tool, idx) => (
                    <Link
                      key={idx}
                      href={tool.href}
                      className={styles.dropdownItem}
                      onClick={() => setIsToolsOpen(false)}
                      role="menuitem"
                    >
                      {tool.name}
                    </Link>
                  ))}
                </div>
              )}
            </li>

            <li className={styles.navItem}>
              <a
                href="/#how-it-works"
                className={`${styles.navLink} ${
                  activeNav === 'how-it-works' ? styles.navLinkActive : ''
                }`}
                onClick={() => setActiveNav('how-it-works')}
              >
                How It Works
              </a>
            </li>
            <li className={styles.navItem}>
              <a
                href="/#reviews"
                className={`${styles.navLink} ${
                  activeNav === 'reviews' ? styles.navLinkActive : ''
                }`}
                onClick={() => setActiveNav('reviews')}
              >
                Reviews
              </a>
            </li>
            <li className={styles.navItem}>
              <a
                href="/#faq"
                className={`${styles.navLink} ${
                  activeNav === 'faq' ? styles.navLinkActive : ''
                }`}
                onClick={() => setActiveNav('faq')}
              >
                FAQ
              </a>
            </li>
            <li className={styles.navItem}>
              <a
                href="/#contact"
                className={`${styles.navLink} ${
                  activeNav === 'contact' ? styles.navLinkActive : ''
                }`}
                onClick={() => setActiveNav('contact')}
              >
                Contact
              </a>
            </li>
          </ul>
        </nav>

        {/* RIGHT: Theme and Fast & Free Button */}
        <div className={styles.actionsRight}>
          <button
            type="button"
            className={styles.actionIconBtn}
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          <a href="/#downloader" className={styles.fastFreeBtn}>
            <Zap size={15} fill="#ffffff" />
            <span>Fast &amp; Free</span>
          </a>

          <button
            type="button"
            className={styles.mobileMenuBtn}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className={styles.mobileDrawerOpen}>
          <Link
            href="/"
            className={styles.mobileNavLink}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Home
          </Link>

          <div className={styles.mobileSectionTitle}>Download Tools</div>
          {toolsList.map((tool, idx) => (
            <Link
              key={idx}
              href={tool.href}
              className={styles.mobileSubLink}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {tool.name}
            </Link>
          ))}

          <div className={styles.mobileSectionTitle}>Explore</div>
          <a
            href="/#how-it-works"
            className={styles.mobileNavLink}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            How It Works
          </a>
          <a
            href="/#reviews"
            className={styles.mobileNavLink}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Reviews
          </a>
          <a
            href="/#faq"
            className={styles.mobileNavLink}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            FAQ
          </a>
          <a
            href="/#contact"
            className={styles.mobileNavLink}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Contact
          </a>
        </div>
      )}
    </header>
  );
}
