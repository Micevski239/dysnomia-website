import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Package, ClipboardList, MessageSquare, ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface SearchResult {
  id: string;
  type: 'product' | 'order' | 'review';
  title: string;
  subtitle: string;
  link: string;
}

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Search function
  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    const searchResults: SearchResult[] = [];

    try {
      // Search products
      const { data: products } = await supabase
        .from('products')
        .select('id, title, slug, price')
        .ilike('title', `%${searchQuery}%`)
        .limit(5);

      if (products) {
        searchResults.push(
          ...products.map((p) => ({
            id: `product-${p.id}`,
            type: 'product' as const,
            title: p.title,
            subtitle: `${p.price.toLocaleString()} MKD`,
            link: `/admin/products/${p.id}/edit`,
          }))
        );
      }

      // Search orders
      const { data: orders } = await supabase
        .from('orders')
        .select('id, order_number, customer_name, total_amount')
        .or(`order_number.ilike.%${searchQuery}%,customer_name.ilike.%${searchQuery}%,customer_email.ilike.%${searchQuery}%`)
        .limit(5);

      if (orders) {
        searchResults.push(
          ...orders.map((o) => ({
            id: `order-${o.id}`,
            type: 'order' as const,
            title: o.order_number,
            subtitle: `${o.customer_name} - ${o.total_amount.toLocaleString()} MKD`,
            link: `/admin/orders/${o.id}`,
          }))
        );
      }

      // Search reviews
      const { data: reviews } = await supabase
        .from('reviews')
        .select(`
          id,
          customer_name,
          rating,
          products:product_id (title)
        `)
        .or(`customer_name.ilike.%${searchQuery}%,customer_email.ilike.%${searchQuery}%`)
        .limit(5);

      if (reviews) {
        searchResults.push(
          ...reviews.map((r: any) => ({
            id: `review-${r.id}`,
            type: 'review' as const,
            title: `Review by ${r.customer_name}`,
            subtitle: `${r.products?.title || 'Product'} - ${r.rating} stars`,
            link: '/admin/reviews',
          }))
        );
      }

      setResults(searchResults);
      setSelectedIndex(0);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      search(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, search]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      navigate(results[selectedIndex].link);
      onClose();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'product':
        return <Package className="w-5 h-5" />;
      case 'order':
        return <ClipboardList className="w-5 h-5" />;
      case 'review':
        return <MessageSquare className="w-5 h-5" />;
      default:
        return <Search className="w-5 h-5" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative min-h-screen flex items-start justify-center pt-[15vh] px-4">
        <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center gap-4 px-6 py-4 border-b border-[#E5E5E5]">
            <Search className="w-5 h-5 text-[#999999]" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search products, orders, reviews..."
              className="flex-1 text-[16px] text-[#1a1a1a] placeholder-[#999999] focus:outline-none"
            />
            <button
              onClick={onClose}
              className="p-1.5 text-[#999999] hover:text-[#666666] hover:bg-[#F5F5F5] rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="py-12 text-center">
                <div className="w-8 h-8 border-2 border-[#E5E5E5] border-t-[#B8860B] rounded-full animate-spin mx-auto" />
              </div>
            ) : results.length > 0 ? (
              <div className="py-2">
                {results.map((result, index) => (
                  <button
                    key={result.id}
                    onClick={() => {
                      navigate(result.link);
                      onClose();
                    }}
                    className={`w-full flex items-center gap-4 px-6 py-3 text-left transition-colors ${
                      index === selectedIndex ? 'bg-[#B8860B]/10' : 'hover:bg-[#F5F5F5]'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        result.type === 'product'
                          ? 'bg-green-100 text-green-700'
                          : result.type === 'order'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {getIcon(result.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[#1a1a1a] truncate">{result.title}</p>
                      <p className="text-[13px] text-[#666666] truncate">{result.subtitle}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#999999]" />
                  </button>
                ))}
              </div>
            ) : query.trim() ? (
              <div className="py-12 text-center">
                <p className="text-[#666666] text-[14px]">No results found for "{query}"</p>
              </div>
            ) : (
              <div className="py-12 text-center">
                <p className="text-[#999999] text-[14px]">
                  Type to search products, orders, or reviews
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-[#E5E5E5] bg-[#FAFAFA] flex items-center gap-4 text-[12px] text-[#999999]">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-[#E5E5E5] rounded font-mono">↑↓</kbd>
              to navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-[#E5E5E5] rounded font-mono">↵</kbd>
              to select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-[#E5E5E5] rounded font-mono">esc</kbd>
              to close
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
