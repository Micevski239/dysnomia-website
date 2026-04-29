import { Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import AnnouncementBar from './AnnouncementBar';
import Header from './Header';
import Footer from './Footer';
import CookieConsent from './CookieConsent';
import { useBreakpoint } from '../../hooks/useBreakpoint';

interface ShopLayoutProps {
  cartCount?: number;
  wishlistCount?: number;
}

export default function ShopLayout({ cartCount = 0, wishlistCount = 0 }: ShopLayoutProps) {
  const { isMobileOrTablet } = useBreakpoint();
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        style={{
          position: 'absolute',
          left: '-9999px',
          zIndex: 999,
          padding: '14px 24px',
          backgroundColor: '#0A0A0A',
          color: '#FFFFFF',
          textDecoration: 'none',
          fontSize: '14px',
          fontWeight: 500,
        }}
        onFocus={(e) => {
          e.currentTarget.style.left = '50%';
          e.currentTarget.style.transform = 'translateX(-50%)';
          e.currentTarget.style.top = '10px';
        }}
        onBlur={(e) => {
          e.currentTarget.style.left = '-9999px';
          e.currentTarget.style.transform = 'none';
          e.currentTarget.style.top = 'auto';
        }}
      >
        Skip to main content
      </a>

      {/* Announcement Bar: fixed on desktop, sticky on mobile */}
      <div style={{
        position: isMobileOrTablet ? 'sticky' : 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
      }}>
        <AnnouncementBar />
      </div>

      {/* Header */}
      <Header cartCount={cartCount} wishlistCount={wishlistCount} />

      {/* Main Content */}
      <main id="main-content" style={{ flex: 1 }} tabIndex={-1}>
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />

      {/* Cookie Consent */}
      <CookieConsent />

      {/* Scroll to top button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Scroll to top"
        style={{
          position: 'fixed',
          bottom: '32px',
          right: '32px',
          width: '44px',
          height: '44px',
          backgroundColor: '#0A0A0A',
          color: '#FFFFFF',
          border: 'none',
          borderRadius: '50%',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
          opacity: showScrollTop ? 1 : 0,
          pointerEvents: showScrollTop ? 'auto' : 'none',
          transform: showScrollTop ? 'translateY(0)' : 'translateY(12px)',
          transition: 'opacity 0.25s ease, transform 0.25s ease',
          zIndex: 200,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#FBBE63'; e.currentTarget.style.color = '#0A0A0A'; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#0A0A0A'; e.currentTarget.style.color = '#FFFFFF'; }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 15l-6-6-6 6" />
        </svg>
      </button>
    </div>
  );
}
