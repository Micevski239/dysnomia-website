// Safe wrappers around Web Storage. Accessing localStorage/sessionStorage can
// throw (Safari private mode, blocked cookies, quota exceeded, sandboxed
// iframes), so every access goes through try/catch and degrades to a no-op.

type StorageKind = 'local' | 'session';

function getStore(kind: StorageKind): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return kind === 'local' ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

export function storageGet(kind: StorageKind, key: string): string | null {
  try {
    return getStore(kind)?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

export function storageSet(kind: StorageKind, key: string, value: string): boolean {
  try {
    const store = getStore(kind);
    if (!store) return false;
    store.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function storageRemove(kind: StorageKind, key: string): void {
  try {
    getStore(kind)?.removeItem(key);
  } catch {
    // ignore
  }
}

/** crypto.randomUUID with a Math.random-based fallback for older browsers (e.g. iOS < 15.4). */
export function randomId(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
  } catch {
    // fall through to the fallback below
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
