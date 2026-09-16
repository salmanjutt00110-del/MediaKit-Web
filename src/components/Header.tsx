'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Moon, Sun, Zap, Menu, X } from 'lucide-react';
import styles from './Header.module.css';

export default function Header() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('home');

  useEffect(() => {
    const timer = setTimeout(() => {
      const savedTheme = localStorage.getItem('mediakit-theme') as 'light' | 'dark' | null;
      if (savedTheme === 'dark' || savedTheme === 'light') {
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
      } else {
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        const autoTheme = prefersDark ? 'dark' : 'light';
        setTheme(autoTheme);
        document.documentElement.setAttribute('data-theme', autoTheme);
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
              <a
                href="#home"
                className={`${styles.navLink} ${
                  activeNav === 'home' ? styles.navLinkActive : ''
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  setActiveNav('home');
                }}
              >
                Home
              </a>
            </li>
            <li className={styles.navItem}>
              <a
                href="#how-it-works"
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
                href="#faq"
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
                href="#disclaimer"
                className={`${styles.navLink} ${
                  activeNav === 'disclaimer' ? styles.navLinkActive : ''
                }`}
                onClick={() => setActiveNav('disclaimer')}
              >
                Disclaimer
              </a>
            </li>
            <li className={styles.navItem}>
              <a
                href="#contact"
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

          <a href="#downloader" className={styles.fastFreeBtn}>
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
          <a
            href="#home"
            className={styles.mobileNavLink}
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setActiveNav('home');
              setIsMobileMenuOpen(false);
            }}
          >
            Home
          </a>
          <a
            href="#how-it-works"
            className={styles.mobileNavLink}
            onClick={() => {
              setActiveNav('how-it-works');
              setIsMobileMenuOpen(false);
            }}
          >
            How It Works
          </a>
          <a
            href="#faq"
            className={styles.mobileNavLink}
            onClick={() => {
              setActiveNav('faq');
              setIsMobileMenuOpen(false);
            }}
          >
            FAQ
          </a>
          <a
            href="#disclaimer"
            className={styles.mobileNavLink}
            onClick={() => {
              setActiveNav('disclaimer');
              setIsMobileMenuOpen(false);
            }}
          >
            Disclaimer
          </a>
          <a
            href="#privacy"
            className={styles.mobileNavLink}
            onClick={() => {
              setActiveNav('privacy');
              setIsMobileMenuOpen(false);
            }}
          >
            Privacy Policy
          </a>
          <a
            href="#contact"
            className={styles.mobileNavLink}
            onClick={() => {
              setActiveNav('contact');
              setIsMobileMenuOpen(false);
            }}
          >
            Contact
          </a>
        </div>
      )}
    </header>
  );
}
