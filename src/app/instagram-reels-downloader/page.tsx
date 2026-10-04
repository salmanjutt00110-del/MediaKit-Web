import type { Metadata } from 'next';
import SeoLandingPage from '@/components/SeoLandingPage';

export const metadata: Metadata = {
  title: {
    absolute: 'Instagram Reels Downloader | MediaKit',
  },
  description:
    'Download Instagram Reels without watermark in 1080p vertical HD. Save viral Reels with synced audio directly to your camera roll or PC with MediaKit.',
  keywords: [
    'instagram reels downloader',
    'download instagram reels',
    'reels downloader',
    'save instagram reels',
    'instagram reels without watermark',
    'download ig reels hd',
  ],
  alternates: {
    canonical: 'https://mediakit.website/instagram-reels-downloader',
  },
  openGraph: {
    title: 'Instagram Reels Downloader | MediaKit',
    description:
      'Download Instagram Reels without watermark in 1080p vertical HD. Save viral Reels with synced audio directly to your camera roll or PC with MediaKit.',
    url: 'https://mediakit.website/instagram-reels-downloader',
    type: 'website',
    images: [
      {
        url: 'https://mediakit.website/logo.png',
        width: 512,
        height: 512,
        alt: 'MediaKit Instagram Reels Downloader',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Instagram Reels Downloader | MediaKit',
    description:
      'Download Instagram Reels without watermark in 1080p vertical HD. Save viral Reels with synced audio directly to your camera roll or PC.',
    images: ['https://mediakit.website/logo.png'],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': 'https://mediakit.website/instagram-reels-downloader#webpage',
      url: 'https://mediakit.website/instagram-reels-downloader',
      name: 'Instagram Reels Downloader | MediaKit',
      description:
        'Download Instagram Reels without watermark in 1080p vertical HD. Save viral Reels with synced audio directly to your camera roll or PC with MediaKit.',
      isPartOf: {
        '@type': 'WebSite',
        '@id': 'https://mediakit.website/#website',
      },
    },
    {
      '@type': 'WebApplication',
      '@id': 'https://mediakit.website/instagram-reels-downloader#app',
      name: 'MediaKit Instagram Reels Downloader',
      url: 'https://mediakit.website/instagram-reels-downloader',
      applicationCategory: 'MultimediaApplication',
      operatingSystem: 'Windows, macOS, Linux, Android, iOS',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      featureList: [
        'Vertical 9:16 aspect ratio preservation up to 1080x1920',
        'Clean video stream with no watermark overlays',
        'Synchronized stereo audio track included in MP4',
        'Direct download to iOS Photos and Android Gallery',
        'No login or account authentication required',
      ],
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
          name: 'Instagram Reels Downloader',
          item: 'https://mediakit.website/instagram-reels-downloader',
        },
      ],
    },
    {
      '@type': 'HowTo',
      name: 'How to Download Instagram Reels in 3 Steps',
      description: 'Quick 3-step guide to download clean Instagram Reels in vertical HD quality.',
      step: [
        {
          '@type': 'HowToStep',
          name: 'Copy Reel Link',
          text: 'Open Instagram, tap the Share icon on the Reel, and choose "Copy Link".',
          position: 1,
        },
        {
          '@type': 'HowToStep',
          name: 'Paste into MediaKit',
          text: 'Paste the copied Reel URL into the search bar above.',
          position: 2,
        },
        {
          '@type': 'HowToStep',
          name: 'Download Vertical HD MP4',
          text: 'Click Download to save the vertical 9:16 MP4 video with full synchronized audio directly to your device.',
          position: 3,
        },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'How do I download Instagram Reels with audio?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Copy the Reel link from the Instagram app or website, paste it into MediaKit, and click Download. The saved MP4 will contain both high-resolution video and original synchronized stereo audio.',
          },
        },
        {
          '@type': 'Question',
          name: 'Do downloaded Instagram Reels have a watermark?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No! When downloading public Reels through MediaKit, the video stream is fetched directly from the content delivery network before any watermark overlays are applied.',
          },
        },
        {
          '@type': 'Question',
          name: 'How do I save Instagram Reels to iPhone camera roll?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Paste the Reel link into Safari on MediaKit, tap Download, open the download manager in Safari, tap the file, tap Share, and select "Save Video" to store it directly in Photos.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I extract audio only from an Instagram Reel as MP3?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes! Select the MP3 audio format option to extract just the trending background sound from any Reel.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I download Reels from private Instagram accounts?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No. In strict accordance with platform privacy regulations, MediaKit only processes publicly visible Reels. MediaKit never asks for your Instagram password or access cookies.',
          },
        },
      ],
    },
  ],
};

export default function InstagramReelsDownloaderPage() {
  return (
    <SeoLandingPage
      badgeText="Instagram Reels Downloader"
      title="Instagram Reels Downloader"
      highlightWord="Reels Downloader"
      subtitle="Save viral Instagram Reels in high definition with synchronized sound. Free, fast, watermark-free, and mobile-optimized."
      supportedUrls={[
        'https://www.instagram.com/reel/Cxxxxxxxxx/',
        'https://www.instagram.com/reels/Cxxxxxxxxx/',
      ]}
      steps={[
        {
          number: 1,
          title: 'Copy the Reel Link',
          description:
            'In the Instagram app or web feed, tap the Share icon on any Reel and tap "Copy Link".',
        },
        {
          number: 2,
          title: 'Paste into MediaKit',
          description:
            'Paste your copied Reel link into the download bar above. MediaKit auto-detects the Reel URL.',
        },
        {
          number: 3,
          title: 'Save Clean HD Video',
          description:
            'Select HD MP4 video or MP3 audio and click Download to save the file directly to your device.',
        },
      ]}
      features={[
        {
          title: 'Vertical 9:16 Full HD Quality',
          description:
            'Preserves the original 1080x1920 portrait framing, vivid color grading, and 60fps smoothness.',
        },
        {
          title: 'Synchronized Stereo Audio',
          description:
            'Downloads trending music, voices, and sound effects in original clarity with no audio lag.',
        },
        {
          title: 'Zero Watermarks or Logos',
          description:
            'Extracts clean footage without creator badges, bouncing watermark logos, or promotional frames.',
        },
      ]}
      articles={[
        {
          title: 'How Instagram Reels Differ from Feed Videos and Why Quality Matters',
          content: [
            'Instagram Reels are short-form vertical videos designed specifically for full-screen smartphone displays. Unlike square or landscape feed posts, Reels use a 9:16 aspect ratio (1080x1920 pixels) and rely heavily on trending audio tracks and rapid editing cuts.',
            'MediaKit preserves this vertical framing without compressing the bitrate or letterboxing the picture. This allows editors and creators to archive reference footage or study transitions in authentic high definition.',
          ],
        },
        {
          title: 'Saving Instagram Reels to Mobile Storage for Offline Playback',
          content: [
            'On iPhone, Safari allows you to download the raw MP4 file directly into the iOS Files app. From there, a simple tap on the Share sheet allows you to select "Save Video" to place it into your Photos camera roll.',
            'On Android, Chrome downloads the MP4 file straight into your Downloads folder, where it is instantly indexed by your native Gallery and Google Photos without requiring any third-party app installations.',
          ],
        },
      ]}
      faqs={[
        {
          question: 'How do I download Instagram Reels with audio?',
          answer:
            'Copy the Reel link from the Instagram app or website, paste it into MediaKit, and click Download. The saved MP4 will contain both high-resolution video and original synchronized stereo audio.',
        },
        {
          question: 'Do downloaded Instagram Reels have a watermark?',
          answer:
            'No! When downloading public Reels through MediaKit, the video stream is fetched directly from the content delivery network before any watermark overlays are applied.',
        },
        {
          question: 'How do I save Instagram Reels to iPhone camera roll?',
          answer:
            'Paste the Reel link into Safari on MediaKit, tap Download, open the download manager in Safari, tap the file, tap Share, and select "Save Video" to store it directly in Photos.',
        },
        {
          question: 'Can I extract audio only from an Instagram Reel as MP3?',
          answer:
            'Yes! Select the MP3 audio format option to extract just the trending background sound from any Reel.',
        },
        {
          question: 'Can I download Reels from private Instagram accounts?',
          answer:
            'No. In strict accordance with platform privacy regulations, MediaKit only processes publicly visible Reels. MediaKit never asks for your Instagram password or access cookies.',
        },
      ]}
      structuredData={jsonLd}
      relatedTools={[
        { name: 'Instagram Video Downloader', href: '/instagram-video-downloader' },
        { name: 'Online Video Downloader', href: '/online-video-downloader' },
        { name: 'TikTok Video Downloader', href: '/tiktok-video-downloader' },
        { name: 'YouTube Shorts Downloader', href: '/youtube-shorts-downloader' },
        { name: 'Facebook Reels Downloader', href: '/facebook-reels-downloader' },
        { name: 'MP4 Video Downloader', href: '/mp4-video-downloader' },
      ]}
    />
  );
}
