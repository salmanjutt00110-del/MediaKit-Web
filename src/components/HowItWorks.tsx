'use client';

import React from 'react';
import { Link as LinkIcon, Cpu, Download, ArrowRight } from 'lucide-react';
import styles from './HowItWorks.module.css';

const steps = [
  {
    number: '01',
    title: 'Paste Link',
    description: 'Paste your media URL.',
    icon: <LinkIcon size={18} />,
  },
  {
    number: '02',
    title: 'Auto Detect',
    description: 'MediaKit identifies the platform automatically.',
    icon: <Cpu size={18} />,
  },
  {
    number: '03',
    title: 'Download',
    description: 'Choose an available format and download.',
    icon: <Download size={18} />,
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className={styles.sectionWrapper} aria-labelledby="how-heading">
      <div className="app-container">
        <div className={styles.sectionHeader}>
          <h2 id="how-heading" className={styles.sectionTitle}>
            How It Works
          </h2>
          <p className={styles.sectionSubtitle}>
            Three simple steps to process and download supported media.
          </p>
        </div>

        <div className={styles.stepsGrid}>
          {steps.map((step, idx) => (
            <div key={step.number} className={styles.stepCard}>
              <div className={styles.stepHeader}>
                <span className={styles.stepNumber}>{step.number}</span>
                <div className={styles.stepIconBox}>{step.icon}</div>
              </div>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepDesc}>{step.description}</p>

              {idx < steps.length - 1 && (
                <div className={styles.stepConnector} aria-hidden="true">
                  <ArrowRight size={16} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
