'use client';

import React, { useState, useEffect } from 'react';
import {
  Star,
  CheckCircle2,
  MessageSquareHeart,
  PlusCircle,
  X,
  Send,
  Check,
} from 'lucide-react';
import {
  YouTubeIcon,
  TikTokIcon,
  FacebookIcon,
  InstagramIcon,
  PinterestIcon,
} from './PlatformIcons';
import styles from './ReviewsSection.module.css';

export interface ReviewItem {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  rating: number;
  platform: 'youtube' | 'tiktok' | 'facebook' | 'instagram' | 'pinterest';
  comment: string;
  date: string;
}

const initialReviews: ReviewItem[] = [
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
  const [reviewsList, setReviewsList] = useState<ReviewItem[]>(initialReviews);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [platform, setPlatform] = useState<ReviewItem['platform']>('youtube');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load custom user reviews from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('mediakit_user_reviews');
      if (saved) {
        const parsed = JSON.parse(saved) as ReviewItem[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setReviewsList([...parsed, ...initialReviews]);
        }
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  const getPlatformIcon = (plt: ReviewItem['platform']) => {
    switch (plt) {
      case 'youtube':
        return <YouTubeIcon size={16} color="#FF0000" />;
      case 'tiktok':
        return <TikTokIcon size={15} color="currentColor" />;
      case 'facebook':
        return <FacebookIcon size={16} color="#1877F2" />;
      case 'instagram':
        return <InstagramIcon size={16} color="#E1306C" />;
      case 'pinterest':
        return <PinterestIcon size={16} color="#E60023" />;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) return;

    setIsSubmitting(true);

    const newReview: ReviewItem = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      role: role.trim() || 'Verified Creator',
      rating,
      platform,
      comment: comment.trim(),
      date: 'Just now',
    };

    // Update state
    const updated = [newReview, ...reviewsList];
    setReviewsList(updated);

    // Save to localStorage
    try {
      const existingSaved = localStorage.getItem('mediakit_user_reviews');
      const parsedExisting = existingSaved ? JSON.parse(existingSaved) : [];
      localStorage.setItem('mediakit_user_reviews', JSON.stringify([newReview, ...parsedExisting]));
    } catch {}

    setSuccessToast(`Thank you, ${newReview.name}! Your review has been added.`);
    setIsSubmitting(false);

    // Reset form fields
    setName('');
    setRole('');
    setComment('');
    setRating(5);

    // Close modal after brief feedback
    setTimeout(() => {
      setIsModalOpen(false);
      setSuccessToast(null);
    }, 1800);
  };

  return (
    <section id="reviews" className={styles.sectionWrapper} aria-labelledby="reviews-heading">
      <div className="app-container">
        {/* Header */}
        <div className={styles.sectionHeader}>
          <div className={styles.badge}>
            <MessageSquareHeart size={15} />
            <span>Community Feedback</span>
          </div>
          <h2 id="reviews-heading" className={styles.sectionTitle}>
            Loved by Over <span className={styles.highlight}>10,000+ Creators</span>
          </h2>
          <p className={styles.sectionSubtitle}>
            See what video editors, marketers, and daily creators say about their MediaKit experience.
          </p>

          {/* Action Row: Rating Pill + Add Review Button */}
          <div className={styles.actionHeaderRow}>
            <div className={styles.ratingSummary}>
              <div className={styles.starsRow}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} fill="#f59e0b" color="#f59e0b" />
                ))}
              </div>
              <span className={styles.ratingText}>
                <strong>4.9 / 5.0</strong> rating based on 2,400+ verified downloads
              </span>
            </div>

            <button
              type="button"
              className={styles.addReviewBtn}
              onClick={() => setIsModalOpen(true)}
              aria-label="Add your review"
            >
              <PlusCircle size={17} />
              <span>Write a Review</span>
            </button>
          </div>
        </div>
      </div>

      {/* Infinite Scrolling Marquee Track */}
      <div className={styles.marqueeContainer}>
        <div className={styles.marqueeTrack}>
          {/* First Loop */}
          {reviewsList.map((rev, idx) => (
            <div key={`rev-1-${rev.id}-${idx}`} className={styles.reviewCard}>
              <div className={styles.cardTop}>
                {/* User Info */}
                <div className={styles.userInfo}>
                  {rev.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={rev.avatar}
                      alt={rev.name}
                      className={styles.avatarImg}
                      loading="lazy"
                    />
                  ) : (
                    <div className={styles.avatarPlaceholder}>
                      {rev.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className={styles.nameRow}>
                      <span className={styles.userName}>{rev.name}</span>
                      <CheckCircle2 size={14} className={styles.verifiedBadge} />
                    </div>
                    <span className={styles.userRole}>{rev.role}</span>
                  </div>
                </div>

                {/* Platform Badge */}
                <div className={styles.platformBadge} title={rev.platform.toUpperCase()}>
                  {getPlatformIcon(rev.platform)}
                </div>
              </div>

              {/* Stars & Date */}
              <div className={styles.cardStars}>
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    fill={i < rev.rating ? '#f59e0b' : 'none'}
                    color={i < rev.rating ? '#f59e0b' : '#cbd5e1'}
                  />
                ))}
                <span className={styles.reviewDate}>{rev.date}</span>
              </div>

              {/* Comment Text */}
              <p className={styles.commentText}>&ldquo;{rev.comment}&rdquo;</p>
            </div>
          ))}

          {/* Second Duplicate Loop for continuous infinite animation */}
          {reviewsList.map((rev, idx) => (
            <div key={`rev-2-${rev.id}-${idx}`} className={styles.reviewCard} aria-hidden="true">
              <div className={styles.cardTop}>
                <div className={styles.userInfo}>
                  {rev.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={rev.avatar}
                      alt={rev.name}
                      className={styles.avatarImg}
                      loading="lazy"
                    />
                  ) : (
                    <div className={styles.avatarPlaceholder}>
                      {rev.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className={styles.nameRow}>
                      <span className={styles.userName}>{rev.name}</span>
                      <CheckCircle2 size={14} className={styles.verifiedBadge} />
                    </div>
                    <span className={styles.userRole}>{rev.role}</span>
                  </div>
                </div>

                <div className={styles.platformBadge} title={rev.platform.toUpperCase()}>
                  {getPlatformIcon(rev.platform)}
                </div>
              </div>

              <div className={styles.cardStars}>
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    fill={i < rev.rating ? '#f59e0b' : 'none'}
                    color={i < rev.rating ? '#f59e0b' : '#cbd5e1'}
                  />
                ))}
                <span className={styles.reviewDate}>{rev.date}</span>
              </div>

              <p className={styles.commentText}>&ldquo;{rev.comment}&rdquo;</p>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Modal: Add Your Review */}
      {isModalOpen && (
        <div
          className={styles.modalOverlay}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-review-title"
        >
          <div className={styles.modalCard}>
            <div className={styles.modalHeader}>
              <h3 id="modal-review-title" className={styles.modalTitle}>
                <MessageSquareHeart size={20} color="var(--brand-blue)" />
                Share Your Experience
              </h3>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setIsModalOpen(false)}
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>
            </div>

            {successToast && (
              <div className={styles.toastSuccess}>
                <Check size={18} />
                <span>{successToast}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Name */}
              <div className={styles.formGroup}>
                <label htmlFor="rev-name" className={styles.formLabel}>
                  Your Name *
                </label>
                <input
                  id="rev-name"
                  type="text"
                  required
                  placeholder="e.g. Salman Khan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={styles.formInput}
                />
              </div>

              {/* Role / Title */}
              <div className={styles.formGroup}>
                <label htmlFor="rev-role" className={styles.formLabel}>
                  Profession or Role
                </label>
                <input
                  id="rev-role"
                  type="text"
                  placeholder="e.g. Video Editor, Creator, Marketer"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className={styles.formInput}
                />
              </div>

              {/* Platform & Rating in Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className={styles.formGroup}>
                  <label htmlFor="rev-platform" className={styles.formLabel}>
                    Primary Platform
                  </label>
                  <select
                    id="rev-platform"
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value as ReviewItem['platform'])}
                    className={styles.formSelect}
                  >
                    <option value="youtube">YouTube</option>
                    <option value="instagram">Instagram</option>
                    <option value="tiktok">TikTok</option>
                    <option value="facebook">Facebook</option>
                    <option value="pinterest">Pinterest</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Rating</label>
                  <div className={styles.ratingPicker}>
                    {[1, 2, 3, 4, 5].map((starNum) => {
                      const isFilled = (hoverRating || rating) >= starNum;
                      return (
                        <button
                          key={starNum}
                          type="button"
                          className={styles.starBtn}
                          onMouseEnter={() => setHoverRating(starNum)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(starNum)}
                          aria-label={`${starNum} stars`}
                        >
                          <Star
                            size={22}
                            fill={isFilled ? '#f59e0b' : 'none'}
                            color={isFilled ? '#f59e0b' : '#94a3b8'}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Review Text */}
              <div className={styles.formGroup}>
                <label htmlFor="rev-comment" className={styles.formLabel}>
                  Your Review *
                </label>
                <textarea
                  id="rev-comment"
                  required
                  placeholder="How has MediaKit helped you download videos or extract audio?"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className={styles.formTextarea}
                />
              </div>

              {/* Actions */}
              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !name.trim() || !comment.trim()}
                  className={styles.submitBtn}
                >
                  <Send size={15} style={{ display: 'inline', marginRight: '6px' }} />
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
