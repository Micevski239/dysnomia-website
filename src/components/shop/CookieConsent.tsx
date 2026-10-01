import { useState, useEffect, type CSSProperties } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { getConsent, setConsent } from '../../lib/consent';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    if (!getConsent()) {
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleChoice = (choice: 'accepted' | 'declined') => {
    setConsent(choice);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  const buttonBase: CSSProperties = {
    padding: '10px 24px',
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '1px',
    textTransform: 'uppercase',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'background-color 0.2s, color 0.2s'
  };

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label={t('cookies.ariaLabel')}
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#0A0A0A',
        borderTop: '1px solid #2A2A2A',
        zIndex: 50,
        animation: 'slideUp 0.3s ease-out'
      }}
    >
      <style>
        {`
          @keyframes slideUp {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
        `}
      </style>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '16px clamp(16px, 4vw, 48px)' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap'
          }}
        >
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>
            {t('cookies.message')}{' '}
            <a
              href="/privacy"
              style={{
                textDecoration: 'underline',
                textUnderlineOffset: '2px',
                color: '#FBBE63'
              }}
            >
              {t('cookies.learnMore')}
            </a>
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => handleChoice('declined')}
              style={{
                ...buttonBase,
                backgroundColor: 'transparent',
                color: 'rgba(255,255,255,0.85)',
                border: '1px solid rgba(255,255,255,0.35)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#FFFFFF'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.85)'}
            >
              {t('cookies.decline')}
            </button>
            <button
              onClick={() => handleChoice('accepted')}
              style={{
                ...buttonBase,
                backgroundColor: '#FBBE63',
                color: '#0A0A0A',
                border: 'none'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E5A84D'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FBBE63'}
            >
              {t('cookies.accept')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
