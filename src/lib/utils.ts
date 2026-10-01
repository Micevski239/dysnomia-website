/** Macedonian Cyrillic (plus common Russian/Serbian letters) → Latin. Keys are lowercase. */
const CYRILLIC_TO_LATIN: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', ѓ: 'gj', е: 'e', ж: 'zh', з: 'z', ѕ: 'dz',
  и: 'i', ј: 'j', к: 'k', л: 'l', љ: 'lj', м: 'm', н: 'n', њ: 'nj', о: 'o', п: 'p',
  р: 'r', с: 's', т: 't', ќ: 'kj', у: 'u', ф: 'f', х: 'h', ц: 'c', ч: 'ch', џ: 'dzh',
  ш: 'sh',
  // Russian / Serbian
  й: 'y', ы: 'y', э: 'e', ю: 'yu', я: 'ya', ё: 'yo', ъ: '', ь: '', щ: 'shch',
  ђ: 'dj', ћ: 'c',
  // Latin letters that don't decompose via NFD
  đ: 'dj', ß: 'ss', æ: 'ae', ø: 'o', œ: 'oe', ł: 'l',
};

/** Short deterministic base36 hash, used as a slug fallback. */
function shortHash(input: string): string {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (Math.imul(31, h) + input.charCodeAt(i)) | 0;
  }
  return (h >>> 0).toString(36);
}

/**
 * Builds a URL slug. Cyrillic is transliterated to Latin first, so Cyrillic-only
 * titles produce a meaningful slug. For non-blank input it never returns '' (falls
 * back to `item-<hash>`); blank input returns '' so slug inputs can be cleared.
 */
export function generateSlug(title: string): string {
  const lower = title.toLowerCase().trim();
  if (!lower) return '';

  const transliterated = Array.from(lower)
    .map((ch) => CYRILLIC_TO_LATIN[ch] ?? ch)
    .join('')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

  const slug = transliterated
    .replace(/[^a-z0-9\s_-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug || `item-${shortHash(lower)}`;
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Convert a Supabase storage URL to its thumbnail variant.
 * e.g. .../product-images/abc.webp → .../product-images/thumbnails/abc.webp
 */
export function getThumbnailUrl(url: string | null | undefined): string {
  if (!url) return '';
  const marker = '/product-images/';
  const idx = url.lastIndexOf(marker);
  if (idx === -1) return url;
  return url.slice(0, idx + marker.length) + 'thumbnails/' + url.slice(idx + marker.length);
}
