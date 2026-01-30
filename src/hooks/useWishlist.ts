import { useWishlistContext, type WishlistItem } from '../context/WishlistContext';

interface AddToWishlistParams {
  productId: string;
  productTitle: string;
  productSlug: string;
  imageUrl: string;
}

export function useWishlist() {
  const {
    items,
    itemCount,
    addItem,
    removeItem,
    isInWishlist,
    toggleItem,
    clearWishlist,
  } = useWishlistContext();

  const addToWishlist = (params: AddToWishlistParams) => {
    addItem(params);
  };

  const removeFromWishlist = (productId: string) => {
    removeItem(productId);
  };

  const toggle = (params: AddToWishlistParams) => {
    toggleItem(params);
  };

  return {
    items,
    itemCount,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    toggle,
    clearWishlist,
  };
}

export type { WishlistItem };
