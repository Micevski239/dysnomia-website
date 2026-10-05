import { Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { LanguageProvider } from './context/LanguageContext';
import { CurrencyProvider } from './context/CurrencyContext';
import ProtectedRoute from './components/ProtectedRoute';
import ShopLayoutWrapper from './components/shop/ShopLayoutWrapper';
import ScrollToTop from './components/ScrollToTop';
import { PageErrorBoundary } from './components/ErrorBoundary';
import { lazyWithReload } from './lib/chunkReload';

// Lazy loaded components for code splitting
const ShopHome = lazyWithReload(() => import('./pages/ShopHome'));
const Shop = lazyWithReload(() => import('./pages/Shop'));
const Collections = lazyWithReload(() => import('./pages/Collections'));
const CollectionShowcase = lazyWithReload(() => import('./pages/CollectionShowcase'));
const NewArrivals = lazyWithReload(() => import('./pages/NewArrivals'));
const KidsPictures = lazyWithReload(() => import('./pages/KidsPictures'));
const TopSellers = lazyWithReload(() => import('./pages/TopSellers'));
const About = lazyWithReload(() => import('./pages/About'));
const AdminLayout = lazyWithReload(() => import('./components/AdminLayout'));
const ProductDetail = lazyWithReload(() => import('./pages/ProductDetail'));
const Login = lazyWithReload(() => import('./pages/admin/Login'));
const Dashboard = lazyWithReload(() => import('./pages/admin/Dashboard'));
const ProductForm = lazyWithReload(() => import('./pages/admin/ProductForm'));
const ProductsList = lazyWithReload(() => import('./pages/admin/ProductsList'));
const CollectionsList = lazyWithReload(() => import('./pages/admin/CollectionsList'));
const CollectionForm = lazyWithReload(() => import('./pages/admin/CollectionForm'));
const NotFound = lazyWithReload(() => import('./pages/NotFound'));

// E-commerce pages
const Cart = lazyWithReload(() => import('./pages/Cart'));
const Checkout = lazyWithReload(() => import('./pages/Checkout'));
const OrderConfirmation = lazyWithReload(() => import('./pages/OrderConfirmation'));

// Account pages
const CustomerLogin = lazyWithReload(() => import('./pages/auth/Login'));
const Register = lazyWithReload(() => import('./pages/auth/Register'));
const ForgotPassword = lazyWithReload(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = lazyWithReload(() => import('./pages/auth/ResetPassword'));
const AccountDashboard = lazyWithReload(() => import('./pages/account/Dashboard'));
const AccountOrders = lazyWithReload(() => import('./pages/account/Orders'));
const AccountWishlist = lazyWithReload(() => import('./pages/account/Wishlist'));
const AccountSettings = lazyWithReload(() => import('./pages/account/Settings'));

// Admin pages
const OrdersList = lazyWithReload(() => import('./pages/admin/OrdersList'));
const OrderDetail = lazyWithReload(() => import('./pages/admin/OrderDetail'));
const ReviewsList = lazyWithReload(() => import('./pages/admin/ReviewsList'));
const FeaturedManager = lazyWithReload(() => import('./pages/admin/FeaturedManager'));
const Announcements = lazyWithReload(() => import('./pages/admin/Announcements'));
const Blog = lazyWithReload(() => import('./pages/Blog'));
const BlogPostPage = lazyWithReload(() => import('./pages/BlogPost'));
const BlogAdmin = lazyWithReload(() => import('./pages/admin/BlogAdmin'));
const ArtScena = lazyWithReload(() => import('./pages/ArtScena'));
const Exhibition = lazyWithReload(() => import('./pages/Exhibition'));
const ArtScenaAdmin = lazyWithReload(() => import('./pages/admin/ArtScenaAdmin'));
const ImageOptimizer = lazyWithReload(() => import('./pages/admin/ImageOptimizer'));
const Statistics = lazyWithReload(() => import('./pages/admin/Statistics'));

// Support pages
const Contact = lazyWithReload(() => import('./pages/Contact'));
const Shipping = lazyWithReload(() => import('./pages/Shipping'));
const FAQ = lazyWithReload(() => import('./pages/FAQ'));
const Privacy = lazyWithReload(() => import('./pages/Privacy'));
const Unsubscribe = lazyWithReload(() => import('./pages/Unsubscribe'));
const NewsletterSubscribers = lazyWithReload(() => import('./pages/admin/NewsletterSubscribers'));

// Loading fallback component
import DysnomiaLoader from './components/shop/DysnomiaLoader';

function PageLoader() {
  return <DysnomiaLoader />;
}

/**
 * If the reset-password URL is not in Supabase's redirect allow-list, the e-mail
 * link lands on the home page instead. Send the visitor to the form either way.
 */
// Read at module load: Supabase strips the token from the URL shortly afterwards.
const openedFromRecoveryLink = window.location.hash.includes('type=recovery');

function PasswordRecoveryRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    // The PASSWORD_RECOVERY event can fire before this effect subscribes.
    if (openedFromRecoveryLink && window.location.pathname !== '/reset-password') {
      navigate('/reset-password', { replace: true });
    }
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') navigate('/reset-password', { replace: true });
    });
    return () => subscription.unsubscribe();
  }, [navigate]);
  return null;
}

function App() {
  return (
    <LanguageProvider>
      <CurrencyProvider>
        <CartProvider>
          <WishlistProvider>
            <AuthProvider>
              <BrowserRouter>
                <ScrollToTop />
                <PasswordRecoveryRedirect />
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    {/* Public Shop Routes */}
                    <Route element={<ShopLayoutWrapper />}>
              <Route path="/" element={<ShopHome />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/collections" element={<Collections />} />
              <Route path="/collections/:slug" element={<CollectionShowcase />} />
              <Route
                path="/artwork/:slug"
                element={
                  <PageErrorBoundary>
                    <ProductDetail />
                  </PageErrorBoundary>
                }
              />
              <Route path="/about" element={<About />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPostPage />} />
              <Route path="/art-scena" element={<ArtScena />} />
              <Route path="/art-scena/:slug" element={<Exhibition />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/shipping" element={<Shipping />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/unsubscribe" element={<Unsubscribe />} />
              <Route path="/posters" element={<Navigate to="/shop" replace />} />
              <Route path="/frames" element={<Navigate to="/shop" replace />} />
              <Route path="/new-arrivals" element={<NewArrivals />} />
              <Route path="/kids-pictures" element={<KidsPictures />} />
              <Route path="/top-sellers" element={<TopSellers />} />
              <Route path="/kids" element={<Navigate to="/kids-pictures" replace />} />
              <Route path="/inspiration" element={<Navigate to="/shop" replace />} />
              <Route path="/business" element={<Navigate to="/shop" replace />} />
              <Route path="/artists" element={<Navigate to="/shop" replace />} />
              <Route path="/stories" element={<Navigate to="/shop" replace />} />

              {/* E-commerce Routes */}
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />

              {/* Customer Auth Routes */}
              <Route path="/login" element={<CustomerLogin />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Account Routes */}
              <Route path="/account" element={<AccountDashboard />} />
              <Route path="/account/orders" element={<AccountOrders />} />
              <Route path="/account/wishlist" element={<AccountWishlist />} />
              <Route path="/account/settings" element={<AccountSettings />} />

              <Route path="*" element={<NotFound />} />
            </Route>

            {/* Admin Login */}
            <Route path="/admin" element={<Login />} />

            {/* Protected Admin Routes */}
            <Route
              element={
                <ProtectedRoute>
                  <PageErrorBoundary>
                    <AdminLayout />
                  </PageErrorBoundary>
                </ProtectedRoute>
              }
            >
              <Route path="/admin/dashboard" element={<Dashboard />} />
              <Route path="/admin/products" element={<ProductsList />} />
              <Route path="/admin/products/new" element={<ProductForm />} />
              <Route path="/admin/products/:id/edit" element={<ProductForm />} />
              <Route path="/admin/collections" element={<CollectionsList />} />
              <Route path="/admin/collections/new" element={<CollectionForm />} />
              <Route path="/admin/collections/:id/edit" element={<CollectionForm />} />
              <Route path="/admin/orders" element={<OrdersList />} />
              <Route path="/admin/orders/:id" element={<OrderDetail />} />
              <Route path="/admin/reviews" element={<ReviewsList />} />
              <Route path="/admin/featured" element={<FeaturedManager />} />
              <Route path="/admin/announcements" element={<Announcements />} />
              <Route path="/admin/blog" element={<BlogAdmin />} />
              <Route path="/admin/art-scena" element={<ArtScenaAdmin />} />
              <Route path="/admin/images" element={<ImageOptimizer />} />
              <Route path="/admin/statistics" element={<Statistics />} />
              <Route path="/admin/newsletter" element={<NewsletterSubscribers />} />
            </Route>
          </Routes>
                </Suspense>
              </BrowserRouter>
            </AuthProvider>
          </WishlistProvider>
        </CartProvider>
      </CurrencyProvider>
    </LanguageProvider>
  );
}

export default App;
