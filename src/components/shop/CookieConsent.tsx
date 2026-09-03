import { useState, useEffect } from 'react';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasConsented = localStorage.getItem('cookieConsent');
    if (!hasConsented) {
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
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
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '16px 48px' }}>
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
            We use cookies to improve our website and your shopping experience.{' '}
            <a
              href="/privacy"
              style={{
                textDecoration: 'underline',
                textUnderlineOffset: '2px',
                color: '#FBBE63'
              }}
            >
              Find out more
            </a>
          </p>
          <button
            onClick={handleAccept}
            style={{
              padding: '10px 24px',
              backgroundColor: '#FBBE63',
              color: '#0A0A0A',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E5A84D'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FBBE63'}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
