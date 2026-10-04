import type { Metadata } from 'next';
import SeoLandingPage from '@/components/SeoLandingPage';

export const metadata: Metadata = {
  title: {
    absolute: 'YouTube Video Downloader – Download YouTube Videos | MediaKit',
  },
  description:
    'Download YouTube videos in HD 1080p and 4K MP4 with synced audio. Free online downloader with automatic format detection and MP3 conversion on MediaKit.',
  keywords: [
    'youtube video downloader',
    'youtube downloader',
    'download youtube videos',
    'youtube video download online',
    'youtube to mp4 hd',
    'youtube 1080p downloader',
    'youtube 4k video downloader',
  ],
  alternates: {
    canonical: 'https://mediakit.website/youtube-video-downloader',
  },
  openGraph: {
    title: 'YouTube Video Downloader – Download YouTube Videos | MediaKit',
    description:
      'Download YouTube videos in HD 1080p and 4K MP4 with synced audio. Free online downloader with automatic format detection and MP3 conversion on MediaKit.',
    url: 'https://mediakit.website/youtube-video-downloader',
    type: 'website',
    images: [
      {
        url: 'https://mediakit.website/logo.png',
        width: 512,
        height: 512,
        alt: 'MediaKit YouTube Video Downloader',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'YouTube Video Downloader – Download YouTube Videos | MediaKit',
    description:
      'Download YouTube videos in HD 1080p and 4K MP4 with synced audio. Free online downloader with automatic format detection and MP3 conversion on MediaKit.',
    images: ['https://mediakit.website/logo.png'],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': 'https://mediakit.website/youtube-video-downloader#webpage',
      url: 'https://mediakit.website/youtube-video-downloader',
      name: 'YouTube Video Downloader – Download YouTube Videos | MediaKit',
      description:
        'Download YouTube videos in HD 1080p and 4K MP4 with synced audio. Free online downloader with automatic format detection and MP3 conversion on MediaKit.',
      isPartOf: {
        '@type': 'WebSite',
        '@id': 'https://mediakit.website/#website',
      },
    },
    {
      '@type': 'WebApplication',
      '@id': 'https://mediakit.website/youtube-video-downloader#app',
      name: 'MediaKit YouTube Video Downloader',
      applicationCategory: 'MultimediaApplication',
      operatingSystem: 'Web Browser, iOS, Android, Windows, macOS, Linux',
      url: 'https://mediakit.website/youtube-video-downloader',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      featureList: [
        'Download YouTube videos in up to 1080p Full HD and 4K where available',
        'Automatic audio/video DASH stream muxing with synchronized audio',
        'Convert YouTube videos to 320kbps MP3 audio',
        'No registration, software, or extensions required',
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
          name: 'YouTube Video Downloader',
          item: 'https://mediakit.website/youtube-video-downloader',
        },
      ],
    },
    {
      '@type': 'HowTo',
      name: 'How to Download YouTube Videos in HD & 4K',
      description:
        'Step-by-step instructions to download any YouTube video in 1080p, 4K, or MP3 using MediaKit.',
      totalTime: 'PT1M',
      estimatedCost: {
        '@type': 'MonetaryAmount',
        currency: 'USD',
        value: '0',
      },
      tool: [
        {
          '@type': 'HowToTool',
          name: 'MediaKit Video Downloader',
          url: 'https://mediakit.website/youtube-video-downloader',
        },
      ],
      step: [
        {
          '@type': 'HowToStep',
          position: 1,
          name: 'Copy YouTube Video Link',
          text: 'Open YouTube in your browser or app. Click "Share" under the video and select "Copy Link".',
          url: 'https://mediakit.website/youtube-video-downloader#step1',
        },
        {
          '@type': 'HowToStep',
          position: 2,
          name: 'Paste into MediaKit',
          text: 'Navigate to mediakit.website/youtube-video-downloader and paste your YouTube link into the search bar.',
          url: 'https://mediakit.website/youtube-video-downloader#step2',
        },
        {
          '@type': 'HowToStep',
          position: 3,
          name: 'Select Quality Tier',
          text: 'Choose your desired resolution: 4K 2160p, 1080p Full HD, 720p, or high-bitrate 320kbps MP3 audio.',
          url: 'https://mediakit.website/youtube-video-downloader#step3',
        },
        {
          '@type': 'HowToStep',
          position: 4,
          name: 'Save Direct MP4 or MP3',
          text: 'Click Download. MediaKit merges video and high-bitrate audio automatically, saving the clean MP4 file to your device.',
          url: 'https://mediakit.website/youtube-video-downloader#step4',
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
            text: 'YouTube serves high-resolution video streams (1080p, 1440p, 4K) separately from audio streams via DASH adaptive bitrate protocol. MediaKit automatically fetches both high-res video and pristine audio streams and merges them on the fly into a standard MP4 file, ensuring you never receive a muted video.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is this YouTube video downloader completely free?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes! MediaKit is 100% free with unlimited downloads, zero watermarks, and no registration or paid subscription required.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I convert YouTube videos to MP3 audio?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, select the MP3 audio download option (up to 320kbps) to extract high-fidelity background music, interviews, or podcasts directly from any YouTube clip.',
          },
        },
        {
          '@type': 'Question',
          name: 'How do I download YouTube videos on iPhone or iPad?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Copy the YouTube link, open Safari, paste the link into MediaKit, and tap Download. Tap the Safari download arrow in the address bar, open the file, tap the Share icon, and tap "Save Video" to place it directly into your Photos camera roll.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I download YouTube Shorts?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes! MediaKit fully supports YouTube Shorts URLs (youtube.com/shorts/...). Paste the link to download the vertical 1080x1920 MP4 video without watermarks.',
          },
        },
        {
          '@type': 'Question',
          name: 'Do I need to install any software or browser extensions?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No. MediaKit is 100% web-based and runs in any modern browser on Windows, Mac, Linux, Android, iOS, or ChromeOS with no extensions or software installs required.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is there a limit on how many YouTube videos I can download?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'There are zero artificial limits. You can download as many videos as you need for offline viewing, archiving, or creative projects.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can MediaKit download private or age-restricted YouTube videos?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'MediaKit works exclusively with publicly accessible YouTube videos. Videos marked private, requiring Google account login, or behind paywalls cannot be processed.',
          },
        },
        {
          '@type': 'Question',
          name: 'What formats and containers does MediaKit support?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'MediaKit generates standard MP4 video containers with H.264/AAC encoding for maximum cross-device compatibility, alongside standalone high-bitrate MP3 and M4A audio files.',
          },
        },
        {
          '@type': 'Question',
          name: 'How do I download YouTube videos without software or apps?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Simply open mediakit.website/youtube-video-downloader in your mobile or desktop browser, paste your video link, and click Download. No executable files, malware, or apps are ever required.',
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
      title="YouTube Video Downloader"
      highlightWord="Video Downloader"
      subtitle="Download YouTube videos online in 1080p Full HD and 4K MP4 with synced audio. Free, no software or registration required with MediaKit."
      supportedUrls={[
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        'https://youtu.be/dQw4w9WgXcQ',
        'https://m.youtube.com/watch?v=dQw4w9WgXcQ',
        'https://www.youtube.com/shorts/3i_bS97sF94',
      ]}
      steps={[
        {
          number: 1,
          title: 'Copy the YouTube Video Link',
          description:
            'Open YouTube on your computer or mobile app. Tap Share underneath the video and click "Copy link" to save the URL to your clipboard.',
        },
        {
          number: 2,
          title: 'Paste URL into MediaKit',
          description:
            'Paste your YouTube link into the input field above. MediaKit instantly parses the URL and fetches live format manifests.',
        },
        {
          number: 3,
          title: 'Select Resolution or Audio MP3',
          description:
            'Choose your desired output: 4K Ultra HD (2160p), 1080p Full HD 60fps, 720p HD, or 320kbps studio-grade MP3 audio.',
        },
        {
          number: 4,
          title: 'Instant Watermark-Free Download',
          description:
            'Click Download. MediaKit merges adaptive audio/video streams into a pristine MP4 container and saves directly to your device.',
        },
      ]}
      features={[
        {
          title: 'Full 1080p & 4K Ultra HD Streams',
          description:
            'Preserves 60 frames-per-second, high-bitrate color grading, and native resolutions without downsampling.',
        },
        {
          title: 'Automatic Video & Audio Muxing',
          description:
            'YouTube separates video and audio on high-res streams. MediaKit merges them into a single audio-synchronized MP4.',
        },
        {
          title: 'YouTube Shorts Full Compatibility',
          description:
            'Download viral YouTube Shorts in native 9:16 vertical resolution with clean audio and no platform watermarks.',
        },
        {
          title: 'High-Bitrate 320kbps MP3 Converter',
          description:
            'Extract pristine stereo audio from music videos, podcasts, and talks with zero audible quality degradation.',
        },
        {
          title: 'No App, Extension or Software Required',
          description:
            '100% browser-based. Say goodbye to suspicious .exe installers, sketchy plugins, or bloatware.',
        },
        {
          title: 'Zero Ads Injected into Downloaded Media',
          description:
            'Unlike other tools that inject watermark overlays or promotional bumpers, your downloaded video is 100% untouched.',
        },
      ]}
      deviceGuides={[
        {
          device: '📱 iPhone & iPad (iOS Safari)',
          iconType: 'iphone',
          steps: [
            'In the YouTube app or Safari, tap Share below any video and tap "Copy link".',
            'Open Safari and navigate to mediakit.website/youtube-video-downloader.',
            'Paste the link into the download box and tap Download.',
            'Select 1080p or 4K and tap "Download". Confirm the Safari download prompt.',
            'Tap the blue download circle in Safari\'s address bar, tap the completed MP4, tap the Share icon, and tap "Save Video" to store it directly in your Photos camera roll.',
          ],
        },
        {
          device: '🤖 Android (Chrome / Samsung Internet)',
          iconType: 'android',
          steps: [
            'Tap Share on the YouTube video and tap "Copy link".',
            'Open Chrome or your preferred browser and visit mediakit.website.',
            'Paste the link into MediaKit — YouTube is recognized immediately.',
            'Select your preferred quality (1080p, 720p, or 320kbps MP3) and tap Download.',
            'The video saves directly to your device\'s "Downloads" folder and appears in your Gallery.',
          ],
        },
        {
          device: '💻 PC / Mac / Linux (Any Browser)',
          iconType: 'desktop',
          steps: [
            'Copy the video URL directly from your browser\'s address bar (Ctrl+C or Cmd+C).',
            'Paste it into MediaKit and select your preferred resolution (up to 4K 2160p).',
            'Click Download to save the complete MP4 file to your computer at maximum speed.',
          ],
        },
      ]}
      comparisonRows={[
        {
          feature: '1080p / 4K with Audio',
          us: '✅ Included (Merged & Synced)',
          official: '⚠️ Requires YouTube Premium',
          competitors: '❌ Muted / Silent Video',
        },
        {
          feature: 'Watermarks & Ads in Media',
          us: '✅ Zero Watermarks or Logos',
          official: '❌ In-stream Pre-roll Ads',
          competitors: '⚠️ Adds Site Watermark',
        },
        {
          feature: 'MP3 Audio Quality',
          us: '✅ 320kbps Studio Quality',
          official: '❌ Not Supported',
          competitors: '⚠️ Compressed 128kbps',
        },
        {
          feature: 'Software or Apps Needed',
          us: '✅ 100% Web (No Install)',
          official: '⚠️ YouTube App Required',
          competitors: '❌ Prompts Suspicious Apps',
        },
        {
          feature: 'Download Caps & Fees',
          us: '✅ 100% Free Forever, Unlimited',
          official: '❌ $13.99/mo Premium',
          competitors: '❌ Daily Caps & Paid Tiers',
        },
      ]}
      articles={[
        {
          title: 'The Best Free YouTube Video Downloader in 2026',
          content: [
            'MediaKit is built to deliver the fastest, cleanest, and highest quality YouTube downloading experience on the internet. While competing downloader websites overwhelm users with aggressive pop-ups, misleading download buttons, and throttled speeds, MediaKit provides direct, high-bandwidth streams with zero spam.',
            'Our cloud infrastructure connects directly to high-speed media delivery nodes to provide unthrottled transfer speeds, allowing you to download 1080p Full HD and 4K Ultra HD videos in seconds.',
          ],
        },
        {
          title: 'Why 1080p and 4K Videos Usually Download Without Audio (And How MediaKit Fixes It)',
          content: [
            'A very common issue users experience with other downloader sites is saving a 1080p or 4K YouTube video only to find that it plays completely silently without any audio track. This happens because YouTube uses Dynamic Adaptive Streaming over HTTP (DASH), which separates the high-definition video track from the audio track to optimize streaming bandwidth.',
            'Most simplistic downloaders only grab the separate video track, resulting in a muted file. MediaKit solves this problem dynamically on the server: our processing pipeline fetches both the pristine video stream and the highest bitrate AAC audio track, seamlessly muxing them together into a standard MP4 file before delivering it to you.',
          ],
        },
        {
          title: 'How to Download YouTube Shorts to iPhone & Android',
          content: [
            'YouTube Shorts are vertical short-form videos designed for mobile consumption. MediaKit fully supports Shorts links. Simply copy the link from the Shorts share menu, paste it into MediaKit, and download the full vertical 1080x1920 MP4 file directly into your phone gallery.',
          ],
        },
      ]}
      faqs={[
        {
          question: 'How do I download YouTube videos in 1080p or 4K with audio?',
          answer:
            'YouTube serves high-resolution video streams (1080p, 1440p, 4K) separately from audio streams via DASH adaptive bitrate protocol. MediaKit automatically fetches both high-res video and pristine audio streams and merges them on the fly into a standard MP4 file, ensuring you never receive a muted video.',
        },
        {
          question: 'Is this YouTube video downloader completely free?',
          answer:
            'Yes! MediaKit is 100% free with unlimited downloads, zero watermarks, and no registration or paid subscription required.',
        },
        {
          question: 'Can I convert YouTube videos to MP3 audio?',
          answer:
            'Yes, select the MP3 audio download option (up to 320kbps) to extract high-fidelity background music, interviews, or podcasts directly from any YouTube clip.',
        },
        {
          question: 'How do I download YouTube videos on iPhone or iPad?',
          answer:
            'Copy the YouTube link, open Safari, paste the link into MediaKit, and tap Download. Tap the Safari download arrow in the address bar, open the file, tap the Share icon, and tap "Save Video" to place it directly into your Photos camera roll.',
        },
        {
          question: 'Can I download YouTube Shorts?',
          answer:
            'Yes! MediaKit fully supports YouTube Shorts URLs (youtube.com/shorts/...). Paste the link to download the vertical 1080x1920 MP4 video without watermarks.',
        },
        {
          question: 'Do I need to install any software or browser extensions?',
          answer:
            'No. MediaKit is 100% web-based and runs in any modern browser on Windows, Mac, Linux, Android, iOS, or ChromeOS with no extensions or software installs required.',
        },
        {
          question: 'Is there a limit on how many YouTube videos I can download?',
          answer:
            'There are zero artificial limits. You can download as many videos as you need for offline viewing, archiving, or creative projects.',
        },
        {
          question: 'Can MediaKit download private or age-restricted YouTube videos?',
          answer:
            'MediaKit works exclusively with publicly accessible YouTube videos. Videos marked private, requiring Google account login, or behind paywalls cannot be processed.',
        },
        {
          question: 'What formats and containers does MediaKit support?',
          answer:
            'MediaKit generates standard MP4 video containers with H.264/AAC encoding for maximum cross-device compatibility, alongside standalone high-bitrate MP3 and M4A audio files.',
        },
        {
          question: 'How do I download YouTube videos without software or apps?',
          answer:
            'Simply open mediakit.website/youtube-video-downloader in your mobile or desktop browser, paste your video link, and click Download. No executable files, malware, or apps are ever required.',
        },
      ]}
      structuredData={jsonLd}
      relatedTools={[
        { name: 'YouTube Shorts Downloader', href: '/youtube-shorts-downloader' },
        { name: 'YouTube to MP3 Converter', href: '/youtube-mp3' },
        { name: 'Online Video Downloader', href: '/online-video-downloader' },
        { name: 'MP4 Video Downloader', href: '/mp4-video-downloader' },
        { name: 'TikTok Video Downloader', href: '/tiktok-video-downloader' },
        { name: 'Instagram Video Downloader', href: '/instagram-video-downloader' },
        { name: 'Facebook Video Downloader', href: '/facebook-video-downloader' },
        { name: 'Pinterest Video Downloader', href: '/pinterest-video-downloader' },
      ]}
    />
  );
}
