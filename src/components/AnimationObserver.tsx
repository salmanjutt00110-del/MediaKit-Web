'use client';

import { useEffect } from 'react';

export default function AnimationObserver() {
  useEffect(() => {
    // Select sections and key components to animate on scroll (excluding primary above-the-fold tools)
    const elements = document.querySelectorAll(
      'section:not(#home):not(#downloader):not([aria-labelledby="platforms-heading"]), .reveal-on-scroll'
    );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.05,
        rootMargin: '0px 0px 40px 0px',
      }
    );

    elements.forEach((el) => {
      el.classList.add('reveal-on-scroll');
      observer.observe(el);
    });

    // Safety timeout: ensure all elements become visible within 500ms even if observer doesn't trigger
    const safetyTimer = setTimeout(() => {
      document.querySelectorAll('.reveal-on-scroll').forEach((el) => {
        el.classList.add('is-revealed');
      });
    }, 500);

    return () => {
      clearTimeout(safetyTimer);
      observer.disconnect();
    };
  }, []);

  return null;
}
