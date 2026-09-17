import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MediaKit — All-In-One Universal Media Downloader',
    short_name: 'MediaKit',
    description: 'Download HD videos, reels, stories, shorts, and MP3 audio from YouTube, TikTok, Facebook, Instagram, and Pinterest.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0b0f17',
    theme_color: '#3b82f6',
    icons: [
      {
        src: '/favicon.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/logo.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
