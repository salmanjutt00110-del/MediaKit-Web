import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: '404 - Page Not Found | MediaKit',
  description: 'The requested page could not be found. Explore popular free video downloaders on MediaKit.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  const popularTools = [
    { name: 'YouTube Video Downloader', url: '/youtube-video-downloader', icon: '▶️' },
    { name: 'TikTok Video Downloader', url: '/tiktok-video-downloader', icon: '🎵' },
    { name: 'Instagram Video Downloader', url: '/instagram-video-downloader', icon: '📸' },
    { name: 'Facebook Video Downloader', url: '/facebook-video-downloader', icon: '📘' },
    { name: 'Pinterest Video Downloader', url: '/pinterest-video-downloader', icon: '📌' },
    { name: 'Online Video Downloader', url: '/online-video-downloader', icon: '🌐' },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 20px',
        }}
      >
        <div
          style={{
            maxWidth: '680px',
            width: '100%',
            textAlign: 'center',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-light)',
            borderRadius: '24px',
            padding: '48px 28px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
            <Image
              src="/logo.png"
              alt="MediaKit Logo"
              width={64}
              height={64}
              style={{ objectFit: 'contain' }}
            />
          </div>

          <span
            style={{
              display: 'inline-block',
              padding: '4px 12px',
              borderRadius: '9999px',
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              fontWeight: 800,
              fontSize: '0.82rem',
              letterSpacing: '0.05em',
              marginBottom: '14px',
            }}
          >
            ERROR 404
          </span>

          <h1
            style={{
              fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
              fontWeight: 900,
              letterSpacing: '-0.02em',
              marginBottom: '12px',
              color: 'var(--text-primary)',
            }}
          >
            Looks like this page went off the grid.
          </h1>

          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '1rem',
              lineHeight: 1.6,
              maxWidth: '500px',
              margin: '0 auto 28px auto',
            }}
          >
            The link you clicked may be broken, moved, or deleted. You can return to the homepage or explore our popular media downloaders below.
          </p>

          <div style={{ marginBottom: '36px' }}>
            <Link
              href="/"
              className="btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 32px',
                fontSize: '1rem',
                borderRadius: '9999px',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              ← Back to MediaKit
            </Link>
          </div>

          <div
            style={{
              borderTop: '1px solid var(--border-light)',
              paddingTop: '28px',
              textAlign: 'left',
            }}
          >
            <h2
              style={{
                fontSize: '0.95rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--text-muted)',
                marginBottom: '16px',
                textAlign: 'center',
              }}
            >
              Popular Downloader Tools
            </h2>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '10px',
              }}
            >
              {popularTools.map((tool) => (
                <Link
                  key={tool.url}
                  href={tool.url}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-card)',
                    color: 'var(--text-primary)',
                    textDecoration: 'none',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    transition: 'border-color 0.2s',
                  }}
                >
                  <span>{tool.icon}</span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {tool.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
