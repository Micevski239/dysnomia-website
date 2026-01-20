import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SearchIcon, HeartIcon, UserIcon, BagIcon, MenuIcon, CloseIcon } from './Icons';

const navItems = [
  { label: 'HOME', href: '/' },
  { label: 'SHOP', href: '/shop' },
  { label: 'COLLECTIONS', href: '/collections' },
  { label: 'NEW ARRIVALS', href: '/new-arrivals' },
  { label: 'ABOUT', href: '/about' },
];

interface HeaderProps {
  cartCount?: number;
  wishlistCount?: number;
}

export default function Header({ cartCount = 0, wishlistCount = 0 }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
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
        position: 'fixed',
        top: '35px',
        left: 0,
        right: 0,
        zIndex: 40,
        transition: 'all 0.3s',
        backgroundColor: headerBg,
        borderBottom: `1px solid ${borderColor}`,
        height: '47px'
      }}
    >
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 48px',
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
            style={{
              display: 'flex',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: textColor,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#FBBE63'}
              onMouseLeave={(e) => e.currentTarget.style.color = textColor}
            >
              <SearchIcon className="w-4 h-4" />
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '1px',
                  textTransform: 'uppercase'
                }}
              >
                Search
              </span>
            </button>

            <Link
              to="/wishlist"
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
              to="/account"
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

            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '1px',
                color: isHome && !isScrolled ? 'rgba(255,255,255,0.7)' : '#666666',
                marginLeft: '8px'
              }}
            >
              EU | EUR
            </span>

            {/* Mobile Menu Button */}
            <button
              style={{
                display: 'none',
                color: textColor,
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: '#FFFFFF',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            padding: '24px',
            borderTop: '1px solid #E5E5E5'
          }}
        >
          <nav>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {navItems.map((item) => (
                <li
                  key={item.label}
                  style={{
                    borderBottom: '1px solid #E5E5E5',
                    padding: '12px 0'
                  }}
                >
                  <Link
                    to={item.href}
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      color: '#0A0A0A',
                      textDecoration: 'none',
                      transition: 'color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#FBBE63'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#0A0A0A'}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}
