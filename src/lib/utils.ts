export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
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
