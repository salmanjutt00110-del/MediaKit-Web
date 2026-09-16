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
