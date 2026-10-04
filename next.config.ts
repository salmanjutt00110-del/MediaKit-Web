import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: '**.ytimg.com' },
      { protocol: 'https', hostname: '**.tiktokcdn.com' },
      { protocol: 'https', hostname: '**.cdninstagram.com' },
      { protocol: 'https', hostname: '**.fbcdn.net' },
      { protocol: 'https', hostname: '**.pinimg.com' },
    ],
  },
  async redirects() {
    return [
      {
        source: '/video-downloader',
        destination: '/online-video-downloader',
        permanent: true,
      },
      {
        source: '/facebook-video-downloader-hd-online-free',
        destination: '/facebook-video-downloader',
        permanent: true,
      },
      {
        source: '/instagram-reels-downloader-without-watermark',
        destination: '/instagram-reels-downloader',
        permanent: true,
      },
      {
        source: '/pinterest-video-downloader-no-watermark-free',
        destination: '/pinterest-video-downloader',
        permanent: true,
      },
      {
        source: '/free-video-downloader-without-watermark',
        destination: '/online-video-downloader',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|png|webp|avif|woff2)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  outputFileTracingIncludes: {
    '/api/**': ['./bin/**/*'],
    '/api/**/*': ['./bin/**/*'],
    '/api/download': ['./bin/**/*'],
    '/api/download/stream': ['./bin/**/*'],
    '/api/download/file': ['./bin/**/*'],
    '/api/download/serve': ['./bin/**/*'],
    '/api/media-info': ['./bin/**/*'],
  },
};

export default nextConfig;
