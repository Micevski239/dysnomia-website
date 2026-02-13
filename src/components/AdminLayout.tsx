import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { Search, Menu, X } from 'lucide-react';
import GlobalSearch from './admin/GlobalSearch';

export default function AdminLayout() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isMobileOrTablet } = useBreakpoint();

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { path: '/admin/orders', label: 'Orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
    { path: '/admin/products', label: 'Products', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
    { path: '/admin/products/new', label: 'Add Product', icon: 'M12 4v16m8-8H4' },
    { path: '/admin/collections', label: 'Collections', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    { path: '/admin/collections/new', label: 'Add Collection', icon: 'M12 4v16m8-8H4' },
    { path: '/admin/reviews', label: 'Reviews', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
    { path: '/admin/featured', label: 'Featured', icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z' },
    { path: '/admin/announcements', label: 'Announcements', icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z' },
    { path: '/admin/blog', label: 'Blog', icon: 'M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z' },
  ];

  const isActive = (path: string) => {
    if (path === '/admin/dashboard') return location.pathname === '/admin/dashboard';
    if (path === '/admin/products') return location.pathname === '/admin/products';
    if (path === '/admin/collections') return location.pathname === '/admin/collections';
    if (path === '/admin/orders') return location.pathname === '/admin/orders' || location.pathname.startsWith('/admin/orders/');
    if (path === '/admin/reviews') return location.pathname === '/admin/reviews';
    if (path === '/admin/featured') return location.pathname === '/admin/featured';
    if (path === '/admin/announcements') return location.pathname === '/admin/announcements';
    if (path === '/admin/blog') return location.pathname === '/admin/blog';
    return location.pathname.startsWith(path);
  };

  // Close sidebar when navigating on mobile
  useEffect(() => {
    if (isMobileOrTablet) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobileOrTablet]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F2F2F2' }}>
      {/* Header */}
      <header style={{ backgroundColor: '#0A0A0A', color: '#FFFFFF' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: `0 clamp(16px, 3vw, 32px)` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {isMobileOrTablet && (
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '44px',
                    height: '44px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#FFFFFF',
                    cursor: 'pointer',
                  }}
                >
                  <Menu style={{ width: '24px', height: '24px' }} />
                </button>
              )}
              <Link
                to="/"
                style={{
                  fontSize: '20px',
                  fontWeight: 500,
                  letterSpacing: '0.15em',
                  color: '#FFFFFF',
                  textDecoration: 'none',
                  fontFamily: "'Playfair Display', Georgia, serif",
                }}
              >
                DYSNOMIA
              </Link>
              {!isMobileOrTablet && (
                <>
                  <span style={{ color: 'rgba(255,255,255,0.3)' }}>|</span>
                  <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>Admin Panel</span>
                </>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: isMobileOrTablet ? '8px' : '16px' }}>
              <button
                onClick={() => setSearchOpen(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  padding: isMobileOrTablet ? '10px' : '8px 16px',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '10px',
                  fontSize: '14px',
                  color: 'rgba(255,255,255,0.7)',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s',
                  minWidth: '44px',
                  minHeight: '44px',
                }}
              >
                <Search style={{ width: '16px', height: '16px' }} />
                {!isMobileOrTablet && (
                  <>
                    Search
                    <kbd style={{
                      padding: '2px 8px',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontFamily: 'monospace',
                      border: '1px solid rgba(255,255,255,0.15)',
                    }}>
                      ⌘K
                    </kbd>
                  </>
                )}
              </button>
              {!isMobileOrTablet && (
                <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>{user?.email}</span>
              )}
              <button
                onClick={handleSignOut}
                style={{
                  fontSize: '14px',
                  color: 'rgba(255,255,255,0.6)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: isMobileOrTablet ? '10px' : '0',
                  minWidth: isMobileOrTablet ? '44px' : 'auto',
                  minHeight: isMobileOrTablet ? '44px' : 'auto',
                }}
              >
                {isMobileOrTablet ? 'Out' : 'Sign Out'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {isMobileOrTablet && sidebarOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 40,
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: `clamp(24px, 4vw, 40px) clamp(16px, 3vw, 32px)` }}>
        <div style={{ display: 'flex', gap: 'clamp(24px, 4vw, 40px)' }}>
          {/* Sidebar */}
          <aside style={{
            width: '260px',
            flexShrink: 0,
            ...(isMobileOrTablet ? {
              position: 'fixed',
              top: 0,
              left: sidebarOpen ? 0 : '-280px',
              bottom: 0,
              zIndex: 50,
              backgroundColor: '#F2F2F2',
              padding: '24px 16px',
              transition: 'left 0.3s ease',
              overflowY: 'auto',
            } : {}),
          }}>
            {isMobileOrTablet && (
              <button
                onClick={() => setSidebarOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '44px',
                  height: '44px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  marginBottom: '16px',
                  marginLeft: 'auto',
                }}
              >
                <X style={{ width: '24px', height: '24px' }} />
              </button>
            )}
            <nav style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E8E8E8',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)',
              padding: '24px',
            }}>
              <p style={{
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.2em',
                color: '#AAAAAA',
                fontWeight: 700,
                marginBottom: '20px',
                paddingLeft: '16px',
              }}>
                Menu
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {navItems.map((item) => {
                  const active = isActive(item.path);
                  return (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '14px',
                          padding: '12px 16px',
                          borderRadius: '12px',
                          fontSize: '15px',
                          fontWeight: active ? 600 : 400,
                          color: active ? '#0A0A0A' : '#777777',
                          backgroundColor: active ? '#FBBE63' : 'transparent',
                          textDecoration: 'none',
                          transition: 'all 0.15s',
                        }}
                      >
                        <svg
                          style={{ width: '20px', height: '20px', flexShrink: 0 }}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                        </svg>
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div style={{
              marginTop: '24px',
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E8E8E8',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)',
              padding: '24px',
            }}>
              <Link
                to="/"
                target="_blank"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: '14px',
                  color: '#777777',
                  textDecoration: 'none',
                }}
              >
                <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                View Gallery
              </Link>
            </div>
          </aside>

          {/* Main */}
          <main style={{ flex: 1, minWidth: 0 }}>
            <Outlet />
          </main>
        </div>
      </div>

      <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
