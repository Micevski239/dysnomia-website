import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { LanguageProvider } from './context/LanguageContext';
import { CurrencyProvider } from './context/CurrencyContext';
import ProtectedRoute from './components/ProtectedRoute';
import ShopLayoutWrapper from './components/shop/ShopLayoutWrapper';
import ScrollToTop from './components/ScrollToTop';
import { PageErrorBoundary } from './components/ErrorBoundary';

// Lazy loaded components for code splitting
const ShopHome = lazy(() => import('./pages/ShopHome'));
const Shop = lazy(() => import('./pages/Shop'));
const Collections = lazy(() => import('./pages/Collections'));
const CollectionShowcase = lazy(() => import('./pages/CollectionShowcase'));
const NewArrivals = lazy(() => import('./pages/NewArrivals'));
const TopSellers = lazy(() => import('./pages/TopSellers'));
const About = lazy(() => import('./pages/About'));
const AdminLayout = lazy(() => import('./components/AdminLayout'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Login = lazy(() => import('./pages/admin/Login'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const ProductForm = lazy(() => import('./pages/admin/ProductForm'));
const ProductsList = lazy(() => import('./pages/admin/ProductsList'));
const CollectionsList = lazy(() => import('./pages/admin/CollectionsList'));
const CollectionForm = lazy(() => import('./pages/admin/CollectionForm'));
const NotFound = lazy(() => import('./pages/NotFound'));

// E-commerce pages
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderConfirmation = lazy(() => import('./pages/OrderConfirmation'));

// Account pages
const CustomerLogin = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const AccountDashboard = lazy(() => import('./pages/account/Dashboard'));
const AccountOrders = lazy(() => import('./pages/account/Orders'));
const AccountWishlist = lazy(() => import('./pages/account/Wishlist'));
const AccountSettings = lazy(() => import('./pages/account/Settings'));

// Admin pages
const OrdersList = lazy(() => import('./pages/admin/OrdersList'));
const OrderDetail = lazy(() => import('./pages/admin/OrderDetail'));
const ReviewsList = lazy(() => import('./pages/admin/ReviewsList'));
const FeaturedManager = lazy(() => import('./pages/admin/FeaturedManager'));

// Support pages
const Contact = lazy(() => import('./pages/Contact'));
const FAQ = lazy(() => import('./pages/FAQ'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Shipping = lazy(() => import('./pages/Shipping'));

// Loading fallback component
function PageLoader() {
  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: '40px',
          height: '40px',
          border: '3px solid #E5E5E5',
          borderTopColor: '#FBBE63',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}
      />
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
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
              <Route path="/contact" element={<Contact />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/shipping" element={<Shipping />} />
              <Route path="/posters" element={<ShopHome />} />
              <Route path="/frames" element={<ShopHome />} />
              <Route path="/new-arrivals" element={<NewArrivals />} />
              <Route path="/top-sellers" element={<TopSellers />} />
              <Route path="/kids" element={<ShopHome />} />
              <Route path="/inspiration" element={<ShopHome />} />
              <Route path="/business" element={<ShopHome />} />
              <Route path="/artists" element={<ShopHome />} />
              <Route path="/stories" element={<ShopHome />} />

              {/* E-commerce Routes */}
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />

              {/* Customer Auth Routes */}
              <Route path="/login" element={<CustomerLogin />} />
              <Route path="/register" element={<Register />} />

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
