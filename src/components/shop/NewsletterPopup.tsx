import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../../hooks/useLanguage';
import { hasSeenNewsletterPopup, markNewsletterPopupSeen } from '../../hooks/useNewsletterForm';
import NewsletterInline from './NewsletterInline';

const SHOW_AFTER_MS = 8000;

// Never interrupt checkout, sign-in or account pages.
const EXCLUDED_PATHS = ['/cart', '/checkout', '/order-confirmation', '/login', '/register', '/forgot-password', '/reset-password', '/unsubscribe', '/account'];

/** Newsletter invitation shown once per browser, a few seconds into the first visit. */
export default function NewsletterPopup() {
  const { t } = useLanguage();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  const excluded = EXCLUDED_PATHS.some((path) => pathname.startsWith(path));

  useEffect(() => {
    if (excluded || hasSeenNewsletterPopup()) return;
    const timer = window.setTimeout(() => {
      // Re-check: the visitor may have signed up in the footer meanwhile.
      if (hasSeenNewsletterPopup()) return;
      markNewsletterPopupSeen();
      setOpen(true);
    }, SHOW_AFTER_MS);
    return () => window.clearTimeout(timer);
  }, [excluded]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  if (!open) return null;

  return (
    <div
      onClick={() => setOpen(false)}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1100,
        backgroundColor: 'rgba(10,10,10,0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t('newsletter.popupTitle')}
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '520px',
          maxHeight: '90vh',
          overflowY: 'auto',
          backgroundColor: '#FFFFFF',
          borderRadius: '32px',
          padding: 'clamp(36px, 6vw, 48px) clamp(24px, 5vw, 44px) clamp(28px, 5vw, 40px)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.25)',
        }}
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label={t('newsletter.popupClose')}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            border: 'none',
            backgroundColor: '#FAFAFA',
            color: '#0A0A0A',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        <NewsletterInline
          source="popup"
          variant="plain"
          title={t('newsletter.popupTitle')}
          description={t('newsletter.popupText')}
        />

        <button
          type="button"
          onClick={() => setOpen(false)}
          style={{
            display: 'block',
            margin: '20px auto 0',
            background: 'none',
            border: 'none',
            fontSize: '13px',
            color: '#666666',
            textDecoration: 'underline',
            cursor: 'pointer',
          }}
        >
          {t('newsletter.popupDismiss')}
        </button>
      </div>
    </div>
  );
}
