import { useState, memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { HeartIcon } from './Icons';
import { useCurrency } from '../../hooks/useCurrency';
import { useWishlist } from '../../hooks/useWishlist';
import { useLanguage } from '../../hooks/useLanguage';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import RoomMockup from './RoomMockup';
import { priceMatrix } from '../../config/printOptions';

export interface ProductCardProps {
  id: string;
  title: string;
  slug: string;
  brand?: string;
  price: number;
  originalPrice?: number;
  image: string;
  hoverImage?: string;
  badge?: 'sale' | 'new' | 'artist' | 'limited' | 'bestseller';
  discount?: number;
  sizes?: string[];
  showRoomPreview?: boolean;
}

// Map display sizes to config size IDs
const SIZE_TO_ID: Record<string, string> = {
  '50x70 cm': '50x70',
  '60x90 cm': '60x90',
  '70x100 cm': '70x100',
  '80x120 cm': '80x120',
  '100x150 cm': '100x150',
};

const ProductCard = memo(function ProductCard({
  id,
  title,
  slug,
  brand = 'dysnomia',
  price: _price,
  originalPrice: _originalPrice,
  image,
  hoverImage: _hoverImage,
  badge,
  discount,
  sizes = ['50x70 cm', '70x100 cm', '100x150 cm'],
  showRoomPreview = true
}: ProductCardProps) {
  const [selectedSize, setSelectedSize] = useState(sizes[0]);
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { currency } = useCurrency();
  const { isInWishlist, toggle } = useWishlist();
  const { t } = useLanguage();
  const { isMobile } = useBreakpoint();
  const wishlisted = isInWishlist(id);

  // Get price from static price matrix based on selected size
  // Using 'canvas' as default print type for carousel display
  const displayPrice = useMemo(() => {
    const sizeId = SIZE_TO_ID[selectedSize] || '50x70';
    const priceInMKD = priceMatrix.canvas[sizeId] || priceMatrix.canvas['50x70'];

    // Convert to EUR if needed (approximate rate: 1 EUR = 61.5 MKD)
    if (currency === 'EUR') {
      return priceInMKD / 61.5;
    }
    return priceInMKD;
  }, [selectedSize, currency]);

  // Memoize Intl.NumberFormat to avoid expensive constructor per render
  const eurFormatter = useMemo(() => new Intl.NumberFormat('en-EU', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }), []);

  const formattedPrice = useMemo(() => {
    if (currency === 'EUR') {
      return eurFormatter.format(displayPrice);
    }
    return `${Math.round(displayPrice).toLocaleString()} MKD`;
  }, [currency, displayPrice, eurFormatter]);

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
        {/* Room Preview - always rendered underneath, revealed on hover */}
        {showRoomPreview && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              opacity: isHovered ? 1 : 0,
              transition: 'opacity 0.4s ease',
            }}
          >
            <RoomMockup artworkImage={image} artworkTitle={title} />
          </div>
        )}

        {/* Regular Image - on top, fades out on hover */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: isHovered && showRoomPreview ? 0 : 1,
            transition: 'opacity 0.4s ease',
          }}
        >
          <img
            src={image}
            alt={title}
            loading="lazy"
            decoding="async"
            onLoad={() => setImageLoaded(true)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              padding: '16px',
              opacity: imageLoaded ? 1 : 0,
              transition: 'opacity 0.4s ease',
            }}
          />
        </div>

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
              letterSpacing: '0.5px',
              zIndex: 2
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
              letterSpacing: '0.5px',
              zIndex: 2
            }}
          >
            {t('shop.badgeNew')}
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
              letterSpacing: '0.5px',
              zIndex: 2
            }}
          >
            {t('shop.badgeArtist')}
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
              letterSpacing: '0.5px',
              zIndex: 2
            }}
          >
            {t('shop.badgeLimited')}
          </span>
        )}
        {badge === 'bestseller' && (
          <span
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              backgroundColor: '#0A0A0A',
              color: '#FBBE63',
              fontSize: '10px',
              fontWeight: 700,
              padding: '4px 8px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              zIndex: 2
            }}
          >
            {t('shop.badgeBestseller')}
          </span>
        )}

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggle({ productId: id, productTitle: title, productSlug: slug, imageUrl: image });
          }}
          aria-label={wishlisted ? `Remove ${title} from wishlist` : `Add ${title} to wishlist`}
          aria-pressed={wishlisted}
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
            color: wishlisted ? '#FBBE63' : '#0A0A0A',
            zIndex: 2
          }}
        >
          <HeartIcon className="w-4 h-4" filled={wishlisted} />
        </button>
      </Link>

      {/* Product Info */}
      <div>
        <p style={{ fontSize: '11px', color: '#666666', marginBottom: '4px', textTransform: 'uppercase' }}>
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

        {/* Price - From static price matrix based on size */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span style={{ fontSize: '13px', color: '#0A0A0A', fontWeight: 500 }}>
            {formattedPrice}
          </span>
        </div>

        {/* Size Options */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }} role="group" aria-label="Size options">
          {sizes.map((size) => (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
              aria-pressed={selectedSize === size}
              style={{
                fontSize: isMobile ? '9px' : '10px',
                padding: isMobile ? '5px 6px' : '6px 10px',
                minHeight: isMobile ? '28px' : '32px',
                boxSizing: 'border-box',
                border: selectedSize === size ? '1px solid #0A0A0A' : '1px solid #E5E5E5',
                backgroundColor: selectedSize === size ? '#0A0A0A' : '#FFFFFF',
                color: selectedSize === size ? '#FFFFFF' : '#0A0A0A',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                whiteSpace: 'nowrap',
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
