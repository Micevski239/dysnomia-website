import type { Product } from '../types';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
}

export default function ProductGrid({ products, loading }: ProductGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="animate-pulse"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="aspect-square bg-surface rounded-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-border/50 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
            </div>
            <div className="mt-4 space-y-2">
              <div className="h-4 bg-surface rounded w-3/4" />
              <div className="h-4 bg-surface rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-24">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-surface flex items-center justify-center">
          <svg
            className="w-12 h-12 text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <p className="text-muted text-lg mb-2">No artworks available</p>
        <p className="text-muted/60 text-sm">Check back soon for new pieces</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product, index) => (
        <div
          key={product.id}
          className="animate-[fadeInUp_0.6s_ease-out_both]"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
}
