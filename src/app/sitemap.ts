import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mediakit.website';
  const now = new Date();

  const routes = [
    { url: '/', priority: 1.0, changeFrequency: 'daily' },
    { url: '/free-video-downloader-without-watermark', priority: 0.95, changeFrequency: 'daily' },
    { url: '/tiktok-video-downloader', priority: 0.95, changeFrequency: 'daily' },
    { url: '/youtube-video-downloader', priority: 0.95, changeFrequency: 'daily' },
    { url: '/youtube-mp3', priority: 0.95, changeFrequency: 'daily' },
    { url: '/instagram-video-downloader', priority: 0.95, changeFrequency: 'daily' },
    { url: '/facebook-video-downloader', priority: 0.95, changeFrequency: 'daily' },
    { url: '/youtube-shorts-downloader', priority: 0.9, changeFrequency: 'daily' },
    { url: '/instagram-reels-downloader', priority: 0.9, changeFrequency: 'daily' },
    { url: '/facebook-reels-downloader', priority: 0.9, changeFrequency: 'daily' },
    { url: '/pinterest-video-downloader', priority: 0.9, changeFrequency: 'daily' },
    { url: '/video-downloader', priority: 0.85, changeFrequency: 'daily' },
    { url: '/blog', priority: 0.85, changeFrequency: 'daily' },
    { url: '/blog/how-to-download-tiktok-videos-without-watermark', priority: 0.8, changeFrequency: 'weekly' },
    { url: '/blog/youtube-to-mp3-converter-guide', priority: 0.8, changeFrequency: 'weekly' },
    { url: '/blog/how-to-download-instagram-reels-iphone-android', priority: 0.8, changeFrequency: 'weekly' },
    { url: '/blog/facebook-video-download-guide', priority: 0.8, changeFrequency: 'weekly' },
    { url: '/blog/best-free-video-downloaders-2026', priority: 0.8, changeFrequency: 'weekly' },
    { url: '/how-to-download-tiktok-without-watermark-iphone', priority: 0.9, changeFrequency: 'weekly' },
    { url: '/how-to-save-tiktok-to-camera-roll', priority: 0.9, changeFrequency: 'weekly' },
    { url: '/tiktok-to-mp4-free-online', priority: 0.9, changeFrequency: 'weekly' },
    { url: '/youtube-to-mp4-free-online-no-registration', priority: 0.9, changeFrequency: 'weekly' },
    { url: '/download-youtube-video-without-software', priority: 0.9, changeFrequency: 'weekly' },
    { url: '/instagram-reels-downloader-without-watermark', priority: 0.9, changeFrequency: 'weekly' },
    { url: '/save-instagram-story-without-knowing', priority: 0.9, changeFrequency: 'weekly' },
    { url: '/facebook-video-downloader-hd-online-free', priority: 0.9, changeFrequency: 'weekly' },
    { url: '/pinterest-video-downloader-no-watermark-free', priority: 0.9, changeFrequency: 'weekly' },
    { url: '/download-videos-for-offline-viewing-free', priority: 0.9, changeFrequency: 'weekly' },
    { url: '/faq', priority: 0.7, changeFrequency: 'weekly' },
    { url: '/terms', priority: 0.5, changeFrequency: 'monthly' },
    { url: '/privacy', priority: 0.5, changeFrequency: 'monthly' },
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route.url}`,
    lastModified: now,
    changeFrequency: route.changeFrequency as 'daily' | 'weekly' | 'monthly',
    priority: route.priority,
  }));
}
