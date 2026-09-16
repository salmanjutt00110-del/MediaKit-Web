'use client';

import React from 'react';
import { Users, CloudDownload, Star, Heart } from 'lucide-react';
import styles from './StatsStrip.module.css';

export default function StatsStrip() {
  return (
    <section className={styles.stripWrapper} aria-label="Platform Highlights">
      <div className="app-container">
        <div className={styles.stripCard}>
          {/* Stat 1: 10M+ Happy Users */}
          <div className={styles.statItem}>
            <div className={`${styles.iconCircle} ${styles.circleBlue}`}>
              <Users size={22} />
            </div>
            <div className={styles.statTextGroup}>
              <span className={styles.statValue}>10M+</span>
              <span className={styles.statLabel}>Happy Users</span>
            </div>
          </div>

          {/* Stat 2: 50M+ Files Downloaded */}
          <div className={styles.statItem}>
            <div className={`${styles.iconCircle} ${styles.circleBlue}`}>
              <CloudDownload size={22} />
            </div>
            <div className={styles.statTextGroup}>
              <span className={styles.statValue}>50M+</span>
              <span className={styles.statLabel}>Files Downloaded</span>
            </div>
          </div>

          {/* Stat 3: 4.9/5 User Rating */}
          <div className={styles.statItem}>
            <div className={`${styles.iconCircle} ${styles.circleYellow}`}>
              <Star size={22} fill="#F59E0B" />
            </div>
            <div className={styles.statTextGroup}>
              <span className={styles.statValue}>4.9/5</span>
              <span className={styles.statLabel}>User Rating</span>
            </div>
          </div>

          {/* Stat 4: 100% Free Forever */}
          <div className={styles.statItem}>
            <div className={`${styles.iconCircle} ${styles.circleRed}`}>
              <Heart size={22} fill="#EF4444" />
            </div>
            <div className={styles.statTextGroup}>
              <span className={styles.statValue}>100%</span>
              <span className={styles.statLabel}>Free Forever</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
