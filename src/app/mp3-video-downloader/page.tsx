import type { Metadata } from 'next';
import SeoLandingPage from '@/components/SeoLandingPage';

export const metadata: Metadata = {
  title: 'MP3 Video Downloader | MediaKit',
  description:
    'Extract and download pure MP3 audio from online videos with MediaKit. Save audio tracks, podcasts, and speech directly to your mobile device or computer for free.',
  keywords: [
    'mp3 video downloader',
    'mp3 downloader',
    'video to mp3',
    'online audio downloader',
    'extract audio from video',
    'free mp3 downloader',
  ],
  alternates: {
    canonical: 'https://mediakit.website/mp3-video-downloader',
  },
  openGraph: {
    title: 'MP3 Video Downloader | MediaKit',
    description:
      'Extract and save clean audio tracks from online videos in MP3 format with MediaKit.',
    url: 'https://mediakit.website/mp3-video-downloader',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MP3 Video Downloader | MediaKit',
    description: 'Extract and save clean MP3 audio tracks directly in your browser.',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': 'https://mediakit.website/mp3-video-downloader#webpage',
      url: 'https://mediakit.website/mp3-video-downloader',
      name: 'MP3 Video Downloader | MediaKit',
      description:
        'Extract and download pure MP3 audio from online videos with MediaKit.',
      isPartOf: {
        '@type': 'WebSite',
        '@id': 'https://mediakit.website/#website',
      },
    },
    {
      '@type': 'WebApplication',
      name: 'MediaKit MP3 Video Downloader',
      url: 'https://mediakit.website/mp3-video-downloader',
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
          name: 'MP3 Video Downloader',
          item: 'https://mediakit.website/mp3-video-downloader',
        },
      ],
    },
    {
      '@type': 'HowTo',
      name: 'How to Extract MP3 Audio from Online Videos',
      description: 'Quick steps to extract and download MP3 audio tracks.',
      step: [
        {
          '@type': 'HowToStep',
          position: 1,
          name: 'Copy Media URL',
          text: 'Copy the web link of any video containing audio you wish to extract.',
        },
        {
          '@type': 'HowToStep',
          position: 2,
          name: 'Paste into MediaKit',
          text: 'Paste the video URL into the search field above and click Download.',
        },
        {
          '@type': 'HowToStep',
          position: 3,
          name: 'Choose MP3 Audio Option',
          text: 'Select the "Audio Only (MP3)" option from available format choices to save the standalone soundtrack.',
        },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'How does the audio extraction process work?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'When a video URL is submitted, MediaKit identifies the independent audio stream provided by the content host and extracts the audio track into a standalone audio file, bypassing unnecessary video payload.',
          },
        },
        {
          '@type': 'Question',
          name: 'What audio bitrate is provided?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'MediaKit delivers the highest available source audio quality provided by the original host platform, typically up to 128kbps to 320kbps depending on source encoding.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I extract MP3 audio from any video platform?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Audio extraction is supported for platforms providing accessible audio streams, including YouTube, TikTok sounds, and Facebook video tracks.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is there a limit on how many MP3 files I can download?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No. MediaKit offers unlimited audio downloads for legitimate personal use without registration or subscription barriers.',
          },
        },
      ],
    },
  ],
};

const customRelatedTools = [
  {
    name: 'YouTube MP3 Downloader',
    url: '/youtube-mp3',
    description: 'Specialized YouTube audio extraction for talks, podcasts, and public music streams.',
    icon: '🎵',
  },
  {
    name: 'MP4 Video Downloader',
    url: '/mp4-video-downloader',
    description: 'Download complete video and audio streams packaged into standard MP4 containers.',
    icon: '🎬',
  },
  {
    name: 'Online Video Downloader',
    url: '/online-video-downloader',
    description: 'Universal downloader supporting all platforms and formats in one tool.',
    icon: '🌐',
  },
  {
    name: 'TikTok Video Downloader',
    url: '/tiktok-video-downloader',
    description: 'Save viral TikTok clips and extract trending background sound tracks.',
    icon: '📱',
  },
];

export default function Mp3VideoDownloaderPage() {
  return (
    <SeoLandingPage
      badgeText="Audio Extraction Tool"
      title="MP3 Video Downloader"
      highlightWord="Downloader"
      subtitle="Extract and save pure MP3 audio tracks, speech, and soundtracks from supported online videos directly to your device."
      supportedUrls={[
        'https://youtube.com/watch?v=...',
        'https://tiktok.com/@user/video/...',
        'https://facebook.com/watch/...',
      ]}
      features={[
        {
          title: 'Direct Audio Stream Demuxing',
          description:
            'Extracts clean audio streams without downloading unnecessary video megabytes, saving bandwidth and storage.',
        },
        {
          title: 'Original Source Fidelity',
          description:
            'Preserves crisp audio reproduction, stereo channel separation, and authentic bitrates provided by the host.',
        },
        {
          title: 'Universal Media Player Compatibility',
          description:
            'Outputs universally playable audio compatible with default iOS, Android, Windows, and Mac media players.',
        },
        {
          title: 'No Conversion Software Needed',
          description:
            'All stream extraction takes place seamlessly through our cloud architecture with zero software to install.',
        },
      ]}
      articles={[
        {
          title: 'How Audio Extraction Works',
          content: [
            'Online video platforms store video frames and audio data as distinct data streams. When you only need the audio—such as for educational lectures, interviews, public domain performances, or background listening—downloading high-definition video is inefficient.',
            'MediaKit demuxes the media package, isolating the audio stream and delivering an MP3 container that plays immediately on any mobile phone, car stereo, or portable audio player.',
          ],
        },
        {
          title: 'Audio Quality and Bitrate Considerations',
          content: [
            'Audio quality is strictly determined by how the original content was recorded and published. Most online video services encode sound in AAC or Opus at bitrates ranging from 128kbps to 256kbps.',
            'MediaKit preserves the highest available source bitrate without lossy re-encoding or artificial inflation, ensuring clear vocal clarity and balanced acoustic playback.',
          ],
        },
      ]}
      faqs={[
        {
          question: 'How does the audio extraction process work?',
          answer:
            'When a video URL is submitted, MediaKit identifies the independent audio stream provided by the content host and extracts the audio track into a standalone audio file, bypassing unnecessary video payload.',
        },
        {
          question: 'What audio bitrate is provided?',
          answer:
            'MediaKit delivers the highest available source audio quality provided by the original host platform, typically up to 128kbps to 320kbps depending on source encoding.',
        },
        {
          question: 'Can I extract MP3 audio from any video platform?',
          answer:
            'Audio extraction is supported for platforms providing accessible audio streams, including YouTube, TikTok sounds, and Facebook video tracks.',
        },
        {
          question: 'Is there a limit on how many MP3 files I can download?',
          answer:
            'No. MediaKit offers unlimited audio downloads for legitimate personal use without registration or subscription barriers.',
        },
      ]}
      structuredData={jsonLd}
      relatedTools={customRelatedTools}
    />
  );
}
