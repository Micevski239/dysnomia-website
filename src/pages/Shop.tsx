import { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/shop/ProductCard';
import type { ProductCardProps } from '../components/shop/ProductCard';
import { useProducts } from '../hooks/useProducts';
import { useCollections } from '../hooks/useCollections';
import { supabase } from '../lib/supabase';
import { useBreakpoint } from '../hooks/useBreakpoint';

type SortOption = 'newest' | 'price-low' | 'price-high' | 'name';
type PriceFilter = 'all' | 'under-100' | '100-200' | '200-300' | 'over-300';

const VALID_SORT_OPTIONS: SortOption[] = ['newest', 'price-low', 'price-high', 'name'];
const VALID_PRICE_FILTERS: PriceFilter[] = ['all', 'under-100', '100-200', '200-300', 'over-300'];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize state from URL params
  const initialSort = (searchParams.get('sort') as SortOption) || 'newest';
  const initialCollections = searchParams.get('collection')?.split(',').filter(Boolean) || [];
  const initialPrice = (searchParams.get('price') as PriceFilter) || 'all';
  const initialSale = searchParams.get('sale') === 'true';

  const [sortBy, setSortBy] = useState<SortOption>(
    VALID_SORT_OPTIONS.includes(initialSort) ? initialSort : 'newest'
  );
  const [selectedCollections, setSelectedCollections] = useState<Set<string>>(new Set(initialCollections));
  const [priceFilter, setPriceFilter] = useState<PriceFilter>(
    VALID_PRICE_FILTERS.includes(initialPrice) ? initialPrice : 'all'
  );
  const [showOnSale, setShowOnSale] = useState(initialSale);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [collectionProductIds, setCollectionProductIds] = useState<Set<string> | null>(null);
  const [productCollectionMap, setProductCollectionMap] = useState<Record<string, string>>({});
  const { products, loading, error, refetch } = useProducts();
  const { collections } = useCollections();
  const { isMobileOrTablet } = useBreakpoint();

  // Build product → collection name lookup
  useEffect(() => {
    async function fetchProductCollections() {
      const { data } = await supabase
        .from('collection_products')
        .select('product_id, collection:collections(title)');
      if (data) {
        const map: Record<string, string> = {};
        for (const row of data as { product_id: string; collection: { title: string }[] | null }[]) {
          if (row.collection?.[0]?.title) {
            map[row.product_id] = row.collection[0].title;
          }
        }
        setProductCollectionMap(map);
      }
    }
    fetchProductCollections();
  }, []);

  // Fetch product IDs for selected collections
  const fetchCollectionProducts = useCallback(async (collectionIds: Set<string>) => {
    if (collectionIds.size === 0) {
      setCollectionProductIds(null);
      return;
    }
    const { data } = await supabase
      .from('collection_products')
      .select('product_id')
      .in('collection_id', Array.from(collectionIds));
    setCollectionProductIds(new Set((data || []).map((r: { product_id: string }) => r.product_id)));
  }, []);

  useEffect(() => {
    fetchCollectionProducts(selectedCollections);
  }, [selectedCollections, fetchCollectionProducts]);

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
    if (priceFilter !== 'all') params.set('price', priceFilter);
    if (showOnSale) params.set('sale', 'true');
    setSearchParams(params, { replace: true });
  }, [sortBy, selectedCollections, priceFilter, showOnSale, setSearchParams]);

  // Map backend products to ProductCardProps used by this view
  const allProducts: ProductCardProps[] = useMemo(
    () =>
      (products || []).map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        price: p.price,
        image: p.image_url ?? '',
        brand: productCollectionMap[p.id] || 'dysnomia',
        showRoomPreview: true,
      })),
    [products, productCollectionMap]
  );

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...allProducts];

    // Apply collection filter
    if (selectedCollections.size > 0 && collectionProductIds) {
      result = result.filter((p) => collectionProductIds.has(p.id));
    }

    // Apply price filter
    if (priceFilter !== 'all') {
      result = result.filter((p) => {
        if (priceFilter === 'under-100') return p.price < 100;
        if (priceFilter === '100-200') return p.price >= 100 && p.price < 200;
        if (priceFilter === '200-300') return p.price >= 200 && p.price < 300;
        if (priceFilter === 'over-300') return p.price >= 300;
        return true;
      });
    }

    // Apply sale filter
    if (showOnSale) {
      result = result.filter((p) => p.badge === 'sale');
    }

    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'newest':
      default:
        // Keep original order for newest
        break;
    }

    return result;
  }, [allProducts, sortBy, selectedCollections, collectionProductIds, priceFilter, showOnSale]);

  const clearFilters = () => {
    setSelectedCollections(new Set());
    setPriceFilter('all');
    setShowOnSale(false);
  };

  const PRODUCTS_PER_PAGE = 12;
  const [visibleCount, setVisibleCount] = useState(PRODUCTS_PER_PAGE);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(PRODUCTS_PER_PAGE);
  }, [selectedCollections, collectionProductIds, priceFilter, showOnSale, sortBy]);

  const visibleProducts = filteredAndSortedProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredAndSortedProducts.length;

  const hasActiveFilters = selectedCollections.size > 0 || priceFilter !== 'all' || showOnSale;

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', paddingTop: '120px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: `0 clamp(16px, 4vw, 48px) clamp(40px, 8vw, 80px)` }}>
        {/* Page Header */}
        <div style={{ marginBottom: '48px' }}>
          <h1
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '42px',
              color: '#0A0A0A',
              letterSpacing: '2px',
              marginBottom: '12px'
            }}
          >
            Shop <span style={{ color: '#FBBE63' }}>All</span>
          </h1>
          <p style={{ fontSize: '15px', color: '#666666', maxWidth: '600px' }}>
            Explore our complete collection of unique artworks and decorative pieces.
            Each piece is crafted with care, style, and sustainability in mind.
          </p>
        </div>

        {/* Toolbar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '32px',
            paddingBottom: '16px',
            borderBottom: '1px solid #E5E5E5'
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
            Filters
          </button>

          {/* Results Count */}
          <p style={{ fontSize: '13px', color: '#666666' }}>
            {filteredAndSortedProducts.length} {filteredAndSortedProducts.length === 1 ? 'artwork' : 'artworks'}
          </p>

          {/* Sort Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <label style={{ fontSize: '12px', color: '#666666', letterSpacing: '1px' }}>
              Sort by:
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
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name A-Z</option>
            </select>
          </div>
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
                top: '82px',
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
                Clear All Filters
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
                Collections
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
                    {col.title}
                  </label>
                ))}
              </div>
            </div>

            {/* Price Filter */}
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
                Price
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { value: 'all', label: 'All Prices' },
                  { value: 'under-100', label: 'Under €100' },
                  { value: '100-200', label: '€100 - €200' },
                  { value: '200-300', label: '€200 - €300' },
                  { value: 'over-300', label: 'Over €300' }
                ].map((option) => (
                  <label
                    key={option.value}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      color: priceFilter === option.value ? '#0A0A0A' : '#666666',
                      fontWeight: priceFilter === option.value ? 600 : 400
                    }}
                  >
                    <input
                      type="radio"
                      name="price"
                      value={option.value}
                      checked={priceFilter === option.value}
                      onChange={(e) => setPriceFilter(e.target.value as PriceFilter)}
                      style={{
                        width: '16px',
                        height: '16px',
                        accentColor: '#FBBE63'
                      }}
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Sale Filter */}
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
                Special Offers
              </h3>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  color: showOnSale ? '#0A0A0A' : '#666666',
                  fontWeight: showOnSale ? 600 : 400
                }}
              >
                <input
                  type="checkbox"
                  checked={showOnSale}
                  onChange={(e) => setShowOnSale(e.target.checked)}
                  style={{
                    width: '16px',
                    height: '16px',
                    accentColor: '#FBBE63'
                  }}
                />
                On Sale
              </label>
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
                  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                  gap: '32px'
                }}
              >
                {[...Array(8)].map((_, i) => (
                  <div key={i} style={{ width: '260px' }}>
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
                  Failed to load artworks
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
                  Try Again
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
                  No artworks found
                </p>
                <p style={{ fontSize: '14px', color: '#666666', marginBottom: '24px' }}>
                  Try adjusting your filters to find what you're looking for.
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
                  Clear Filters
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                  gap: '32px'
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
                  Load More
                </button>
                <p style={{ fontSize: '12px', color: '#666666', marginTop: '12px' }}>
                  Showing {visibleCount} of {filteredAndSortedProducts.length} artworks
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
