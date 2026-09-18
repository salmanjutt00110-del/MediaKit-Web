import { DetectionResult, PlatformType } from './types';

// Maximum supported input length
export const MAX_URL_LENGTH = 2048;

// Common tracking parameters safely stripped across platforms
const TRACKING_PARAMS = new Set([
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'fbclid',
  'igshid',
  'si',
  'feature',
  'ref',
  'ref_src',
  'ref_url',
  'mibextid',
  'rdid',
  '_hsenc',
  '_hsmi',
  'mc_cid',
  'mc_eid',
]);

// Dangerous protocols to immediately reject
const DANGEROUS_PROTOCOLS = ['javascript:', 'data:', 'file:', 'blob:', 'vbscript:', 'about:'];

/**
 * Normalizes harmless URL differences (protocols, tracking params, trailing slashes)
 * while strictly preserving the canonical content identifiers.
 */
export function normalizeUrl(rawUrl: string): { normalizedUrl: string; isValid: boolean; error?: string } {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { normalizedUrl: '', isValid: false, error: 'Please enter a valid link.' };
  }

  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return { normalizedUrl: '', isValid: false, error: 'Please enter a valid link.' };
  }

  if (trimmed.length > MAX_URL_LENGTH) {
    return { normalizedUrl: '', isValid: false, error: 'Link exceeds maximum supported length.' };
  }

  const lowerTrimmed = trimmed.toLowerCase();
  for (const protocol of DANGEROUS_PROTOCOLS) {
    if (lowerTrimmed.startsWith(protocol)) {
      return { normalizedUrl: '', isValid: false, error: 'Invalid URL protocol.' };
    }
  }

  let urlWithProto = trimmed;
  if (!/^https?:\/\//i.test(urlWithProto)) {
    urlWithProto = `https://${urlWithProto}`;
  }

  // If user accidentally pasted two URLs back-to-back (e.g. url1https://url2)
  const secondHttpIndex = urlWithProto.slice(8).search(/https?:\/\//i);
  if (secondHttpIndex !== -1) {
    urlWithProto = urlWithProto.slice(0, secondHttpIndex + 8);
  }

  let parsed: URL;
  try {
    parsed = new URL(urlWithProto);
  } catch {
    return { normalizedUrl: trimmed, isValid: false, error: 'That link doesn\'t look valid.' };
  }

  // Enforce https
  parsed.protocol = 'https:';

  // Strip safe tracking parameters
  const paramsToDelete: string[] = [];
  parsed.searchParams.forEach((_, key) => {
    if (TRACKING_PARAMS.has(key.toLowerCase()) || key.toLowerCase().startsWith('utm_')) {
      paramsToDelete.push(key);
    }
  });
  paramsToDelete.forEach((key) => parsed.searchParams.delete(key));

  // Normalize hostname (lowercase, strip www)
  let hostname = parsed.hostname.toLowerCase();
  if (hostname.startsWith('www.')) {
    hostname = hostname.substring(4);
    parsed.hostname = hostname;
  }

  // Reject random words without dots as non-URLs
  if (!hostname.includes('.') && hostname !== 'localhost') {
    return { normalizedUrl: trimmed, isValid: false, error: "That link doesn't look valid." };
  }

  // Clean trailing slash for clean paths (except root /)
  if (parsed.pathname.length > 1 && parsed.pathname.endsWith('/')) {
    parsed.pathname = parsed.pathname.slice(0, -1);
  }

  // Canonicalize YouTube video links (strip mix/playlist clutter like &list=RD... &index=...)
  if (hostname === 'youtube.com' || hostname.endsWith('.youtube.com') || hostname === 'youtu.be') {
    if (parsed.searchParams.has('v')) {
      const vid = parsed.searchParams.get('v');
      parsed.pathname = '/watch';
      parsed.search = `?v=${vid}`;
    } else if (hostname === 'youtu.be') {
      parsed.search = '';
    }
  }

  return { normalizedUrl: parsed.toString(), isValid: true };
}

/**
 * Validates and detects the platform of any provided media URL.
 * Automatically normalizes prefixes and cleans up tracking parameters.
 */
export function detectPlatform(rawUrl: string): DetectionResult {
  const norm = normalizeUrl(rawUrl);

  if (!norm.isValid) {
    return {
      platform: 'unknown',
      valid: false,
      normalizedUrl: norm.normalizedUrl || rawUrl,
      originalUrl: rawUrl,
      error: norm.error || 'Please enter a valid link.',
      errorCode: 'INVALID_URL',
    };
  }

  let parsed: URL;
  try {
    parsed = new URL(norm.normalizedUrl);
  } catch {
    return {
      platform: 'unknown',
      valid: false,
      normalizedUrl: norm.normalizedUrl,
      originalUrl: rawUrl,
      error: 'That link doesn\'t look valid.',
      errorCode: 'INVALID_URL',
    };
  }

  const hostname = parsed.hostname.toLowerCase();

  // 1. YouTube Detection
  const isYouTubeHost =
    hostname === 'youtube.com' ||
    hostname.endsWith('.youtube.com') ||
    hostname === 'youtu.be' ||
    hostname === 'youtube-nocookie.com';

  if (isYouTubeHost) {
    return {
      platform: 'youtube',
      valid: true,
      normalizedUrl: norm.normalizedUrl,
      originalUrl: rawUrl,
    };
  }

  // 2. TikTok Detection
  const isTikTokHost =
    hostname === 'tiktok.com' ||
    hostname.endsWith('.tiktok.com') ||
    hostname === 'vm.tiktok.com' ||
    hostname === 'vt.tiktok.com';

  if (isTikTokHost) {
    let normalized = norm.normalizedUrl;
    try {
      const parsedUrl = new URL(normalized);
      if (parsedUrl.hostname === 'tiktok.com') {
        parsedUrl.hostname = 'www.tiktok.com';
        normalized = parsedUrl.toString();
      }
    } catch {}

    return {
      platform: 'tiktok',
      valid: true,
      normalizedUrl: normalized,
      originalUrl: rawUrl,
    };
  }

  // 3. Facebook Detection
  const isFacebookHost =
    hostname === 'facebook.com' ||
    hostname.endsWith('.facebook.com') ||
    hostname === 'fb.watch' ||
    hostname === 'fb.com' ||
    hostname.endsWith('.fb.com');

  if (isFacebookHost) {
    return {
      platform: 'facebook',
      valid: true,
      normalizedUrl: norm.normalizedUrl,
      originalUrl: rawUrl,
    };
  }

  // 4. Instagram Detection
  const isInstagramHost =
    hostname === 'instagram.com' ||
    hostname.endsWith('.instagram.com') ||
    hostname === 'instagr.am';

  if (isInstagramHost) {
    return {
      platform: 'instagram',
      valid: true,
      normalizedUrl: norm.normalizedUrl,
      originalUrl: rawUrl,
    };
  }

  // 5. Pinterest Detection
  const isPinterestHost =
    hostname === 'pinterest.com' ||
    hostname.endsWith('.pinterest.com') ||
    hostname === 'pin.it' ||
    hostname.endsWith('.pin.it');

  if (isPinterestHost) {
    return {
      platform: 'pinterest',
      valid: true,
      normalizedUrl: norm.normalizedUrl,
      originalUrl: rawUrl,
    };
  }

  // Valid URL structure but unsupported platform
  return {
    platform: 'unknown',
    valid: false,
    normalizedUrl: norm.normalizedUrl,
    originalUrl: rawUrl,
    error: 'Sorry, this platform isn\'t supported yet.',
    errorCode: 'UNSUPPORTED_PLATFORM',
  };
}

export function getPlatformDisplayName(platform: PlatformType): string {
  switch (platform) {
    case 'youtube':
      return 'YouTube';
    case 'tiktok':
      return 'TikTok';
    case 'facebook':
      return 'Facebook';
    case 'instagram':
      return 'Instagram';
    case 'pinterest':
      return 'Pinterest';
    default:
      return 'Unknown';
  }
}
