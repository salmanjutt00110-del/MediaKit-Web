'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';
import { YouTubeIcon, TikTokIcon, FacebookIcon, InstagramIcon, PinterestIcon } from './PlatformIcons';
import styles from './SupportedPlatforms.module.css';

const platforms = [
  {
    id: 'youtube',
    name: 'YouTube',
    description: 'Videos, Shorts, Audio',
    icon: <YouTubeIcon size={30} color="#ffffff" />,
    squircleClass: styles.squircleYouTube,
    cardClass: styles.cardYouTube,
    btnClass: styles.btnRed,
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    description: 'Videos, No Watermark',
    icon: <TikTokIcon size={26} color="#ffffff" />,
    squircleClass: styles.squircleTikTok,
    cardClass: styles.cardTikTok,
    btnClass: styles.btnBlue,
  },
  {
    id: 'facebook',
    name: 'Facebook',
    description: 'Videos, Reels, Photos',
    icon: <FacebookIcon size={28} color="#ffffff" />,
    squircleClass: styles.squircleFacebook,
    cardClass: styles.cardFacebook,
    btnClass: styles.btnBlue,
  },
  {
    id: 'instagram',
    name: 'Instagram',
    description: 'Videos, Reels, Stories',
    icon: <InstagramIcon size={28} color="#ffffff" />,
    squircleClass: styles.squircleInstagram,
    cardClass: styles.cardInstagram,
    btnClass: styles.btnPurple,
  },
  {
    id: 'pinterest',
    name: 'Pinterest',
    description: 'Videos, Pins, Ideas',
    icon: <PinterestIcon size={28} color="#ffffff" />,
    squircleClass: styles.squirclePinterest,
    cardClass: styles.cardPinterest,
    btnClass: styles.btnRed,
  },
];

export default function SupportedPlatforms() {
  return (
    <section className={styles.sectionWrapper} aria-labelledby="platforms-heading">
      <div className="app-container">
        <div className={styles.sectionHeader}>
          <h2 id="platforms-heading" className={styles.sectionTitle}>
            Supported <span className={styles.blueHighlight}>Platforms</span>
          </h2>
          <p className={styles.sectionSubtitle}>
            Just paste the link — we&apos;ll handle the rest.
          </p>
        </div>

        <div className={styles.platformGrid}>
          {platforms.map((platform) => (
            <div
              key={platform.id}
              className={`${styles.platformCard} ${platform.cardClass}`}
            >
              <div className={styles.cardTop}>
                <div className={`${styles.iconSquircle} ${platform.squircleClass}`}>
                  {platform.icon}
                </div>
              </div>

              <div className={styles.cardBottom}>
                <div className={styles.cardDetails}>
                  <h3 className={styles.platformName}>{platform.name}</h3>
                  <p className={styles.platformDesc}>{platform.description}</p>
                </div>
                <div className={`${styles.arrowCircleBtn} ${platform.btnClass}`}>
                  <ChevronRight size={18} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
