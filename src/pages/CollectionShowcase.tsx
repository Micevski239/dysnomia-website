import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Collection, Product } from '../types';
import { formatPrice } from '../lib/utils';
import { useBreakpoint } from '../hooks/useBreakpoint';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=1000&h=1400&fit=crop';

interface CollectionProductRow {
  product: Product | null;
}

export default function CollectionShowcase() {
  const { slug } = useParams<{ slug: string }>();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [artworks, setArtworks] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isMobile } = useBreakpoint();

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

  return (
    <div style={{ backgroundColor: '#f6f3ed', minHeight: '100vh', color: '#1a1813' }}>
      <section style={{ position: 'relative', minHeight: '65vh', overflow: 'hidden' }}>
        <img
          src={heroImage}
          alt={collection?.title || 'Collection cover'}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(15%) brightness(0.85)' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(115deg, rgba(10,10,10,0.8), rgba(10,10,10,0.35))' }} />
        <div style={{ position: 'relative', maxWidth: '1100px', margin: '0 auto', padding: `clamp(80px, 12vw, 120px) clamp(16px, 3vw, 32px) clamp(40px, 8vw, 80px)`, display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'minmax(0,1fr) 0.7fr', gap: 'clamp(24px, 4vw, 32px)' }}>
          <div>
            <p style={{ fontSize: '12px', letterSpacing: '0.4em', textTransform: 'uppercase', color: '#eadcc0' }}>Collection</p>
            <h1 style={{ fontSize: '46px', fontWeight: 400, color: '#ffffff', margin: '12px 0 16px' }}>
              {collection?.title || 'Collection'}
            </h1>
            <p style={{ fontSize: '17px', lineHeight: 1.7, color: 'rgba(255,255,255,0.86)' }}>
              {collection?.description || 'Explore the palette and textures that define this capsule. Each artwork echoes the tone set by the hero imagery.'}
            </p>
            <div style={{ marginTop: '32px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link
                to="/collections"
                style={{ padding: '14px 32px', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.5)', color: '#ffffff', letterSpacing: '0.35em', textTransform: 'uppercase', textDecoration: 'none', fontSize: '12px' }}
              >
                Back to collections
              </Link>
              <Link
                to="/shop"
                style={{ padding: '14px 32px', borderRadius: '999px', backgroundColor: '#ffffff', color: '#0f0f0f', letterSpacing: '0.35em', textTransform: 'uppercase', textDecoration: 'none', fontSize: '12px' }}
              >
                Shop all
              </Link>
            </div>
          </div>
          <div style={{ display: 'grid', gap: '16px' }}>
            <div style={{ border: '1px solid rgba(255,255,255,0.3)', borderRadius: '24px', padding: '20px', color: '#f5ead4' }}>
              <p style={{ fontSize: '12px', letterSpacing: '0.35em', textTransform: 'uppercase', color: '#eadcc0', marginBottom: '8px' }}>Pieces</p>
              <p style={{ fontSize: '34px', fontWeight: 500 }}>{artworks.length > 0 ? artworks.length : '—'}</p>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.75)' }}>Linked artworks in this capsule</p>
            </div>
            <div style={{ border: '1px solid rgba(255,255,255,0.3)', borderRadius: '24px', padding: '20px', color: '#f5ead4' }}>
              <p style={{ fontSize: '12px', letterSpacing: '0.35em', textTransform: 'uppercase', color: '#eadcc0', marginBottom: '8px' }}>Updated</p>
              <p style={{ fontSize: '18px', fontWeight: 500 }}>
                {collection ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(collection.updated_at)) : '—'}
              </p>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.75)' }}>Last curation refresh</p>
            </div>
          </div>
        </div>
      </section>

      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: 'clamp(32px, 5vw, 48px) clamp(16px, 3vw, 24px) clamp(48px, 8vw, 80px)' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <p style={{ fontSize: '11px', letterSpacing: '0.35em', textTransform: 'uppercase', color: '#a89c8c', marginBottom: '12px' }}>Artworks</p>
          <h2 style={{ fontSize: '34px', fontWeight: 400, color: '#151310' }}>Pieces in this capsule</h2>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#7a7266' }}>Loading artworks…</div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#b3261e' }}>{error}</div>
        ) : artworks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#7a7266' }}>
            This collection does not have any artworks linked yet.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
            {artworks.map((product, index) => (
              <ProductTile key={product.id} product={product} highlight={index % 5 === 0} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ProductTile({ product, highlight }: { product: Product; highlight: boolean }) {
  return (
    <Link
      to={`/artwork/${product.slug}`}
      style={{
        display: 'block',
        backgroundColor: '#ffffff',
        borderRadius: '32px',
        overflow: 'hidden',
        textDecoration: 'none',
        color: '#151310',
        boxShadow: highlight ? '0 40px 110px rgba(20,17,15,0.15)' : '0 25px 70px rgba(20,17,15,0.08)',
        minHeight: highlight ? '520px' : '420px'
      }}
    >
      <div style={{ position: 'relative', height: highlight ? '360px' : '280px', overflow: 'hidden' }}>
        <img
          src={product.image_url || FALLBACK_IMAGE}
          alt={product.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease', transform: 'scale(1)' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent, rgba(0,0,0,0.45))' }} />
        <span style={{ position: 'absolute', top: '16px', left: '16px', backgroundColor: '#ffffff', color: '#0f0f0f', fontSize: '10px', fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', padding: '6px 12px' }}>
          {product.status}
        </span>
      </div>
      <div style={{ padding: '24px' }}>
        <p style={{ fontSize: '11px', letterSpacing: '0.35em', color: '#a79c8c', textTransform: 'uppercase', marginBottom: '6px' }}>Artwork</p>
        <h3 style={{ fontSize: '22px', fontWeight: 600, marginBottom: '4px' }}>{product.title}</h3>
        <p style={{ fontSize: '14px', color: '#6d6459' }}>{formatPrice(Number(product.price) || 0)}</p>
      </div>
    </Link>
  );
}
