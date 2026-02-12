import { useProducts } from '../hooks/useProducts';
import { Link } from 'react-router-dom';
import { formatPrice } from '../lib/utils';

export default function Home() {
  const { products, loading } = useProducts();
  const featuredProducts = products.filter(p => p.status === 'published').slice(0, 4);

  return (
    <>
      {/* Hero Section */}
      <section
        style={{
          backgroundColor: '#1a1a1a',
          backgroundImage: 'url(/logo.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          minHeight: '90vh',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}
      >
        {/* Dark Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(26, 26, 26, 0.7)'
          }}
        />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '0 24px', maxWidth: '900px', margin: '0 auto' }}>
          <h1 style={{ color: '#ffffff', fontSize: 'clamp(48px, 10vw, 96px)', fontWeight: 300, letterSpacing: '-0.02em', marginBottom: '32px' }}>
            DYSNOMIA
          </h1>

          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '18px', maxWidth: '540px', margin: '0 auto 48px', fontWeight: 300, lineHeight: 1.7 }}>
            Curating extraordinary artworks that inspire, transform, and elevate every space they inhabit.
          </p>

          <a
            href="#gallery"
            style={{
              display: 'inline-block',
              padding: '16px 40px',
              backgroundColor: '#B8860B',
              color: '#ffffff',
              fontWeight: 500,
              letterSpacing: '0.05em',
              textDecoration: 'none'
            }}
          >
            View Collection
          </a>
        </div>

        {/* Scroll Indicator */}
        <div style={{ position: 'absolute', bottom: '80px', left: '50%', transform: 'translateX(-50%)' }}>
          <div style={{ width: '1px', height: '64px', background: 'linear-gradient(to bottom, #B8860B, transparent)' }} />
        </div>

        {/* Wave Divider */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, overflow: 'hidden', lineHeight: 0 }}>
          <svg
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            style={{ width: '100%', height: '120px', display: 'block' }}
          >
            <path
              d="M0,40 C150,100 350,0 500,50 C650,100 750,20 900,60 C1050,100 1100,30 1200,50 L1200,120 L0,120 Z"
              fill="#ffffff"
            />
          </svg>
        </div>
      </section>

      {/* About Section */}
      <section style={{ backgroundColor: '#ffffff', padding: '96px 24px', width: '100%' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '64px', alignItems: 'center' }}>
            <div>
              <p style={{ color: '#B8860B', fontSize: '14px', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '16px', fontWeight: 500 }}>
                About the Gallery
              </p>
              <h2 style={{ color: '#1a1a1a', fontSize: '36px', fontWeight: 300, marginBottom: '24px', lineHeight: 1.2 }}>
                Where Art Meets <span style={{ color: '#B8860B' }}>Passion</span>
              </h2>
              <p style={{ color: '#4a4a4a', lineHeight: 1.8, marginBottom: '24px' }}>
                Dysnomia Art Gallery is dedicated to showcasing exceptional contemporary artworks
                from emerging and established artists. Each piece in our collection is carefully
                selected for its unique artistic vision and exceptional craftsmanship.
              </p>
              <p style={{ color: '#4a4a4a', lineHeight: 1.8 }}>
                We believe that art has the power to transform spaces and inspire emotions.
                Our mission is to connect art lovers with pieces that resonate with their
                personal aesthetic.
              </p>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {[
                { value: `${products.length}+`, label: 'Artworks' },
                { value: products.filter(p => p.status === 'sold').length, label: 'Sold' },
                { value: 'Global', label: 'Shipping' },
                { value: '24/7', label: 'Online' }
              ].map((stat, i) => (
                <div key={i} style={{ backgroundColor: '#f5f5f5', padding: '32px', textAlign: 'center' }}>
                  <p style={{ color: '#B8860B', fontSize: '36px', fontWeight: 300, marginBottom: '8px' }}>{stat.value}</p>
                  <p style={{ color: '#6b6b6b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      {featuredProducts.length > 0 && (
        <section style={{ backgroundColor: '#fafafa', padding: '64px 24px' }}>
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <p style={{ color: '#B8860B', fontSize: '12px', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '12px' }}>Curated Selection</p>
              <h2 style={{ fontSize: '28px', fontWeight: 300, color: '#1a1a1a' }}>Featured Artworks</h2>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              {featuredProducts.map((product) => (
                <Link key={product.id} to={`/artwork/${product.slug}`} style={{ display: 'block', width: '150px', backgroundColor: '#fff', textDecoration: 'none' }}>
                  <div style={{ width: '150px', height: '180px', position: 'relative', overflow: 'hidden' }}>
                    <img src={product.image_url || ''} alt={product.title} style={{ position: 'absolute', top: 0, left: 0, width: '150px', height: '180px', objectFit: 'cover' }} />
                    {product.status === 'sold' && <span style={{ position: 'absolute', top: '6px', left: '6px', backgroundColor: '#000', color: '#fff', fontSize: '9px', padding: '2px 6px', textTransform: 'uppercase' }}>Sold</span>}
                  </div>
                  <div style={{ padding: '8px' }}>
                    <h3 style={{ fontSize: '12px', fontWeight: 500, color: '#1a1a1a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.title}</h3>
                    <p style={{ fontSize: '12px', color: '#B8860B', fontWeight: 500 }}>{formatPrice(product.price)}</p>
                  </div>
                </Link>
              ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: '32px' }}>
              <a href="#gallery" style={{ color: '#1a1a1a', fontWeight: 500, textDecoration: 'none' }}>View All Artworks →</a>
            </div>
          </div>
        </section>
      )}

      {/* Full Gallery */}
      <section id="gallery" style={{ backgroundColor: '#ffffff', padding: '96px 24px', width: '100%' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <p style={{ color: '#B8860B', fontSize: '14px', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '16px', fontWeight: 500 }}>
              Browse
            </p>
            <h2 style={{ color: '#1a1a1a', fontSize: '36px', fontWeight: 300, marginBottom: '16px' }}>
              Complete Collection
            </h2>
            <p style={{ color: '#6b6b6b', maxWidth: '540px', margin: '0 auto' }}>
              Explore our full gallery of original artworks available for acquisition.
            </p>
          </div>

          {/* Loading */}
          {loading && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
              {[...Array(10)].map((_, i) => (
                <div key={i}>
                  <div style={{ width: '100%', aspectRatio: '3/4', backgroundColor: '#f5f5f5' }} />
                  <div style={{ padding: '10px' }}>
                    <div style={{ height: '12px', backgroundColor: '#f5f5f5', width: '75%', marginBottom: '6px' }} />
                    <div style={{ height: '12px', backgroundColor: '#f5f5f5', width: '40%' }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && products.length === 0 && (
            <div style={{ textAlign: 'center', padding: '64px 0' }}>
              <p style={{ color: '#6b6b6b', fontSize: '18px' }}>No artworks available at the moment.</p>
            </div>
          )}

          {/* Products Grid */}
          {!loading && products.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
              {products.map((product) => (
                <Link
                  key={product.id}
                  to={`/artwork/${product.slug}`}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e5e5',
                    textDecoration: 'none',
                    display: 'block',
                    transition: 'box-shadow 0.3s'
                  }}
                >
                  <div style={{ position: 'relative', width: '100%', aspectRatio: '3/4', overflow: 'hidden' }}>
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg style={{ width: '24px', height: '24px', color: '#e5e5e5' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    {product.status === 'sold' && (
                      <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ backgroundColor: '#B8860B', color: '#ffffff', padding: '4px 10px', fontSize: '11px', letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 500 }}>
                          Sold
                        </span>
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '10px', borderTop: '1px solid #e5e5e5' }}>
                    <h3 style={{ color: '#1a1a1a', fontWeight: 500, marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '13px' }}>
                      {product.title}
                    </h3>
                    <p style={{ color: '#B8860B', fontWeight: 600, fontSize: '13px' }}>{formatPrice(product.price)}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ backgroundColor: '#1a1a1a', padding: '96px 24px', width: '100%' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ color: '#B8860B', fontSize: '14px', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '16px', fontWeight: 500 }}>
            Custom Work
          </p>
          <h2 style={{ color: '#ffffff', fontSize: '36px', fontWeight: 300, marginBottom: '24px' }}>
            Commission a Piece
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', maxWidth: '600px', margin: '0 auto 40px', lineHeight: 1.7 }}>
            Looking for something unique? Work directly with our artists to create
            a custom artwork tailored to your vision and space.
          </p>
          <button
            style={{
              padding: '16px 40px',
              border: '2px solid #B8860B',
              backgroundColor: 'transparent',
              color: '#B8860B',
              fontWeight: 500,
              letterSpacing: '0.05em',
              cursor: 'pointer'
            }}
          >
            Get in Touch
          </button>
        </div>
      </section>
    </>
  );
}
