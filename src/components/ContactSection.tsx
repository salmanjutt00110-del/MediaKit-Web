'use client';

import React, { useState } from 'react';
import { Mail, MessageCircle, Send, CheckCircle2, Clock, Globe, ShieldCheck, Headphones } from 'lucide-react';
import { FacebookIcon } from './PlatformIcons';
import styles from './ContactSection.module.css';

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <section id="contact" className={styles.sectionWrapper} aria-labelledby="contact-heading">
      <div className="app-container">
        {/* Header */}
        <div className={styles.sectionHeader}>
          <div className={styles.badge}>
            <Headphones size={14} />
            <span>Dedicated Support</span>
          </div>
          <h2 id="contact-heading" className={styles.sectionTitle}>
            Get in Touch With Us
          </h2>
          <p className={styles.sectionSubtitle}>
            Have a question, feedback, or need help downloading a specific link? We&apos;re here to help.
          </p>
        </div>

        <div className={styles.contactGrid}>
          {/* Left Column: Contact Methods */}
          <div className={styles.infoCol}>
            {/* Professional Helpdesk Support Card */}
            <div className={`${styles.channelCard} ${styles.helpdeskCard}`}>
              <div className={styles.channelIconBox}>
                <Headphones size={28} color="#ffffff" />
              </div>
              <div className={styles.channelDetails}>
                <span className={styles.channelBadge}>Instant Help</span>
                <h3 className={styles.channelTitle}>24/7 Digital Assistant</h3>
                <p className={styles.channelDesc}>
                  Encountered an issue with a video download, format conversion, or batch speed? Use our instant web form or the AI Help button below.
                </p>
                <a
                  href="#contact-form"
                  className={styles.helpdeskBtn}
                >
                  <MessageCircle size={16} color="#ffffff" />
                  <span>Send Direct Feedback</span>
                </a>
              </div>
            </div>

            {/* Response Time & Community Channels */}
            <div className={styles.subChannelsGrid}>
              <div className={styles.miniCard}>
                <div className={styles.miniIcon}><Clock size={20} color="#2563eb" /></div>
                <h4 className={styles.miniTitle}>Live Support</h4>
                <p className={styles.miniText}>Instant AI Assistant Available</p>
              </div>

              <div className={styles.miniCard}>
                <div className={styles.miniIcon}><FacebookIcon size={20} color="#1877F2" /></div>
                <h4 className={styles.miniTitle}>Facebook Page</h4>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.miniLink}
                >
                  Visit Community
                </a>
              </div>
            </div>

            {/* Fast Response Guarantee */}
            <div className={styles.guaranteeBox}>
              <div className={styles.guaranteeItem}>
                <Clock size={16} className={styles.guaranteeIcon} />
                <span>Quick Response (Typically within hours)</span>
              </div>
              <div className={styles.guaranteeItem}>
                <Globe size={16} className={styles.guaranteeIcon} />
                <span>Global Support available 24/7</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Contact Form */}
          <div className={styles.formCol} id="contact-form">
            <div className={styles.formCard}>
              <h3 className={styles.formTitle}>Send Us a Message</h3>
              <p className={styles.formSubtitle}>
                Fill out the form below and we will get back to you as soon as possible.
              </p>

              {submitted ? (
                <div className={styles.successState}>
                  <div className={styles.successIconBox}>
                    <CheckCircle2 size={36} color="#10b981" />
                  </div>
                  <h4 className={styles.successHeading}>Message Sent Successfully!</h4>
                  <p className={styles.successMessage}>
                    Thank you, <strong>{formData.name || 'Friend'}</strong>! Your message has been received. Our team will review it and reply via email shortly.
                  </p>
                  <button
                    type="button"
                    className={styles.resetBtn}
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: '', email: '', subject: '', message: '' });
                    }}
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className={styles.formElement}>
                  <div className={styles.inputRow}>
                    <div className={styles.inputGroup}>
                      <label htmlFor="contact-name" className={styles.label}>
                        Your Name
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        required
                        placeholder="John Doe"
                        className={styles.input}
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>

                    <div className={styles.inputGroup}>
                      <label htmlFor="contact-email" className={styles.label}>
                        Email Address
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        required
                        placeholder="john@example.com"
                        className={styles.input}
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <label htmlFor="contact-subject" className={styles.label}>
                      Subject
                    </label>
                    <input
                      id="contact-subject"
                      type="text"
                      required
                      placeholder="e.g. Issue with YouTube link or General Feedback"
                      className={styles.input}
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label htmlFor="contact-message" className={styles.label}>
                      Message
                    </label>
                    <textarea
                      id="contact-message"
                      required
                      rows={4}
                      placeholder="Write your question or message here..."
                      className={styles.textarea}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={styles.submitBtn}
                  >
                    <Send size={16} />
                    <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
