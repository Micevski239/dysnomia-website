import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useNewArrivalsSpotlight } from '../hooks/useFeaturedSections';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { useLanguage } from '../hooks/useLanguage';
import { localize } from '../lib/localize';
import ProductCard from '../components/shop/ProductCard';
import type { ProductCardProps } from '../components/shop/ProductCard';
import type { Product } from '../types';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=1000&h=1400&fit=crop';

const formatPrice = (value: number) =>
  new Intl.NumberFormat('en-EU', { style: 'currency', currency: 'EUR' }).format(value);

const mapProductToCard = (product: Product, language = 'en'): ProductCardProps => ({
  id: product.id,
  title: localize(product.title, product.title_mk, language),
  slug: product.slug,
  brand: 'dysnomia',
  price: Number(product.price) || 0,
  image: product.image_url || FALLBACK_IMAGE,
  badge: 'new',
  sizes: ['50x70 cm', '70x100 cm', '100x150 cm'],
});

export default function NewArrivals() {
  const { products, loading } = useProducts();
  const { spotlightProductId } = useNewArrivalsSpotlight();
  const { isMobile } = useBreakpoint();
  const { language } = useLanguage();

  const sortedProducts = useMemo(() => {
    return [...products].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [products]);

  const spotlight = useMemo(() => {
    if (spotlightProductId) {
      return sortedProducts.find((p) => p.id === spotlightProductId) || sortedProducts[0] || null;
    }
    return sortedProducts[0] || null;
  }, [sortedProducts, spotlightProductId]);

  const gridProducts = sortedProducts.slice(0, 12);

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', paddingTop: '120px' }}>
      {/* Hero Section */}
      <section style={{ maxWidth: '1400px', margin: '0 auto', padding: `0 clamp(16px, 4vw, 48px) clamp(40px, 8vw, 80px)` }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: spotlight && !isMobile ? '1fr 1fr' : '1fr',
            gap: 'clamp(24px, 5vw, 48px)',
            alignItems: 'center',
          }}
        >
          {/* Text Content */}
          <div>
            <p
              style={{
                fontSize: '12px',
                letterSpacing: '3px',
                textTransform: 'uppercase',
                color: '#FBBE63',
                marginBottom: '16px',
              }}
            >
              New Arrivals
            </p>
            <h1
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 'clamp(32px, 6vw, 52px)',
                color: '#0A0A0A',
                letterSpacing: '1px',
                lineHeight: 1.1,
                marginBottom: '24px',
              }}
            >
              Fresh <span style={{ color: '#FBBE63' }}>Artworks</span>
            </h1>
            <p
              style={{
                fontSize: '17px',
                lineHeight: 1.7,
                color: '#666666',
                maxWidth: '500px',
                marginBottom: '32px',
              }}
            >
              Discover our latest collection of unique artworks. Each piece is carefully
              curated to bring modern elegance and timeless beauty to your space.
            </p>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <Link
                to="/shop"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '16px 32px',
                  backgroundColor: '#0A0A0A',
                  color: '#FFFFFF',
                  fontSize: '12px',
                  fontWeight: 600,
                  letterSpacing: '1.5px',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                  transition: 'all 0.3s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#FBBE63';
                  e.currentTarget.style.color = '#0A0A0A';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#0A0A0A';
                  e.currentTarget.style.color = '#FFFFFF';
                }}
              >
                Browse All
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                to="/collections"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '16px 32px',
                  backgroundColor: '#FFFFFF',
                  color: '#0A0A0A',
                  fontSize: '12px',
                  fontWeight: 600,
                  letterSpacing: '1.5px',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                  border: '1px solid #E5E5E5',
                  transition: 'all 0.3s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#0A0A0A';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#E5E5E5';
                }}
              >
                View Collections
              </Link>
            </div>
          </div>

          {/* Featured Image */}
          {spotlight && (
            <Link
              to={`/artwork/${spotlight.slug}`}
              style={{
                display: 'block',
                position: 'relative',
                aspectRatio: '4/5',
                backgroundColor: '#F5F5F5',
                overflow: 'hidden',
                textDecoration: 'none',
              }}
            >
              <img
                src={spotlight.image_url || FALLBACK_IMAGE}
                alt={localize(spotlight.title, spotlight.title_mk, language)}
                loading="lazy"
                decoding="async"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.5s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: '32px',
                  background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                  color: '#FFFFFF',
                }}
              >
                <p
                  style={{
                    fontSize: '11px',
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    marginBottom: '8px',
                    color: '#FBBE63',
                  }}
                >
                  Featured
                </p>
                <h3
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: '28px',
                    marginBottom: '8px',
                  }}
                >
                  {localize(spotlight.title, spotlight.title_mk, language)}
                </h3>
                <p style={{ fontSize: '16px' }}>{formatPrice(Number(spotlight.price) || 0)}</p>
              </div>
            </Link>
          )}
        </div>
      </section>


      {/* Products Grid */}
      <section style={{ maxWidth: '1400px', margin: '0 auto', padding: `clamp(32px, 6vw, 60px) clamp(16px, 4vw, 48px) clamp(48px, 8vw, 80px)` }}>
        {loading ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '32px',
            }}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i}>
                <div
                  style={{
                    aspectRatio: '3/4',
                    backgroundColor: '#F5F5F5',
                    marginBottom: '12px',
                  }}
                />
                <div
                  style={{
                    height: '12px',
                    width: '60%',
                    backgroundColor: '#F5F5F5',
                    marginBottom: '8px',
                  }}
                />
                <div
                  style={{
                    height: '16px',
                    width: '80%',
                    backgroundColor: '#F5F5F5',
                    marginBottom: '8px',
                  }}
                />
                <div
                  style={{
                    height: '14px',
                    width: '40%',
                    backgroundColor: '#F5F5F5',
                  }}
                />
              </div>
            ))}
          </div>
        ) : gridProducts.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '80px 20px',
              backgroundColor: '#FAFAFA',
              border: '1px solid #E5E5E5',
            }}
          >
            <p
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: '24px',
                color: '#0A0A0A',
                marginBottom: '12px',
              }}
            >
              No artworks found
            </p>
            <p style={{ fontSize: '15px', color: '#666666' }}>
              Check back soon for new arrivals.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '32px',
            }}
          >
            {gridProducts.map((product) => (
              <ProductCard key={product.id} {...mapProductToCard(product, language)} />
            ))}
          </div>
        )}
      </section>

      {/* Newsletter Section */}
      <section
        style={{
          backgroundColor: '#0A0A0A',
          padding: `clamp(48px, 8vw, 80px) clamp(16px, 4vw, 48px)`,
        }}
      >
        <div
          style={{
            maxWidth: '600px',
            margin: '0 auto',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontSize: '12px',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              color: '#FBBE63',
              marginBottom: '16px',
            }}
          >
            Stay Updated
          </p>
          <h2
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 'clamp(28px, 5vw, 36px)',
              color: '#FFFFFF',
              marginBottom: '16px',
            }}
          >
            Never Miss New Arrivals
          </h2>
          <p
            style={{
              fontSize: '15px',
              lineHeight: 1.7,
              color: 'rgba(255,255,255,0.7)',
              marginBottom: '32px',
            }}
          >
            Subscribe to get notified when new artworks arrive. Be the first to discover
            exclusive pieces and limited editions.
          </p>
          <form
            style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              gap: '12px',
              maxWidth: '440px',
              margin: '0 auto',
            }}
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              placeholder="Enter your email"
              style={{
                flex: 1,
                padding: '16px 20px',
                border: '1px solid rgba(255,255,255,0.2)',
                backgroundColor: 'transparent',
                color: '#FFFFFF',
                fontSize: '14px',
              }}
            />
            <button
              type="submit"
              style={{
                padding: '16px 32px',
                backgroundColor: '#FBBE63',
                color: '#0A0A0A',
                border: 'none',
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '1px',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'opacity 0.3s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

      {/* Gold Accent Line */}
      <div style={{ height: '4px', backgroundColor: '#FBBE63' }} />
    </div>
  );
}
