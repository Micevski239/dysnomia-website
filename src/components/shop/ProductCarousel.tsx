import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';
import type { ProductCardProps } from './ProductCard';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { useLanguage } from '../../hooks/useLanguage';

interface ProductCarouselProps {
  title: string;
  viewAllLink: string;
  products: ProductCardProps[];
}

export default function ProductCarousel({
  title,
  viewAllLink,
  products
}: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { isMobile } = useBreakpoint();
  const { t } = useLanguage();

  const gap = isMobile ? 8 : 12;
  const itemsPerView = isMobile ? 2 : 5;
  const totalItems = products.length;
  const totalPages = Math.ceil(totalItems / itemsPerView);

  // Create extended products array for infinite loop effect (memoized)
  const extendedProducts = useMemo(() => [...products, ...products, ...products], [products]);

  // Calculate card width dynamically from container
  const getCardWidth = useCallback(() => {
    if (!scrollRef.current) return isMobile ? 150 : 248;
    const containerWidth = scrollRef.current.clientWidth;
    // Mobile: 2 cards with 1 gap, Desktop: 5 cards with 4 gaps
    return isMobile ? (containerWidth - gap) / 2 : (containerWidth - gap * 4) / 5;
  }, [isMobile, gap]);

  const scrollToPage = useCallback((pageIndex: number, smooth = true) => {
    if (scrollRef.current) {
      const cardWidth = getCardWidth();
      // Scroll by full page (itemsPerView items at a time)
      const itemIndex = pageIndex * itemsPerView;
      const scrollPosition = (itemIndex + totalItems) * (cardWidth + gap);
      scrollRef.current.scrollTo({
        left: scrollPosition,
        behavior: smooth ? 'smooth' : 'auto'
      });
    }
  }, [getCardWidth, gap, totalItems, itemsPerView]);

  // Arrow navigation
  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % totalPages);
  };

  // Scroll when currentIndex (page) changes
  useEffect(() => {
    scrollToPage(currentIndex);
  }, [currentIndex, scrollToPage]);

  // Auto-advance every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalPages);
    }, 5000);
    return () => clearInterval(interval);
  }, [totalPages]);

  // Initialize scroll position to middle set (page 0)
  useEffect(() => {
    if (scrollRef.current && products.length > 0) {
      const cardWidth = getCardWidth();
      const initialPosition = totalItems * (cardWidth + gap);
      scrollRef.current.scrollTo({ left: initialPosition, behavior: 'auto' });
    }
  }, [products.length, totalItems, getCardWidth, gap]);

  // Handle infinite loop - reset position when reaching edges
  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;

    const { scrollLeft } = scrollRef.current;
    const cardWidth = getCardWidth();
    const singleSetWidth = totalItems * (cardWidth + gap);

    // If scrolled to the end (third set), jump to middle set
    if (scrollLeft >= singleSetWidth * 2) {
      scrollRef.current.scrollTo({ left: scrollLeft - singleSetWidth, behavior: 'auto' });
    }
    // If scrolled to the beginning, jump to middle set
    else if (scrollLeft <= 0) {
      scrollRef.current.scrollTo({ left: scrollLeft + singleSetWidth, behavior: 'auto' });
    }
  }, [totalItems, getCardWidth, gap]);

  const goToPage = (pageIndex: number) => {
    setCurrentIndex(pageIndex);
  };

  if (products.length === 0) return null;

  return (
    <section style={{ padding: 'clamp(32px, 6vw, 60px) 0', backgroundColor: '#FFFFFF' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 clamp(16px, 4vw, 48px)' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isMobile ? '20px' : '32px', gap: '12px' }}>
          <h2
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: isMobile ? '16px' : '24px',
              fontWeight: 500,
              letterSpacing: isMobile ? '1px' : '2px',
              color: '#0A0A0A',
              whiteSpace: 'nowrap'
            }}
          >
            {title}
          </h2>
          <Link
            to={viewAllLink}
            style={{
              fontSize: isMobile ? '10px' : '12px',
              color: '#666666',
              textDecoration: 'none',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              transition: 'color 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#FBBE63'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#666666'}
          >
            {t('common.viewAll')}
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Carousel Container */}
        <div style={{ position: 'relative' }}>
          {/* Products Container */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            style={{
              display: 'flex',
              gap: `${gap}px`,
              overflowX: 'hidden',
              scrollBehavior: 'smooth',
              msOverflowStyle: 'none',
              scrollbarWidth: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {extendedProducts.map((product, index) => (
              <div
                key={`${product.id}-${index}`}
                style={{
                  flex: isMobile ? `0 0 calc((100% - ${gap}px) / 2)` : `0 0 calc((100% - ${gap * 4}px) / 5)`,
                  maxWidth: isMobile ? `calc((100% - ${gap}px) / 2)` : `calc((100% - ${gap * 4}px) / 5)`
                }}
              >
                <ProductCard {...product} showRoomPreview={!isMobile} />
              </div>
            ))}
          </div>
        </div>

        {/* Pagination Lines - one per page */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '32px' }}>
          {Array.from({ length: totalPages }).map((_, pageIndex) => (
            <button
              key={pageIndex}
              onClick={() => goToPage(pageIndex)}
              style={{
                height: '2px',
                width: pageIndex === currentIndex ? '40px' : '20px',
                backgroundColor: pageIndex === currentIndex ? '#0A0A0A' : '#E5E5E5',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
              aria-label={`Go to page ${pageIndex + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
