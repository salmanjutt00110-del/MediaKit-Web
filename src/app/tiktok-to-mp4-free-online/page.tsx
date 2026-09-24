import type { Metadata } from 'next';
import SeoLandingPage from '@/components/SeoLandingPage';

export const metadata: Metadata = {
  title: 'TikTok to MP4 Free Online — No Watermark HD Download | MediaKit',
  description:
    'Convert and download TikTok to MP4 free online in HD 1080p without watermark. No software or registration required. Fast, clean TikTok MP4 converter.',
  keywords: [
    'tiktok to mp4 free online',
    'tiktok to mp4',
    'tiktok mp4 converter online free',
    'download tiktok mp4 without watermark',
    'convert tiktok to mp4 hd',
  ],
  alternates: {
    canonical: 'https://mediakit.website/tiktok-to-mp4-free-online',
  },
  openGraph: {
    title: 'TikTok to MP4 Free Online — No Watermark HD Download | MediaKit',
    description: 'Convert and download TikTok to MP4 free online without watermark. HD 1080p quality.',
    url: 'https://mediakit.website/tiktok-to-mp4-free-online',
    type: 'website',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      name: 'MediaKit TikTok to MP4 Converter',
      url: 'https://mediakit.website/tiktok-to-mp4-free-online',
      applicationCategory: 'MultimediaApplication',
      operatingSystem: 'All',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
};

export default function TikTokToMp4FreeOnlinePage() {
  return (
    <SeoLandingPage
      badgeText="TikTok to MP4 Converter"
      title="TikTok to MP4 Free Online Without Watermark"
      highlightWord="Without Watermark"
      subtitle="Convert any TikTok video URL to standard MP4 format in full HD 1080p resolution. No software installation, registration, or watermarks."
      supportedUrls={[
        'https://www.tiktok.com/@username/video/1234567890',
        'https://vm.tiktok.com/ZM8example/',
        'https://vt.tiktok.com/ZS8example/',
      ]}
      steps={[
        {
          number: 1,
          title: 'Copy TikTok Link',
          description: 'Copy the URL of the TikTok video from the app or browser.',
        },
        {
          number: 2,
          title: 'Paste into Converter',
          description: 'Paste the link into MediaKit above. The URL format is verified instantly.',
        },
        {
          number: 3,
          title: 'Choose MP4 Resolution',
          description: 'Select full original HD 1080p or standard MP4 resolution.',
        },
        {
          number: 4,
          title: 'Download Clean MP4',
          description: 'Save the watermark-free MP4 file directly to your smartphone or computer.',
        },
      ]}
      faqs={[
        {
          question: 'Are downloaded TikTok MP4 files compatible with all devices?',
          answer: 'Yes, MediaKit generates standard H.264/AAC MP4 files playable on all modern smartphones, tablets, TVs, and editing programs.',
        },
        {
          question: 'Is this TikTok to MP4 converter free online?',
          answer: 'Yes, 100% free with no registration, subscription, or software downloads.',
        },
      ]}
      structuredData={jsonLd}
    />
  );
}
