import type { Metadata } from 'next';
import SeoLandingPage from '@/components/SeoLandingPage';

export const metadata: Metadata = {
  title: 'Online Video Downloader | MediaKit',
  description:
    'Download videos online from YouTube, TikTok, Instagram, Facebook, and Pinterest with MediaKit. Free, fast multi-platform video downloader with auto-detection.',
  keywords: [
    'online video downloader',
    'video downloader online',
    'free video downloader',
    'social media video downloader',
    'download videos online',
    'all in one video downloader',
  ],
  alternates: {
    canonical: 'https://mediakit.website/online-video-downloader',
  },
  openGraph: {
    title: 'Online Video Downloader | MediaKit',
    description:
      'Universal online video downloader for YouTube, TikTok, Instagram, Facebook, and Pinterest. Fast, free, and browser-based.',
    url: 'https://mediakit.website/online-video-downloader',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Online Video Downloader | MediaKit',
    description:
      'Universal online video downloader for YouTube, TikTok, Instagram, Facebook, and Pinterest.',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': 'https://mediakit.website/online-video-downloader#webpage',
      url: 'https://mediakit.website/online-video-downloader',
      name: 'Online Video Downloader | MediaKit',
      description:
        'Download videos online from YouTube, TikTok, Instagram, Facebook, and Pinterest with MediaKit. Free multi-platform video downloader with automatic format detection.',
      isPartOf: {
        '@type': 'WebSite',
        '@id': 'https://mediakit.website/#website',
      },
    },
    {
      '@type': 'WebApplication',
      name: 'MediaKit Online Video Downloader',
      url: 'https://mediakit.website/online-video-downloader',
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
      ],
    },
    {
      '@type': 'HowTo',
      name: 'How to Download Videos Online with MediaKit',
      description: 'Step-by-step instructions to download videos from any supported social platform.',
      step: [
        {
          '@type': 'HowToStep',
          position: 1,
          name: 'Copy Media URL',
          text: 'Copy the web link or share link of any public video from YouTube, TikTok, Instagram, Facebook, or Pinterest.',
        },
        {
          '@type': 'HowToStep',
          position: 2,
          name: 'Paste into MediaKit',
          text: 'Paste the copied URL into the MediaKit search bar. The tool automatically detects the source platform.',
        },
        {
          '@type': 'HowToStep',
          position: 3,
          name: 'Select Format & Download',
          text: 'Choose an available MP4 resolution or audio extraction option and save the file to your device.',
        },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What platforms can MediaKit download videos from?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'MediaKit officially supports public videos from YouTube (including Shorts), TikTok, Instagram (Reels & feeds), Facebook (watch & Reels), and Pinterest (videos, GIFs & Idea Pins).',
          },
        },
        {
          '@type': 'Question',
          name: 'How does automatic platform detection work?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'When you paste a link, MediaKit parses the URL domain and path structure in real time to invoke the specialized extractor for that platform with zero manual configuration required.',
          },
        },
        {
          '@type': 'Question',
          name: 'Are there any software installations or browser extensions needed?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No. MediaKit operates entirely within standard desktop and mobile web browsers including Chrome, Safari, Firefox, and Edge.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I download videos in batch mode?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. Switch to the Batch tab on the downloader above to paste up to 25 URLs across multiple platforms and process them simultaneously.',
          },
        },
        {
          '@type': 'Question',
          name: 'Why is a specific quality or 4K option sometimes not shown?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'MediaKit only presents stream options that the original creator uploaded and that the hosting platform makes accessible. If the source was recorded in 720p or 1080p, higher resolutions cannot be synthesized.',
          },
        },
      ],
    },
  ],
};

const customRelatedTools = [
  {
    name: 'YouTube Video Downloader',
    url: '/youtube-video-downloader',
    description: 'Download regular YouTube videos, tutorials, and music streams up to 1080p.',
    icon: '▶️',
  },
  {
    name: 'TikTok Video Downloader',
    url: '/tiktok-video-downloader',
    description: 'Save viral TikTok clips in original MP4 without watermark overlays.',
    icon: '🎵',
  },
  {
    name: 'Instagram Video Downloader',
    url: '/instagram-video-downloader',
    description: 'Download Instagram Reels, public video posts, and carousel media.',
    icon: '📸',
  },
  {
    name: 'Facebook Video Downloader',
    url: '/facebook-video-downloader',
    description: 'Download Facebook public feed videos and Reels in crisp MP4 format.',
    icon: '📘',
  },
  {
    name: 'Pinterest Video Downloader',
    url: '/pinterest-video-downloader',
    description: 'Save Pinterest video pins, animated GIFs, and mobile pin.it links.',
    icon: '📌',
  },
  {
    name: 'MP4 Video Downloader',
    url: '/mp4-video-downloader',
    description: 'Universal MP4 downloader preserving authentic visual bitrates and audio sync.',
    icon: '🎬',
  },
];

export default function OnlineVideoDownloaderPage() {
  return (
    <SeoLandingPage
      badgeText="Universal Media Tool"
      title="Online Video Downloader"
      highlightWord="Downloader"
      subtitle="One unified downloader for YouTube, TikTok, Instagram, Facebook, and Pinterest. Paste your link and let MediaKit handle format detection automatically."
      supportedUrls={[
        'https://youtube.com/watch?v=...',
        'https://tiktok.com/@user/video/...',
        'https://instagram.com/reel/...',
        'https://facebook.com/watch/...',
        'https://pinterest.com/pin/...',
      ]}
      features={[
        {
          title: 'Multi-Platform URL Auto-Detection',
          description:
            'MediaKit automatically identifies which platform your link is from, routing it to the appropriate stream parser instantly.',
        },
        {
          title: 'Transparent Format Selection',
          description:
            'Select from authentic MP4 resolutions (1080p, 720p, 480p, 360p) and audio extraction options without artificial upscaling.',
        },
        {
          title: 'Batch URL Processing',
          description:
            'Need to save multiple links? Switch to Batch Mode to process up to 25 URLs across different platforms in one unified session.',
        },
        {
          title: 'Zero Software Requirements',
          description:
            'Everything runs inside your web browser across Windows, macOS, Linux, iOS, and Android with no installation necessary.',
        },
      ]}
      articles={[
        {
          title: 'Cross-Platform Media Downloading Made Simple',
          content: [
            'Instead of bookmarking separate downloaders for every social network, MediaKit combines support for all major public video platforms into a single, cohesive interface.',
            'Whether saving an educational YouTube tutorial for offline study, preserving a creative TikTok recipe, or downloading a Facebook community clip, our cloud parsing infrastructure safely fetches the cleanest source stream available.',
          ],
        },
        {
          title: 'Supported Formats and Device Playback',
          content: [
            'All downloaded video streams are packaged into universally compatible MP4 containers with H.264 video and AAC audio encoding. This ensures out-of-the-box playback across smart TVs, smartphones, editing software, and media players.',
            'For listeners who only require the soundtrack or speech, MediaKit provides direct MP3 audio extraction when available from the source.',
          ],
        },
      ]}
      faqs={[
        {
          question: 'What platforms can MediaKit download videos from?',
          answer:
            'MediaKit officially supports public videos from YouTube (including Shorts), TikTok, Instagram (Reels & feeds), Facebook (watch & Reels), and Pinterest (videos, GIFs & Idea Pins).',
        },
        {
          question: 'How does automatic platform detection work?',
          answer:
            'When you paste a link, MediaKit parses the URL domain and path structure in real time to invoke the specialized extractor for that platform with zero manual configuration required.',
        },
        {
          question: 'Are there any software installations or browser extensions needed?',
          answer:
            'No. MediaKit operates entirely within standard desktop and mobile web browsers including Chrome, Safari, Firefox, and Edge.',
        },
        {
          question: 'Can I download videos in batch mode?',
          answer:
            'Yes. Switch to the Batch tab on the downloader above to paste up to 25 URLs across multiple platforms and process them simultaneously.',
        },
        {
          question: 'Why is a specific quality or 4K option sometimes not shown?',
          answer:
            'MediaKit only presents stream options that the original creator uploaded and that the hosting platform makes accessible. If the source was recorded in 720p or 1080p, higher resolutions cannot be synthesized.',
        },
      ]}
      structuredData={jsonLd}
      relatedTools={customRelatedTools}
    />
  );
}
