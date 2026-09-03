import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export interface WishlistItem {
  productId: string;
  productTitle: string;
  productSlug: string;
  imageUrl: string;
  addedAt: string;
}

interface WishlistContextValue {
  items: WishlistItem[];
  itemCount: number;
  addItem: (item: Omit<WishlistItem, 'addedAt'>) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  toggleItem: (item: Omit<WishlistItem, 'addedAt'>) => void;
  clearWishlist: () => void;
}

const WISHLIST_STORAGE_KEY = 'dysnomia_wishlist';

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Persist to localStorage whenever items change
  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Failed to save wishlist to localStorage:', error);
    }
  }, [items]);

  const itemCount = items.length;

  const addItem = (newItem: Omit<WishlistItem, 'addedAt'>) => {
    setItems((currentItems) => {
      // Check if already exists
      if (currentItems.some((item) => item.productId === newItem.productId)) {
        return currentItems;
      }
      return [...currentItems, { ...newItem, addedAt: new Date().toISOString() }];
    });
  };

  const removeItem = (productId: string) => {
    setItems((currentItems) => currentItems.filter((item) => item.productId !== productId));
  };

  const isInWishlist = (productId: string): boolean => {
    return items.some((item) => item.productId === productId);
  };

  const toggleItem = (item: Omit<WishlistItem, 'addedAt'>) => {
    if (isInWishlist(item.productId)) {
      removeItem(item.productId);
    } else {
      addItem(item);
    }
  };

  const clearWishlist = () => {
    setItems([]);
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        itemCount,
        addItem,
        removeItem,
        isInWishlist,
        toggleItem,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlistContext() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlistContext must be used within a WishlistProvider');
  }
  return context;
}
