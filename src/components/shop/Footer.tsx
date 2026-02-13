import { memo } from 'react';
import { Link } from 'react-router-dom';
import { InstagramIcon, FacebookIcon } from './Icons';
import { useBreakpoint } from '../../hooks/useBreakpoint';

const footerLinks = {
  shop: [
    { label: 'All Artworks', href: '/shop' },
    { label: 'Collections', href: '/collections' },
    { label: 'New Arrivals', href: '/new-arrivals' },
    { label: 'Top Sellers', href: '/top-sellers' }
  ],
  about: [
    { label: 'About Us', href: '/about' }
  ],
  support: [
    { label: 'Contact Us', href: '/contact' },
    { label: 'Shipping & Delivery', href: '/shipping' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Privacy Policy', href: '/privacy' }
  ]
};

export default memo(function Footer() {
  const { isMobile, isTablet } = useBreakpoint();

  const linkStyle: React.CSSProperties = {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.7)',
    textDecoration: 'none',
    display: 'block',
    marginBottom: '10px',
    transition: 'color 0.2s'
  };

  const headingStyle: React.CSSProperties = {
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '2px',
    textTransform: 'uppercase',
    color: '#FBBE63',
    marginBottom: '20px'
  };

  return (
    <footer style={{ backgroundColor: '#0A0A0A', borderTop: '1px solid #1A1A1A' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: `clamp(32px, 6vw, 64px) clamp(16px, 4vw, 48px)` }}>
        {/* Main Footer Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : isTablet ? 'repeat(3, 1fr)' : 'repeat(4, 1fr)',
            gap: 'clamp(24px, 4vw, 48px)'
          }}
        >
          {/* Shop */}
          <div>
            <h3 style={headingStyle}>SHOP</h3>
            {footerLinks.shop.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                style={linkStyle}
                onMouseEnter={(e) => e.currentTarget.style.color = '#FBBE63'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* About Dysnomia */}
          <div>
            <h3 style={headingStyle}>ABOUT</h3>
            {footerLinks.about.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                style={linkStyle}
                onMouseEnter={(e) => e.currentTarget.style.color = '#FBBE63'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Support */}
          <div>
            <h3 style={headingStyle}>SUPPORT</h3>
            {footerLinks.support.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                style={linkStyle}
                onMouseEnter={(e) => e.currentTarget.style.color = '#FBBE63'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Connect */}
          <div>
            <h3 style={headingStyle}>CONNECT</h3>

            {/* Email */}
            <a
              href="mailto:contact_dysnomia@yahoo.com"
              style={{
                ...linkStyle,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#FBBE63'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
            >
              contact_dysnomia@yahoo.com
            </a>

            {/* Social Links */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '16px' }}>
              <a
                href="https://www.instagram.com/dysnomia_art.gallery666/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: 'rgba(255,255,255,0.6)',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#FBBE63'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
              >
                <InstagramIcon className="w-5 h-5" />
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61575933645818"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: 'rgba(255,255,255,0.6)',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#FBBE63'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
              >
                <FacebookIcon className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div
          style={{
            marginTop: '56px',
            paddingTop: '32px',
            borderTop: '1px solid #1A1A1A',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px'
          }}
        >
          {/* Country Selector */}
          <button
            style={{
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '1px',
              color: 'rgba(255,255,255,0.5)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#FBBE63'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
          >
            EU | EUR
          </button>

          {/* Logo */}
          <Link
            to="/"
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '32px',
              fontWeight: 600,
              color: '#FBBE63',
              textDecoration: 'none',
              letterSpacing: '4px',
              textTransform: 'uppercase'
            }}
          >
            DYSNOMIA
          </Link>

          {/* Tagline */}
          <p
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '14px',
              color: 'rgba(255,255,255,0.5)',
              letterSpacing: '3px',
              fontStyle: 'italic'
            }}
          >
            Art • Design • Lifestyle
          </p>

          {/* Copyright */}
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
            Copyright {new Date().getFullYear()} Dysnomia Art Gallery. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
});
