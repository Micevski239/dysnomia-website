import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

function getSessionId(): string {
  let id = sessionStorage.getItem('pv_session');
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem('pv_session', id);
  }
  return id;
}

export function usePageTracking() {
  const location = useLocation();
  const lastTrackedPath = useRef<string>('');

  useEffect(() => {
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
  }, [location.pathname]);
}
