'use client';

import { useEffect } from 'react';

export default function AnimationObserver() {
  useEffect(() => {
    // Select sections and key components to animate on scroll
    const elements = document.querySelectorAll('section, .reveal-on-scroll');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            // Once revealed, unobserve to keep performance high
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    elements.forEach((el) => {
      el.classList.add('reveal-on-scroll');
      observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return null;
}
