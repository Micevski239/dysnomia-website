import { useState, memo } from 'react';
import { Link } from 'react-router-dom';
import { HeartIcon } from './Icons';

export interface ProductCardProps {
  id: string;
  title: string;
  slug: string;
  brand?: string;
  price: number;
  originalPrice?: number;
  image: string;
  hoverImage?: string;
  badge?: 'sale' | 'new' | 'artist' | 'limited';
  discount?: number;
  sizes?: string[];
  isWishlisted?: boolean;
  onWishlistToggle?: (id: string) => void;
}

const ProductCard = memo(function ProductCard({
  id,
  title,
  slug,
  brand = 'dysnomia',
  price,
  originalPrice,
  image,
  hoverImage,
  badge,
  discount,
  sizes = ['30x40 cm', '50x70 cm', '70x100 cm'],
  isWishlisted = false,
  onWishlistToggle
}: ProductCardProps) {
  const [selectedSize, setSelectedSize] = useState(sizes[0]);
  const [isHovered, setIsHovered] = useState(false);

  const formatPrice = (p: number) => {
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(p);
  };

  return (
    <div
      style={{
        flexShrink: 0,
        width: '100%',
        transition: 'transform 0.3s'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <Link
        to={`/artwork/${slug}`}
        style={{
          display: 'block',
          position: 'relative',
          aspectRatio: '3/4',
          backgroundColor: '#F5F5F5',
          marginBottom: '12px',
          overflow: 'hidden',
          textDecoration: 'none',
          border: isHovered ? '1px solid #FBBE63' : '1px solid #E5E5E5',
          transition: 'border-color 0.3s'
        }}
      >
        <img
          src={isHovered && hoverImage ? hoverImage : image}
          alt={title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            padding: '16px',
            transition: 'all 0.5s'
          }}
        />

        {/* Badges */}
        {badge === 'sale' && discount && (
          <span
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              backgroundColor: '#FBBE63',
              color: '#0A0A0A',
              fontSize: '10px',
              fontWeight: 700,
              padding: '4px 8px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            -{discount}%
          </span>
        )}
        {badge === 'new' && (
          <span
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              backgroundColor: '#0A0A0A',
              color: '#FFFFFF',
              fontSize: '10px',
              fontWeight: 700,
              padding: '4px 8px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            New
          </span>
        )}
        {badge === 'artist' && (
          <span
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #0A0A0A',
              color: '#0A0A0A',
              fontSize: '10px',
              fontWeight: 700,
              padding: '4px 8px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            Artist
          </span>
        )}
        {badge === 'limited' && (
          <span
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              backgroundColor: '#FBBE63',
              color: '#0A0A0A',
              fontSize: '10px',
              fontWeight: 700,
              padding: '4px 8px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            Limited
          </span>
        )}

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            onWishlistToggle?.(id);
          }}
          aria-label={isWishlisted ? `Remove ${title} from wishlist` : `Add ${title} to wishlist`}
          aria-pressed={isWishlisted}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            padding: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            border: '1px solid #E5E5E5',
            borderRadius: '50%',
            cursor: 'pointer',
            transition: 'all 0.3s',
            opacity: isHovered ? 1 : 0,
            color: isWishlisted ? '#FBBE63' : '#0A0A0A'
          }}
        >
          <HeartIcon className="w-4 h-4" filled={isWishlisted} />
        </button>

        {/* Hover Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(251, 190, 99, 0.03)',
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.3s'
          }}
        />
      </Link>

      {/* Product Info */}
      <div>
        <p style={{ fontSize: '11px', color: '#666666', marginBottom: '4px', textTransform: 'lowercase' }}>
          {brand}
        </p>
        <Link to={`/artwork/${slug}`} style={{ textDecoration: 'none' }}>
          <h3
            style={{
              fontSize: '13px',
              color: '#0A0A0A',
              fontWeight: 500,
              lineHeight: 1.4,
              marginBottom: '8px',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#FBBE63'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#0A0A0A'}
          >
            {title}
          </h3>
        </Link>

        {/* Price */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span style={{ fontSize: '13px', color: '#0A0A0A', fontWeight: 500 }}>
            {formatPrice(price)}
          </span>
          {originalPrice && originalPrice > price && (
            <span style={{ fontSize: '12px', color: '#666666', textDecoration: 'line-through' }}>
              {formatPrice(originalPrice)}
            </span>
          )}
        </div>

        {/* Size Options */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }} role="group" aria-label="Size options">
          {sizes.map((size) => (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
              aria-pressed={selectedSize === size}
              style={{
                fontSize: '10px',
                padding: '4px 8px',
                border: selectedSize === size ? '1px solid #0A0A0A' : '1px solid #E5E5E5',
                backgroundColor: selectedSize === size ? '#0A0A0A' : '#FFFFFF',
                color: selectedSize === size ? '#FFFFFF' : '#0A0A0A',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {size}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});

export default ProductCard;
