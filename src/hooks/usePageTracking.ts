import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { hasAnalyticsConsent, onConsentChange } from '../lib/consent';
import { storageGet, storageSet, randomId } from '../lib/storage';

// Fallback when sessionStorage is unavailable: one id per page load.
let memorySessionId: string | null = null;

function getSessionId(): string {
  let id = storageGet('session', 'pv_session');
  if (!id) {
    id = memorySessionId ?? randomId();
    memorySessionId = id;
    storageSet('session', 'pv_session', id);
  }
  return id;
}

export function usePageTracking() {
  const location = useLocation();
  const lastTrackedPath = useRef<string>('');
  const [consented, setConsented] = useState<boolean>(hasAnalyticsConsent);

  // Start (or stop) tracking as soon as the visitor answers the cookie banner.
  useEffect(() => onConsentChange((state) => setConsented(state === 'accepted')), []);

  useEffect(() => {
    // Page views are only recorded after the visitor accepted analytics cookies.
    if (!consented) return;

    const path = location.pathname;

    // Skip admin routes and duplicate tracking (React strict mode)
    if (path.startsWith('/admin') || path === lastTrackedPath.current) return;
    lastTrackedPath.current = path;

    supabase.from('page_views').insert({
      page_path: path,
      page_title: document.title,
      referrer: document.referrer || null,
      session_id: getSessionId(),
      user_agent: navigator.userAgent,
      screen_width: window.innerWidth,
    }).then(); // fire-and-forget
  }, [location.pathname, consented]);
}
