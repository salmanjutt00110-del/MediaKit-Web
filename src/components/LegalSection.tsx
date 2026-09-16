'use client';

import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck, FileText, CheckCircle2, ChevronDown } from 'lucide-react';
import styles from './LegalSection.module.css';

export default function LegalSection() {
  const [activeTab, setActiveTab] = useState<'disclaimer' | 'privacy'>('disclaimer');

  return (
    <section className={styles.sectionWrapper} aria-label="Legal and Privacy Information">
      <div className="app-container">
        {/* Section Header */}
        <div className={styles.sectionHeader}>
          <div className={styles.badge}>
            <FileText size={14} />
            <span>Transparency &amp; Trust</span>
          </div>
          <h2 className={styles.sectionTitle}>
            Disclaimer &amp; Privacy Policy
          </h2>
          <p className={styles.sectionSubtitle}>
            We believe in complete transparency regarding content rights, user safety, and strict zero-logging privacy.
          </p>

          {/* Switcher Tabs */}
          <div className={styles.tabsWrapper}>
            <button
              type="button"
              className={`${styles.tabBtn} ${activeTab === 'disclaimer' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab('disclaimer')}
            >
              <ShieldAlert size={16} />
              <span>Disclaimer</span>
            </button>
            <button
              type="button"
              className={`${styles.tabBtn} ${activeTab === 'privacy' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab('privacy')}
            >
              <ShieldCheck size={16} />
              <span>Privacy Policy</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Disclaimer */}
        <div
          id="disclaimer"
          className={`${styles.contentCard} ${activeTab === 'disclaimer' ? styles.cardVisible : styles.cardHidden}`}
        >
          <div className={styles.cardHeader}>
            <div className={`${styles.iconBox} ${styles.iconWarning}`}>
              <ShieldAlert size={24} />
            </div>
            <div>
              <h3 className={styles.cardTitle}>Legal Disclaimer &amp; Fair Use Policy</h3>
              <p className={styles.cardDesc}>
                Please read this disclaimer carefully before using MediaKit services.
              </p>
            </div>
          </div>

          <div className={styles.gridPoints}>
            <div className={styles.pointItem}>
              <div className={styles.pointIcon}><CheckCircle2 size={18} /></div>
              <div>
                <h4 className={styles.pointTitle}>No Content Hosting</h4>
                <p className={styles.pointText}>
                  MediaKit does not host, store, replicate, or archive any audio or video files on its servers. All media is fetched directly from the respective platform&apos;s public CDNs.
                </p>
              </div>
            </div>

            <div className={styles.pointItem}>
              <div className={styles.pointIcon}><CheckCircle2 size={18} /></div>
              <div>
                <h4 className={styles.pointTitle}>Personal &amp; Educational Use</h4>
                <p className={styles.pointText}>
                  This tool is provided strictly for personal, non-commercial, and fair-use purposes (e.g. offline research, backups, study). Commercial redistribution of copyrighted media without author consent is strictly prohibited.
                </p>
              </div>
            </div>

            <div className={styles.pointItem}>
              <div className={styles.pointIcon}><CheckCircle2 size={18} /></div>
              <div>
                <h4 className={styles.pointTitle}>Creator Copyright &amp; Intellectual Property</h4>
                <p className={styles.pointText}>
                  All trademarks, logos, video titles, and media rights belong solely to their respective content creators and platforms. MediaKit respects intellectual property and does not circumvent DRM or private account restrictions.
                </p>
              </div>
            </div>

            <div className={styles.pointItem}>
              <div className={styles.pointIcon}><CheckCircle2 size={18} /></div>
              <div>
                <h4 className={styles.pointTitle}>User Responsibility</h4>
                <p className={styles.pointText}>
                  By using MediaKit, you agree that you are solely responsible for verifying that you have the right or legitimate permission to download and store the requested content.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab 2: Privacy Policy */}
        <div
          id="privacy"
          className={`${styles.contentCard} ${activeTab === 'privacy' ? styles.cardVisible : styles.cardHidden}`}
        >
          <div className={styles.cardHeader}>
            <div className={`${styles.iconBox} ${styles.iconSafe}`}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className={styles.cardTitle}>Privacy Policy &amp; Data Protection</h3>
              <p className={styles.cardDesc}>
                Your privacy is paramount. MediaKit is built on a strict zero-knowledge architecture.
              </p>
            </div>
          </div>

          <div className={styles.gridPoints}>
            <div className={styles.pointItem}>
              <div className={styles.pointIcon}><CheckCircle2 size={18} /></div>
              <div>
                <h4 className={styles.pointTitle}>Zero Account Requirement</h4>
                <p className={styles.pointText}>
                  You never need to create an account, register, or provide personal details (name, email, password, or phone number) to download media on MediaKit.
                </p>
              </div>
            </div>

            <div className={styles.pointItem}>
              <div className={styles.pointIcon}><CheckCircle2 size={18} /></div>
              <div>
                <h4 className={styles.pointTitle}>No Activity Logs</h4>
                <p className={styles.pointText}>
                  We do not monitor, store, or profile the URLs you submit or the files you retrieve. Once a download stream finishes, transient processing memory is instantly purged.
                </p>
              </div>
            </div>

            <div className={styles.pointItem}>
              <div className={styles.pointIcon}><CheckCircle2 size={18} /></div>
              <div>
                <h4 className={styles.pointTitle}>No Tracking Cookies or Ads</h4>
                <p className={styles.pointText}>
                  We do not use invasive tracking cookies or sell your browsing footprint to advertisers. Only your selected theme preference (Light/Dark) is stored locally in your browser.
                </p>
              </div>
            </div>

            <div className={styles.pointItem}>
              <div className={styles.pointIcon}><CheckCircle2 size={18} /></div>
              <div>
                <h4 className={styles.pointTitle}>Encrypted Transmission</h4>
                <p className={styles.pointText}>
                  All communication between your device and MediaKit is fully encrypted via standard HTTPS/TLS protocols, ensuring complete integrity and security.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
