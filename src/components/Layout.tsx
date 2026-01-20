import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function Layout() {
  const [scrolled, setScrolled] = useState(false);
  const [_mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff' }}>
      {/* Header */}
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          transition: 'all 0.3s',
          backgroundColor: scrolled || !isHome ? 'rgba(255,255,255,0.97)' : 'transparent',
          borderBottom: scrolled || !isHome ? '1px solid #e5e5e5' : 'none',
          boxShadow: scrolled ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: scrolled ? '64px' : '80px', transition: 'height 0.3s' }}>
            {/* Logo */}
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
              <span style={{ color: '#B8860B', fontWeight: 600, letterSpacing: '0.1em', fontSize: scrolled ? '18px' : '20px', transition: 'font-size 0.3s' }}>
                DYSNOMIA
              </span>
              <span style={{ color: isHome && !scrolled ? 'rgba(255,255,255,0.7)' : '#6b6b6b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                Art Gallery
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
              <Link
                to="/"
                style={{ color: isHome && !scrolled ? '#ffffff' : '#1a1a1a', fontSize: '14px', fontWeight: 500, letterSpacing: '0.02em', textDecoration: 'none' }}
              >
                Gallery
              </Link>
              <a
                href="#gallery"
                style={{ color: isHome && !scrolled ? '#ffffff' : '#1a1a1a', fontSize: '14px', fontWeight: 500, letterSpacing: '0.02em', textDecoration: 'none' }}
              >
                Collection
              </a>
              <Link
                to="/admin"
                style={{
                  padding: '8px 20px',
                  border: `1px solid ${isHome && !scrolled ? 'rgba(255,255,255,0.3)' : '#e5e5e5'}`,
                  color: isHome && !scrolled ? '#ffffff' : '#1a1a1a',
                  fontSize: '14px',
                  fontWeight: 500,
                  letterSpacing: '0.02em',
                  textDecoration: 'none'
                }}
              >
                Admin
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Spacer for non-home pages */}
      {!isHome && <div style={{ height: '64px' }} />}

      {/* Main */}
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer style={{ backgroundColor: '#1a1a1a', width: '100%' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '64px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '48px' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <h3 style={{ color: '#B8860B', fontSize: '20px', fontWeight: 600, letterSpacing: '0.1em', marginBottom: '16px' }}>
                DYSNOMIA
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', lineHeight: 1.7, maxWidth: '400px' }}>
                Curating extraordinary artworks that inspire and transform spaces.
                Each piece in our collection tells a unique story.
              </p>
            </div>

            <div>
              <h4 style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '16px' }}>
                Navigation
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Link to="/" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', textDecoration: 'none' }}>Home</Link>
                <a href="#gallery" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', textDecoration: 'none' }}>Collection</a>
                <Link to="/admin" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', textDecoration: 'none' }}>Admin</Link>
              </div>
            </div>

            <div>
              <h4 style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '16px' }}>
                Contact
              </h4>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', marginBottom: '8px' }}>Inquiries & Commissions</p>
              <a href="mailto:hello@dysnomia.art" style={{ color: '#B8860B', fontSize: '14px', textDecoration: 'none' }}>
                hello@dysnomia.art
              </a>
            </div>
          </div>

          <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>
              &copy; {new Date().getFullYear()} Dysnomia Art Gallery. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
