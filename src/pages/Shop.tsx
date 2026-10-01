import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/shop/ProductCard';
import type { ProductCardProps } from '../components/shop/ProductCard';
import { useProducts } from '../hooks/useProducts';
import { useCollections } from '../hooks/useCollections';
import { useProductCollectionMap } from '../hooks/useProductCollectionMap';
import { useLanguage } from '../hooks/useLanguage';
import { localize } from '../lib/localize';
import { getThumbnailUrl } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { useBreakpoint } from '../hooks/useBreakpoint';

// Price-based sorting/filtering is intentionally absent: every artwork is priced
// by the shared print-type × size matrix (getPrice), so product.price is meaningless.
type SortOption = 'newest' | 'name';

const VALID_SORT_OPTIONS: SortOption[] = ['newest', 'name'];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize state from URL params
  const initialSort = (searchParams.get('sort') as SortOption) || 'newest';
  const initialCollections = searchParams.get('collection')?.split(',').filter(Boolean) || [];

  const [sortBy, setSortBy] = useState<SortOption>(
    VALID_SORT_OPTIONS.includes(initialSort) ? initialSort : 'newest'
  );
  const [selectedCollections, setSelectedCollections] = useState<Set<string>>(new Set(initialCollections));
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  // Product IDs for the selection identified by `key` — results for an older
  // selection are ignored so a slow response can't overwrite a newer one.
  const [collectionFilter, setCollectionFilter] = useState<{ key: string; ids: Set<string> } | null>(null);
  const { products, loading, error, refetch } = useProducts();
  const { collections } = useCollections();
  const { productCollectionMap, kidsProductIds } = useProductCollectionMap();
  const { language, t } = useLanguage();
  const { isMobile, isMobileOrTablet } = useBreakpoint();

  const collectionKey = useMemo(() => Array.from(selectedCollections).sort().join(','), [selectedCollections]);
  const collectionProductIds = collectionFilter && collectionFilter.key === collectionKey ? collectionFilter.ids : null;

  // Fetch product IDs for selected collections
  useEffect(() => {
    if (!collectionKey) return;
    let cancelled = false;
    supabase
      .from('collection_products')
      .select('product_id')
      .in('collection_id', collectionKey.split(','))
      .then(({ data }) => {
        if (cancelled) return;
        setCollectionFilter({
          key: collectionKey,
          ids: new Set((data || []).map((r: { product_id: string }) => r.product_id)),
        });
      });
    return () => {
      cancelled = true;
    };
  }, [collectionKey]);

  const toggleCollection = (id: string) => {
    setSelectedCollections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Sync URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (sortBy !== 'newest') params.set('sort', sortBy);
    if (selectedCollections.size > 0) params.set('collection', Array.from(selectedCollections).join(','));
    setSearchParams(params, { replace: true });
  }, [sortBy, selectedCollections, setSearchParams]);

  // Map backend products to ProductCardProps used by this view
  const allProducts: ProductCardProps[] = useMemo(
    () =>
      (products || []).map((p) => ({
        id: p.id,
        title: localize(p.title, p.title_mk, language),
        slug: p.slug,
        price: p.price,
        image: getThumbnailUrl(p.image_url) || '',
        brand: productCollectionMap[p.id] || 'dysnomia',
        showRoomPreview: true,
        isKidsRoom: kidsProductIds.has(p.id),
      })),
    [products, productCollectionMap, kidsProductIds, language]
  );

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...allProducts];

    // Apply collection filter
    if (selectedCollections.size > 0 && collectionProductIds) {
      result = result.filter((p) => collectionProductIds.has(p.id));
    }

    // Apply sorting
    switch (sortBy) {
      case 'name':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'newest':
      default:
        // Keep original order for newest
        break;
    }

    return result;
  }, [allProducts, sortBy, selectedCollections, collectionProductIds]);

  const clearFilters = () => {
    setSelectedCollections(new Set());
  };

  const PRODUCTS_PER_PAGE = 12;
  const [visibleCount, setVisibleCount] = useState(PRODUCTS_PER_PAGE);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(PRODUCTS_PER_PAGE);
  }, [selectedCollections, collectionProductIds, sortBy]);

  const visibleProducts = filteredAndSortedProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredAndSortedProducts.length;

  const hasActiveFilters = selectedCollections.size > 0;

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', paddingTop: isMobileOrTablet ? '100px' : '120px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: `0 clamp(16px, 4vw, 48px) clamp(40px, 8vw, 80px)` }}>
        {/* Page Header */}
        <div style={{ marginBottom: isMobileOrTablet ? '24px' : '48px' }}>
          <h1
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: isMobileOrTablet ? '28px' : '42px',
              color: '#0A0A0A',
              letterSpacing: '2px',
              marginBottom: '12px'
            }}
          >
            {t('shop.shopTitle')} <span style={{ color: '#FBBE63' }}>{t('shop.shopTitleAccent')}</span>
          </h1>
          <p style={{ fontSize: isMobileOrTablet ? '14px' : '15px', color: '#666666', maxWidth: '600px' }}>
            {t('shop.shopDescription')}
          </p>
          <p style={{ fontSize: isMobileOrTablet ? '13px' : '14px', color: '#B8860B', fontStyle: 'italic', marginTop: '8px', maxWidth: '600px' }}>
            {t('shop.shopSlogan')}
          </p>
        </div>

        {/* Toolbar */}
        <div
          style={{
            marginBottom: '32px',
            paddingBottom: '16px',
            borderBottom: '1px solid #E5E5E5'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              style={{
                display: isMobileOrTablet ? 'flex' : 'none',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E5E5',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '1px',
                textTransform: 'uppercase'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </svg>
              {t('shop.filters')}
            </button>

            {/* Results Count - inline on desktop, below on mobile */}
            {!isMobileOrTablet && (
              <p style={{ fontSize: '13px', color: '#666666' }}>
                {filteredAndSortedProducts.length} {filteredAndSortedProducts.length === 1 ? t('shop.artwork') : t('shop.artworks')}
              </p>
            )}

            {/* Sort Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <label style={{ fontSize: '12px', color: '#666666', letterSpacing: '1px', display: isMobileOrTablet ? 'none' : 'block' }}>
                {t('shop.sortBy')}
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                style={{
                  padding: '8px 32px 8px 12px',
                  fontSize: '13px',
                  border: '1px solid #E5E5E5',
                  backgroundColor: '#FFFFFF',
                  cursor: 'pointer',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 10px center'
                }}
              >
                <option value="newest">{t('shop.sortNewest')}</option>
                <option value="name">{t('shop.sortName')}</option>
              </select>
            </div>
          </div>

          {/* Results Count - separate row on mobile/tablet */}
          {isMobileOrTablet && (
            <p style={{ fontSize: '12px', color: '#666666', marginTop: '10px' }}>
              {filteredAndSortedProducts.length} {filteredAndSortedProducts.length === 1 ? t('shop.artwork') : t('shop.artworks')}
            </p>
          )}
        </div>

        {/* Main Content */}
        <div style={{ display: 'flex', gap: 'clamp(24px, 4vw, 48px)' }}>
          {/* Sidebar Filters */}
          <aside
            style={{
              width: '240px',
              flexShrink: 0,
              display: isMobileOrTablet ? (mobileFiltersOpen ? 'block' : 'none') : 'block',
              ...(isMobileOrTablet && mobileFiltersOpen ? {
                position: 'fixed',
                top: isMobileOrTablet ? '47px' : '82px',
                left: 0,
                right: 0,
                bottom: 0,
                width: '100%',
                backgroundColor: '#FFFFFF',
                zIndex: 30,
                padding: '24px',
                overflowY: 'auto'
              } : {})
            }}
          >
            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                style={{
                  width: '100%',
                  padding: '12px',
                  marginBottom: '24px',
                  backgroundColor: '#FBBE63',
                  color: '#0A0A0A',
                  border: 'none',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                {t('shop.clearAllFilters')}
              </button>
            )}

            {/* Collection Filter */}
            <div style={{ marginBottom: '32px' }}>
              <h3
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: '16px',
                  color: '#0A0A0A',
                  marginBottom: '16px',
                  paddingBottom: '8px',
                  borderBottom: '1px solid #E5E5E5'
                }}
              >
                {t('shop.collectionsFilter')}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {collections.map((col) => (
                  <label
                    key={col.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      color: selectedCollections.has(col.id) ? '#0A0A0A' : '#666666',
                      fontWeight: selectedCollections.has(col.id) ? 600 : 400
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedCollections.has(col.id)}
                      onChange={() => toggleCollection(col.id)}
                      style={{ width: '16px', height: '16px', accentColor: '#FBBE63' }}
                    />
                    {localize(col.title, col.title_mk, language)}
                  </label>
                ))}
              </div>
            </div>

            {/* Gold Decorative Line */}
            <div
              style={{
                width: '40px',
                height: '2px',
                backgroundColor: '#FBBE63',
                marginTop: '24px'
              }}
            />
          </aside>

          {/* Product Grid */}
          <div style={{ flex: 1 }}>
            {loading ? (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(260px, 1fr))',
                  gap: isMobile ? '16px' : '32px'
                }}
              >
                {[...Array(8)].map((_, i) => (
                  <div key={i}>
                    <div
                      style={{
                        aspectRatio: '3/4',
                        backgroundColor: '#F5F5F5',
                        marginBottom: '12px',
                        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                      }}
                    />
                    <div
                      style={{
                        height: '12px',
                        backgroundColor: '#F5F5F5',
                        marginBottom: '8px',
                        width: '60%',
                        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                      }}
                    />
                    <div
                      style={{
                        height: '16px',
                        backgroundColor: '#F5F5F5',
                        marginBottom: '8px',
                        width: '80%',
                        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                      }}
                    />
                    <div
                      style={{
                        height: '14px',
                        backgroundColor: '#F5F5F5',
                        width: '40%',
                        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '80px 20px',
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FCA5A5'
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    margin: '0 auto 16px',
                    backgroundColor: '#FCA5A5',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <p
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: '20px',
                    color: '#DC2626',
                    marginBottom: '12px'
                  }}
                >
                  {t('shop.failedToLoad')}
                </p>
                <p style={{ fontSize: '14px', color: '#7F1D1D', marginBottom: '24px' }}>
                  {error}
                </p>
                <button
                  onClick={() => refetch()}
                  style={{
                    padding: '12px 32px',
                    backgroundColor: '#DC2626',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: 600,
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#B91C1C';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#DC2626';
                  }}
                >
                  {t('shop.tryAgain')}
                </button>
              </div>
            ) : filteredAndSortedProducts.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '80px 20px',
                  backgroundColor: '#FAFAFA',
                  border: '1px solid #E5E5E5'
                }}
              >
                <p
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: '20px',
                    color: '#0A0A0A',
                    marginBottom: '12px'
                  }}
                >
                  {t('shop.noArtworksFound')}
                </p>
                <p style={{ fontSize: '14px', color: '#666666', marginBottom: '24px' }}>
                  {t('shop.noArtworksFoundDesc')}
                </p>
                <button
                  onClick={clearFilters}
                  style={{
                    padding: '12px 32px',
                    backgroundColor: '#0A0A0A',
                    color: '#FFFFFF',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: 600,
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
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
                  {t('shop.clearFilters')}
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(260px, 1fr))',
                  gap: isMobile ? '16px' : '32px'
                }}
              >
                {visibleProducts.map((product) => (
                  <ProductCard key={product.id} {...product} />
                ))}
              </div>
            )}

            {/* Load More */}
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
                  {t('shop.loadMore')}
                </button>
                <p style={{ fontSize: '12px', color: '#666666', marginTop: '12px' }}>
                  {t('shop.showing')} {visibleCount} {t('shop.of')} {filteredAndSortedProducts.length} {t('shop.artworks')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
