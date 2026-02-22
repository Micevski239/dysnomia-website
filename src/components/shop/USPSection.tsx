import { useMemo } from 'react';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { useLanguage } from '../../hooks/useLanguage';

export default function USPSection() {
  const { isMobile, isTablet } = useBreakpoint();
  const { t } = useLanguage();

  const uspItems = useMemo(() => [
    {
      icon: '🎨',
      title: t('home.contemporaryArt'),
      description: t('home.contemporaryArtDesc')
    },
    {
      icon: '🖌️',
      title: t('home.uniqueArtworks'),
      description: t('home.uniqueArtworksDesc')
    },
    {
      icon: '✨',
      title: t('home.designAesthetics'),
      description: t('home.designAestheticsDesc')
    },
    {
      icon: '🌿',
      title: t('home.ecoFriendly'),
      description: t('home.ecoFriendlyDesc')
    },
    {
      icon: '🏠',
      title: t('home.homeDecor'),
      description: t('home.homeDecorDesc')
    }
  ], [t]);

  return (
    <section
      style={{
        backgroundColor: '#FFFFFF',
        padding: isMobile ? '40px 0' : '64px 0',
        borderTop: 'none',
        borderBottom: 'none'
      }}
    >
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 clamp(16px, 4vw, 48px)' }}>
        {/* Section Title */}
        <h2
          style={{
            textAlign: 'center',
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: isMobile ? '18px' : '28px',
            color: '#0A0A0A',
            letterSpacing: isMobile ? '1px' : '2px',
            marginBottom: isMobile ? '24px' : '48px'
          }}
        >
          {t('home.whyChoose')} <span style={{ color: '#FBBE63' }}>Dysnomia</span>
        </h2>

        {/* USP Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : isTablet ? 'repeat(3, 1fr)' : 'repeat(5, 1fr)',
            gap: isMobile ? '8px' : 'clamp(16px, 3vw, 24px)'
          }}
        >
          {uspItems.map((item, index) => (
            <div
              key={index}
              style={{
                backgroundColor: '#FFFFFF',
                padding: isMobile ? '16px 12px' : '32px 24px',
                textAlign: 'center',
                border: '1px solid #E5E5E5',
                transition: 'all 0.3s',
                cursor: 'default',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: isMobile ? 'center' : 'flex-start',
                minHeight: isMobile ? '140px' : 'auto',
                gridColumn: isMobile && uspItems.length % 2 === 1 && index === uspItems.length - 1 ? '1 / -1' : undefined,
                justifySelf: isMobile && uspItems.length % 2 === 1 && index === uspItems.length - 1 ? 'center' : undefined,
                width: isMobile && uspItems.length % 2 === 1 && index === uspItems.length - 1 ? 'calc(50% - 4px)' : undefined,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#FBBE63';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(251, 190, 99, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E5E5E5';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Icon */}
              <div
                style={{
                  fontSize: isMobile ? '24px' : '36px',
                  marginBottom: isMobile ? '8px' : '16px'
                }}
              >
                {item.icon}
              </div>

              {/* Title */}
              <h3
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: isMobile ? '12px' : '16px',
                  color: '#0A0A0A',
                  fontWeight: 500,
                  marginBottom: isMobile ? '4px' : '8px',
                  letterSpacing: '0.5px'
                }}
              >
                {item.title}
              </h3>

              {/* Description - hide on mobile */}
              {!isMobile && (
                <p
                  style={{
                    fontSize: '13px',
                    color: '#666666',
                    lineHeight: 1.5
                  }}
                >
                  {item.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
