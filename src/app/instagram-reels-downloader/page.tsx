import type { Metadata } from 'next';
import SeoLandingPage from '@/components/SeoLandingPage';

export const metadata: Metadata = {
  title: 'Instagram Reels Downloader Without Watermark — HD MP4 Save | MediaKit',
  description:
    'Download Instagram Reels videos in Full 1080p HD without watermark. Free online IG Reels downloader with synchronized audio for iPhone, Android, and PC.',
  keywords: [
    'instagram reels downloader',
    'download instagram reels without watermark',
    'ig reels download',
    'save instagram reels with audio',
    'instagram reels to mp4',
    'free instagram reels downloader',
    'instagram reel video download',
  ],
  alternates: {
    canonical: '/instagram-reels-downloader',
  },
  openGraph: {
    title: 'Instagram Reels Downloader Without Watermark — HD MP4 Save | MediaKit',
    description:
      'Download Instagram Reels videos in Full HD with synchronized sound. 100% free online Instagram Reels downloader.',
    url: '/instagram-reels-downloader',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Instagram Reels Downloader Without Watermark — MediaKit',
    description: 'Download clean Instagram Reels in Full HD with stereo audio.',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      name: 'MediaKit Instagram Reels Downloader',
      url: 'https://mediakit.website/instagram-reels-downloader',
      applicationCategory: 'MultimediaApplication',
      operatingSystem: 'Windows, macOS, Linux, Android, iOS',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        ratingCount: '15400',
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
          name: 'Instagram Reels Downloader',
          item: 'https://mediakit.website/instagram-reels-downloader',
        },
      ],
    },
    {
      '@type': 'HowTo',
      name: 'How to Download Instagram Reels Without Watermark',
      description: 'Quick 3-step guide to save clean Instagram Reels in HD.',
      step: [
        {
          '@type': 'HowToStep',
          name: 'Copy Reel Link',
          text: 'Open Instagram, tap the Share icon on the Reel, and select "Copy Link".',
          position: 1,
        },
        {
          '@type': 'HowToStep',
          name: 'Paste into MediaKit',
          text: 'Paste the Reel link into the search box above.',
          position: 2,
        },
        {
          '@type': 'HowToStep',
          name: 'Download HD Video',
          text: 'Click Download to save the clean vertical MP4 Reel directly to your device.',
          position: 3,
        },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'How do I download Instagram Reels with sound?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Copy the Reel link from the Instagram app or website, paste it into MediaKit, and click Download. The saved MP4 will contain both video and original audio.',
          },
        },
        {
          '@type': 'Question',
          name: 'Do downloaded Instagram Reels have a watermark?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No! When downloading public Reels through MediaKit, the video is saved without any superimposed watermark.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I download Instagram Reels to iPhone camera roll?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes! After clicking Download in Safari, tap the download icon in the URL bar, tap the file, and choose "Save Video" to store it directly in Photos.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I extract audio only from an Instagram Reel as MP3?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes! Select the MP3 audio format to download just the trending background sound of any Reel.',
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
      title="Download Instagram Reels Without Watermark"
      highlightWord="Without Watermark"
      subtitle="Save viral Instagram Reels in high definition with synchronized sound. Free, fast, and watermark-free."
      supportedUrls={[
        'https://www.instagram.com/reel/REEL_ID/',
        'https://www.instagram.com/reels/REEL_ID/',
      ]}
      features={[
        {
          title: 'Vertical 9:16 Full HD Quality',
          description:
            'Preserves vivid colors, 60fps frame rate, and crisp sharpness of original Instagram Reels.',
        },
        {
          title: 'Synchronized Stereo Audio',
          description:
            'Downloads trending music, voices, and audio effects in original studio clarity without distortion.',
        },
        {
          title: 'Zero Watermarks or Logos',
          description:
            'Standard MP4 format allows you to save clean reels directly into your iOS Photos or Android Gallery.',
        },
      ]}
      faqs={[
        {
          question: 'Do downloaded Instagram Reels have a watermark?',
          answer:
            'No! When downloading public Reels through MediaKit, the video is saved without any superimposed watermark.',
        },
        {
          question: 'Can I extract audio only from an Instagram Reel?',
          answer:
            'Yes! You can choose the MP3 audio format to download just the background sound of any Reel.',
        },
        {
          question: 'How do I download Reels on Android?',
          answer:
            'Copy the Reel link, paste it into MediaKit on Chrome, tap Download, and the MP4 video is saved straight to your Gallery.',
        },
        {
          question: 'Can I download private Instagram Reels?',
          answer:
            'No, MediaKit strictly adheres to platform security and only processes publicly viewable Reels.',
        },
      ]}
      structuredData={jsonLd}
    />
  );
}
