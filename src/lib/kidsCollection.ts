import { supabase } from './supabase';

/**
 * Single source of truth for finding the kids collection.
 *
 * The "Kids Pictures" page used to look up `slug = 'kids'` only. When the slug
 * changed in the admin (it was `kid` once, then `kids`), the page silently showed
 * "No artworks found". We now accept every known alias and fall back to the
 * collection title, so renaming the collection can no longer empty the page.
 *
 * Keep this list in sync with supabase/migrations/009_october_2026_update.sql
 * and scripts/check-kids-collection.mjs.
 */
export const KIDS_COLLECTION_SLUGS = [
  'kids',
  'kid',
  'kids-pictures',
  'kids-room',
  'kids-posters',
  'kids-collection',
  'detski-sliki',
] as const;

const KIDS_TITLE_PATTERN = /\bkids?\b|детск|за деца/i;

interface CollectionLike {
  slug?: string | null;
  title?: string | null;
  title_mk?: string | null;
}

export function isKidsSlug(slug: string | null | undefined): boolean {
  if (!slug) return false;
  return (KIDS_COLLECTION_SLUGS as readonly string[]).includes(slug.toLowerCase());
}

export function isKidsCollection(collection: CollectionLike | null | undefined): boolean {
  if (!collection) return false;
  if (isKidsSlug(collection.slug)) return true;
  return KIDS_TITLE_PATTERN.test(collection.title || '') || KIDS_TITLE_PATTERN.test(collection.title_mk || '');
}

/** Pick the best kids collection: exact alias first (in priority order), then a title match. */
export function pickKidsCollection<T extends CollectionLike>(collections: T[]): T | null {
  for (const slug of KIDS_COLLECTION_SLUGS) {
    const match = collections.find((c) => c.slug?.toLowerCase() === slug);
    if (match) return match;
  }
  return collections.find((c) => isKidsCollection(c)) || null;
}

export async function fetchKidsCollectionId(): Promise<string | null> {
  const { data, error } = await supabase
    .from('collections')
    .select('id, slug, title, title_mk');

  if (error || !data) return null;
  return pickKidsCollection(data)?.id ?? null;
}
