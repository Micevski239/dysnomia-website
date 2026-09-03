import { memo } from 'react';
import { Link } from 'react-router-dom';
import { InstagramIcon, FacebookIcon } from './Icons';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { useLanguage } from '../../hooks/useLanguage';

const footerLinks = {
  shop: [
    { labelKey: 'footer.allArtworks', href: '/shop' },
    { labelKey: 'common.collections', href: '/collections' },
    { labelKey: 'common.newArrivals', href: '/new-arrivals' },
    { labelKey: 'common.topSellers', href: '/top-sellers' }
  ],
  about: [
    { labelKey: 'common.aboutDysnomia', href: '/about' },
    { labelKey: 'common.ourProducts', href: '/shop' }
  ],
  support: [
    { labelKey: 'about.contactUs', href: '/contact' },
    { labelKey: 'footer.shippingPolicy', href: '/shipping' },
    { labelKey: 'footer.returnPolicy', href: '/shipping' }
  ]
};

export default memo(function Footer() {
  const { isMobile, isTablet } = useBreakpoint();
  const { t } = useLanguage();

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
            <h3 style={headingStyle}>{t('footer.shop')}</h3>
            {footerLinks.shop.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                style={linkStyle}
                onMouseEnter={(e) => e.currentTarget.style.color = '#FBBE63'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
              >
                {t(link.labelKey)}
              </Link>
            ))}
          </div>

          {/* About Dysnomia */}
          <div>
            <h3 style={headingStyle}>{t('footer.about')}</h3>
            {footerLinks.about.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                style={linkStyle}
                onMouseEnter={(e) => e.currentTarget.style.color = '#FBBE63'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
              >
                {t(link.labelKey)}
              </Link>
            ))}
          </div>

          {/* Support */}
          <div>
            <h3 style={headingStyle}>{t('footer.support')}</h3>
            {footerLinks.support.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                style={linkStyle}
                onMouseEnter={(e) => e.currentTarget.style.color = '#FBBE63'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
              >
                {t(link.labelKey)}
              </Link>
            ))}
          </div>

          {/* Connect */}
          <div>
            <h3 style={headingStyle}>{t('footer.connect')}</h3>

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
            {t('home.tagline')}
          </p>

          {/* Copyright */}
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>
            {t('footer.copyright')} {new Date().getFullYear()} {t('footer.rightsReserved')}
          </p>
        </div>
      </div>
    </footer>
  );
});
