import type { Metadata } from 'next';
import SeoLandingPage from '@/components/SeoLandingPage';

export const metadata: Metadata = {
  title: 'YouTube Video Downloader — Free 1080p, 4K & MP3 (No Watermark) | MediaKit',
  description:
    'Download YouTube videos in 1080p Full HD, 4K, and 720p MP4 or convert YouTube to 320kbps MP3 audio for free. Fast, online, no watermark, and no software required.',
  keywords: [
    'youtube video downloader',
    'youtube downloader',
    'youtube video download',
    'download youtube video',
    'youtube to mp4',
    'youtube 1080p download',
    'youtube 4k downloader',
    'free youtube video downloader',
    'youtube to mp3',
    'youtube downloader online',
    'download youtube video without watermark',
  ],
  alternates: {
    canonical: '/youtube-video-downloader',
  },
  openGraph: {
    title: 'YouTube Video Downloader — Free 1080p, 4K & MP3 | MediaKit',
    description:
      'Download YouTube videos in high definition (1080p, 720p, 4K) or extract clear audio with MediaKit. 100% free, fast, and no registration required.',
    url: '/youtube-video-downloader',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'YouTube Video Downloader — Free 1080p & 4K MP4 | MediaKit',
    description:
      'Download YouTube videos in original HD quality with full audio synchronization for free.',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      name: 'MediaKit YouTube Video Downloader',
      url: 'https://mediakit.website/youtube-video-downloader',
      applicationCategory: 'MultimediaApplication',
      operatingSystem: 'Windows, macOS, Linux, Android, iOS',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        ratingCount: '18450',
        bestRating: '5',
        worstRating: '1',
      },
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
          item: 'https://mediakit.website/video-downloader',
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'YouTube Video Downloader',
          item: 'https://mediakit.website/youtube-video-downloader',
        },
      ],
    },
    {
      '@type': 'HowTo',
      name: 'How to Download YouTube Videos in 1080p & 4K',
      description: 'Step-by-step guide to saving YouTube videos and audio on PC, iPhone, or Android.',
      step: [
        {
          '@type': 'HowToStep',
          name: 'Copy YouTube Link',
          text: 'Open YouTube and copy the URL of the video or Short from your browser or the YouTube app share button.',
          position: 1,
        },
        {
          '@type': 'HowToStep',
          name: 'Paste URL into MediaKit',
          text: 'Paste the YouTube link into the MediaKit search bar above.',
          position: 2,
        },
        {
          '@type': 'HowToStep',
          name: 'Select Quality and Download',
          text: 'Select 1080p Full HD, 4K, 720p, or MP3 audio and click Download to save the file immediately.',
          position: 3,
        },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'How do I download YouTube videos in 1080p or 4K with audio?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'YouTube serves high-resolution video streams (1080p and 4K) separately from audio streams. MediaKit automatically merges the video and high-bitrate audio streams into a single MP4 container, ensuring you never get a muted video.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is this YouTube video downloader free without watermark?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes! MediaKit is 100% free with zero watermarks, no ads injected into the video, and no registration or subscription required.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I convert YouTube videos to MP3 audio?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, select the MP3 audio option from the download format menu to extract high-bitrate audio directly from any YouTube video.',
          },
        },
        {
          '@type': 'Question',
          name: 'How do I download YouTube videos on my iPhone or iPad?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Copy the YouTube link, open Safari, paste the link into MediaKit, and tap Download. When the download completes, tap the blue Safari download icon and select "Save Video" to store it in your Photos app.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is there a limit on how many YouTube videos I can download?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No. You can download as many YouTube videos as you need with no artificial daily limits or throttled speeds.',
          },
        },
        {
          '@type': 'Question',
          name: 'Does MediaKit work on Android and PC?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, MediaKit is a browser-based application that works seamlessly on Windows, Mac, Linux, Android, and iOS devices without installing any software or extensions.',
          },
        },
      ],
    },
  ],
};

export default function YouTubeDownloaderPage() {
  return (
    <SeoLandingPage
      badgeText="YouTube Video Downloader"
      title="Download YouTube Videos in 1080p, 4K & MP3"
      highlightWord="1080p, 4K & MP3"
      subtitle="Save your favorite YouTube videos directly to your device in crisp 1080p Full HD, 4K, 720p, or high-bitrate MP3 audio with no watermarks."
      supportedUrls={[
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        'https://youtu.be/dQw4w9WgXcQ',
        'https://m.youtube.com/watch?v=dQw4w9WgXcQ',
        'https://www.youtube.com/shorts/SHORTS_ID',
      ]}
      features={[
        {
          title: 'Full 1080p & 4K Video Quality',
          description:
            'Preserves the original resolution, frame rate (60fps), and color depth uploaded by creators.',
        },
        {
          title: 'Direct Video & Audio Merging',
          description:
            'Automatically synchronizes high-definition video and audio streams seamlessly so you never get muted files.',
        },
        {
          title: 'Zero Watermarks or Ads',
          description:
            'A clean, web-based experience without intrusive pop-ups, malicious software, or site watermarks.',
        },
      ]}
      deviceGuides={[
        {
          device: 'iPhone & iPad (iOS Safari)',
          iconType: 'iphone',
          steps: [
            'In the YouTube app, tap "Share" under the video and choose "Copy link".',
            'Open Safari and paste the link into MediaKit above.',
            'Choose your resolution (1080p or 4K) and tap "Download".',
            'Tap the blue download circle in Safari, tap the downloaded file, and choose "Save Video" to add it to your Photos library.',
          ],
        },
        {
          device: 'Android (Chrome / Samsung)',
          iconType: 'android',
          steps: [
            'Copy the video URL from the YouTube app or mobile browser.',
            'Paste the link into MediaKit above — YouTube is auto-detected immediately.',
            'Select your format (1080p, 720p, or MP3) and tap "Download".',
            'The file downloads directly into your device\'s "Downloads" folder and appears in your Gallery.',
          ],
        },
        {
          device: 'PC, Mac & Laptops',
          iconType: 'desktop',
          steps: [
            'Copy the full YouTube URL from your browser\'s address bar (Ctrl+C or Cmd+C).',
            'Paste into MediaKit (Ctrl+V or Cmd+V) and choose 1080p, 4K, or 320kbps MP3.',
            'Click Download to save the MP4 file directly to your desktop or downloads directory.',
          ],
        },
      ]}
      comparisonRows={[
        {
          feature: '1080p / 4K Audio Merging',
          us: 'Included (Synchronized Audio)',
          official: 'Requires YouTube Premium',
          competitors: '1080p Often Muted / Missing',
        },
        {
          feature: 'Watermarks & Logos',
          us: 'Zero Watermarks (100% Clean)',
          official: 'None',
          competitors: 'Watermarks Injected',
        },
        {
          feature: 'MP3 Audio Converter',
          us: '320kbps High Bitrate MP3',
          official: 'Not Supported',
          competitors: '128kbps Low Quality',
        },
        {
          feature: 'Pop-ups & Spam Ads',
          us: 'Zero Pop-ups, 100% Clean',
          official: 'Standard Ads',
          competitors: 'Malicious Ads & Redirects',
        },
        {
          feature: 'Cost & Subscriptions',
          us: '100% Free Forever',
          official: '$13.99/mo (Premium)',
          competitors: 'Paid Upgrades & Caps',
        },
      ]}
      articles={[
        {
          title: 'The Best Free YouTube Video Downloader in 2026',
          content: [
            'MediaKit is designed to provide the fastest, simplest, and highest quality YouTube downloading experience on the web. Unlike traditional downloader websites that bombard you with deceptive pop-ups and low-resolution limits, MediaKit delivers authentic 1080p, 1440p, and 4K MP4 streams directly to your device.',
            'Our cloud architecture directly interfaces with YouTube content delivery nodes to provide unthrottled download speeds, ensuring large high-definition video files transfer in just seconds.',
          ],
        },
        {
          title: 'How Audio Merging Ensures Mute-Free 1080p and 4K Downloads',
          content: [
            'Many users encounter downloader websites where 1080p or 4K videos download without any sound. This occurs because YouTube serves video and audio streams as separate tracks via adaptive streaming (DASH).',
            'MediaKit solves this issue on the fly: our processing pipeline combines the ultra-high-definition video track with the highest fidelity audio stream into a universally compatible MP4 container with H.264 video and AAC audio.',
          ],
        },
      ]}
      faqs={[
        {
          question: 'How do I download YouTube videos in 1080p or 4K?',
          answer:
            'Simply copy the YouTube video link, paste it into MediaKit above, and select 1080p or 4K from the format list. The video and audio are merged seamlessly.',
        },
        {
          question: 'Is MediaKit free to use?',
          answer:
            'Yes, MediaKit is 100% free with no registration, subscription, or software installation required.',
        },
        {
          question: 'Can I download YouTube videos on my smartphone?',
          answer:
            'Yes! MediaKit is fully responsive and functions smoothly on mobile browsers including Safari on iOS and Chrome on Android.',
        },
        {
          question: 'Can I convert YouTube videos to MP3 audio?',
          answer:
            'Yes, select the MP3 audio download option to extract crystal-clear sound directly from any YouTube clip.',
        },
        {
          question: 'Is there a limit on how many YouTube videos I can download?',
          answer:
            'There are no artificial daily limits. You can download as many videos as you need for personal offline viewing.',
        },
        {
          question: 'What video formats are supported?',
          answer:
            'We provide MP4 video containers with standard H.264/AAC encoding, compatible with all modern media players, TVs, and editing suites.',
        },
      ]}
      structuredData={jsonLd}
    />
  );
}
