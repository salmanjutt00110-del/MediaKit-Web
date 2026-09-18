import type { Metadata } from 'next';
import SeoLandingPage from '@/components/SeoLandingPage';

export const metadata: Metadata = {
  title: 'TikTok Video Downloader Without Watermark — HD MP4 | MediaKit',
  description:
    'Download TikTok videos without watermark in original HD resolution. Fast, free, supports vt.tiktok and tiktok.com links. Save TikTok MP4 or MP3 audio easily.',
  alternates: {
    canonical: 'https://mediakit.website/tiktok-video-downloader',
  },
  openGraph: {
    title: 'TikTok Video Downloader Without Watermark — HD MP4 | MediaKit',
    description:
      'Download TikTok videos without watermark in original HD resolution. Fast, free, supports vt.tiktok and tiktok.com links.',
    url: 'https://mediakit.website/tiktok-video-downloader',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      name: 'MediaKit TikTok Downloader',
      url: 'https://mediakit.website/tiktok-video-downloader',
      applicationCategory: 'MultimediaApplication',
      operatingSystem: 'All',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Does MediaKit remove the bouncing TikTok logo and username watermark?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes! MediaKit extracts the clean source video stream before TikTok applies overlay watermarks, giving you a crystal-clear video.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I download TikTok sounds or music as MP3?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, select the Audio Only (MP3) download option to save the authentic background sound from any TikTok clip.',
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
          description: 'Obtain clean, original footage without distracting creator badges or animated TikTok icons.',
        },
        {
          title: 'All Mobile & Short Links Supported',
          description: 'Works seamlessly with vt.tiktok.com, vm.tiktok.com, tiktok.com/t/, and desktop URLs.',
        },
        {
          title: 'Viral Audio MP3 Extraction',
          description: 'Extract trending tracks, sounds, and spoken audio directly from TikTok videos in seconds.',
        },
      ]}
      faqs={[
        {
          question: 'Where are TikTok videos saved on my phone?',
          answer: 'On iOS, files download to your "Files" app (or directly to Photos when prompted). On Android, files are saved in your default "Downloads" folder.',
        },
        {
          question: 'Do I need a TikTok account to download videos?',
          answer: 'No, you do not need to log in or create an account. Simply copy the public link and paste it into MediaKit.',
        },
        {
          question: 'Can private TikTok videos be downloaded?',
          answer: 'No. To protect creator privacy and platform safety rules, MediaKit only processes publicly accessible TikTok videos.',
        },
      ]}
      structuredData={jsonLd}
    />
  );
}
