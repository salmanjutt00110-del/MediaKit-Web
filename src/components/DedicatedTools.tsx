import React from 'react';
import Link from 'next/link';

interface ToolItem {
  name: string;
  url: string;
  description: string;
  badge: string;
  icon: string;
}

const tools: ToolItem[] = [
  {
    name: 'YouTube Video Downloader',
    url: '/youtube-video-downloader',
    description: 'Download regular YouTube videos, tutorials, and music streams up to 1080p Full HD.',
    badge: 'YouTube',
    icon: '▶️',
  },
  {
    name: 'YouTube Shorts Downloader',
    url: '/youtube-shorts-downloader',
    description: 'Save vertical YouTube Shorts clips directly to your phone camera roll or computer.',
    badge: 'Shorts',
    icon: '⚡',
  },
  {
    name: 'YouTube to MP3 Converter',
    url: '/youtube-mp3',
    description: 'Extract pristine studio-grade audio tracks from YouTube videos in high-bitrate MP3.',
    badge: 'Audio',
    icon: '🎵',
  },
  {
    name: 'TikTok Video Downloader',
    url: '/tiktok-video-downloader',
    description: 'Download clean TikTok videos without watermark logos and extract trending sounds.',
    badge: 'TikTok',
    icon: '📱',
  },
  {
    name: 'Instagram Video Downloader',
    url: '/instagram-video-downloader',
    description: 'Save public Instagram video posts, carousels, and story highlights in original clarity.',
    badge: 'Instagram',
    icon: '📸',
  },
  {
    name: 'Instagram Reels Downloader',
    url: '/instagram-reels-downloader',
    description: 'Download vertical Instagram Reels with original synchronized background music.',
    badge: 'Reels',
    icon: '✨',
  },
  {
    name: 'Facebook Video Downloader',
    url: '/facebook-video-downloader',
    description: 'Download public Facebook timeline videos, group clips, and watch streams in MP4.',
    badge: 'Facebook',
    icon: '📘',
  },
  {
    name: 'Facebook Reels Downloader',
    url: '/facebook-reels-downloader',
    description: 'Save vertical Facebook Reels clips with synchronized sound directly to your gallery.',
    badge: 'FB Reels',
    icon: '🎞️',
  },
  {
    name: 'Pinterest Video Downloader',
    url: '/pinterest-video-downloader',
    description: 'Save Pinterest video pins, Idea Pins, and animated GIFs with pin.it link unrolling.',
    badge: 'Pinterest',
    icon: '📌',
  },
  {
    name: 'Online Video Downloader',
    url: '/online-video-downloader',
    description: 'Universal cross-platform downloader with real-time automatic link and format detection.',
    badge: 'Universal',
    icon: '🌐',
  },
  {
    name: 'MP4 Video Downloader',
    url: '/mp4-video-downloader',
    description: 'Download online videos in universal MP4 format playable on any smartphone or player.',
    badge: 'Format',
    icon: '🎬',
  },
  {
    name: 'MP3 Video Downloader',
    url: '/mp3-video-downloader',
    description: 'Extract standalone audio files and speech from supported media links with zero lag.',
    badge: 'Audio',
    icon: '🎧',
  },
];

export default function DedicatedTools() {
  return (
    <section
      style={{
        padding: '60px 0',
        background: 'var(--bg-subtle)',
        borderTop: '1px solid var(--border-light)',
        borderBottom: '1px solid var(--border-light)',
      }}
      aria-labelledby="dedicated-tools-heading"
    >
      <div className="app-container">
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span
            style={{
              display: 'inline-block',
              padding: '6px 14px',
              borderRadius: '9999px',
              background: 'rgba(59, 130, 246, 0.1)',
              color: 'var(--brand-blue)',
              fontWeight: 700,
              fontSize: '0.85rem',
              marginBottom: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Specialized Tool Suite
          </span>
          <h2
            id="dedicated-tools-heading"
            style={{
              fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)',
              fontWeight: 900,
              letterSpacing: '-0.02em',
              marginBottom: '12px',
            }}
          >
            Platform-Specific <span style={{ color: 'var(--brand-blue)' }}>Download Tools</span>
          </h2>
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '1rem',
              maxWidth: '620px',
              margin: '0 auto',
            }}
          >
            Explore dedicated downloaders tailored for individual platforms, format conversion, and watermark-free media saving.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '18px',
          }}
        >
          {tools.map((tool) => (
            <Link
              key={tool.url}
              href={tool.url}
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '24px',
                borderRadius: '18px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-light)',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'all 0.2s ease',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '14px',
                  }}
                >
                  <span style={{ fontSize: '1.6rem' }}>{tool.icon}</span>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '3px 10px',
                      borderRadius: '9999px',
                      background: 'rgba(59, 130, 246, 0.08)',
                      color: 'var(--brand-blue)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {tool.badge}
                  </span>
                </div>
                <h3
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    marginBottom: '8px',
                    color: 'var(--text-primary)',
                  }}
                >
                  {tool.name}
                </h3>
                <p
                  style={{
                    fontSize: '0.88rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.5,
                  }}
                >
                  {tool.description}
                </p>
              </div>

              <div
                style={{
                  marginTop: '16px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: 'var(--brand-blue)',
                }}
              >
                <span>Use Tool</span>
                <span>→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
