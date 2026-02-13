import { Outlet } from 'react-router-dom';
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
  const { isMobile } = useBreakpoint();

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
        position: isMobile ? 'sticky' : 'fixed',
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
    </div>
  );
}
