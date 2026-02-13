import { createContext, useContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

export interface CartItem {
  productId: string;
  productTitle: string;
  productSlug: string;
  imageUrl: string;
  printType: 'canvas' | 'roll' | 'framed';
  sizeId: string;
  sizeLabel: string;
  quantity: number;
  unitPrice: number;
}

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  totalPrice: number;
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (productId: string, printType: string, sizeId: string) => void;
  updateQuantity: (productId: string, printType: string, sizeId: string, quantity: number) => void;
  clearCart: () => void;
  getItemKey: (productId: string, printType: string, sizeId: string) => string;
}

const CART_STORAGE_KEY = 'dysnomia_cart';

const CartContext = createContext<CartContextValue | undefined>(undefined);

function getItemKey(productId: string, printType: string, sizeId: string): string {
  return `${productId}-${printType}-${sizeId}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Persist to localStorage whenever items change
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error);
    }
  }, [items]);

  const itemCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
  const totalPrice = useMemo(() => items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0), [items]);

  const addItem = useCallback((newItem: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    const quantity = newItem.quantity ?? 1;
    const key = getItemKey(newItem.productId, newItem.printType, newItem.sizeId);

    setItems((currentItems) => {
      const existingIndex = currentItems.findIndex(
        (item) => getItemKey(item.productId, item.printType, item.sizeId) === key
      );

      if (existingIndex >= 0) {
        // Update existing item quantity
        const updated = [...currentItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      }

      // Add new item
      return [...currentItems, { ...newItem, quantity }];
    });
  }, []);

  const removeItem = useCallback((productId: string, printType: string, sizeId: string) => {
    const key = getItemKey(productId, printType, sizeId);
    setItems((currentItems) =>
      currentItems.filter(
        (item) => getItemKey(item.productId, item.printType, item.sizeId) !== key
      )
    );
  }, []);

  const updateQuantity = useCallback((productId: string, printType: string, sizeId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId, printType, sizeId);
      return;
    }

    const key = getItemKey(productId, printType, sizeId);
    setItems((currentItems) =>
      currentItems.map((item) =>
        getItemKey(item.productId, item.printType, item.sizeId) === key
          ? { ...item, quantity }
          : item
      )
    );
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        totalPrice,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getItemKey,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCartContext() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCartContext must be used within a CartProvider');
  }
  return context;
}
