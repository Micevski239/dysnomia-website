import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function AdminLayout() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin');
  };

  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { path: '/admin/products', label: 'Products', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
    { path: '/admin/products/new', label: 'Add Product', icon: 'M12 4v16m8-8H4' },
    { path: '/admin/collections', label: 'Collections', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    { path: '/admin/collections/new', label: 'Add Collection', icon: 'M12 4v16m8-8H4' },
  ];

  const isActive = (path: string) => {
    if (path === '/admin/dashboard') return location.pathname === '/admin/dashboard';
    if (path === '/admin/products') return location.pathname === '/admin/products';
    if (path === '/admin/collections') return location.pathname === '/admin/collections';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Admin Header */}
      <header className="bg-[#0A0A0A] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="text-xl font-medium tracking-[0.15em] hover:text-[#FBBE63] transition-colors"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                DYSNOMIA
              </Link>
              <span className="text-white/40">|</span>
              <span className="text-sm text-white/70">Admin Panel</span>
            </div>
            <div className="flex items-center gap-6">
              <span className="text-sm text-white/70">{user?.email}</span>
              <button
                onClick={handleSignOut}
                className="text-sm text-white/70 hover:text-white transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar */}
          <aside className="lg:w-72 flex-shrink-0">
            <nav className="bg-white rounded-2xl shadow-sm border border-[#E5E5E5] p-5">
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#999999] mb-4 px-4">
                Menu
              </p>
              <ul className="space-y-1">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all text-[15px] ${
                        isActive(item.path)
                          ? 'bg-[#FBBE63] text-[#0A0A0A] font-medium'
                          : 'text-[#666666] hover:bg-[#F5F5F5] hover:text-[#0A0A0A]'
                      }`}
                    >
                      <svg
                        className="w-5 h-5 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d={item.icon}
                        />
                      </svg>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Quick link to public site */}
            <div className="mt-5 bg-white rounded-2xl shadow-sm border border-[#E5E5E5] p-5">
              <Link
                to="/"
                target="_blank"
                className="flex items-center gap-3 text-[14px] text-[#666666] hover:text-[#FBBE63] transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
                View Gallery
              </Link>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
