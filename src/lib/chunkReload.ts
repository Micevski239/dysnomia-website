import { lazy, type ComponentType } from 'react';
import { storageGet, storageSet } from './storage';

// After a deploy, tabs that are still open reference old hashed chunk files that
// no longer exist. Importing them fails; reloading once fetches the new build.

const RELOAD_FLAG_KEY = 'dysnomia_chunk_reload_at';
// A second failure within this window means the reload didn't help — stop retrying.
const RELOAD_WINDOW_MS = 10_000;

export function isChunkLoadError(error: unknown): boolean {
  if (!error) return false;
  const name = (error as { name?: string }).name ?? '';
  const message = String((error as { message?: string }).message ?? error);
  return (
    name === 'ChunkLoadError' ||
    /Failed to fetch dynamically imported module/i.test(message) ||
    /error loading dynamically imported module/i.test(message) ||
    /Importing a module script failed/i.test(message) ||
    /Loading (CSS )?chunk [\w-]+ failed/i.test(message) ||
    /Unable to preload CSS/i.test(message)
  );
}

/**
 * Reload the page once to pick up a new deployment. Returns true if a reload
 * was triggered, false if we already reloaded recently (or storage is blocked
 * and we can't remember that we did — then we don't risk a reload loop).
 */
export function reloadOnceForChunkError(): boolean {
  if (typeof window === 'undefined') return false;
  const last = Number(storageGet('session', RELOAD_FLAG_KEY) || 0);
  if (last && Date.now() - last < RELOAD_WINDOW_MS) return false;
  if (!storageSet('session', RELOAD_FLAG_KEY, String(Date.now()))) return false;
  window.location.reload();
  return true;
}

/** React.lazy wrapper that reloads the page once when a chunk fails to load. */
export function lazyWithReload<T extends ComponentType<any>>( // eslint-disable-line @typescript-eslint/no-explicit-any
  factory: () => Promise<{ default: T }>
) {
  return lazy(() =>
    factory().catch((error: unknown) => {
      if (isChunkLoadError(error) && reloadOnceForChunkError()) {
        // Keep Suspense showing its fallback until the reload happens.
        return new Promise<{ default: T }>(() => {});
      }
      throw error;
    })
  );
}
