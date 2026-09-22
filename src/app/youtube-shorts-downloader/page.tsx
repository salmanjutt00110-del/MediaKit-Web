import type { Metadata } from 'next';
import SeoLandingPage from '@/components/SeoLandingPage';

export const metadata: Metadata = {
  title: 'YouTube Shorts Downloader — Save Vertical Shorts in HD Free | MediaKit',
  description:
    'Download YouTube Shorts videos in authentic 9:16 vertical 1080p HD quality with synchronized audio. 100% free, watermark-free, and works on iPhone, Android, and PC.',
  keywords: [
    'youtube shorts downloader',
    'download youtube shorts',
    'youtube shorts to mp4',
    'yt shorts download',
    'save youtube shorts without watermark',
    'youtube shorts audio download',
    'free youtube shorts downloader',
  ],
  alternates: {
    canonical: '/youtube-shorts-downloader',
  },
  openGraph: {
    title: 'YouTube Shorts Downloader — Save Vertical Shorts in HD Free | MediaKit',
    description:
      'Download YouTube Shorts videos in authentic 9:16 vertical HD quality with audio. Fast, free, watermark-free, and works on all mobile and desktop devices.',
    url: '/youtube-shorts-downloader',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'YouTube Shorts Downloader — MediaKit',
    description:
      'Save vertical YouTube Shorts in 1080p Full HD with synchronized sound.',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      name: 'MediaKit YouTube Shorts Downloader',
      url: 'https://mediakit.website/youtube-shorts-downloader',
      applicationCategory: 'MultimediaApplication',
      operatingSystem: 'Windows, macOS, Linux, Android, iOS',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        ratingCount: '13900',
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
          name: 'YouTube Shorts Downloader',
          item: 'https://mediakit.website/youtube-shorts-downloader',
        },
      ],
    },
    {
      '@type': 'HowTo',
      name: 'How to Download YouTube Shorts',
      description: 'Quick 3-step guide to download YouTube Shorts in original quality.',
      step: [
        {
          '@type': 'HowToStep',
          name: 'Copy Shorts URL',
          text: 'In the YouTube app or website, tap the Share icon on the Short and choose "Copy link".',
          position: 1,
        },
        {
          '@type': 'HowToStep',
          name: 'Paste into MediaKit',
          text: 'Paste the Shorts URL into the MediaKit search bar above.',
          position: 2,
        },
        {
          '@type': 'HowToStep',
          name: 'Download Vertical HD MP4',
          text: 'Click Download to instantly save the vertical 9:16 MP4 video with full audio.',
          position: 3,
        },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'How do I copy a YouTube Shorts link?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'On the YouTube app or website, tap the Share icon on the Short and tap "Copy link". Paste it into MediaKit.',
          },
        },
        {
          '@type': 'Question',
          name: 'Are YouTube Shorts downloaded in vertical aspect ratio?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes! All YouTube Shorts retain their native 9:16 vertical resolution (up to 1080x1920) with synchronized audio.',
          },
        },
        {
          '@type': 'Question',
          name: 'Do downloaded YouTube Shorts include audio?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. MediaKit processes both the high-definition video track and audio track into a single MP4 file ready for playback.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I convert YouTube Shorts into MP3 sound?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes! Select the "MP3" format option to extract only the audio track from any Short.',
          },
        },
      ],
    },
  ],
};

export default function YouTubeShortsDownloaderPage() {
  return (
    <SeoLandingPage
      badgeText="YouTube Shorts Downloader"
      title="Download YouTube Shorts in Vertical HD"
      highlightWord="Vertical HD"
      subtitle="Save fast-paced YouTube Shorts straight to your photo gallery or computer in original vertical dimensions with no watermarks."
      supportedUrls={[
        'https://www.youtube.com/shorts/SHORTS_ID',
        'https://youtube.com/shorts/SHORTS_ID',
      ]}
      features={[
        {
          title: 'Native 9:16 Portrait Aspect',
          description:
            'No black letterboxing or cropped edges. Download pure vertical video designed for mobile screens.',
        },
        {
          title: 'High Bitrate Audio Track',
          description:
            'Extract the complete sound track and voiceover in crystal-clear quality alongside the video.',
        },
        {
          title: 'Instant Download Speeds',
          description:
            'Short clips process in just seconds directly through high-speed content delivery streams.',
        },
      ]}
      faqs={[
        {
          question: 'Do downloaded YouTube Shorts include audio?',
          answer:
            'Yes. MediaKit processes both the high-definition video track and audio track into a single MP4 file ready for playback.',
        },
        {
          question: 'Can I convert YouTube Shorts into MP3 sound?',
          answer:
            'Yes! Select the "MP3" format option to extract only the audio track from any Short.',
        },
        {
          question: 'How do I download YouTube Shorts on iPhone?',
          answer:
            'Paste the link into Safari on MediaKit, tap Download, and choose "Save Video" from Safari\'s downloads to save it in your Photos app.',
        },
        {
          question: 'Is there any limit on how many Shorts I can download?',
          answer:
            'No, you can download unlimited Shorts for free without any daily limits or restrictions.',
        },
      ]}
      structuredData={jsonLd}
    />
  );
}
