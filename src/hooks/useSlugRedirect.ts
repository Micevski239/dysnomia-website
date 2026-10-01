import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { resolveSlugRedirect, type SlugRedirectEntity } from '../lib/slugRedirects';

/**
 * When a page's entity is not found, check `slug_redirects` for a renamed slug
 * and redirect (replace) to `${basePath}${newSlug}`, keeping the query string.
 * Returns true while the lookup is still pending, so the page can keep showing
 * its loading state instead of flashing "not found".
 */
export function useSlugRedirect(
  entity: SlugRedirectEntity,
  slug: string | undefined,
  notFound: boolean,
  basePath: string
): boolean {
  const navigate = useNavigate();
  const { search } = useLocation();
  const [checkedSlug, setCheckedSlug] = useState<string | null>(null);

  useEffect(() => {
    if (!notFound || !slug) return;
    let cancelled = false;
    resolveSlugRedirect(entity, slug)
      .catch(() => null)
      .then((newSlug) => {
        if (cancelled) return;
        if (newSlug && newSlug !== slug) {
          navigate(`${basePath}${newSlug}${search}`, { replace: true });
        } else {
          setCheckedSlug(slug);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [entity, slug, notFound, basePath, navigate, search]);

  return notFound && !!slug && checkedSlug !== slug;
}
