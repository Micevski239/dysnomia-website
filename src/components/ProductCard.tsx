import { Link } from 'react-router-dom';
import type { Product } from '../types';
import { formatPrice } from '../lib/utils';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      to={`/artwork/${product.slug}`}
      className="group block bg-surface rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-all duration-500 hover:shadow-[0_0_40px_rgba(212,175,55,0.1)] hover:-translate-y-1"
    >
      <div className="relative aspect-square overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="w-full h-full bg-secondary flex items-center justify-center">
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
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Sold Badge */}
        {product.status === 'sold' && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[2px]">
            <span className="bg-primary text-background px-6 py-2 font-bold tracking-[0.2em] text-sm uppercase shadow-lg">
              Sold
            </span>
          </div>
        )}

        {/* Quick View Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
          {product.status !== 'sold' && (
            <span className="bg-primary text-background px-6 py-3 font-medium tracking-wide transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
              View Artwork
            </span>
          )}
        </div>

        {/* Corner Accents */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 m-3" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 m-3" />
      </div>

      <div className="p-5 relative">
        {/* Animated underline */}
        <div className="absolute top-0 left-5 right-5 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />

        <h3 className="text-text font-medium text-lg group-hover:text-primary transition-colors duration-300 truncate">
          {product.title}
        </h3>

        <div className="flex items-center justify-between mt-2">
          <p className="text-primary font-semibold text-lg">
            {formatPrice(product.price)}
          </p>
          <span className="text-xs text-muted uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {product.status === 'sold' ? 'Sold' : 'Available'}
          </span>
        </div>
      </div>
    </Link>
  );
}
