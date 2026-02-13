import { useState, useEffect, useMemo } from 'react';
import { useProducts } from '../../hooks/useProducts';
import { useBestsellers, useNewArrivalsSpotlight, useFeaturedSectionMutations } from '../../hooks/useFeaturedSections';
import { AdminCard } from '../../components/admin';
import { Star, X, Search, Save, GripVertical } from 'lucide-react';
import type { Product } from '../../types';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=80&h=80&fit=crop';

export default function FeaturedManager() {
  const { products: allProducts } = useProducts(true);
  const { products: currentBestsellers, spotlightProductId: currentBsSpotlight, refetch: refetchBestsellers } = useBestsellers();
  const { spotlightProductId: currentNaSpotlight } = useNewArrivalsSpotlight();
  const { setBestsellers, setSpotlight, loading: saving } = useFeaturedSectionMutations();

  // Bestsellers state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bsSpotlightId, setBsSpotlightId] = useState<string | null>(null);
  const [bsSearch, setBsSearch] = useState('');
  const [bsSaveSuccess, setBsSaveSuccess] = useState(false);

  // New Arrivals state
  const [naSpotlightId, setNaSpotlightId] = useState<string | null>(null);
  const [naSearch, setNaSearch] = useState('');
  const [naSaveSuccess, setNaSaveSuccess] = useState(false);

  const publishedProducts = useMemo(
    () => allProducts.filter((p) => p.status === 'published'),
    [allProducts]
  );

  // Initialize from current data
  useEffect(() => {
    if (currentBestsellers.length > 0) {
      setSelectedIds(currentBestsellers.map((p) => p.id));
    }
  }, [currentBestsellers]);

  useEffect(() => {
    if (currentBsSpotlight) setBsSpotlightId(currentBsSpotlight);
  }, [currentBsSpotlight]);

  useEffect(() => {
    if (currentNaSpotlight) setNaSpotlightId(currentNaSpotlight);
  }, [currentNaSpotlight]);

  // Filtered products for search
  const filteredForBs = useMemo(() => {
    if (!bsSearch.trim()) return publishedProducts;
    const q = bsSearch.toLowerCase();
    return publishedProducts.filter((p) => p.title.toLowerCase().includes(q));
  }, [publishedProducts, bsSearch]);

  const filteredForNa = useMemo(() => {
    if (!naSearch.trim()) return publishedProducts;
    const q = naSearch.toLowerCase();
    return publishedProducts.filter((p) => p.title.toLowerCase().includes(q));
  }, [publishedProducts, naSearch]);

  const selectedProducts = useMemo(
    () => selectedIds.map((id) => publishedProducts.find((p) => p.id === id)).filter((p): p is Product => !!p),
    [selectedIds, publishedProducts]
  );

  const toggleProduct = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        const next = prev.filter((x) => x !== id);
        if (bsSpotlightId === id) setBsSpotlightId(next[0] || null);
        return next;
      }
      if (prev.length >= 12) return prev;
      return [...prev, id];
    });
  };

  const removeProduct = (id: string) => {
    setSelectedIds((prev) => prev.filter((x) => x !== id));
    if (bsSpotlightId === id) setBsSpotlightId(null);
  };

  const handleSaveBestsellers = async () => {
    try {
      await setBestsellers(selectedIds);
      await setSpotlight('bestsellers', bsSpotlightId);
      await refetchBestsellers();
      setBsSaveSuccess(true);
      setTimeout(() => setBsSaveSuccess(false), 3000);
    } catch {
      // error is handled in the hook
    }
  };

  const handleSaveNaSpotlight = async () => {
    try {
      await setSpotlight('new_arrivals', naSpotlightId);
      setNaSaveSuccess(true);
      setTimeout(() => setNaSaveSuccess(false), 3000);
    } catch {
      // error is handled in the hook
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Page Header */}
      <div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1a1a1a', marginBottom: '4px' }}>
          Featured Sections
        </h1>
        <p style={{ fontSize: '14px', color: '#777' }}>
          Manage which products appear on the Bestsellers and New Arrivals pages
        </p>
      </div>

      {/* ─── BESTSELLERS SECTION ─── */}
      <AdminCard title={`Bestsellers (${selectedIds.length}/12)`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Selected products */}
          {selectedProducts.length > 0 && (
            <div>
              <p style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#999', marginBottom: '12px' }}>
                Selected Products — Click star to set as spotlight
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {selectedProducts.map((product) => (
                  <div
                    key={product.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      backgroundColor: bsSpotlightId === product.id ? '#FFF8E7' : '#FAFAFA',
                      border: bsSpotlightId === product.id ? '1px solid #FBBE63' : '1px solid #E8E8E8',
                    }}
                  >
                    <GripVertical style={{ width: '16px', height: '16px', color: '#CCC', flexShrink: 0 }} />
                    <img
                      src={product.image_url || FALLBACK_IMAGE}
                      alt={product.title}
                      style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }}
                    />
                    <span style={{ flex: 1, fontSize: '14px', fontWeight: 500, color: '#1a1a1a' }}>
                      {product.title}
                    </span>
                    <button
                      onClick={() => setBsSpotlightId(bsSpotlightId === product.id ? null : product.id)}
                      title={bsSpotlightId === product.id ? 'Remove spotlight' : 'Set as spotlight'}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: 'pointer',
                        backgroundColor: bsSpotlightId === product.id ? '#FBBE63' : 'transparent',
                        color: bsSpotlightId === product.id ? '#1a1a1a' : '#CCC',
                        transition: 'all 0.15s',
                      }}
                    >
                      <Star style={{ width: '16px', height: '16px' }} fill={bsSpotlightId === product.id ? 'currentColor' : 'none'} />
                    </button>
                    <button
                      onClick={() => removeProduct(product.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: 'pointer',
                        backgroundColor: 'transparent',
                        color: '#999',
                        transition: 'all 0.15s',
                      }}
                    >
                      <X style={{ width: '16px', height: '16px' }} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search to add */}
          <div>
            <p style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#999', marginBottom: '12px' }}>
              Add Products
            </p>
            <div style={{ position: 'relative', marginBottom: '12px' }}>
              <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#999' }} />
              <input
                type="text"
                placeholder="Search products..."
                value={bsSearch}
                onChange={(e) => setBsSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 36px',
                  borderRadius: '10px',
                  border: '1px solid #E8E8E8',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {filteredForBs.map((product) => {
                const isSelected = selectedIds.includes(product.id);
                return (
                  <button
                    key={product.id}
                    onClick={() => toggleProduct(product.id)}
                    disabled={!isSelected && selectedIds.length >= 12}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: !isSelected && selectedIds.length >= 12 ? 'not-allowed' : 'pointer',
                      backgroundColor: isSelected ? '#E8F5E9' : 'transparent',
                      opacity: !isSelected && selectedIds.length >= 12 ? 0.4 : 1,
                      textAlign: 'left',
                      width: '100%',
                      transition: 'background-color 0.15s',
                    }}
                  >
                    <img
                      src={product.image_url || FALLBACK_IMAGE}
                      alt={product.title}
                      style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }}
                    />
                    <span style={{ flex: 1, fontSize: '14px', color: '#1a1a1a' }}>{product.title}</span>
                    <span style={{ fontSize: '12px', color: '#999' }}>
                      {isSelected ? 'Selected' : 'Add'}
                    </span>
                  </button>
                );
              })}
              {filteredForBs.length === 0 && (
                <p style={{ padding: '20px', textAlign: 'center', fontSize: '14px', color: '#999' }}>
                  No products found
                </p>
              )}
            </div>
          </div>

          {/* Save */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={handleSaveBestsellers}
              disabled={saving}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                borderRadius: '10px',
                border: 'none',
                cursor: saving ? 'not-allowed' : 'pointer',
                backgroundColor: '#1a1a1a',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 600,
                opacity: saving ? 0.6 : 1,
                transition: 'opacity 0.15s',
              }}
            >
              <Save style={{ width: '16px', height: '16px' }} />
              {saving ? 'Saving...' : 'Save Bestsellers'}
            </button>
            {bsSaveSuccess && (
              <span style={{ fontSize: '13px', color: '#4CAF50', fontWeight: 500 }}>
                Saved successfully!
              </span>
            )}
          </div>
        </div>
      </AdminCard>

      {/* ─── NEW ARRIVALS SPOTLIGHT ─── */}
      <AdminCard title="New Arrivals Spotlight">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ fontSize: '14px', color: '#666', lineHeight: 1.5 }}>
            The New Arrivals page automatically shows the 12 newest products.
            Use this to override which product appears in the spotlight hero section.
          </p>

          {/* Current spotlight display */}
          {naSpotlightId && (() => {
            const product = publishedProducts.find((p) => p.id === naSpotlightId);
            if (!product) return null;
            return (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  borderRadius: '10px',
                  backgroundColor: '#FFF8E7',
                  border: '1px solid #FBBE63',
                }}
              >
                <Star style={{ width: '16px', height: '16px', color: '#FBBE63', flexShrink: 0 }} fill="#FBBE63" />
                <img
                  src={product.image_url || FALLBACK_IMAGE}
                  alt={product.title}
                  style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }}
                />
                <span style={{ flex: 1, fontSize: '14px', fontWeight: 500, color: '#1a1a1a' }}>
                  {product.title}
                </span>
                <button
                  onClick={() => setNaSpotlightId(null)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: 'transparent',
                    color: '#999',
                  }}
                >
                  <X style={{ width: '16px', height: '16px' }} />
                </button>
              </div>
            );
          })()}

          {/* Search / select */}
          <div style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#999' }} />
            <input
              type="text"
              placeholder="Search products to set as spotlight..."
              value={naSearch}
              onChange={(e) => setNaSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px 10px 36px',
                borderRadius: '10px',
                border: '1px solid #E8E8E8',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <div style={{ maxHeight: '240px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {filteredForNa.map((product) => {
              const isActive = naSpotlightId === product.id;
              return (
                <button
                  key={product.id}
                  onClick={() => setNaSpotlightId(isActive ? null : product.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: isActive ? '#FFF8E7' : 'transparent',
                    textAlign: 'left',
                    width: '100%',
                    transition: 'background-color 0.15s',
                  }}
                >
                  <img
                    src={product.image_url || FALLBACK_IMAGE}
                    alt={product.title}
                    style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }}
                  />
                  <span style={{ flex: 1, fontSize: '14px', color: '#1a1a1a' }}>{product.title}</span>
                  {isActive && <Star style={{ width: '14px', height: '14px', color: '#FBBE63' }} fill="#FBBE63" />}
                </button>
              );
            })}
          </div>

          {/* Save */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={handleSaveNaSpotlight}
              disabled={saving}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                borderRadius: '10px',
                border: 'none',
                cursor: saving ? 'not-allowed' : 'pointer',
                backgroundColor: '#1a1a1a',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 600,
                opacity: saving ? 0.6 : 1,
                transition: 'opacity 0.15s',
              }}
            >
              <Save style={{ width: '16px', height: '16px' }} />
              {saving ? 'Saving...' : 'Save Spotlight'}
            </button>
            {naSaveSuccess && (
              <span style={{ fontSize: '13px', color: '#4CAF50', fontWeight: 500 }}>
                Saved successfully!
              </span>
            )}
          </div>
        </div>
      </AdminCard>
    </div>
  );
}
