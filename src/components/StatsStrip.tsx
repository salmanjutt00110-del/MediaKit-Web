'use client';

import React from 'react';
import { Layers, Sparkles, ShieldCheck, Lock } from 'lucide-react';
import styles from './StatsStrip.module.css';

export default function StatsStrip() {
  return (
    <section className={styles.stripWrapper} aria-label="Platform Highlights">
      <div className="app-container">
        <div className={styles.stripCard}>
          {/* Highlight 1: 5 Platforms */}
          <div className={styles.statItem}>
            <div className={`${styles.iconCircle} ${styles.circleBlue}`}>
              <Layers size={22} />
            </div>
            <div className={styles.statTextGroup}>
              <span className={styles.statValue}>5 Platforms</span>
              <span className={styles.statLabel}>YouTube, TikTok, FB, IG, Pin</span>
            </div>
          </div>

          {/* Highlight 2: Up to 4K Quality */}
          <div className={styles.statItem}>
            <div className={`${styles.iconCircle} ${styles.circleBlue}`}>
              <Sparkles size={22} />
            </div>
            <div className={styles.statTextGroup}>
              <span className={styles.statValue}>Up to 4K HD</span>
              <span className={styles.statLabel}>Dynamic Quality & MP3</span>
            </div>
          </div>

          {/* Highlight 3: 100% Free */}
          <div className={styles.statItem}>
            <div className={`${styles.iconCircle} ${styles.circleYellow}`}>
              <ShieldCheck size={22} />
            </div>
            <div className={styles.statTextGroup}>
              <span className={styles.statValue}>100% Free</span>
              <span className={styles.statLabel}>No Registration Required</span>
            </div>
          </div>

          {/* Highlight 4: Safe & Private */}
          <div className={styles.statItem}>
            <div className={`${styles.iconCircle} ${styles.circleRed}`}>
              <Lock size={22} />
            </div>
            <div className={styles.statTextGroup}>
              <span className={styles.statValue}>Private & Safe</span>
              <span className={styles.statLabel}>Zero Permanent Logs</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
