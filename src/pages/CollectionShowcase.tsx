import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Collection, Product } from '../types';
import ProductCard from '../components/shop/ProductCard';
import type { ProductCardProps } from '../components/shop/ProductCard';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { useLanguage } from '../hooks/useLanguage';
import { localize } from '../lib/localize';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=1000&h=1400&fit=crop';
const PRODUCTS_PER_PAGE = 12;

interface CollectionProductRow {
  product: Product | null;
}

export default function CollectionShowcase() {
  const { slug } = useParams<{ slug: string }>();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [artworks, setArtworks] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(PRODUCTS_PER_PAGE);
  const { isMobile, isMobileOrTablet } = useBreakpoint();
  const { language, t } = useLanguage();

  useEffect(() => {
    let isMounted = true;

    async function loadCollection() {
      if (!slug) return;
      setLoading(true);
      setError(null);

      const { data: collectionData, error: collectionError } = await supabase
        .from('collections')
        .select('*')
        .eq('slug', slug)
        .single();

      if (collectionError || !collectionData) {
        if (!isMounted) return;
        setError(collectionError?.message || 'Collection not found');
        setCollection(null);
        setArtworks([]);
        setLoading(false);
        return;
      }

      const { data: mappingData, error: mappingError } = await supabase
        .from('collection_products')
        .select('product:products(*)')
        .eq('collection_id', collectionData.id)
        .order('added_at', { ascending: false })
        .returns<CollectionProductRow[]>();

      if (!isMounted) return;

      if (mappingError) {
        setError(mappingError.message);
        setCollection(collectionData);
        setArtworks([]);
        setLoading(false);
        return;
      }

      const mappedProducts = (mappingData || [])
        .map((row) => row.product)
        .filter((product): product is Product => Boolean(product));

      setCollection(collectionData);
      setArtworks(mappedProducts);
      setLoading(false);
    }

    loadCollection();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const heroImage = useMemo(() => collection?.cover_image || collection?.cover_image_url || FALLBACK_IMAGE, [collection]);
  const [heroLoaded, setHeroLoaded] = useState(false);

  // Reset loaded state when collection changes
  useEffect(() => { setHeroLoaded(false); }, [slug]);

  const productCards: ProductCardProps[] = useMemo(
    () =>
      artworks.map((p) => ({
        id: p.id,
        title: localize(p.title, p.title_mk, language),
        slug: p.slug,
        price: p.price,
        image: p.image_url ?? '',
        brand: localize(collection?.title, collection?.title_mk, language) || 'dysnomia',
        showRoomPreview: true,
      })),
    [artworks, collection, language]
  );

  const visibleProducts = useMemo(() => productCards.slice(0, visibleCount), [productCards, visibleCount]);
  const hasMore = visibleCount < productCards.length;

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', paddingTop: isMobileOrTablet ? '100px' : '120px' }}>
      {/* Hero Section */}
      <section style={{ maxWidth: '1400px', margin: '0 auto', padding: `0 clamp(16px, 4vw, 48px) clamp(40px, 8vw, 80px)` }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: !isMobile ? '1fr 1fr' : '1fr',
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
              {t('common.collection')}
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
              {localize(collection?.title, collection?.title_mk, language) || 'Collection'}
            </h1>
            {(collection?.description || collection?.description_mk) && (
              <p
                style={{
                  fontSize: '17px',
                  lineHeight: 1.7,
                  color: '#666666',
                  maxWidth: '500px',
                  marginBottom: '32px',
                }}
              >
                {localize(collection?.description, collection?.description_mk, language)}
              </p>
            )}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <span style={{ fontSize: '24px', fontWeight: 600, color: '#0A0A0A' }}>{artworks.length}</span>
              <span style={{ fontSize: '12px', color: '#666666', letterSpacing: '1px', textTransform: 'uppercase' }}>{t('common.pieces')}</span>
            </div>
          </div>

          {/* Featured Image */}
          <div
            style={{
              position: 'relative',
              aspectRatio: '4/5',
              backgroundColor: '#F5F5F5',
              overflow: 'hidden',
            }}
          >
            <img
              src={heroImage}
              alt={localize(collection?.title, collection?.title_mk, language) || 'Collection cover'}
              decoding="async"
              onLoad={() => setHeroLoaded(true)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: heroLoaded ? 1 : 0,
                transition: 'opacity 0.4s ease',
              }}
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
                {t('common.cover')}
              </p>
              <h3
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: '28px',
                }}
              >
                {localize(collection?.title, collection?.title_mk, language) || 'Collection'}
              </h3>
            </div>
          </div>
        </div>
      </section>

      {/* Breadcrumb */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: isMobile ? '16px' : '24px 48px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#666666' }}>
          <Link to="/collections" style={{ color: '#666666', textDecoration: 'none', letterSpacing: '1px', textTransform: 'uppercase' }}>
            {t('common.collections')}
          </Link>
          <span>/</span>
          <span style={{ color: '#0A0A0A', fontWeight: 600 }}>{localize(collection?.title, collection?.title_mk, language) || '...'}</span>
        </div>
      </div>

      {/* Artworks Section */}
      <section style={{ maxWidth: '1400px', margin: '0 auto', padding: `0 ${isMobile ? '16px' : '48px'} ${isMobile ? '40px' : '80px'}` }}>
        <div style={{ textAlign: 'center', marginBottom: isMobile ? '24px' : '48px', marginTop: '24px' }}>
          <p
            style={{
              fontSize: '11px',
              color: '#666666',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              marginBottom: '12px',
            }}
          >
            {t('common.exploreTheCollection')}
          </p>
          <h2
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: isMobile ? '24px' : '36px',
              color: '#0A0A0A',
              letterSpacing: '2px',
            }}
          >
            {t('common.artworks')}
          </h2>
        </div>

        {loading ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: isMobile ? '12px' : '32px',
            }}
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <div style={{ aspectRatio: '3/4', backgroundColor: '#F5F5F5', marginBottom: '12px' }} />
                <div style={{ height: '12px', backgroundColor: '#F5F5F5', width: '60%', marginBottom: '8px' }} />
                <div style={{ height: '16px', backgroundColor: '#F5F5F5', width: '80%' }} />
              </div>
            ))}
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', backgroundColor: '#FAFAFA', border: '1px solid #E5E5E5' }}>
            <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '20px', color: '#0A0A0A', marginBottom: '12px' }}>
              {t('common.unableToLoadArtworks')}
            </p>
            <p style={{ fontSize: '14px', color: '#666666' }}>{error}</p>
          </div>
        ) : artworks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', backgroundColor: '#FAFAFA', border: '1px solid #E5E5E5' }}>
            <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '20px', color: '#0A0A0A', marginBottom: '12px' }}>
              {t('common.noArtworksYet')}
            </p>
            <p style={{ fontSize: '14px', color: '#666666', marginBottom: '24px' }}>
              {t('common.noArtworksYetDesc')}
            </p>
            <Link
              to="/shop"
              style={{
                display: 'inline-block',
                padding: '14px 36px',
                backgroundColor: '#0A0A0A',
                color: '#FFFFFF',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '2px',
                textTransform: 'uppercase',
                textDecoration: 'none',
              }}
            >
              {t('common.browseAllArtworks')}
            </Link>
          </div>
        ) : (
          <>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: isMobile ? '12px' : '32px',
              }}
            >
              {visibleProducts.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>

            {hasMore && (
              <div style={{ textAlign: 'center', marginTop: '48px' }}>
                <button
                  onClick={() => setVisibleCount((prev) => prev + PRODUCTS_PER_PAGE)}
                  style={{
                    padding: '14px 48px',
                    backgroundColor: '#0A0A0A',
                    color: '#FFFFFF',
                    border: '1px solid #0A0A0A',
                    fontSize: '12px',
                    fontWeight: 700,
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#FBBE63';
                    e.currentTarget.style.borderColor = '#FBBE63';
                    e.currentTarget.style.color = '#0A0A0A';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#0A0A0A';
                    e.currentTarget.style.borderColor = '#0A0A0A';
                    e.currentTarget.style.color = '#FFFFFF';
                  }}
                >
                  {t('common.loadMore')}
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
