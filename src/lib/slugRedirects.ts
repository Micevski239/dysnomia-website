import { supabase } from './supabase';

export type SlugRedirectEntity = 'product' | 'collection' | 'blog';

const MAX_HOPS = 3;

/**
 * Look up the current slug for an entity whose slug was renamed. Rows in
 * `slug_redirects` are created by DB triggers whenever a slug changes. Follows
 * rename chains (a → b → c) up to MAX_HOPS and returns the final slug, or null
 * when there is no redirect (or the chain loops back to the original slug).
 */
export async function resolveSlugRedirect(entity: SlugRedirectEntity, slug: string): Promise<string | null> {
  const visited = new Set<string>([slug]);
  let current = slug;
  let resolved: string | null = null;

  for (let hop = 0; hop < MAX_HOPS; hop++) {
    const { data, error } = await supabase
      .from('slug_redirects')
      .select('new_slug')
      .eq('entity', entity)
      .eq('old_slug', current)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data?.new_slug) break;
    const next = data.new_slug as string;
    if (visited.has(next)) break;
    visited.add(next);
    resolved = next;
    current = next;
  }

  return resolved;
}
