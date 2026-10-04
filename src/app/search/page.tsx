import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Search Tools & Media | MediaKit',
  description: 'Search for MediaKit video downloaders and media conversion tools.',
  robots: {
    index: false,
    follow: true,
  },
};

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedParams = await searchParams;
  const query = resolvedParams.q || '';

  const tools = [
    {
      name: 'YouTube Video Downloader',
      url: '/youtube-video-downloader',
      description: 'Download standard YouTube videos in 1080p, 720p, and MP4.',
      keywords: ['youtube', 'video', 'yt', '1080p'],
    },
    {
      name: 'YouTube Shorts Downloader',
      url: '/youtube-shorts-downloader',
      description: 'Save vertical YouTube Shorts clips directly to your phone or PC.',
      keywords: ['shorts', 'youtube', 'short', 'vertical'],
    },
    {
      name: 'YouTube MP3 Downloader',
      url: '/youtube-mp3',
      description: 'Extract pure audio tracks from YouTube videos in MP3 format.',
      keywords: ['mp3', 'audio', 'sound', 'music', 'youtube'],
    },
    {
      name: 'TikTok Video Downloader',
      url: '/tiktok-video-downloader',
      description: 'Download TikTok clips without watermark overlays.',
      keywords: ['tiktok', 'tik tok', 'watermark', 'tt'],
    },
    {
      name: 'Instagram Video Downloader',
      url: '/instagram-video-downloader',
      description: 'Save Instagram videos, reels, and stories in high definition.',
      keywords: ['instagram', 'ig', 'insta', 'story', 'post'],
    },
    {
      name: 'Instagram Reels Downloader',
      url: '/instagram-reels-downloader',
      description: 'Save vertical Instagram Reels with synchronized audio tracks.',
      keywords: ['reels', 'instagram', 'reel', 'ig reel'],
    },
    {
      name: 'Facebook Video Downloader',
      url: '/facebook-video-downloader',
      description: 'Download public Facebook videos and watch clips.',
      keywords: ['facebook', 'fb', 'watch', 'video'],
    },
    {
      name: 'Facebook Reels Downloader',
      url: '/facebook-reels-downloader',
      description: 'Download Facebook Reels in crisp MP4 format.',
      keywords: ['facebook', 'fb', 'reels', 'fb reel'],
    },
    {
      name: 'Pinterest Video Downloader',
      url: '/pinterest-video-downloader',
      description: 'Download Pinterest video pins, Idea Pins, and animated GIFs.',
      keywords: ['pinterest', 'pin', 'pin.it', 'gif'],
    },
    {
      name: 'Online Video Downloader',
      url: '/online-video-downloader',
      description: 'All-in-one multi-platform downloader with auto-detection.',
      keywords: ['online', 'video', 'free', 'downloader', 'all'],
    },
    {
      name: 'MP4 Video Downloader',
      url: '/mp4-video-downloader',
      description: 'Download videos packaged in universal MP4 containers.',
      keywords: ['mp4', 'video', 'hd'],
    },
    {
      name: 'MP3 Video Downloader',
      url: '/mp3-video-downloader',
      description: 'Extract standalone audio files from supported media links.',
      keywords: ['mp3', 'audio', 'soundtrack'],
    },
  ];

  const filteredTools = query
    ? tools.filter(
        (t) =>
          t.name.toLowerCase().includes(query.toLowerCase()) ||
          t.description.toLowerCase().includes(query.toLowerCase()) ||
          t.keywords.some((k) => k.toLowerCase().includes(query.toLowerCase()))
      )
    : tools;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main style={{ flex: 1, padding: '48px 0 64px 0' }}>
        <div className="app-container" style={{ maxWidth: '820px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <h1
              style={{
                fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
                fontWeight: 900,
                letterSpacing: '-0.02em',
                marginBottom: '10px',
              }}
            >
              Search Results
            </h1>
            {query ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
                Showing matching tools for &ldquo;<strong>{query}</strong>&rdquo;
              </p>
            ) : (
              <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
                Browse all available MediaKit video download tools
              </p>
            )}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '16px',
            }}
          >
            {filteredTools.map((tool) => (
              <Link
                key={tool.url}
                href={tool.url}
                style={{
                  display: 'block',
                  padding: '24px',
                  borderRadius: '16px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-light)',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'border-color 0.2s, transform 0.2s',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <h2
                  style={{
                    fontSize: '1.15rem',
                    fontWeight: 700,
                    marginBottom: '8px',
                    color: 'var(--brand-blue)',
                  }}
                >
                  {tool.name} →
                </h2>
                <p
                  style={{
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.5,
                  }}
                >
                  {tool.description}
                </p>
              </Link>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <Link href="/" className="btn-primary">
              Return to Downloader
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
