import { useCart } from '../../hooks/useCart';
import { useWishlist } from '../../hooks/useWishlist';
import { usePageTracking } from '../../hooks/usePageTracking';
import ShopLayout from './ShopLayout';
import RouteSEO from '../RouteSEO';

export default function ShopLayoutWrapper() {
  const { itemCount: cartCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();
  usePageTracking();

  return (
    <>
      <RouteSEO />
      <ShopLayout cartCount={cartCount} wishlistCount={wishlistCount} />
    </>
  );
}
