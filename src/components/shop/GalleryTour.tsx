import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCollections } from '../../hooks/useCollections';
import { useLanguage } from '../../hooks/useLanguage';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { localize } from '../../lib/localize';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=1000&fit=crop';

export default function GalleryTour() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const { collections, loading } = useCollections(true);
  const { t, language } = useLanguage();
  const { isMobile } = useBreakpoint();

  const visibleCollections = useMemo(() => {
    if (!collections.length) return [];
    return collections.map((collection) => ({
      id: collection.id,
      title: localize(collection.title, collection.title_mk, language) || 'Untitled',
      subtitle: t('common.collection'),
      description: localize(collection.description, collection.description_mk, language) || 'Discover the curation and explore the featured artworks.',
      image: collection.cover_image || collection.cover_image_url || FALLBACK_IMAGE,
      link: `/collections/${collection.slug}`,
      pieces: (collection as any).collection_products?.[0]?.count ?? 0,
    }));
  }, [collections, t, language]);

  return (
    <section style={{ backgroundColor: '#FFFFFF', padding: isMobile ? '40px 0' : '80px 0' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: isMobile ? '0 16px' : '0 48px' }}>
        <div style={{ textAlign: 'center', marginBottom: isMobile ? '24px' : '56px' }}>
          <p style={{ fontSize: isMobile ? '10px' : '11px', color: '#666666', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '12px' }}>
            {t('home.exploreOurWorld')}
          </p>
          <h2
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: isMobile ? '20px' : '36px',
              color: '#0A0A0A',
              letterSpacing: isMobile ? '1px' : '2px',
              marginBottom: '16px'
            }}
          >
            {t('home.galleryTour')} <span style={{ color: '#FBBE63' }}>{t('home.galleryTourAccent')}</span>
          </h2>
          {!isMobile && (
            <p style={{ fontSize: '15px', color: '#666666', maxWidth: '500px', margin: '0 auto', lineHeight: 1.6 }}>
              {t('home.galleryTourDesc')}
            </p>
          )}
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(220px, 1fr))', gap: isMobile ? '8px' : '24px' }}>
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} style={{ aspectRatio: '3/4', backgroundColor: '#f5f5f5', border: '1px solid #eee' }} />
            ))}
          </div>
        ) : visibleCollections.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666666' }}>
            {t('home.collectionsEmpty')}
          </p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(220px, 1fr))', gap: isMobile ? '8px' : '24px' }}>
            {visibleCollections.map((collection) => (
              <Link
                key={collection.id}
                to={collection.link}
                style={{
                  position: 'relative',
                  aspectRatio: '3/4',
                  overflow: 'hidden',
                  textDecoration: 'none',
                  border: hoveredId === collection.id ? '1px solid #FBBE63' : '1px solid #E5E5E5',
                  transition: 'all 0.4s ease'
                }}
                onMouseEnter={() => setHoveredId(collection.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <img
                  src={collection.image}
                  alt={collection.title}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.6s ease',
                    transform: hoveredId === collection.id ? 'scale(1.08)' : 'scale(1)'
                  }}
                />

                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: hoveredId === collection.id
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
                    padding: isMobile ? '12px' : '32px 24px',
                    transform: isMobile
                      ? 'translateY(0)'
                      : hoveredId === collection.id
                        ? 'translateY(0)'
                        : 'translateY(20px)',
                    transition: 'transform 0.4s ease'
                  }}
                >
                  {!isMobile && (
                    <p
                      style={{
                        fontSize: '10px',
                        color: '#FBBE63',
                        letterSpacing: '2px',
                        textTransform: 'uppercase',
                        marginBottom: hoveredId === collection.id ? '8px' : '0',
                        opacity: hoveredId === collection.id ? 1 : 0,
                        maxHeight: hoveredId === collection.id ? '20px' : '0',
                        overflow: 'hidden',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {collection.subtitle}
                    </p>
                  )}

                  <h3
                    style={{
                      fontFamily: "'Playfair Display', Georgia, serif",
                      fontSize: isMobile ? '13px' : '24px',
                      color: '#FFFFFF',
                      fontWeight: 500,
                      marginBottom: isMobile ? '0' : '8px',
                      letterSpacing: '1px'
                    }}
                  >
                    {collection.title}
                  </h3>

                  {!isMobile && (
                    <>
                      <p
                        style={{
                          fontSize: '13px',
                          color: 'rgba(255,255,255,0.8)',
                          lineHeight: 1.5,
                          marginBottom: '16px',
                          opacity: hoveredId === collection.id ? 1 : 0,
                          maxHeight: hoveredId === collection.id ? '60px' : '0',
                          transition: 'all 0.4s ease',
                          overflow: 'hidden'
                        }}
                      >
                        {collection.description}
                      </p>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          columnGap: '14px',
                          opacity: hoveredId === collection.id ? 1 : 0,
                          maxHeight: hoveredId === collection.id ? '30px' : '0',
                          overflow: 'hidden',
                          transition: 'all 0.4s ease'
                        }}
                      >
                        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', letterSpacing: '1px' }}>
                          {collection.pieces} {t('common.pieces')}
                        </span>
                        <span
                          style={{
                            fontSize: '11px',
                            color: '#FBBE63',
                            fontWeight: 700,
                            letterSpacing: '1px',
                            textTransform: 'uppercase',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          {t('home.viewCollection')}
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                          </svg>
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {!isMobile && (
                  <>
                    <div
                      style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        width: '24px',
                        height: '24px',
                        borderTop: '2px solid #FBBE63',
                        borderRight: '2px solid #FBBE63',
                        opacity: hoveredId === collection.id ? 1 : 0,
                        transition: 'opacity 0.3s ease'
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '16px',
                        left: '16px',
                        width: '24px',
                        height: '24px',
                        borderBottom: '2px solid #FBBE63',
                        borderLeft: '2px solid #FBBE63',
                        opacity: hoveredId === collection.id ? 1 : 0,
                        transition: 'opacity 0.3s ease'
                      }}
                    />
                  </>
                )}
              </Link>
            ))}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: isMobile ? '24px' : '48px' }}>
          <Link
            to="/collections"
            style={{
              display: 'inline-block',
              padding: isMobile ? '12px 24px' : '14px 36px',
              backgroundColor: '#0A0A0A',
              color: '#FFFFFF',
              fontSize: isMobile ? '11px' : '12px',
              fontWeight: 700,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              textDecoration: 'none',
              border: '1px solid #0A0A0A',
              transition: 'all 0.3s'
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
            {t('home.viewAllCollections')}
          </Link>
        </div>
      </div>
    </section>
  );
}
