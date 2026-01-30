import { useCart } from '../../hooks/useCart';
import { useWishlist } from '../../hooks/useWishlist';
import ShopLayout from './ShopLayout';

export default function ShopLayoutWrapper() {
  const { itemCount: cartCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();

  return <ShopLayout cartCount={cartCount} wishlistCount={wishlistCount} />;
}
