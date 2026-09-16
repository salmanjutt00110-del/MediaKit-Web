'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Moon, Sun, Globe, ChevronDown, Zap, Menu, X } from 'lucide-react';
import styles from './Header.module.css';

export default function Header() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('home');

  useEffect(() => {
    const timer = setTimeout(() => {
      const savedTheme = localStorage.getItem('mediakit-theme') as 'light' | 'dark' | null;
      if (savedTheme === 'dark') {
        setTheme('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
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

  return (
    <header className={styles.headerWrapper}>
      <div className={`app-container ${styles.headerContainer}`}>
        {/* LEFT: Logo + Title + Tagline */}
        <Link
          href="/"
          className={styles.brandWrapper}
          aria-label="MediaKit Home"
          onClick={() => setActiveNav('home')}
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
                href="#home"
                className={`${styles.navLink} ${
                  activeNav === 'home' ? styles.navLinkActive : ''
                }`}
                onClick={() => setActiveNav('home')}
              >
                Home
              </Link>
            </li>
            <li className={styles.navItem}>
              <Link
                href="#how-it-works"
                className={`${styles.navLink} ${
                  activeNav === 'how-it-works' ? styles.navLinkActive : ''
                }`}
                onClick={() => setActiveNav('how-it-works')}
              >
                How It Works
              </Link>
            </li>
            <li className={styles.navItem}>
              <Link
                href="#faq"
                className={`${styles.navLink} ${
                  activeNav === 'faq' ? styles.navLinkActive : ''
                }`}
                onClick={() => setActiveNav('faq')}
              >
                FAQ
              </Link>
            </li>
            <li className={styles.navItem}>
              <Link
                href="#contact"
                className={`${styles.navLink} ${
                  activeNav === 'contact' ? styles.navLinkActive : ''
                }`}
                onClick={() => setActiveNav('contact')}
              >
                Contact
              </Link>
            </li>
          </ul>
        </nav>

        {/* RIGHT: Theme, Language, Fast & Free Button */}
        <div className={styles.actionsRight}>
          <button
            type="button"
            className={styles.actionIconBtn}
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          <div className={styles.langSelector} title="Language Selector">
            <Globe size={16} />
            <span>EN</span>
            <ChevronDown size={14} />
          </div>

          <Link href="#downloader" className={styles.fastFreeBtn}>
            <Zap size={15} fill="#ffffff" />
            <span>Fast &amp; Free</span>
          </Link>

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
            href="#home"
            className={styles.mobileNavLink}
            onClick={() => {
              setActiveNav('home');
              setIsMobileMenuOpen(false);
            }}
          >
            Home
          </Link>
          <Link
            href="#how-it-works"
            className={styles.mobileNavLink}
            onClick={() => {
              setActiveNav('how-it-works');
              setIsMobileMenuOpen(false);
            }}
          >
            How It Works
          </Link>
          <Link
            href="#faq"
            className={styles.mobileNavLink}
            onClick={() => {
              setActiveNav('faq');
              setIsMobileMenuOpen(false);
            }}
          >
            FAQ
          </Link>
          <Link
            href="#contact"
            className={styles.mobileNavLink}
            onClick={() => {
              setActiveNav('contact');
              setIsMobileMenuOpen(false);
            }}
          >
            Contact
          </Link>
        </div>
      )}
    </header>
  );
}
