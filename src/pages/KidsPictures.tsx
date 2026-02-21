import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { useLanguage } from '../hooks/useLanguage';
import { useCurrency } from '../hooks/useCurrency';
import { localize } from '../lib/localize';
import ProductCard from '../components/shop/ProductCard';
import type { ProductCardProps } from '../components/shop/ProductCard';
import type { Product } from '../types';
import { getPrice } from '../config/printOptions';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=1000&h=1400&fit=crop';

interface CollectionProductRow {
  product: Product | null;
}

const mapProductToCard = (product: Product, language = 'en'): ProductCardProps => ({
  id: product.id,
  title: localize(product.title, product.title_mk, language),
  slug: product.slug,
  brand: 'dysnomia',
  price: Number(product.price) || 0,
  image: product.image_url || FALLBACK_IMAGE,
  badge: 'new',
  sizes: ['50x70 cm', '70x100 cm', '100x150 cm'],
  isKidsRoom: true,
});

export default function KidsPictures() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { isMobile, isMobileOrTablet } = useBreakpoint();
  const { language, t } = useLanguage();
  const { formatPrice } = useCurrency();

  useEffect(() => {
    let isMounted = true;

    async function loadKidsProducts() {
      setLoading(true);

      const { data: collectionData } = await supabase
        .from('collections')
        .select('id')
        .eq('slug', 'kid')
        .single();

      if (!collectionData || !isMounted) {
        setLoading(false);
        return;
      }

      const { data: mappingData } = await supabase
        .from('collection_products')
        .select('product:products(*)')
        .eq('collection_id', collectionData.id)
        .order('added_at', { ascending: false })
        .returns<CollectionProductRow[]>();

      if (!isMounted) return;

      const mappedProducts = (mappingData || [])
        .map((row) => row.product)
        .filter((product): product is Product => Boolean(product));

      setProducts(mappedProducts);
      setLoading(false);
    }

    loadKidsProducts();
    return () => { isMounted = false; };
  }, []);

  const spotlight = useMemo(() => products[0] || null, [products]);
  const gridProducts = products.slice(0, 12);

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', paddingTop: isMobileOrTablet ? '100px' : '120px' }}>
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
              {t('kidsPictures.title')}
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
              {t('kidsPictures.heroTitle')} <span style={{ color: '#FBBE63' }}>{t('kidsPictures.heroTitleAccent')}</span>
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
              {t('kidsPictures.heroDescription')}
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
                {t('kidsPictures.browseAll')}
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
                {t('kidsPictures.viewCollections')}
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
                  {t('kidsPictures.featured')}
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
                <p style={{ fontSize: '16px' }}>{formatPrice(getPrice('canvas', '50x70'))}</p>
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
              gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: isMobile ? '16px' : '32px',
            }}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i}>
                <div style={{ aspectRatio: '3/4', backgroundColor: '#F5F5F5', marginBottom: '12px' }} />
                <div style={{ height: '12px', width: '60%', backgroundColor: '#F5F5F5', marginBottom: '8px' }} />
                <div style={{ height: '16px', width: '80%', backgroundColor: '#F5F5F5', marginBottom: '8px' }} />
                <div style={{ height: '14px', width: '40%', backgroundColor: '#F5F5F5' }} />
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
              {t('kidsPictures.noArtworks')}
            </p>
            <p style={{ fontSize: '15px', color: '#666666' }}>
              {t('kidsPictures.noArtworksMessage')}
            </p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: isMobile ? '16px' : '32px',
            }}
          >
            {gridProducts.map((product) => (
              <ProductCard key={product.id} {...mapProductToCard(product, language)} />
            ))}
          </div>
        )}
      </section>

      {/* Gold Accent Line */}
      <div style={{ height: '4px', backgroundColor: '#FBBE63' }} />
    </div>
  );
}
