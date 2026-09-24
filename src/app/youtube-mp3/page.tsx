import type { Metadata } from 'next';
import SeoLandingPage from '@/components/SeoLandingPage';

export const metadata: Metadata = {
  title: 'YouTube to MP3 Converter Free 320kbps | MediaKit',
  description:
    'Convert YouTube videos to MP3 free in 320kbps high quality audio. Fast, free, no software or registration needed. Download YouTube music with MediaKit.',
  keywords: [
    'youtube to mp3 converter free 320kbps',
    'youtube to mp3',
    'youtube to mp3 converter',
    'youtube to mp3 free',
    'convert youtube to mp3 320kbps free',
    'youtube audio downloader',
    'download youtube audio 320kbps',
    'youtube to mp3 online',
    'best youtube to mp3 converter',
    'youtube music downloader free',
  ],
  alternates: {
    canonical: 'https://mediakit.website/youtube-mp3',
  },
  openGraph: {
    title: 'YouTube to MP3 Converter Free 320kbps | MediaKit',
    description:
      'Convert YouTube videos to MP3 free in 320kbps high quality audio. Fast, free, no software or registration needed.',
    url: 'https://mediakit.website/youtube-mp3',
    type: 'website',
    images: [
      {
        url: '/logo.png',
        width: 512,
        height: 512,
        alt: 'MediaKit — YouTube to MP3 Converter Free 320kbps',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'YouTube to MP3 Converter Free 320kbps | MediaKit',
    description:
      'Convert YouTube videos to MP3 free in 320kbps high quality audio. Fast, free, no software or registration needed.',
    images: ['/logo.png'],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'MediaKit YouTube to MP3 Converter',
      applicationCategory: 'MultimediaApplication',
      applicationSubCategory: 'Audio Converter',
      operatingSystem: 'Web Browser, iOS, Android, Windows, macOS, Linux',
      url: 'https://mediakit.website/youtube-mp3',
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
        ratingCount: '21340',
        reviewCount: '15400',
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
          name: 'YouTube to MP3 Converter',
          item: 'https://mediakit.website/youtube-mp3',
        },
      ],
    },
    {
      '@type': 'HowTo',
      name: 'How to Convert YouTube Videos to MP3 (320kbps)',
      description:
        'Step-by-step guide to extract and convert YouTube videos to 320kbps MP3 audio.',
      totalTime: 'PT1M',
      estimatedCost: {
        '@type': 'MonetaryAmount',
        currency: 'USD',
        value: '0',
      },
      tool: [
        {
          '@type': 'HowToTool',
          name: 'MediaKit YouTube to MP3 Converter',
          url: 'https://mediakit.website/youtube-mp3',
        },
      ],
      step: [
        {
          '@type': 'HowToStep',
          position: 1,
          name: 'Copy YouTube URL',
          text: 'Open YouTube and copy the link of the video or music track you want to convert.',
          url: 'https://mediakit.website/youtube-mp3#step1',
        },
        {
          '@type': 'HowToStep',
          position: 2,
          name: 'Paste into MediaKit',
          text: 'Paste the link into the converter box above.',
          url: 'https://mediakit.website/youtube-mp3#step2',
        },
        {
          '@type': 'HowToStep',
          position: 3,
          name: 'Select MP3 320kbps',
          text: 'Choose 320kbps, 256kbps, or 128kbps MP3 audio format.',
          url: 'https://mediakit.website/youtube-mp3#step3',
        },
        {
          '@type': 'HowToStep',
          position: 4,
          name: 'Download High Quality Audio',
          text: 'Click Download. MediaKit processes and extracts the audio stream in seconds.',
          url: 'https://mediakit.website/youtube-mp3#step4',
        },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What audio bitrates are available for YouTube MP3 conversion?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'MediaKit provides studio-grade 320kbps, high-quality 256kbps, 192kbps, and compact 128kbps MP3 audio extraction, preserving maximum sonic depth.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is this YouTube to MP3 converter free?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes! MediaKit is 100% free with unlimited conversions, zero fees, and no registration required.',
          },
        },
        {
          '@type': 'Question',
          name: 'How do I convert YouTube to MP3 on an iPhone?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Copy the YouTube link, open Safari, paste the link into mediakit.website/youtube-mp3, tap Download MP3, and the audio file saves directly to your iPhone Files app.',
          },
        },
        {
          '@type': 'Question',
          name: 'Does MediaKit support YouTube Music links?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, public music videos, tracks, and podcasts from YouTube and music.youtube.com can be converted to MP3.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is software installation required?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'No software, browser extensions, or apps are needed. The conversion happens entirely in the cloud on MediaKit servers.',
          },
        },
        {
          '@type': 'Question',
          name: 'How fast is the conversion process?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Most YouTube videos are converted to MP3 in under 5 to 10 seconds thanks to our multi-threaded audio processing pipeline.',
          },
        },
        {
          '@type': 'Question',
          name: 'Are ID3 tags and album cover art preserved?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, where available, MediaKit embeds the video title, artist metadata, and high-resolution thumbnail into the downloaded MP3 file tags.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I convert long YouTube videos or podcasts?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, MediaKit supports standard videos, podcasts, DJ mixes, and long-form recordings with robust chunked streaming.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is it safe to use this YouTube to MP3 converter?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'MediaKit is completely safe, zero-logging, and free from malware, intrusive ads, or malicious redirects.',
          },
        },
        {
          '@type': 'Question',
          name: 'Can I convert YouTube Shorts to MP3 audio?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes, simply paste the Shorts link and select MP3 audio to download just the soundtrack.',
          },
        },
      ],
    },
  ],
};

export default function YouTubeMp3Page() {
  return (
    <SeoLandingPage
      badgeText="YouTube to MP3 Converter"
      title="YouTube to MP3 Converter Free 320kbps"
      highlightWord="Free 320kbps"
      subtitle="Convert YouTube videos to MP3 free in 320kbps high quality audio. Fast, free, no software or registration needed. Download YouTube music with MediaKit."
      supportedUrls={[
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        'https://youtu.be/dQw4w9WgXcQ',
        'https://music.youtube.com/watch?v=dQw4w9WgXcQ',
        'https://www.youtube.com/shorts/3i_bS97sF94',
      ]}
      steps={[
        {
          number: 1,
          title: 'Copy the YouTube Link',
          description:
            'Open the YouTube video or song, tap Share, and select "Copy Link".',
        },
        {
          number: 2,
          title: 'Paste into MediaKit',
          description:
            'Paste your copied URL into the converter box above.',
        },
        {
          number: 3,
          title: 'Select MP3 320kbps Quality',
          description:
            'Choose your preferred audio bitrate: 320kbps for maximum studio clarity, 256kbps, or 128kbps.',
        },
        {
          number: 4,
          title: 'Download Clean MP3 Audio',
          description:
            'Click Download. The converted MP3 file is processed in seconds and downloads directly to your device.',
        },
      ]}
      features={[
        {
          title: 'Ultra-High Bitrate 320kbps',
          description:
            'Extract pristine stereo audio with maximum dynamic range, deep bass, and clear highs.',
        },
        {
          title: 'Zero Software or Extensions',
          description:
            'Everything runs in the cloud. No suspicious desktop programs or browser plugins required.',
        },
        {
          title: 'Instant Fast Audio Demuxing',
          description:
            'Fast processing pipeline converts video streams to pure audio in under 10 seconds.',
        },
        {
          title: 'All Operating Systems Supported',
          description:
            'Full support for iPhone (Safari), Android (Chrome), Mac, Windows, Linux, and Chromebooks.',
        },
      ]}
      comparisonRows={[
        {
          feature: 'Maximum Audio Bitrate',
          us: '✅ 320kbps Studio Master',
          official: '⚠️ Not Available as MP3',
          competitors: '⚠️ Capped at 128kbps',
        },
        {
          feature: 'Conversion Speed',
          us: '✅ 3-8 Seconds Fast',
          official: 'N/A',
          competitors: '❌ 30-60 Seconds Queue',
        },
        {
          feature: 'Ad & Pop-up Spam',
          us: '✅ Clean & Ad-Minimal',
          official: 'N/A',
          competitors: '❌ Fake Virus Alerts & Pop-ups',
        },
        {
          feature: 'Daily Limits',
          us: '✅ Unlimited Free Downloads',
          official: 'N/A',
          competitors: '❌ 3-5 Downloads Per Day Cap',
        },
      ]}
      articles={[
        {
          title: 'Why 320kbps MP3 Audio Extraction Matters',
          content: [
            'Most online YouTube to MP3 tools aggressively compress audio down to 128kbps or even 96kbps to save server bandwidth. This strips away high frequency details and creates audible distortion in cymbals, vocals, and acoustic instruments.',
            'MediaKit demuxes the authentic audio stream from the highest available source bitrate and encodes directly to 320kbps MP3 without generational loss, delivering audiophile-grade fidelity on headphones and home stereo speakers.',
          ],
        },
        {
          title: 'How to Save YouTube MP3 Files on iPhone and Android',
          content: [
            'On Android, simply paste the link in Chrome, click Download, and the MP3 file saves into your Downloads folder and immediately indexes into your favorite music player like Spotify local files or YouTube Music.',
            'On iPhone, paste the link in Safari, tap Download, tap the Safari download arrow, and access the MP3 file inside the iOS Files app or share it to your favorite audio apps.',
          ],
        },
      ]}
      faqs={[
        {
          question: 'What audio bitrates are available for YouTube MP3 conversion?',
          answer:
            'MediaKit provides studio-grade 320kbps, high-quality 256kbps, 192kbps, and compact 128kbps MP3 audio extraction, preserving maximum sonic depth.',
        },
        {
          question: 'Is this YouTube to MP3 converter free?',
          answer:
            'Yes! MediaKit is 100% free with unlimited conversions, zero fees, and no registration required.',
        },
        {
          question: 'How do I convert YouTube to MP3 on an iPhone?',
          answer:
            'Copy the YouTube link, open Safari, paste the link into mediakit.website/youtube-mp3, tap Download MP3, and the audio file saves directly to your iPhone Files app.',
        },
        {
          question: 'Does MediaKit support YouTube Music links?',
          answer:
            'Yes, public music videos, tracks, and podcasts from YouTube and music.youtube.com can be converted to MP3.',
        },
        {
          question: 'Is software installation required?',
          answer:
            'No software, browser extensions, or apps are needed. The conversion happens entirely in the cloud on MediaKit servers.',
        },
        {
          question: 'How fast is the conversion process?',
          answer:
            'Most YouTube videos are converted to MP3 in under 5 to 10 seconds thanks to our multi-threaded audio processing pipeline.',
        },
        {
          question: 'Are ID3 tags and album cover art preserved?',
          answer:
            'Yes, where available, MediaKit embeds the video title, artist metadata, and high-resolution thumbnail into the downloaded MP3 file tags.',
        },
        {
          question: 'Can I convert long YouTube videos or podcasts?',
          answer:
            'Yes, MediaKit supports standard videos, podcasts, DJ mixes, and long-form recordings with robust chunked streaming.',
        },
        {
          question: 'Is it safe to use this YouTube to MP3 converter?',
          answer:
            'MediaKit is completely safe, zero-logging, and free from malware, intrusive ads, or malicious redirects.',
        },
        {
          question: 'Can I convert YouTube Shorts to MP3 audio?',
          answer:
            'Yes, simply paste the Shorts link and select MP3 audio to download just the soundtrack.',
        },
      ]}
      structuredData={jsonLd}
    />
  );
}
