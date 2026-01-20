import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';
import ProductCard from './ProductCard';
import type { ProductCardProps } from './ProductCard';

interface ProductCarouselProps {
  title: string;
  viewAllLink: string;
  products: ProductCardProps[];
}

export default function ProductCarousel({ title, viewAllLink, products }: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);

  const itemsPerPage = 5;
  const totalPages = Math.ceil(products.length / itemsPerPage);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
      setCurrentPage(Math.round(scrollLeft / clientWidth));
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section style={{ padding: '60px 0', backgroundColor: '#FFFFFF' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 48px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
          <h2
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '24px',
              fontWeight: 500,
              letterSpacing: '2px',
              color: '#0A0A0A'
            }}
          >
            {title}
          </h2>
          <Link
            to={viewAllLink}
            style={{
              fontSize: '12px',
              color: '#666666',
              textDecoration: 'none',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              transition: 'color 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#FBBE63'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#666666'}
          >
            View all
            <svg
              width="12"
              height="12"
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
          {/* Navigation Arrows */}
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            style={{
              position: 'absolute',
              left: '-16px',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              width: '40px',
              height: '40px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E5E5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: canScrollLeft ? 'pointer' : 'not-allowed',
              opacity: canScrollLeft ? 1 : 0.3,
              transition: 'all 0.2s',
              color: '#0A0A0A'
            }}
            onMouseEnter={(e) => {
              if (canScrollLeft) {
                e.currentTarget.style.borderColor = '#FBBE63';
                e.currentTarget.style.color = '#FBBE63';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#E5E5E5';
              e.currentTarget.style.color = '#0A0A0A';
            }}
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>

          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            style={{
              position: 'absolute',
              right: '-16px',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              width: '40px',
              height: '40px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E5E5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: canScrollRight ? 'pointer' : 'not-allowed',
              opacity: canScrollRight ? 1 : 0.3,
              transition: 'all 0.2s',
              color: '#0A0A0A'
            }}
            onMouseEnter={(e) => {
              if (canScrollRight) {
                e.currentTarget.style.borderColor = '#FBBE63';
                e.currentTarget.style.color = '#FBBE63';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#E5E5E5';
              e.currentTarget.style.color = '#0A0A0A';
            }}
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>

          {/* Products Container */}
          <div
            ref={scrollRef}
            onScroll={checkScroll}
            style={{
              display: 'flex',
              gap: '16px',
              overflowX: 'auto',
              scrollBehavior: 'smooth',
              msOverflowStyle: 'none',
              scrollbarWidth: 'none'
            }}
          >
            {products.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </div>

        {/* Pagination Dots */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '32px' }}>
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              onClick={() => {
                if (scrollRef.current) {
                  scrollRef.current.scrollTo({
                    left: index * scrollRef.current.clientWidth,
                    behavior: 'smooth'
                  });
                }
              }}
              style={{
                height: '2px',
                width: index === currentPage ? '40px' : '20px',
                backgroundColor: index === currentPage ? '#0A0A0A' : '#E5E5E5',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
              aria-label={`Go to page ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
