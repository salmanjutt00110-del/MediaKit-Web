import type { Metadata } from 'next';
import SeoLandingPage from '@/components/SeoLandingPage';

export const metadata: Metadata = {
  title: {
    absolute: 'YouTube Shorts Downloader – Download Shorts | MediaKit',
  },
  description:
    'Download YouTube Shorts videos in vertical 9:16 HD with audio. Free online YouTube Shorts downloader — fast, watermark-free, and mobile-ready on MediaKit.',
  keywords: [
    'youtube shorts downloader',
    'download youtube shorts',
    'youtube shorts video downloader',
    'save youtube shorts',
    'download yt shorts online',
    'youtube shorts to mp4',
  ],
  alternates: {
    canonical: 'https://mediakit.website/youtube-shorts-downloader',
  },
  openGraph: {
    title: 'YouTube Shorts Downloader – Download Shorts | MediaKit',
    description:
      'Download YouTube Shorts videos in vertical 9:16 HD with audio. Free online YouTube Shorts downloader — fast, watermark-free, and mobile-ready on MediaKit.',
    url: 'https://mediakit.website/youtube-shorts-downloader',
    type: 'website',
    images: [
      {
        url: 'https://mediakit.website/logo.png',
        width: 512,
        height: 512,
        alt: 'MediaKit YouTube Shorts Downloader',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'YouTube Shorts Downloader – Download Shorts | MediaKit',
    description:
      'Download YouTube Shorts videos in vertical 9:16 HD with audio. Free online YouTube Shorts downloader — fast, watermark-free, and mobile-ready.',
    images: ['https://mediakit.website/logo.png'],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': 'https://mediakit.website/youtube-shorts-downloader#webpage',
      url: 'https://mediakit.website/youtube-shorts-downloader',
      name: 'YouTube Shorts Downloader – Download Shorts | MediaKit',
      description:
        'Download YouTube Shorts videos in vertical 9:16 HD with audio. Free online YouTube Shorts downloader — fast, watermark-free, and mobile-ready on MediaKit.',
      isPartOf: {
        '@type': 'WebSite',
        '@id': 'https://mediakit.website/#website',
      },
    },
    {
      '@type': 'WebApplication',
      '@id': 'https://mediakit.website/youtube-shorts-downloader#app',
      name: 'MediaKit YouTube Shorts Downloader',
      url: 'https://mediakit.website/youtube-shorts-downloader',
      applicationCategory: 'MultimediaApplication',
      operatingSystem: 'Windows, macOS, Linux, Android, iOS',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      featureList: [
        'Native 9:16 vertical resolution download up to 1080x1920',
        'Automatic detection of youtube.com/shorts/ URLs',
        'Synchronized stereo audio track included in MP4',
        'Optional audio-only MP3 download format',
        'No registration, software, or extensions needed',
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
          name: 'YouTube Shorts Downloader',
          item: 'https://mediakit.website/youtube-shorts-downloader',
        },
      ],
    },
    {
      '@type': 'HowTo',
      name: 'How to Download YouTube Shorts in 3 Steps',
      description: 'Quick step-by-step guide to download vertical YouTube Shorts videos in original HD quality.',
      step: [
        {
          '@type': 'HowToStep',
          name: 'Copy Shorts URL',
          text: 'In the YouTube mobile app or browser, tap the Share icon on the Short and choose "Copy Link".',
          position: 1,
        },
        {
          '@type': 'HowToStep',
          name: 'Paste into MediaKit',
          text: 'Paste the copied Shorts URL into the MediaKit input bar above. The engine identifies the Short automatically.',
          position: 2,
        },
        {
          '@type': 'HowToStep',
          name: 'Download Vertical HD MP4',
          text: 'Select your preferred format (vertical HD MP4 or audio MP3) and click Download to save the file.',
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
            text: 'On the YouTube mobile app, tap the Share button on the right-hand action bar of any Short and tap "Copy link". On a desktop browser, copy the full URL from your browser address bar (it begins with youtube.com/shorts/).',
          },
        },
        {
          '@type': 'Question',
          name: 'How does MediaKit detect YouTube Shorts?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'When you paste a link containing /shorts/ into the input field, MediaKit instantly identifies the YouTube Shorts format and queries the vertical stream manifest without requiring manual tool selection.',
          },
        },
        {
          '@type': 'Question',
          name: 'Are YouTube Shorts downloaded in native vertical 9:16 aspect ratio?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes! All YouTube Shorts retain their native 9:16 vertical resolution (up to 1080x1920) without black letterboxing bars or cropped edges.',
          },
        },
        {
          '@type': 'Question',
          name: 'Do downloaded YouTube Shorts include audio?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. MediaKit processes both the high-definition video track and audio track into a single MP4 file ready for playback with perfect audio synchronization.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I extract audio only from a YouTube Short as an MP3?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes! Select the MP3 audio format option to download just the soundtrack or voiceover from any Short.',
          },
        },
        {
          '@type': 'Question',
          name: 'How do I save YouTube Shorts to iPhone camera roll?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Paste the Shorts link into Safari on MediaKit, tap Download, open the downloaded file from the Safari download manager in the address bar, tap Share, and tap "Save Video" to store it directly in Photos.',
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
      title="YouTube Shorts Downloader"
      highlightWord="Shorts Downloader"
      subtitle="Download YouTube Shorts in authentic 9:16 vertical HD with synchronized audio. Fast, free, watermark-free, and mobile-ready."
      supportedUrls={[
        'https://www.youtube.com/shorts/dQw4w9WgXcQ',
        'https://youtube.com/shorts/dQw4w9WgXcQ',
        'https://m.youtube.com/shorts/dQw4w9WgXcQ',
      ]}
      steps={[
        {
          number: 1,
          title: 'Copy the Shorts URL',
          description:
            'In the YouTube app, tap the Share icon on the Short and tap "Copy Link". In desktop browsers, copy the URL from your address bar.',
        },
        {
          number: 2,
          title: 'Paste into MediaKit',
          description:
            'Paste the link into the download bar above. MediaKit immediately detects the /shorts/ URL structure.',
        },
        {
          number: 3,
          title: 'Choose Available Format',
          description:
            'Select vertical HD MP4 or extract audio as MP3, then click Download to save the file directly to your device.',
        },
      ]}
      features={[
        {
          title: 'Native 9:16 Vertical Video',
          description:
            'Preserves full portrait dimensions (1080x1920) without black bars, letterboxing, or distortion.',
        },
        {
          title: 'Synchronized High-Bitrate Audio',
          description:
            'Merges high-resolution video and pristine stereo audio into a single MP4 container on the fly.',
        },
        {
          title: 'Fast Auto-Detection',
          description:
            'Paste any standard or shortened YouTube Shorts URL and format manifests are fetched in seconds.',
        },
      ]}
      articles={[
        {
          title: 'How to Copy and Download YouTube Shorts URLs',
          content: [
            'YouTube Shorts are vertical videos up to 60 seconds long, designed for mobile viewing. In the YouTube mobile app, the standard address bar is hidden, so you can obtain the link by tapping the Share button on the right side of the screen and choosing "Copy link".',
            'Once copied, paste the URL into MediaKit. Our engine recognizes the /shorts/ path format and requests the original vertical MP4 stream directly from YouTube edge CDN servers.',
          ],
        },
        {
          title: 'Why YouTube Shorts Keep Their High Quality on MediaKit',
          content: [
            'Many generic screen-recording apps degrade video sharpness and cause frame stuttering when capturing Shorts. MediaKit bypasses screen capture by directly streaming the uploaded digital video file in its authentic bitrate and resolution.',
            'This ensures creators, editors, and viewers receive the exact color profiles and crispness rendered by the original uploader.',
          ],
        },
      ]}
      faqs={[
        {
          question: 'How do I copy a YouTube Shorts link?',
          answer:
            'On the YouTube mobile app, tap the Share button on the right-hand action bar of any Short and tap "Copy link". On a desktop browser, copy the full URL from your browser address bar (it begins with youtube.com/shorts/).',
        },
        {
          question: 'How does MediaKit detect YouTube Shorts?',
          answer:
            'When you paste a link containing /shorts/ into the input field, MediaKit instantly identifies the YouTube Shorts format and queries the vertical stream manifest without requiring manual tool selection.',
        },
        {
          question: 'Are YouTube Shorts downloaded in native vertical 9:16 aspect ratio?',
          answer:
            'Yes! All YouTube Shorts retain their native 9:16 vertical resolution (up to 1080x1920) without black letterboxing bars or cropped edges.',
        },
        {
          question: 'Do downloaded YouTube Shorts include audio?',
          answer:
            'Yes. MediaKit processes both the high-definition video track and audio track into a single MP4 file ready for playback with perfect audio synchronization.',
        },
        {
          question: 'Can I extract audio only from a YouTube Short as an MP3?',
          answer:
            'Yes! Select the MP3 audio format option to download just the soundtrack or voiceover from any Short.',
        },
        {
          question: 'How do I save YouTube Shorts to iPhone camera roll?',
          answer:
            'Paste the Shorts link into Safari on MediaKit, tap Download, open the downloaded file from the Safari download manager in the address bar, tap Share, and tap "Save Video" to store it directly in Photos.',
        },
      ]}
      structuredData={jsonLd}
      relatedTools={[
        { name: 'YouTube Video Downloader', href: '/youtube-video-downloader' },
        { name: 'YouTube to MP3 Converter', href: '/youtube-mp3' },
        { name: 'Online Video Downloader', href: '/online-video-downloader' },
        { name: 'TikTok Video Downloader', href: '/tiktok-video-downloader' },
        { name: 'Instagram Reels Downloader', href: '/instagram-reels-downloader' },
        { name: 'Facebook Reels Downloader', href: '/facebook-reels-downloader' },
      ]}
    />
  );
}
