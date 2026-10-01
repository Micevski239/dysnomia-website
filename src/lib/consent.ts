import { storageGet, storageSet } from './storage';

// Cookie / analytics consent. Stored under the pre-existing 'cookieConsent' key;
// the legacy value 'true' (written by the old accept-only banner) counts as accepted.

export type ConsentState = 'accepted' | 'declined' | null;

const CONSENT_STORAGE_KEY = 'cookieConsent';
export const CONSENT_CHANGE_EVENT = 'dysnomia:consent-change';

// In-memory copy so a choice still applies for this page view when storage is blocked.
let memoryConsent: ConsentState = null;

export function getConsent(): ConsentState {
  const stored = storageGet('local', CONSENT_STORAGE_KEY);
  if (stored === 'accepted' || stored === 'true') return 'accepted';
  if (stored === 'declined') return 'declined';
  return memoryConsent;
}

export function setConsent(value: 'accepted' | 'declined'): void {
  memoryConsent = value;
  storageSet('local', CONSENT_STORAGE_KEY, value);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent<ConsentState>(CONSENT_CHANGE_EVENT, { detail: value }));
  }
}

export function hasAnalyticsConsent(): boolean {
  return getConsent() === 'accepted';
}

/** Subscribe to consent changes (same tab via custom event, other tabs via 'storage'). */
export function onConsentChange(callback: (state: ConsentState) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handleCustom = () => callback(getConsent());
  const handleStorage = (e: StorageEvent) => {
    if (e.key === CONSENT_STORAGE_KEY) callback(getConsent());
  };
  window.addEventListener(CONSENT_CHANGE_EVENT, handleCustom);
  window.addEventListener('storage', handleStorage);
  return () => {
    window.removeEventListener(CONSENT_CHANGE_EVENT, handleCustom);
    window.removeEventListener('storage', handleStorage);
  };
}
