import type { Metadata } from 'next';
import SeoLandingPage from '@/components/SeoLandingPage';

export const metadata: Metadata = {
  title: 'Instagram Video Downloader — Reels, Stories, Posts | MediaKit',
  description:
    'Download Instagram videos, reels, and stories for free. Save Instagram content in HD quality. No login required. Fast Instagram downloader by MediaKit.',
  keywords: [
    'instagram video downloader',
    'instagram reels downloader',
    'download instagram videos',
    'instagram story downloader',
    'download instagram reels without watermark',
    'free instagram video downloader',
    'instagram video download hd',
  ],
  alternates: {
    canonical: 'https://mediakit.website/instagram-video-downloader',
  },
  openGraph: {
    title: 'Instagram Video Downloader Free | MediaKit',
    description: 'Download Instagram videos, reels & stories. Free, HD quality, no login.',
    url: 'https://mediakit.website/instagram-video-downloader',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Instagram Video Downloader Free | MediaKit',
    description: 'Download Instagram videos, reels & stories. Free, HD quality, no login.',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      name: 'MediaKit Instagram Video Downloader',
      url: 'https://mediakit.website/instagram-video-downloader',
      applicationCategory: 'MultimediaApplication',
      operatingSystem: 'Windows, macOS, Linux, Android, iOS',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        ratingCount: '16320',
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
          name: 'Instagram Video Downloader',
          item: 'https://mediakit.website/instagram-video-downloader',
        },
      ],
    },
    {
      '@type': 'HowTo',
      name: 'How to Download Instagram Videos and Reels',
      description: 'Step-by-step guide to saving Instagram videos in original HD quality.',
      step: [
        {
          '@type': 'HowToStep',
          name: 'Copy Instagram Link',
          text: 'Open Instagram, tap the three dots or the Paper Airplane / Share icon on the video, and tap "Copy Link".',
          position: 1,
        },
        {
          '@type': 'HowToStep',
          name: 'Paste into MediaKit',
          text: 'Paste the copied URL into the MediaKit search bar above.',
          position: 2,
        },
        {
          '@type': 'HowToStep',
          name: 'Download HD MP4',
          text: 'Select your preferred HD resolution and click Download to save the video directly.',
          position: 3,
        },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'How do I download a video from Instagram?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Open Instagram, tap the Share icon or the three dots on the post, select "Copy Link", paste it into MediaKit above, and click Download.',
          },
        },
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
          name: 'Do I need to log into Instagram or provide my password?',
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
            text: 'Paste the link into Safari on MediaKit, tap Download, tap the Safari download arrow in the address bar, select the video, and tap "Save Video" to place it directly in your Photos library.',
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
            text: 'Yes! All downloaded MP4 files include the authentic stereo audio track recorded by the creator, with full synchronization.',
          },
        },
      ],
    },
  ],
};

export default function InstagramVideoDownloaderPage() {
  return (
    <SeoLandingPage
      badgeText="Instagram Video Downloader"
      title="Download Instagram Videos &amp; Reels in HD"
      highlightWord="Reels in HD"
      subtitle="Save public Instagram video posts, Reels, and carousel videos directly to your device with no watermarks."
      supportedUrls={[
        'https://www.instagram.com/reel/Cxxxxxxxxx/',
        'https://www.instagram.com/p/POST_ID/',
        'https://www.instagram.com/tv/VIDEO_ID/',
      ]}
      features={[
        {
          title: 'Full Resolution Video Stream',
          description:
            'Extract the uncompressed MP4 source file directly from CDN servers for maximum color fidelity and sharpness.',
        },
        {
          title: 'Zero Watermarks or Logos',
          description:
            'Download clean video clips without distracting creator badges, bouncing logos, or site watermarks.',
        },
        {
          title: 'No Instagram Login Required',
          description:
            'Never share your Instagram password or connect accounts. Completely anonymous, private, and secure.',
        },
      ]}
      deviceGuides={[
        {
          device: 'iPhone & iPad (iOS Safari)',
          iconType: 'iphone',
          steps: [
            'In the Instagram app, tap the Paper Airplane / Share icon on the Reel or post and select "Copy Link".',
            'Open Safari and paste the URL into MediaKit above.',
            'Choose HD 1080p and tap "Download".',
            'Tap the blue download circle in Safari, open the downloaded file, and tap "Save Video" to add it to your Photos app.',
          ],
        },
        {
          device: 'Android (Chrome / Samsung)',
          iconType: 'android',
          steps: [
            'Copy the Instagram video URL by tapping the three dots or Share > Copy link.',
            'Paste into MediaKit — Instagram is recognized instantly.',
            'Tap Download to save the MP4 video.',
            'The file saves immediately to your "Downloads" folder and appears in your Gallery.',
          ],
        },
        {
          device: 'PC, Mac & Laptops',
          iconType: 'desktop',
          steps: [
            'Copy the URL from the browser address bar (instagram.com/reel/... or /p/...).',
            'Paste into MediaKit and select HD quality.',
            'Click Download to save the MP4 video file directly to your computer.',
          ],
        },
      ]}
      comparisonRows={[
        {
          feature: 'Watermarks & Overlays',
          us: 'Zero Watermarks (100% Clean)',
          official: 'Adds Instagram Logo',
          competitors: 'Site Watermarks Added',
        },
        {
          feature: 'Audio In-Sync',
          us: 'Crystal-Clear Audio Track',
          official: 'Muted on Certain Saves',
          competitors: 'Audio Often Missing',
        },
        {
          feature: 'Resolution',
          us: 'Original 1080p High Definition',
          official: 'Compressed Stream',
          competitors: 'Compressed to 720p',
        },
        {
          feature: 'Login Required',
          us: 'Never (100% Anonymous)',
          official: 'Must Have IG Account',
          competitors: 'Asks to Connect Account',
        },
        {
          feature: 'Cost & Limits',
          us: '100% Free Forever, Unlimited',
          official: 'App Only',
          competitors: 'Daily Download Caps',
        },
      ]}
      articles={[
        {
          title: 'The Ultimate Free Instagram Video Downloader',
          content: [
            'Instagram is packed with incredible creator content, from viral Reels to informative tutorial clips. However, Instagram\'s native "Save" feature merely bookmarks the post inside the app, preventing you from viewing the video offline or using it in editing projects.',
            'MediaKit gives you full control over your media. By connecting directly to Instagram\'s media distribution edge servers, MediaKit retrieves the uncompressed MP4 source file in full 1080p High Definition.',
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
          question: 'How do I download a video from Instagram?',
          answer:
            'Open the Instagram app or website, tap the Share icon or the three dots on the post, select "Copy Link", and paste it into MediaKit above.',
        },
        {
          question: 'Can I download Instagram Reels?',
          answer:
            'Yes! Instagram Reels are fully supported in native 9:16 vertical resolution (1080x1920) with high-bitrate synchronized audio.',
        },
        {
          question: 'Do I need to install any app to download Instagram videos?',
          answer:
            'No apps or browser extensions are needed. MediaKit functions 100% online through your browser.',
        },
        {
          question: 'Are downloaded Instagram videos saved with audio?',
          answer:
            'Yes! All downloaded MP4 files include the authentic stereo audio track recorded by the creator.',
        },
        {
          question: 'Can I download private Instagram posts?',
          answer:
            'No. In strict accordance with platform privacy and security policies, only public Instagram media can be processed.',
        },
        {
          question: 'Is MediaKit free to use?',
          answer:
            'Yes, MediaKit is 100% free with no hidden charges, registration, or subscriptions.',
        },
      ]}
      structuredData={jsonLd}
    />
  );
}
