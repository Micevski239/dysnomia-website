import { useState } from 'react';
import { Link } from 'react-router-dom';
import { InstagramIcon, FacebookIcon, PinterestIcon } from './Icons';
import { useBreakpoint } from '../../hooks/useBreakpoint';

const footerLinks = {
  gallery: [
    { label: 'Artworks', href: '/artworks' },
    { label: 'Collections', href: '/collections' },
    { label: 'Limited Edition', href: '/limited-edition' },
    { label: 'New Arrivals', href: '/new-arrivals' }
  ],
  discover: [
    { label: 'Artists', href: '/artists' },
    { label: 'Contemporary', href: '/collections/contemporary' },
    { label: 'Abstract', href: '/collections/abstract' },
    { label: 'Home Décor', href: '/collections/home-decor' }
  ],
  about: [
    { label: 'Our Story', href: '/about' },
    { label: 'Sustainability', href: '/sustainability' },
    { label: 'Quality & Materials', href: '/quality' },
    { label: 'Reviews', href: '/reviews' }
  ],
  support: [
    { label: 'Contact Us', href: '/contact' },
    { label: 'Shipping & Delivery', href: '/shipping' },
    { label: 'Returns & Refunds', href: '/returns' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Privacy Policy', href: '/privacy' }
  ]
};

export default function Footer() {
  const [email, setEmail] = useState('');
  const { isMobile, isTablet } = useBreakpoint();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Newsletter signup:', email);
    setEmail('');
  };

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
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : isTablet ? 'repeat(3, 1fr)' : 'repeat(5, 1fr)',
            gap: 'clamp(24px, 4vw, 48px)'
          }}
        >
          {/* Gallery */}
          <div>
            <h3 style={headingStyle}>GALLERY</h3>
            {footerLinks.gallery.map((link) => (
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

          {/* Discover */}
          <div>
            <h3 style={headingStyle}>DISCOVER</h3>
            {footerLinks.discover.map((link) => (
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
            <h3 style={headingStyle}>ABOUT DYSNOMIA</h3>
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

          {/* Newsletter */}
          <div>
            <h3 style={headingStyle}>STAY INSPIRED</h3>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '16px', lineHeight: 1.6 }}>
              Subscribe for exclusive collections, new arrivals, and art inspiration.
            </p>
            <form onSubmit={handleSubmit} style={{ display: 'flex' }} id="newsletter">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  fontSize: '13px',
                  backgroundColor: '#1A1A1A',
                  border: '1px solid #2A2A2A',
                  color: '#FFFFFF',
                  outline: 'none'
                }}
                required
              />
              <button
                type="submit"
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#FBBE63',
                  color: '#0A0A0A',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#E5A84D';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FBBE63';
                }}
              >
                JOIN
              </button>
            </form>

            {/* Social Links */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginTop: '24px' }}>
              <a
                href="https://instagram.com"
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
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com"
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
                <FacebookIcon className="w-4 h-4" />
              </a>
              <a
                href="https://pinterest.com"
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
                <PinterestIcon className="w-4 h-4" />
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
}
