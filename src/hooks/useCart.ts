import { useCartContext, type CartItem } from '../context/CartContext';
import { getPrice } from '../config/printOptions';
import type { PrintType } from '../config/printOptions';
import { printSizes } from '../config/printOptions';

interface AddToCartParams {
  productId: string;
  productTitle: string;
  productSlug: string;
  imageUrl: string;
  printType: PrintType;
  sizeId: string;
  quantity?: number;
}

export function useCart() {
  const {
    items,
    itemCount,
    totalPrice,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getItemKey,
  } = useCartContext();

  const addToCart = ({
    productId,
    productTitle,
    productSlug,
    imageUrl,
    printType,
    sizeId,
    quantity = 1,
  }: AddToCartParams) => {
    const unitPrice = getPrice(printType, sizeId);
    const size = printSizes.find((s) => s.id === sizeId);
    const sizeLabel = size?.label ?? sizeId;

    addItem({
      productId,
      productTitle,
      productSlug,
      imageUrl,
      printType,
      sizeId,
      sizeLabel,
      unitPrice,
      quantity,
    });
  };

  const incrementQuantity = (item: CartItem) => {
    updateQuantity(item.productId, item.printType, item.sizeId, item.quantity + 1);
  };

  const decrementQuantity = (item: CartItem) => {
    if (item.quantity > 1) {
      updateQuantity(item.productId, item.printType, item.sizeId, item.quantity - 1);
    } else {
      removeItem(item.productId, item.printType, item.sizeId);
    }
  };

  const removeFromCart = (item: CartItem) => {
    removeItem(item.productId, item.printType, item.sizeId);
  };

  const isInCart = (productId: string, printType: string, sizeId: string): boolean => {
    const key = getItemKey(productId, printType, sizeId);
    return items.some(
      (item) => getItemKey(item.productId, item.printType, item.sizeId) === key
    );
  };

  return {
    items,
    itemCount,
    totalPrice,
    addToCart,
    removeFromCart,
    incrementQuantity,
    decrementQuantity,
    updateQuantity,
    clearCart,
    isInCart,
  };
}
