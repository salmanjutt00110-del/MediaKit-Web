'use client';

import React from 'react';
import { Star, CheckCircle2, MessageSquareHeart } from 'lucide-react';
import { YouTubeIcon, TikTokIcon, FacebookIcon, InstagramIcon } from './PlatformIcons';
import styles from './ReviewsSection.module.css';

interface Review {
  id: string;
  name: string;
  role: string;
  avatar: string;
  rating: number;
  platform: 'youtube' | 'tiktok' | 'facebook' | 'instagram';
  comment: string;
  date: string;
}

const reviews: Review[] = [
  {
    id: '1',
    name: 'Hamza Malik',
    role: 'YouTube Content Creator',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    rating: 5,
    platform: 'youtube',
    comment:
      'MediaKit is hands down the fastest downloader I’ve ever used. Pulls pristine 1080p 60fps YouTube videos in just a few seconds without messing up the audio sync.',
    date: '2 days ago',
  },
  {
    id: '2',
    name: 'Ayesha Khan',
    role: 'Digital Marketing Strategist',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    rating: 5,
    platform: 'instagram',
    comment:
      'Finding high-res Instagram reels for client campaign presentations was always a struggle. MediaKit’s smart link detection downloads full HD reels instantly!',
    date: '3 days ago',
  },
  {
    id: '3',
    name: 'Bilal Ahmed',
    role: 'Video Editor & Motion Designer',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80',
    rating: 5,
    platform: 'tiktok',
    comment:
      'Zero watermarks on TikTok downloads! It saves me hours of manual cropping and healing tools. Absolute game changer for short-form video editors.',
    date: '5 days ago',
  },
  {
    id: '4',
    name: 'Zainab Fatima',
    role: 'Social Media Manager',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
    rating: 5,
    platform: 'facebook',
    comment:
      'No registration, no pop-up spam, and 100% free. The audio extraction (MP3) tool works flawlessly on Facebook clips and interviews.',
    date: '1 week ago',
  },
  {
    id: '5',
    name: 'Usman Tariq',
    role: 'Podcast Producer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    rating: 5,
    platform: 'youtube',
    comment:
      'The MP3 audio quality is crystal clear at 320kbps. I use MediaKit daily to archive our team’s recorded YouTube live streams and keynote speeches.',
    date: '1 week ago',
  },
  {
    id: '6',
    name: 'Sana Rehman',
    role: 'Travel Vlogger & Influencer',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    rating: 5,
    platform: 'instagram',
    comment:
      'The mobile interface is so sleek and fast on my phone. Paste the link, select quality, and it saves directly to my camera roll without lag.',
    date: '2 weeks ago',
  },
];

export default function ReviewsSection() {
  const getPlatformIcon = (platform: Review['platform']) => {
    switch (platform) {
      case 'youtube':
        return <YouTubeIcon size={16} color="#FF0000" />;
      case 'tiktok':
        return <TikTokIcon size={15} color="currentColor" />;
      case 'facebook':
        return <FacebookIcon size={16} color="#1877F2" />;
      case 'instagram':
        return <InstagramIcon size={16} color="#E1306C" />;
    }
  };

  return (
    <section id="reviews" className={styles.sectionWrapper} aria-labelledby="reviews-heading">
      <div className="app-container">
        {/* Header */}
        <div className={styles.sectionHeader}>
          <div className={styles.badge}>
            <MessageSquareHeart size={14} />
            <span>Community Feedback</span>
          </div>
          <h2 id="reviews-heading" className={styles.sectionTitle}>
            Loved by Over <span className={styles.highlight}>10,000+ Creators</span>
          </h2>
          <p className={styles.sectionSubtitle}>
            See what video editors, marketers, and daily creators say about their MediaKit experience.
          </p>

          {/* Overall Rating Pill */}
          <div className={styles.ratingSummary}>
            <div className={styles.starsRow}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={18} fill="#f59e0b" color="#f59e0b" />
              ))}
            </div>
            <span className={styles.ratingText}>
              <strong>4.9 / 5.0</strong> rating based on 2,400+ verified user downloads
            </span>
          </div>
        </div>
      </div>

      {/* Infinite Scrolling Track */}
      <div className={styles.marqueeContainer}>
        <div className={styles.marqueeTrack}>
          {/* First loop */}
          {reviews.map((rev) => (
            <div key={`r1-${rev.id}`} className={styles.reviewCard}>
              <div className={styles.cardTop}>
                {/* User Info */}
                <div className={styles.userInfo}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={rev.avatar}
                    alt={rev.name}
                    className={styles.avatarImg}
                    loading="lazy"
                  />
                  <div>
                    <div className={styles.nameRow}>
                      <span className={styles.userName}>{rev.name}</span>
                      <CheckCircle2 size={14} className={styles.verifiedBadge} />
                    </div>
                    <span className={styles.userRole}>{rev.role}</span>
                  </div>
                </div>

                {/* Platform Badge */}
                <div className={styles.platformBadge}>
                  {getPlatformIcon(rev.platform)}
                </div>
              </div>

              {/* Stars */}
              <div className={styles.cardStars}>
                {[...Array(rev.rating)].map((_, i) => (
                  <Star key={i} size={14} fill="#f59e0b" color="#f59e0b" />
                ))}
                <span className={styles.reviewDate}>{rev.date}</span>
              </div>

              {/* Comment Text */}
              <p className={styles.commentText}>&ldquo;{rev.comment}&rdquo;</p>
            </div>
          ))}

          {/* Duplicate loop for seamless infinite scrolling */}
          {reviews.map((rev) => (
            <div key={`r2-${rev.id}`} className={styles.reviewCard} aria-hidden="true">
              <div className={styles.cardTop}>
                <div className={styles.userInfo}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={rev.avatar}
                    alt={rev.name}
                    className={styles.avatarImg}
                    loading="lazy"
                  />
                  <div>
                    <div className={styles.nameRow}>
                      <span className={styles.userName}>{rev.name}</span>
                      <CheckCircle2 size={14} className={styles.verifiedBadge} />
                    </div>
                    <span className={styles.userRole}>{rev.role}</span>
                  </div>
                </div>

                <div className={styles.platformBadge}>
                  {getPlatformIcon(rev.platform)}
                </div>
              </div>

              <div className={styles.cardStars}>
                {[...Array(rev.rating)].map((_, i) => (
                  <Star key={i} size={14} fill="#f59e0b" color="#f59e0b" />
                ))}
                <span className={styles.reviewDate}>{rev.date}</span>
              </div>

              <p className={styles.commentText}>&ldquo;{rev.comment}&rdquo;</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
