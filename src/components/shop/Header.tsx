import { useState, useEffect, useMemo, useRef, memo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HeartIcon, UserIcon, BagIcon, MenuIcon, CloseIcon } from './Icons';
import { useLanguage } from '../../hooks/useLanguage';
import { useCurrency } from '../../hooks/useCurrency';
import { useAuthContext } from '../../context/AuthContext';
import { useBreakpoint } from '../../hooks/useBreakpoint';

interface HeaderProps {
  cartCount?: number;
  wishlistCount?: number;
}

export default memo(function Header({ cartCount = 0, wishlistCount = 0 }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';
  const { language, setLanguage, t } = useLanguage();
  const { currency, setCurrency } = useCurrency();
  const { user } = useAuthContext();
  const { isMobile } = useBreakpoint();

  const navItems = useMemo(() => [
    { label: t('common.home'), href: '/' },
    { label: t('common.shop'), href: '/shop' },
    { label: t('common.collections'), href: '/collections' },
    { label: t('common.newArrivals'), href: '/new-arrivals' },
    { label: t('common.topSellers'), href: '/top-sellers' },
    { label: t('common.blog'), href: '/blog' },
    { label: t('common.aboutUs'), href: '/about' },
  ], [t]);

  // Throttled scroll listener
  const ticking = useRef(false);
  useEffect(() => {
    const handleScroll = () => {
      if (!ticking.current) {
        ticking.current = true;
        requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 50);
          ticking.current = false;
        });
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // White theme with black text, gold accents
  const headerBg = isHome && !isScrolled ? 'transparent' : '#FFFFFF';
  const textColor = isHome && !isScrolled ? '#FFFFFF' : '#0A0A0A';
  const borderColor = isHome && !isScrolled ? 'transparent' : '#E5E5E5';
  const logoColor = isHome && !isScrolled ? '#FBBE63' : '#0A0A0A';

  return (
    <header
      style={{
        position: isMobile ? 'sticky' : 'fixed',
        top: '35px',
        left: 0,
        right: 0,
        zIndex: 40,
        transition: 'all 0.3s',
        backgroundColor: headerBg,
        borderBottom: `1px solid ${borderColor}`,
        height: '47px',
        ...(isMobile ? { marginBottom: '-82px' } : {})
      }}
    >
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 clamp(16px, 4vw, 48px)',
          height: '100%'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '100%'
          }}
        >
          {/* Logo - DYSNOMIA */}
          <Link
            to="/"
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '20px',
              fontWeight: 600,
              color: logoColor,
              textDecoration: 'none',
              letterSpacing: '3px',
              textTransform: 'uppercase'
            }}
          >
            DYSNOMIA
          </Link>

          {/* Desktop Navigation */}
          <nav
            className="desktop-only"
            style={{
              alignItems: 'center',
              gap: '28px'
            }}
          >
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  color: textColor,
                  textDecoration: 'none',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#FBBE63'}
                onMouseLeave={(e) => e.currentTarget.style.color = textColor}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Side Icons */}
          <div className="header-icons" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <Link
              to="/account/wishlist"
              style={{
                position: 'relative',
                color: textColor,
                textDecoration: 'none',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#FBBE63'}
              onMouseLeave={(e) => e.currentTarget.style.color = textColor}
            >
              <HeartIcon className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    width: '16px',
                    height: '16px',
                    backgroundColor: '#FBBE63',
                    color: '#0A0A0A',
                    fontSize: '10px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700
                  }}
                >
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link
              to={user ? '/account' : '/login'}
              style={{
                color: textColor,
                textDecoration: 'none',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#FBBE63'}
              onMouseLeave={(e) => e.currentTarget.style.color = textColor}
            >
              <UserIcon className="w-5 h-5" />
            </Link>

            <Link
              to="/cart"
              style={{
                position: 'relative',
                color: textColor,
                textDecoration: 'none',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#FBBE63'}
              onMouseLeave={(e) => e.currentTarget.style.color = textColor}
            >
              <BagIcon className="w-5 h-5" />
              {cartCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    width: '16px',
                    height: '16px',
                    backgroundColor: '#FBBE63',
                    color: '#0A0A0A',
                    fontSize: '10px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700
                  }}
                >
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Language/Currency Selector */}
            <div className="desktop-only" style={{ alignItems: 'center', gap: '4px', marginLeft: '8px' }}>
              <button
                onClick={() => setLanguage(language === 'en' ? 'mk' : 'en')}
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '1px',
                  color: isHome && !isScrolled ? 'rgba(255,255,255,0.7)' : '#666666',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  textTransform: 'uppercase',
                }}
              >
                {language}
              </button>
              <span style={{ color: isHome && !isScrolled ? 'rgba(255,255,255,0.4)' : '#cccccc' }}>|</span>
              <button
                onClick={() => setCurrency(currency === 'EUR' ? 'MKD' : 'EUR')}
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '1px',
                  color: isHome && !isScrolled ? 'rgba(255,255,255,0.7)' : '#666666',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                {currency}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="mobile-only"
              style={{
                color: textColor,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                minWidth: '44px',
                minHeight: '44px',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          opacity: mobileMenuOpen ? 1 : 0,
          visibility: mobileMenuOpen ? 'visible' : 'hidden',
          transition: 'opacity 0.3s, visibility 0.3s',
          zIndex: 49
        }}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Mobile Menu - Slide from Left */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: '280px',
          maxWidth: '80vw',
          backgroundColor: '#FFFFFF',
          boxShadow: '4px 0 20px rgba(0,0,0,0.15)',
          padding: '56px 24px 24px',
          transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease-in-out',
          zIndex: 50,
          overflowY: 'auto'
        }}
      >
        {/* Close Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <span
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '18px',
              fontWeight: 600,
              color: '#0A0A0A',
              letterSpacing: '2px'
            }}
          >
            MENU
          </span>
          <button
            onClick={() => setMobileMenuOpen(false)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              color: '#0A0A0A'
            }}
          >
            <CloseIcon />
          </button>
        </div>

        <nav>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {navItems.map((item) => (
              <li
                key={item.label}
                style={{
                  borderBottom: '1px solid #E5E5E5',
                  padding: '16px 0'
                }}
              >
                <Link
                  to={item.href}
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    color: '#0A0A0A',
                    textDecoration: 'none',
                    transition: 'color 0.2s'
                  }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Language/Currency in Mobile Menu */}
        <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #E5E5E5' }}>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button
              onClick={() => setLanguage(language === 'en' ? 'mk' : 'en')}
              style={{
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '1px',
                color: '#666666',
                background: 'none',
                border: '1px solid #E5E5E5',
                padding: '8px 16px',
                cursor: 'pointer',
                textTransform: 'uppercase'
              }}
            >
              {language === 'en' ? 'MK' : 'EN'}
            </button>
            <button
              onClick={() => setCurrency(currency === 'EUR' ? 'MKD' : 'EUR')}
              style={{
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '1px',
                color: '#666666',
                background: 'none',
                border: '1px solid #E5E5E5',
                padding: '8px 16px',
                cursor: 'pointer'
              }}
            >
              {currency === 'EUR' ? 'MKD' : 'EUR'}
            </button>
          </div>
        </div>
      </div>

    </header>
  );
});
