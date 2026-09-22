import type { Metadata } from 'next';
import SeoLandingPage from '@/components/SeoLandingPage';

export const metadata: Metadata = {
  title: 'Facebook Video Downloader — Download FB Videos & Reels 1080p HD Free | MediaKit',
  description:
    'Download Facebook videos, Reels, and Watch clips in 1080p Full HD & SD quality for free. Fast online FB video downloader with no watermarks and no registration.',
  keywords: [
    'facebook video downloader',
    'fb video download',
    'download facebook video',
    'facebook reels downloader',
    'download fb reels',
    'facebook watch downloader',
    'facebook video downloader hd',
    'fb video download online',
    'download facebook video without watermark',
    'free facebook video downloader',
  ],
  alternates: {
    canonical: '/facebook-video-downloader',
  },
  openGraph: {
    title: 'Facebook Video Downloader — Download FB Videos & Reels 1080p HD Free | MediaKit',
    description:
      'Download Facebook videos in HD and SD quality for free. Fast online FB video downloader for public videos, watch clips, and Reels on mobile and PC.',
    url: '/facebook-video-downloader',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Facebook Video Downloader — Save FB Videos in 1080p HD | MediaKit',
    description:
      'Fast, free, and watermark-free online Facebook video and reels downloader.',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      name: 'MediaKit Facebook Video Downloader',
      url: 'https://mediakit.website/facebook-video-downloader',
      applicationCategory: 'MultimediaApplication',
      operatingSystem: 'Windows, macOS, Linux, Android, iOS',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        ratingCount: '14280',
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
          name: 'Facebook Video Downloader',
          item: 'https://mediakit.website/facebook-video-downloader',
        },
      ],
    },
    {
      '@type': 'HowTo',
      name: 'How to Download Facebook Videos in 1080p HD',
      description: 'Quick 3-step guide to download public Facebook videos and Reels.',
      step: [
        {
          '@type': 'HowToStep',
          name: 'Copy FB Video Link',
          text: 'Click Share below the Facebook video or post and select "Copy Link".',
          position: 1,
        },
        {
          '@type': 'HowToStep',
          name: 'Paste into MediaKit',
          text: 'Paste the Facebook link into the MediaKit search bar above.',
          position: 2,
        },
        {
          '@type': 'HowToStep',
          name: 'Select HD Quality & Download',
          text: 'Choose HD (1080p / 720p) or SD quality and click Download to save the MP4 video.',
          position: 3,
        },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'How do I download a video from Facebook in HD?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Click Share below the Facebook video, select "Copy link", paste the URL into MediaKit above, and select HD 1080p from the download options.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is this Facebook video downloader free and watermark-free?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes! MediaKit is 100% free with no watermarks, no account registration, and no software installation.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I download Facebook Reels as well as standard videos?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes! MediaKit supports all Facebook video formats including Facebook Reels, Watch clips, and timeline posts.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I download private Facebook group videos?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No. To ensure user privacy and adhere to platform security policies, MediaKit strictly processes publicly available Facebook videos.',
          },
        },
        {
          '@type': 'Question',
          name: 'How do I save Facebook videos on my iPhone or Android?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'On iPhone, open Safari, paste the link into MediaKit, download the file, and tap "Save Video" to add it to your Photos library. On Android, the file downloads directly to your Downloads folder and Gallery.',
          },
        },
      ],
    },
  ],
};

export default function FacebookVideoDownloaderPage() {
  return (
    <SeoLandingPage
      badgeText="Facebook Video Downloader"
      title="Download Facebook Videos &amp; Reels in 1080p HD"
      highlightWord="1080p HD"
      subtitle="Save public Facebook videos, Watch clips, and Reels in crisp High Definition MP4 format with no watermarks."
      supportedUrls={[
        'https://www.facebook.com/watch/?v=1234567890',
        'https://www.facebook.com/username/videos/1234567890/',
        'https://fb.watch/example/',
        'https://www.facebook.com/reel/1234567890/',
      ]}
      features={[
        {
          title: 'Full 1080p & 720p HD Quality',
          description:
            'Download Facebook videos in crystal-clear High Definition or lightweight Standard Definition when saving bandwidth.',
        },
        {
          title: 'fb.watch & Mobile Link Support',
          description:
            'Handles desktop URLs, mobile m.facebook links, and short fb.watch redirection URLs automatically.',
        },
        {
          title: 'Direct MP4 File Output',
          description:
            'Plays anywhere: Windows Media Player, QuickTime, VLC, smartphones, and home media systems.',
        },
      ]}
      deviceGuides={[
        {
          device: 'iPhone & iPad (iOS Safari)',
          iconType: 'iphone',
          steps: [
            'In the Facebook app, tap Share under the video and choose "Copy link".',
            'Open Safari and paste the link into MediaKit.',
            'Choose HD (1080p) and tap "Download".',
            'Tap the blue download icon in Safari, tap the file, and tap "Save Video" to add it to your Photos camera roll.',
          ],
        },
        {
          device: 'Android (Chrome / Samsung)',
          iconType: 'android',
          steps: [
            'Copy the video URL from Facebook (tap the three dots > Copy link).',
            'Paste the link into MediaKit above — Facebook is detected instantly.',
            'Select HD quality and tap Download.',
            'The MP4 file saves immediately to your "Downloads" folder and appears in your Gallery.',
          ],
        },
        {
          device: 'PC, Mac & Laptops',
          iconType: 'desktop',
          steps: [
            'Copy the link from your browser address bar or right-click the Facebook video and copy the URL.',
            'Paste into MediaKit and select HD quality.',
            'Click Download to save the MP4 directly without any extensions or software.',
          ],
        },
      ]}
      comparisonRows={[
        {
          feature: 'Watermarks & Overlays',
          us: 'Zero Watermarks (100% Clean)',
          official: 'None',
          competitors: 'Site Watermarks Added',
        },
        {
          feature: '1080p High Definition',
          us: 'Full HD 1080p Available',
          official: 'Compressed Stream',
          competitors: 'Often Throttled to 360p',
        },
        {
          feature: 'Reels & Watch Clips',
          us: 'All Public FB Videos Supported',
          official: 'Saved in App Only',
          competitors: 'Fails on fb.watch links',
        },
        {
          feature: 'Ads & Redirects',
          us: 'Zero Popups, Clean Experience',
          official: 'Sponsored Content',
          competitors: 'Deceptive Popups & Redirects',
        },
        {
          feature: 'Login Required',
          us: 'No Login Needed',
          official: 'Must Log In',
          competitors: 'Asks for Facebook Token',
        },
      ]}
      articles={[
        {
          title: 'The Fastest Online Facebook Video Downloader',
          content: [
            'MediaKit provides a reliable and streamlined way to download Facebook videos and Reels directly to your device. Whether you want to save educational tutorials, hilarious memes, or cooking recipes for offline watching, MediaKit extracts the direct MP4 stream in just seconds.',
            'Our system automatically handles all types of Facebook URLs, including short links (fb.watch), mobile URLs (m.facebook.com), and desktop links (facebook.com/watch). You never have to manually edit the link.',
          ],
        },
        {
          title: 'Privacy-First Facebook Downloading Without Login',
          content: [
            'Many online downloaders ask you to paste cookies or log into your Facebook account, creating severe security vulnerabilities. MediaKit never asks for your login credentials or personal information.',
            'We strictly process publicly available Facebook videos using server-side stream extraction, ensuring your personal Facebook account remains completely private and secure.',
          ],
        },
      ]}
      faqs={[
        {
          question: 'How do I download a video from Facebook?',
          answer:
            'Click Share below the Facebook video, select "Copy link", paste the URL into MediaKit, and choose your preferred video quality (HD or SD).',
        },
        {
          question: 'Are Facebook Reels supported?',
          answer:
            'Yes! You can download Facebook Reels in full vertical HD quality with crystal-clear audio.',
        },
        {
          question: 'Are Facebook live streams supported?',
          answer:
            'You can download Facebook live videos once the stream has concluded and is saved as a recorded public video.',
        },
        {
          question: 'Do I have to log in to Facebook to download?',
          answer:
            'No login is ever required. MediaKit processes the public media stream directly without accessing your account.',
        },
        {
          question: 'Can I download private Facebook group videos?',
          answer:
            'No. To ensure user privacy and security, MediaKit strictly processes publicly available Facebook videos and posts.',
        },
        {
          question: 'Is MediaKit free?',
          answer:
            'Yes, MediaKit is 100% free with unlimited downloads and no subscription fees.',
        },
      ]}
      structuredData={jsonLd}
    />
  );
}
