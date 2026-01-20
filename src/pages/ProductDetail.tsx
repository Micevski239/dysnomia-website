import { useParams, Link } from 'react-router-dom';
import { useProduct } from '../hooks/useProducts';
import { formatPrice } from '../lib/utils';

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { product, loading, error } = useProduct(slug || '');

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', padding: '48px 24px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '48px' }}>
            <div style={{ aspectRatio: '3/4', backgroundColor: '#f5f5f5' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ height: '32px', backgroundColor: '#f5f5f5', width: '75%' }} />
              <div style={{ height: '24px', backgroundColor: '#f5f5f5', width: '25%' }} />
              <div style={{ height: '128px', backgroundColor: '#f5f5f5' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '80px', height: '80px', margin: '0 auto 24px', border: '2px solid #e5e5e5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg style={{ width: '32px', height: '32px', color: '#6b6b6b' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 300, color: '#1a1a1a', marginBottom: '16px' }}>Artwork Not Found</h2>
          <p style={{ color: '#6b6b6b', marginBottom: '32px' }}>
            The artwork you're looking for doesn't exist or has been removed.
          </p>
          <Link
            to="/"
            style={{
              display: 'inline-block',
              padding: '12px 32px',
              backgroundColor: '#B8860B',
              color: '#ffffff',
              fontWeight: 500,
              letterSpacing: '0.02em',
              textDecoration: 'none'
            }}
          >
            Back to Gallery
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', padding: '48px 24px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* Back Link */}
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            color: '#6b6b6b',
            fontSize: '14px',
            textDecoration: 'none',
            marginBottom: '32px'
          }}
        >
          <svg style={{ width: '16px', height: '16px', marginRight: '8px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Gallery
        </Link>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '64px' }}>
          {/* Image */}
          <div style={{ position: 'relative' }}>
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.title}
                style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover' }}
              />
            ) : (
              <div style={{ width: '100%', aspectRatio: '3/4', backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg style={{ width: '64px', height: '64px', color: '#e5e5e5' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            {product.status === 'sold' && (
              <div style={{ position: 'absolute', top: '24px', left: '24px' }}>
                <span style={{ backgroundColor: '#1a1a1a', color: '#ffffff', padding: '8px 16px', fontSize: '14px', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500 }}>
                  Sold
                </span>
              </div>
            )}
          </div>

          {/* Details */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <p style={{ color: '#B8860B', fontSize: '14px', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 500 }}>
              Original Artwork
            </p>

            <h1 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 300, color: '#1a1a1a', marginBottom: '16px' }}>
              {product.title}
            </h1>

            <p style={{ fontSize: '32px', color: '#B8860B', fontWeight: 500, marginBottom: '32px' }}>
              {formatPrice(product.price)}
            </p>

            {product.status === 'sold' ? (
              <div style={{ backgroundColor: '#f5f5f5', border: '1px solid #e5e5e5', padding: '24px', marginBottom: '32px' }}>
                <p style={{ color: '#4a4a4a', fontSize: '14px' }}>
                  This artwork has been sold. Contact us for similar pieces or to commission a custom work.
                </p>
              </div>
            ) : (
              <button
                style={{
                  padding: '16px 40px',
                  backgroundColor: '#B8860B',
                  color: '#ffffff',
                  fontWeight: 500,
                  letterSpacing: '0.02em',
                  border: 'none',
                  cursor: 'pointer',
                  marginBottom: '32px',
                  alignSelf: 'flex-start'
                }}
              >
                Inquire About This Piece
              </button>
            )}

            {product.description && (
              <div style={{ borderTop: '1px solid #e5e5e5', paddingTop: '32px', marginBottom: '32px' }}>
                <h2 style={{ fontSize: '12px', fontWeight: 600, color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>
                  Description
                </h2>
                <p style={{ color: '#4a4a4a', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                  {product.description}
                </p>
              </div>
            )}

            <div style={{ borderTop: '1px solid #e5e5e5', paddingTop: '32px', marginTop: 'auto' }}>
              <h2 style={{ fontSize: '12px', fontWeight: 600, color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>
                Details
              </h2>
              <dl style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', fontSize: '14px' }}>
                <div>
                  <dt style={{ color: '#6b6b6b', marginBottom: '4px' }}>Status</dt>
                  <dd style={{ color: '#1a1a1a', textTransform: 'capitalize' }}>{product.status}</dd>
                </div>
                <div>
                  <dt style={{ color: '#6b6b6b', marginBottom: '4px' }}>Added</dt>
                  <dd style={{ color: '#1a1a1a' }}>
                    {new Date(product.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
