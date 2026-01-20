import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AdminLayout from './components/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import ShopLayout from './components/shop/ShopLayout';
import ShopHome from './pages/ShopHome';
import Shop from './pages/Shop';
import Collections from './pages/Collections';
import CollectionShowcase from './pages/CollectionShowcase';
import ProductDetail from './pages/ProductDetail';
import NewArrivals from './pages/NewArrivals';
import About from './pages/About';
import Login from './pages/admin/Login';
import ProductForm from './pages/admin/ProductForm';
import ProductsList from './pages/admin/ProductsList';
import CollectionsList from './pages/admin/CollectionsList';
import CollectionForm from './pages/admin/CollectionForm';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Shop Routes */}
          <Route element={<ShopLayout cartCount={0} wishlistCount={0} />}>
            <Route path="/" element={<ShopHome />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/collections" element={<Collections />} />
            <Route path="/collections/:slug" element={<CollectionShowcase />} />
            <Route path="/artwork/:slug" element={<ProductDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/posters" element={<ShopHome />} />
            <Route path="/frames" element={<ShopHome />} />
            <Route path="/new-arrivals" element={<NewArrivals />} />
            <Route path="/top-sellers" element={<ShopHome />} />
            <Route path="/kids" element={<ShopHome />} />
            <Route path="/inspiration" element={<ShopHome />} />
            <Route path="/business" element={<ShopHome />} />
            <Route path="/artists" element={<ShopHome />} />
            <Route path="/stories" element={<ShopHome />} />
          </Route>

          {/* Admin Login */}
          <Route path="/admin" element={<Login />} />

          {/* Protected Admin Routes */}
          <Route
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/admin/products" element={<ProductsList />} />
            <Route path="/admin/products/new" element={<ProductForm />} />
            <Route path="/admin/products/:id/edit" element={<ProductForm />} />
            <Route path="/admin/collections" element={<CollectionsList />} />
            <Route path="/admin/collections/new" element={<CollectionForm />} />
            <Route path="/admin/collections/:id/edit" element={<CollectionForm />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
