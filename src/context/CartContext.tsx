import { createContext, useContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getPrice } from '../config/printOptions';

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

// The stored shape is unchanged; prices are never trusted from storage (they are
// recomputed from the price matrix on load), so existing carts keep working.
const CART_STORAGE_KEY = 'dysnomia_cart';

const PRINT_TYPES: ReadonlyArray<CartItem['printType']> = ['canvas', 'roll', 'framed'];

const CartContext = createContext<CartContextValue | undefined>(undefined);

function getItemKey(productId: string, printType: string, sizeId: string): string {
  return `${productId}-${printType}-${sizeId}`;
}

/**
 * Validate one persisted cart entry. Returns null for malformed entries and for
 * print type × size combos that no longer exist; otherwise returns the item with
 * its unitPrice recomputed from the current price matrix.
 */
function sanitizeStoredItem(raw: unknown): CartItem | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (
    typeof r.productId !== 'string' || !r.productId ||
    typeof r.sizeId !== 'string' || !r.sizeId ||
    typeof r.printType !== 'string' ||
    !PRINT_TYPES.includes(r.printType as CartItem['printType'])
  ) {
    return null;
  }
  const printType = r.printType as CartItem['printType'];
  const unitPrice = getPrice(printType, r.sizeId);
  if (unitPrice <= 0) return null;

  const quantity = typeof r.quantity === 'number' && Number.isFinite(r.quantity) ? Math.floor(r.quantity) : 0;
  if (quantity < 1) return null;

  return {
    productId: r.productId,
    productTitle: typeof r.productTitle === 'string' ? r.productTitle : '',
    productSlug: typeof r.productSlug === 'string' ? r.productSlug : '',
    imageUrl: typeof r.imageUrl === 'string' ? r.imageUrl : '',
    printType,
    sizeId: r.sizeId,
    sizeLabel: typeof r.sizeLabel === 'string' ? r.sizeLabel : r.sizeId,
    quantity,
    unitPrice,
  };
}

function loadStoredCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  let parsed: unknown;
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (!stored) return [];
    parsed = JSON.parse(stored);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];

  const seen = new Set<string>();
  const result: CartItem[] = [];
  for (const raw of parsed) {
    const item = sanitizeStoredItem(raw);
    if (!item) continue;
    const key = getItemKey(item.productId, item.printType, item.sizeId);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }
  return result;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadStoredCart);

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
