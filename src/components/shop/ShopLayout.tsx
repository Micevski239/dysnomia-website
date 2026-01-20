import { Outlet } from 'react-router-dom';
import AnnouncementBar from './AnnouncementBar';
import Header from './Header';
import Footer from './Footer';
import CookieConsent from './CookieConsent';

interface ShopLayoutProps {
  cartCount?: number;
  wishlistCount?: number;
}

export default function ShopLayout({ cartCount = 0, wishlistCount = 0 }: ShopLayoutProps) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Sticky Announcement Bar */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50 }}>
        <AnnouncementBar />
      </div>

      {/* Header */}
      <Header cartCount={cartCount} wishlistCount={wishlistCount} />

      {/* Main Content */}
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />

      {/* Cookie Consent */}
      <CookieConsent />
    </div>
  );
}
