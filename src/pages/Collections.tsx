import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCollections } from '../hooks/useCollections';
import { useBreakpoint } from '../hooks/useBreakpoint';

const placeholderImage = 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&h=1000&fit=crop';

export default function CollectionsPage() {
  const { collections, loading, error } = useCollections();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const { isMobile } = useBreakpoint();

  const renderState = () => {
    if (loading) {
      return (
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#666666' }}>
          Loading collections...
        </div>
      );
    }

    if (error) {
      return (
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#B00020' }}>
          Unable to load collections right now. Please try again later.
        </div>
      );
    }

    if (collections.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#666666' }}>
          No collections are available at the moment.
        </div>
      );
    }

    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
          gap: 'clamp(12px, 2vw, 24px)'
        }}
      >
        {collections.map((collection) => {
          const coverImage = collection.cover_image ?? collection.cover_image_url ?? placeholderImage;
          const isHovered = hoveredId === collection.id;

          return (
            <Link
              key={collection.id}
              to={`/collections/${collection.slug}`}
              style={{
                position: 'relative',
                aspectRatio: '3/4',
                overflow: 'hidden',
                textDecoration: 'none',
                border: isHovered ? '1px solid #FBBE63' : '1px solid #E5E5E5',
                transition: 'all 0.4s ease'
              }}
              onMouseEnter={() => setHoveredId(collection.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <img
                src={coverImage}
                alt={collection.title}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.6s ease',
                  transform: isHovered ? 'scale(1.08)' : 'scale(1)'
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: isHovered
                    ? 'linear-gradient(to top, rgba(10, 10, 10, 0.95) 0%, rgba(10, 10, 10, 0.6) 50%, rgba(10, 10, 10, 0.3) 100%)'
                    : 'linear-gradient(to top, rgba(10, 10, 10, 0.85) 0%, rgba(10, 10, 10, 0.4) 50%, rgba(10, 10, 10, 0.2) 100%)',
                  transition: 'all 0.4s ease'
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: '32px 24px',
                  transform: isHovered ? 'translateY(0)' : 'translateY(20px)',
                  transition: 'transform 0.4s ease'
                }}
              >
                <p
                  style={{
                    fontSize: '10px',
                    color: '#FBBE63',
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    marginBottom: '8px',
                    opacity: isHovered ? 1 : 0,
                    transition: 'opacity 0.3s ease'
                  }}
                >
                  Collection
                </p>
                <h3
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: '24px',
                    color: '#FFFFFF',
                    marginBottom: '8px',
                    letterSpacing: '1px'
                  }}
                >
                  {collection.title}
                </h3>
                {collection.description && (
                  <p
                    style={{
                      fontSize: '13px',
                      color: 'rgba(255,255,255,0.85)',
                      lineHeight: 1.5,
                      opacity: isHovered ? 1 : 0,
                      maxHeight: isHovered ? '60px' : '0',
                      transition: 'all 0.4s ease',
                      overflow: 'hidden'
                    }}
                  >
                    {collection.description}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    );
  };

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', paddingTop: '120px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: `0 clamp(16px, 4vw, 48px) clamp(40px, 8vw, 80px)` }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <p
            style={{
              fontSize: '11px',
              color: '#666666',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              marginBottom: '12px'
            }}
          >
            Explore Our Collections
          </p>
          <h1
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '42px',
              color: '#0A0A0A',
              letterSpacing: '2px',
              marginBottom: '16px'
            }}
          >
            Collections
          </h1>
          <p
            style={{
              fontSize: '15px',
              color: '#666666',
              maxWidth: '600px',
              margin: '0 auto'
            }}
          >
            Discover curated sets of artworks and décor that share a common story, color palette, or mood.
          </p>
        </div>

        {renderState()}
      </div>
    </div>
  );
}
