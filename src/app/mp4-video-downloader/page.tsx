import type { Metadata } from 'next';
import SeoLandingPage from '@/components/SeoLandingPage';

export const metadata: Metadata = {
  title: 'MP4 Video Downloader | MediaKit',
  description:
    'Download online videos in standard MP4 format from supported platforms. Preserve authentic resolutions from 1080p to 360p with synchronized audio using MediaKit.',
  keywords: [
    'mp4 video downloader',
    'download video mp4',
    'online mp4 downloader',
    'save video to mp4',
    'free mp4 video downloader',
    'mp4 converter online',
  ],
  alternates: {
    canonical: 'https://mediakit.website/mp4-video-downloader',
  },
  openGraph: {
    title: 'MP4 Video Downloader | MediaKit',
    description:
      'Download online videos in universal MP4 format with synchronized audio across supported platforms.',
    url: 'https://mediakit.website/mp4-video-downloader',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MP4 Video Downloader | MediaKit',
    description: 'Save videos in standard MP4 format with authentic source quality.',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': 'https://mediakit.website/mp4-video-downloader#webpage',
      url: 'https://mediakit.website/mp4-video-downloader',
      name: 'MP4 Video Downloader | MediaKit',
      description:
        'Download online videos in standard MP4 format from supported platforms with MediaKit.',
      isPartOf: {
        '@type': 'WebSite',
        '@id': 'https://mediakit.website/#website',
      },
    },
    {
      '@type': 'WebApplication',
      name: 'MediaKit MP4 Video Downloader',
      url: 'https://mediakit.website/mp4-video-downloader',
      applicationCategory: 'MultimediaApplication',
      operatingSystem: 'Windows, macOS, Linux, Android, iOS',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://mediakit.website/',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Tools',
          item: 'https://mediakit.website/online-video-downloader',
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'MP4 Video Downloader',
          item: 'https://mediakit.website/mp4-video-downloader',
        },
      ],
    },
    {
      '@type': 'HowTo',
      name: 'How to Download MP4 Videos Online',
      description: 'Quick steps to extract and download MP4 video files.',
      step: [
        {
          '@type': 'HowToStep',
          position: 1,
          name: 'Copy Video Link',
          text: 'Copy the web link or share link of any video you wish to download in MP4 format.',
        },
        {
          '@type': 'HowToStep',
          position: 2,
          name: 'Paste into MediaKit',
          text: 'Paste the URL into the search field above and initiate detection.',
        },
        {
          '@type': 'HowToStep',
          position: 3,
          name: 'Choose MP4 Quality',
          text: 'Select your preferred MP4 resolution (e.g., 1080p, 720p, or 480p) from available source options and click Download.',
        },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Why is MP4 the recommended format for video downloads?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'MP4 (MPEG-4 Part 14) using the H.264 video codec and AAC audio is universally supported by virtually every smartphone, tablet, computer, smart TV, and video editing software without requiring proprietary codecs.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can MediaKit convert any video to 4K or 1080p MP4?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No. MediaKit only provides resolutions that the original content was recorded and published in. We do not perform artificial or fake upscaling, ensuring authentic file clarity.',
          },
        },
        {
          '@type': 'Question',
          name: 'Are downloaded MP4 videos saved with synchronized sound?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. Where platforms deliver separate video and audio streams (such as YouTube DASH), MediaKit combines them into a single, fully synchronized MP4 file before download.',
          },
        },
        {
          '@type': 'Question',
          name: 'Does downloading MP4 videos work on mobile devices?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, MP4 files can be directly saved to iOS Photos (via Safari download manager) and Android file storage or galleries.',
          },
        },
      ],
    },
  ],
};

const customRelatedTools = [
  {
    name: 'MP3 Video Downloader',
    url: '/mp3-video-downloader',
    description: 'Extract pure audio streams and soundtracks into standalone MP3 files.',
    icon: '🎵',
  },
  {
    name: 'Online Video Downloader',
    url: '/online-video-downloader',
    description: 'Universal downloader supporting all platforms and formats in one tool.',
    icon: '🌐',
  },
  {
    name: 'YouTube Video Downloader',
    url: '/youtube-video-downloader',
    description: 'Download YouTube videos in MP4 format up to 1080p HD.',
    icon: '▶️',
  },
  {
    name: 'TikTok Video Downloader',
    url: '/tiktok-video-downloader',
    description: 'Save clean MP4 TikTok videos with zero watermark overlays.',
    icon: '📱',
  },
];

export default function Mp4VideoDownloaderPage() {
  return (
    <SeoLandingPage
      badgeText="Format Specialization"
      title="MP4 Video Downloader"
      highlightWord="Downloader"
      subtitle="Save online videos in universal, high-compatibility MP4 format with synchronized stereo audio and authentic source resolution."
      supportedUrls={[
        'https://youtube.com/watch?v=...',
        'https://tiktok.com/@user/video/...',
        'https://instagram.com/reel/...',
        'https://facebook.com/watch/...',
        'https://pinterest.com/pin/...',
      ]}
      features={[
        {
          title: 'Universal MP4 Compatibility',
          description:
            'Outputs standard H.264 / AAC MP4 containers compatible across iOS, Android, macOS, Windows, and smart displays.',
        },
        {
          title: 'Authentic Resolution Tiers',
          description:
            'Choose from true 1080p, 720p, 480p, and 360p streams based strictly on what the source video provides.',
        },
        {
          title: 'Synchronized Audio Streams',
          description:
            'Extracts full audio tracks and combines them seamlessly with video streams to prevent sound desync.',
        },
        {
          title: 'No Software Installation',
          description:
            'Download directly inside your browser without installing conversion software or third-party plugins.',
        },
      ]}
      articles={[
        {
          title: 'Why MP4 is the Standard for Video Downloads',
          content: [
            'MPEG-4 Part 14 (MP4) is the most widely supported digital multimedia container format in the world. It delivers an optimal balance between visual compression efficiency and playback compatibility across mobile devices, desktop operating systems, and video editing suites.',
            'MediaKit ensures that when you download an MP4, the file contains clean video frames and crisp audio channels packaged for immediate playback without extra transcoding.',
          ],
        },
        {
          title: 'Understanding Video Resolution Availability',
          content: [
            'Different social media platforms handle video resolution differently. While YouTube often provides resolutions up to 1080p or 4K, platforms like TikTok and Instagram typically stream in native mobile resolutions (720p or 1080p vertical).',
            'MediaKit never makes false promises about resolution; the format options displayed directly reflect the genuine media streams made available by the host platform.',
          ],
        },
      ]}
      faqs={[
        {
          question: 'Why is MP4 the recommended format for video downloads?',
          answer:
            'MP4 (MPEG-4 Part 14) using the H.264 video codec and AAC audio is universally supported by virtually every smartphone, tablet, computer, smart TV, and video editing software without requiring proprietary codecs.',
        },
        {
          question: 'Can MediaKit convert any video to 4K or 1080p MP4?',
          answer:
            'No. MediaKit only provides resolutions that the original content was recorded and published in. We do not perform artificial or fake upscaling, ensuring authentic file clarity.',
        },
        {
          question: 'Are downloaded MP4 videos saved with synchronized sound?',
          answer:
            'Yes. Where platforms deliver separate video and audio streams (such as YouTube DASH), MediaKit combines them into a single, fully synchronized MP4 file before download.',
        },
        {
          question: 'Does downloading MP4 videos work on mobile devices?',
          answer:
            'Yes, MP4 files can be directly saved to iOS Photos (via Safari download manager) and Android file storage or galleries.',
        },
      ]}
      structuredData={jsonLd}
      relatedTools={customRelatedTools}
    />
  );
}
