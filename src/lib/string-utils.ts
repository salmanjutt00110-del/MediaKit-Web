/**
 * Decodes HTML entities and cleans up messy titles from social media scrapers.
 */
export function cleanAndDecodeTitle(raw?: string): string {
  if (!raw) return 'Media File';
  let str = raw.trim();

  // 1. Remove engagement prefixes like "14 reactions | ", "250 likes | "
  str = str.replace(/^[\d,.]+[kKmM]?\s+(?:reactions?|likes?|views?|comments?)\s*\|\s*/i, '');

  // 2. Decode hex entities: &#x64a;
  str = str.replace(/&#x([0-9a-fA-F]+);?/g, (_, hex) => {
    try {
      return String.fromCodePoint(parseInt(hex, 16));
    } catch {
      return '';
    }
  });

  // 3. Decode decimal entities: &#1234;
  str = str.replace(/&#([0-9]+);?/g, (_, dec) => {
    try {
      return String.fromCodePoint(parseInt(dec, 10));
    } catch {
      return '';
    }
  });

  // 4. Decode named entities
  str = str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ');

  // 5. Clean up stray entity semicolons between decoded words
  str = str.replace(/;+/g, ' ');

  // 6. Clean trailing platform branding
  str = str
    .replace(/\s*\|\s*(?:Facebook|TikTok|Instagram|YouTube)$/i, '')
    .replace(/\s+/g, ' ')
    .trim();

  // 7. Prevent extreme runaway title lengths (> 150 chars)
  if (str.length > 150) {
    str = str.slice(0, 147).trim() + '...';
  }

  return str || 'Media File';
}

const WINDOWS_RESERVED_NAMES = new Set([
  'CON', 'PRN', 'AUX', 'NUL',
  'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
  'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9',
]);

/**
 * Sanitizes any raw title and extension into a safe, valid filesystem and attachment filename.
 * Rules:
 * - Removes path traversal (.., /, \)
 * - Removes illegal filesystem characters (< > : " / \ | ? * and null bytes)
 * - Removes control characters (0x00-0x1F, 0x7F-0x9F)
 * - Normalizes whitespace
 * - Preserves useful Unicode where safe
 * - Strips duplicate/existing extensions
 * - Protects against Windows reserved device names (CON, AUX, etc.)
 * - Enforces safe max filename length (up to 100 characters before extension)
 * - Guarantees safe final lowercase extension
 */
export function sanitizeFilename(title: string, ext: string = 'mp4', maxLength: number = 100): string {
  const safeExt = (ext || 'mp4')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 8) || 'mp4';

  let clean = (title || 'media')
    // Remove control characters and non-printable characters
    .replace(/[\x00-\x1f\x7f-\x9f]/g, '')
    // Remove directory traversal characters
    .replace(/\.{2,}/g, '.')
    // Remove illegal filesystem characters
    .replace(/[<>:"/\\|?*]/g, '_')
    // Normalize consecutive underscores/spaces
    .replace(/[\t\r\n]+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/_+/g, '_')
    .trim();

  // Strip leading/trailing dots, dashes, and underscores
  clean = clean.replace(/^[._-]+|[._-]+$/g, '').trim();

  // Remove existing extension if already matching or common media extension
  clean = clean.replace(new RegExp(`\\.${safeExt}$`, 'i'), '');
  clean = clean.replace(/\.(mp4|webm|mkv|m4a|mp3|aac|opus|jpg|jpeg|png|webp)$/i, '');
  clean = clean.replace(/^[._-]+|[._-]+$/g, '').trim();

  if (!clean) {
    clean = 'media';
  }

  // Handle Windows reserved device names
  if (WINDOWS_RESERVED_NAMES.has(clean.toUpperCase())) {
    clean = `_${clean}`;
  }

  // Enforce maximum length before extension
  if (clean.length > maxLength) {
    clean = clean.slice(0, maxLength).trim();
  }

  return `${clean}.${safeExt}`;
}

/**
 * Generates an ASCII-only safe filename for standard HTTP Content-Disposition headers.
 */
export function sanitizeAsciiFilename(title: string, ext: string = 'mp4', maxLength: number = 80): string {
  const safeExt = (ext || 'mp4')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 8) || 'mp4';

  let clean = (title || 'media')
    .replace(/[^a-zA-Z0-9_\-\s]/g, '')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .trim();

  clean = clean.replace(/^[._-]+|[._-]+$/g, '').trim();
  clean = clean.replace(new RegExp(`\\.${safeExt}$`, 'i'), '');
  clean = clean.replace(/\.(mp4|webm|mkv|m4a|mp3|aac|opus|jpg|jpeg|png|webp)$/i, '');
  clean = clean.replace(/^[._-]+|[._-]+$/g, '').trim();

  if (!clean) {
    clean = 'media';
  }

  if (WINDOWS_RESERVED_NAMES.has(clean.toUpperCase())) {
    clean = `_${clean}`;
  }

  if (clean.length > maxLength) {
    clean = clean.slice(0, maxLength).trim();
  }

  return `${clean}.${safeExt}`;
}

/**
 * Validates if a hostname or IP is a private, loopback, or cloud-metadata address (SSRF prevention).
 */
export function isPrivateHost(host: string): boolean {
  const h = host.toLowerCase().trim();

  if (
    h === 'localhost' ||
    h === '127.0.0.1' ||
    h === '0.0.0.0' ||
    h === '::1' ||
    h.endsWith('.local') ||
    h.endsWith('.internal') ||
    h.endsWith('.lan')
  ) {
    return true;
  }

  // Check IPv4 private/reserved ranges
  const ipv4Match = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4Match) {
    const a = Number(ipv4Match[1]);
    const b = Number(ipv4Match[2]);
    if (
      a === 0 || // 0.0.0.0/8
      a === 10 || // 10.0.0.0/8
      a === 127 || // 127.0.0.0/8
      (a === 172 && b >= 16 && b <= 31) || // 172.16.0.0/12
      (a === 192 && b === 168) || // 192.168.0.0/16
      (a === 169 && b === 254) // 169.254.0.0/16 (Link Local / Cloud Metadata)
    ) {
      return true;
    }
  }

  // Check IPv6 private/link-local
  if (h.startsWith('[') && h.endsWith(']')) {
    const ipv6 = h.slice(1, -1).toLowerCase();
    if (
      ipv6 === '::1' ||
      ipv6.startsWith('fe80:') ||
      ipv6.startsWith('fc') ||
      ipv6.startsWith('fd') ||
      ipv6.includes('127.0.0.1')
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Checks if a full URL is safe from SSRF attacks.
 */
export function isSafeUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;
    return !isPrivateHost(parsed.hostname);
  } catch {
    return false;
  }
}

/**
 * Probes the remote media URL via HEAD request to obtain the real Content-Length.
 * Never invents or estimates size if the server doesn't provide it.
 */
export async function probeUrlSize(url?: string): Promise<string | undefined> {
  if (!url || !url.startsWith('http') || !isSafeUrl(url)) return undefined;
  try {
    const headers: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    };
    if (url.includes('getmyfb') || url.includes('ssscdn')) {
      headers['Referer'] = 'https://getmyfb.com/';
    }
    const res = await fetch(url, {
      method: 'HEAD',
      headers,
      signal: AbortSignal.timeout(3000),
    });
    const len = Number(res.headers.get('content-length'));
    if (len && len > 0 && !isNaN(len)) {
      const mb = len / (1024 * 1024);
      return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.round(len / 1024)} KB`;
    }
  } catch {}
  return undefined;
}
