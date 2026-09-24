import type { Metadata } from 'next';
import SeoLandingPage from '@/components/SeoLandingPage';

export const metadata: Metadata = {
  title: 'Instagram Downloader - Reels, Stories Free | MediaKit',
  description:
    'Download Instagram Reels, Stories & Videos free. HD quality, no login required, no watermark. Works on iPhone & Android instantly. Best Instagram downloader — MediaKit.',
  keywords: [
    'instagram downloader',
    'instagram video downloader',
    'download instagram reels without watermark free',
    'instagram reels downloader',
    'instagram video downloader online no login',
    'save instagram story without them knowing free',
    'instagram reels downloader iphone free',
    'download instagram videos hd free online',
    'save instagram audio',
    'instagram carousel downloader',
    'fastest instagram downloader',
  ],
  alternates: {
    canonical: 'https://mediakit.website/instagram-video-downloader',
  },
  openGraph: {
    title: 'Instagram Downloader - Reels, Stories Free | MediaKit',
    description:
      'Download Instagram Reels, Stories & Videos free. HD quality, no login required, no watermark. Works on iPhone & Android instantly.',
    url: 'https://mediakit.website/instagram-video-downloader',
    type: 'website',
    images: [
      {
        url: '/logo.png',
        width: 512,
        height: 512,
        alt: 'MediaKit — Instagram Downloader Reels & Stories Free',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Instagram Downloader - Reels, Stories Free | MediaKit',
    description:
      'Download Instagram Reels, Stories & Videos free. HD quality, no login required, no watermark.',
    images: ['/logo.png'],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'MediaKit Instagram Downloader',
      applicationCategory: 'UtilitiesApplication',
      applicationSubCategory: 'Video Downloader',
      operatingSystem: 'Web Browser, iOS, Android, Windows, macOS, Linux',
      url: 'https://mediakit.website/instagram-video-downloader',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        bestRating: '5',
        worstRating: '1',
        ratingCount: '19420',
        reviewCount: '13890',
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
          name: 'Instagram Video Downloader',
          item: 'https://mediakit.website/instagram-video-downloader',
        },
      ],
    },
    {
      '@type': 'HowTo',
      name: 'How to Download Instagram Reels and Videos',
      description:
        'Save Instagram Reels, video posts, and Stories in full HD without watermark.',
      totalTime: 'PT1M',
      estimatedCost: {
        '@type': 'MonetaryAmount',
        currency: 'USD',
        value: '0',
      },
      tool: [
        {
          '@type': 'HowToTool',
          name: 'MediaKit Instagram Downloader',
          url: 'https://mediakit.website/instagram-video-downloader',
        },
      ],
      step: [
        {
          '@type': 'HowToStep',
          position: 1,
          name: 'Copy Instagram Post or Reel Link',
          text: 'Open Instagram, tap the Share (Paper Airplane) or three-dot icon on any post or Reel, and tap "Copy Link".',
          url: 'https://mediakit.website/instagram-video-downloader#step1',
        },
        {
          '@type': 'HowToStep',
          position: 2,
          name: 'Paste into MediaKit',
          text: 'Paste the link into the download box on MediaKit. The Instagram URL is detected automatically.',
          url: 'https://mediakit.website/instagram-video-downloader#step2',
        },
        {
          '@type': 'HowToStep',
          position: 3,
          name: 'Click Download',
          text: 'Hit the Download button to analyze the stream and generate the direct HD MP4 download link.',
          url: 'https://mediakit.website/instagram-video-downloader#step3',
        },
        {
          '@type': 'HowToStep',
          position: 4,
          name: 'Save to Camera Roll or Gallery',
          text: 'Save the watermark-free video with pristine audio directly to your device storage or Photos app.',
          url: 'https://mediakit.website/instagram-video-downloader#step4',
        },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Can I download Instagram Reels without watermark?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes! MediaKit extracts the original source stream before Instagram applies overlay elements, giving you a clean, watermark-free MP4 file.',
          },
        },
        {
          '@type': 'Question',
          name: 'Do I need to log into Instagram or provide my account password?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Never! MediaKit operates 100% anonymously and never requires your Instagram username, password, or cookies.',
          },
        },
        {
          '@type': 'Question',
          name: 'How do I save Instagram videos to my iPhone camera roll?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Paste the link into Safari on MediaKit, tap Download, tap the Safari download arrow in the address bar, select the video, and tap "Save Video" to place it directly into your iPhone Photos app.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I download Instagram Stories?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, public Instagram Stories can be downloaded anonymously before they expire without notifying the creator.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I download private Instagram posts?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No. In strict accordance with platform privacy and security policies, only publicly accessible Instagram media can be processed.',
          },
        },
        {
          '@type': 'Question',
          name: 'Are downloaded Instagram videos saved with authentic audio?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes! All downloaded MP4 files include the authentic stereo audio track recorded by the creator, with full audio synchronization.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I download Instagram carousel posts with multiple videos or photos?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, MediaKit parses all media items in carousel albums so you can save each slide individually.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is MediaKit free to use for Instagram downloads?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, MediaKit is 100% free with unlimited downloads, no daily caps, and no subscriptions.',
          },
        },
        {
          '@type': 'Question',
          name: 'What resolution are Instagram videos downloaded in?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'MediaKit delivers videos in original 1080x1920 (9:16 vertical) for Reels and up to 1080p for square/landscape feeds.',
          },
        },
        {
          '@type': 'Question',
          name: 'Does the creator know if I download their Instagram video or Story?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No. Instagram does not notify creators when their public media is viewed or downloaded via third-party web tools.',
          },
        },
      ],
    },
  ],
};

export default function InstagramVideoDownloaderPage() {
  return (
    <SeoLandingPage
      badgeText="Instagram Downloader"
      title="Instagram Downloader - Reels, Stories Free"
      highlightWord="Reels, Stories Free"
      subtitle="Download Instagram Reels, Stories & Videos free. HD quality, no login required, no watermark. Works on iPhone & Android instantly. Best Instagram downloader — MediaKit."
      supportedUrls={[
        'https://www.instagram.com/reel/Cxxxxxxxxx/',
        'https://www.instagram.com/p/POST_ID/',
        'https://www.instagram.com/tv/VIDEO_ID/',
        'https://www.instagram.com/stories/username/1234567890/',
      ]}
      steps={[
        {
          number: 1,
          title: 'Copy the Instagram Link',
          description:
            'Open Instagram, tap the Share (Paper Airplane) or three-dot icon on any Reel or post, and tap "Copy Link".',
        },
        {
          number: 2,
          title: 'Paste URL into MediaKit',
          description:
            'Paste your copied URL into the box above. MediaKit auto-detects Instagram links instantly.',
        },
        {
          number: 3,
          title: 'Click Download',
          description:
            'Tap Download. MediaKit parses the CDN stream and prepares the watermark-free HD MP4 file.',
        },
        {
          number: 4,
          title: 'Save to Camera Roll / Gallery',
          description:
            'Save the video directly to your smartphone Photos app or computer Downloads folder.',
        },
      ]}
      features={[
        {
          title: 'Full 1080p Resolution Stream',
          description:
            'Extract original uncompressed MP4 source files directly from CDN edge servers for maximum crispness.',
        },
        {
          title: 'Zero Watermarks or Logos',
          description:
            'Download clean video clips without creator badges, bouncing logos, or third-party site watermarks.',
        },
        {
          title: 'No Instagram Login Required',
          description:
            'Never share your Instagram password, tokens, or personal account. 100% anonymous and secure.',
        },
        {
          title: 'Full Audio Synchronization',
          description:
            'Authentic stereo sound synced with video frames. Never worry about muted or silent Reels.',
        },
      ]}
      deviceGuides={[
        {
          device: '📱 iPhone & iPad (iOS Safari)',
          iconType: 'iphone',
          steps: [
            'In the Instagram app, tap Share on any Reel or post and tap "Copy Link".',
            'Open Safari and navigate to mediakit.website/instagram-video-downloader.',
            'Paste the link and tap Download.',
            'Tap Download in Safari\'s prompt, tap the blue Safari download circle, open the file, and tap "Save Video" to add it to your Photos library.',
          ],
        },
        {
          device: '🤖 Android (Chrome / Samsung)',
          iconType: 'android',
          steps: [
            'Tap the three dots or Share arrow on Instagram and select "Copy link".',
            'Open Chrome and visit mediakit.website.',
            'Paste the URL — Instagram is detected immediately.',
            'Tap Download to save the MP4 video directly into your Downloads folder and Gallery.',
          ],
        },
        {
          device: '💻 PC / Mac (Any Browser)',
          iconType: 'desktop',
          steps: [
            'Copy the URL from your browser address bar (instagram.com/reel/... or /p/...).',
            'Paste into MediaKit and click Download.',
            'Save the clean MP4 directly to your computer.',
          ],
        },
      ]}
      comparisonRows={[
        {
          feature: 'Watermarks & Overlays',
          us: '✅ Zero Watermarks (100% Clean)',
          official: '⚠️ Adds Instagram Logo',
          competitors: '❌ Adds Site Watermark',
        },
        {
          feature: 'Audio Synchronization',
          us: '✅ Crystal-Clear Stereo Sound',
          official: '⚠️ Muted on Certain Saves',
          competitors: '❌ Often Muted / Desynced',
        },
        {
          feature: 'Login Required',
          us: '✅ Never (100% Anonymous)',
          official: '⚠️ Must Have IG Account',
          competitors: '❌ Requires IG Login / Cookie',
        },
        {
          feature: 'Cost & Limits',
          us: '✅ 100% Free Forever, Unlimited',
          official: '⚠️ In-app Only',
          competitors: '❌ Daily Caps & Paid Upgrades',
        },
      ]}
      articles={[
        {
          title: 'The Ultimate Free Instagram Downloader for Reels & Stories',
          content: [
            'Instagram is packed with incredible creator content, from viral Reels to informative tutorial clips. However, Instagram\'s native "Save" feature merely bookmarks the post inside the app, preventing you from viewing the video offline or using it in editing projects.',
            'MediaKit gives you full control over your media. By connecting directly to Instagram\'s media distribution edge servers, MediaKit retrieves the uncompressed MP4 source file in full 1080p High Definition without watermarks.',
          ],
        },
        {
          title: 'Why MediaKit is Safer Than Other Instagram Downloaders',
          content: [
            'Many third-party apps and websites require you to log into Instagram or install untrusted browser extensions that can compromise your credentials. MediaKit never asks for passwords, tokens, or permissions.',
            'Everything runs through our secure server pipeline, keeping your identity completely anonymous and ensuring a fast, spam-free downloading experience.',
          ],
        },
      ]}
      faqs={[
        {
          question: 'Can I download Instagram Reels without watermark?',
          answer:
            'Yes! MediaKit extracts the original source stream before Instagram applies overlay elements, giving you a clean, watermark-free MP4 file.',
        },
        {
          question: 'Do I need to log into Instagram or provide my account password?',
          answer:
            'Never! MediaKit operates 100% anonymously and never requires your Instagram username, password, or cookies.',
        },
        {
          question: 'How do I save Instagram videos to my iPhone camera roll?',
          answer:
            'Paste the link into Safari on MediaKit, tap Download, tap the Safari download arrow in the address bar, select the video, and tap "Save Video" to place it directly into your iPhone Photos app.',
        },
        {
          question: 'Can I download Instagram Stories?',
          answer:
            'Yes, public Instagram Stories can be downloaded anonymously before they expire without notifying the creator.',
        },
        {
          question: 'Can I download private Instagram posts?',
          answer:
            'No. In strict accordance with platform privacy and security policies, only publicly accessible Instagram media can be processed.',
        },
        {
          question: 'Are downloaded Instagram videos saved with authentic audio?',
          answer:
            'Yes! All downloaded MP4 files include the authentic stereo audio track recorded by the creator, with full audio synchronization.',
        },
        {
          question: 'Can I download Instagram carousel posts with multiple videos or photos?',
          answer:
            'Yes, MediaKit parses all media items in carousel albums so you can save each slide individually.',
        },
        {
          question: 'Is MediaKit free to use for Instagram downloads?',
          answer:
            'Yes, MediaKit is 100% free with unlimited downloads, no daily caps, and no subscriptions.',
        },
        {
          question: 'What resolution are Instagram videos downloaded in?',
          answer:
            'MediaKit delivers videos in original 1080x1920 (9:16 vertical) for Reels and up to 1080p for square/landscape feeds.',
        },
        {
          question: 'Does the creator know if I download their Instagram video or Story?',
          answer:
            'No. Instagram does not notify creators when their public media is viewed or downloaded via third-party web tools.',
        },
      ]}
      structuredData={jsonLd}
    />
  );
}
