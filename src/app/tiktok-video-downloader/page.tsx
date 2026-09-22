import type { Metadata } from 'next';
import SeoLandingPage from '@/components/SeoLandingPage';

export const metadata: Metadata = {
  title: 'TikTok Video Downloader Without Watermark — HD MP4 & MP3 Audio | MediaKit',
  description:
    'Download TikTok videos without watermark in original HD resolution (1080p). Fast, 100% free, supports vt.tiktok and tiktok.com links. Save clean TikTok MP4 or MP3 audio easily.',
  keywords: [
    'tiktok video downloader without watermark',
    'tiktok downloader no watermark',
    'download tiktok video without watermark',
    'tiktok video download hd',
    'tiktok to mp3',
    'free tiktok downloader',
    'tiktok watermark remover online',
    'save tiktok without watermark',
    'tiktok no watermark download iphone',
    'tiktok no watermark download android',
  ],
  alternates: {
    canonical: '/tiktok-video-downloader',
  },
  openGraph: {
    title: 'TikTok Video Downloader Without Watermark — HD MP4 | MediaKit',
    description:
      'Download TikTok videos without watermark in original HD resolution. Fast, free, supports vt.tiktok and tiktok.com links.',
    url: '/tiktok-video-downloader',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TikTok Video Downloader Without Watermark — MediaKit',
    description:
      'Save clean TikTok videos without watermark or extract viral MP3 audio.',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      name: 'MediaKit TikTok Downloader Without Watermark',
      url: 'https://mediakit.website/tiktok-video-downloader',
      applicationCategory: 'MultimediaApplication',
      operatingSystem: 'Windows, macOS, Linux, Android, iOS',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        ratingCount: '19750',
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
          name: 'TikTok Video Downloader Without Watermark',
          item: 'https://mediakit.website/tiktok-video-downloader',
        },
      ],
    },
    {
      '@type': 'HowTo',
      name: 'How to Download TikTok Videos Without Watermark',
      description: 'Step-by-step instructions to save clean TikTok clips in HD.',
      step: [
        {
          '@type': 'HowToStep',
          name: 'Copy TikTok Link',
          text: 'Open the TikTok app, tap Share on the video, and choose "Copy Link".',
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
          name: 'Download Watermark-Free MP4',
          text: 'Click Download to instantly save the clean, watermark-free video or MP3 audio file.',
          position: 3,
        },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Does MediaKit remove the bouncing TikTok logo and username watermark?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes! MediaKit extracts the clean source video stream before TikTok applies overlay watermarks, giving you a crystal-clear, watermark-free video.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is this TikTok downloader free?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, MediaKit is 100% free with unlimited downloads and no registration or subscription required.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I download TikTok sounds or music as MP3?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, select the MP3 audio download option to save the authentic background track from any TikTok clip.',
          },
        },
        {
          '@type': 'Question',
          name: 'How do I download TikTok videos without watermark on iPhone?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Copy the TikTok link, open Safari, paste the link into MediaKit, and tap Download. Tap the Safari download arrow, open the file, and tap "Save Video" to add it to your Photos app.',
          },
        },
        {
          '@type': 'Question',
          name: 'Are vt.tiktok.com and vm.tiktok.com short links supported?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes! MediaKit automatically resolves and unrolls all TikTok short links, mobile URLs, and desktop URLs.',
          },
        },
      ],
    },
  ],
};

export default function TikTokDownloaderPage() {
  return (
    <SeoLandingPage
      badgeText="TikTok Video Downloader"
      title="Download TikTok Videos Without Watermark"
      highlightWord="Without Watermark"
      subtitle="Save clean, watermark-free TikTok clips in original HD quality or extract viral background audio as MP3."
      supportedUrls={[
        'https://www.tiktok.com/@username/video/1234567890',
        'https://vm.tiktok.com/ZM8example/',
        'https://vt.tiktok.com/ZS8example/',
        'https://www.tiktok.com/t/ZP8example/',
      ]}
      features={[
        {
          title: 'Zero Watermark Overlays',
          description:
            'Obtain clean, original footage without distracting creator badges or animated bouncing TikTok icons.',
        },
        {
          title: 'All Mobile & Short Links Supported',
          description:
            'Works seamlessly with vt.tiktok.com, vm.tiktok.com, tiktok.com/t/, and desktop URLs.',
        },
        {
          title: 'Viral Audio MP3 Extraction',
          description:
            'Extract trending tracks, sounds, and spoken audio directly from TikTok videos in seconds.',
        },
      ]}
      deviceGuides={[
        {
          device: 'iPhone & iPad (iOS Safari)',
          iconType: 'iphone',
          steps: [
            'In the TikTok app, tap Share on the video and tap "Copy Link".',
            'Open Safari and paste the URL into MediaKit.',
            'Tap "Download (No Watermark)".',
            'Tap the blue download icon in Safari\'s address bar, select the video, and tap "Save Video" to store it in Photos.',
          ],
        },
        {
          device: 'Android (Chrome / Samsung)',
          iconType: 'android',
          steps: [
            'Copy the video URL from the TikTok app (Share > Copy link).',
            'Paste the link into MediaKit above — TikTok is auto-detected.',
            'Tap Download to save the watermark-free MP4 or MP3.',
            'The file downloads directly into your Downloads folder and Gallery.',
          ],
        },
        {
          device: 'PC, Mac & Laptops',
          iconType: 'desktop',
          steps: [
            'Copy the TikTok video URL from your browser address bar.',
            'Paste into MediaKit and click Download.',
            'The clean, watermark-free video downloads directly to your computer.',
          ],
        },
      ]}
      comparisonRows={[
        {
          feature: 'Watermarks & Logos',
          us: 'Zero Watermarks (100% Clean)',
          official: 'Bouncing Logo & Username',
          competitors: 'Injects Site Branding',
        },
        {
          feature: 'Resolution',
          us: 'Original HD Quality',
          official: 'Compressed 720p',
          competitors: 'Compressed / Blurry',
        },
        {
          feature: 'MP3 Sound Extraction',
          us: 'Direct 320kbps MP3',
          official: 'Not Supported',
          competitors: 'Low Quality Audio',
        },
        {
          feature: 'Pop-ups & Spam',
          us: 'Zero Pop-ups, Clean Experience',
          official: 'In-app Ads',
          competitors: 'Aggressive Pop-ups & Redirects',
        },
        {
          feature: 'Pricing & Limits',
          us: '100% Free Forever, Unlimited',
          official: 'Free in App',
          competitors: 'Daily Download Caps',
        },
      ]}
      articles={[
        {
          title: 'How to Download TikTok Videos Without Watermark',
          content: [
            'TikTok\'s built-in "Save Video" function always stamps an animated TikTok logo and the creator\'s username over the corners of the video. If you are re-sharing content to other platforms or editing video reels, these watermarks can obstruct important visual details.',
            'MediaKit bypasses these overlays by communicating directly with the media origin CDN server to pull the pristine, raw MP4 source file before TikTok applies its branding watermarks.',
          ],
        },
        {
          title: 'Extracting Trending TikTok Audio as MP3',
          content: [
            'TikTok is the home of trending music, remixes, and viral soundbites. MediaKit includes an audio extraction feature that lets you strip and download just the audio track in crystal-clear MP3 format.',
            'Simply paste the TikTok link, choose "Audio (MP3)" from the format list, and save the sound directly to your phone or computer.',
          ],
        },
      ]}
      faqs={[
        {
          question: 'Does MediaKit remove the bouncing TikTok logo and username watermark?',
          answer:
            'Yes! MediaKit extracts the clean source video stream before TikTok applies overlay watermarks, giving you a crystal-clear video.',
        },
        {
          question: 'Can I download TikTok sounds or music as MP3?',
          answer:
            'Yes, select the Audio Only (MP3) download option to save the authentic background sound from any TikTok clip.',
        },
        {
          question: 'Where are TikTok videos saved on my phone?',
          answer:
            'On iOS, files download to your "Files" app (or directly to Photos when prompted). On Android, files are saved in your default "Downloads" folder.',
        },
        {
          question: 'Do I need a TikTok account to download videos?',
          answer:
            'No, you do not need to log in or create an account. Simply copy the public link and paste it into MediaKit.',
        },
        {
          question: 'Can private TikTok videos be downloaded?',
          answer:
            'No. To protect creator privacy and platform safety rules, MediaKit only processes publicly accessible TikTok videos.',
        },
        {
          question: 'Is MediaKit free?',
          answer:
            'Yes, MediaKit is 100% free with unlimited downloads and no hidden charges.',
        },
      ]}
      structuredData={jsonLd}
    />
  );
}
