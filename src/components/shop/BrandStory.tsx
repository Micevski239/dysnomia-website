import { useLanguage } from '../../hooks/useLanguage';
import { useBreakpoint } from '../../hooks/useBreakpoint';

export default function BrandStory() {
  const { t } = useLanguage();
  const { isMobile } = useBreakpoint();

  return (
    <section
      style={{
        padding: isMobile ? '40px 0' : '100px 0',
        backgroundColor: '#FAFAFA',
        borderTop: '1px solid #E5E5E5',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Decorative elements - hidden on mobile */}
      {!isMobile && (
        <>
          {/* Decorative corner elements */}
          <div
            style={{
              position: 'absolute',
              top: '40px',
              left: '40px',
              width: '80px',
              height: '80px',
              borderTop: '2px solid #FBBE63',
              borderLeft: '2px solid #FBBE63'
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '40px',
              right: '40px',
              width: '80px',
              height: '80px',
              borderTop: '2px solid #FBBE63',
              borderRight: '2px solid #FBBE63'
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '40px',
              left: '40px',
              width: '80px',
              height: '80px',
              borderBottom: '2px solid #FBBE63',
              borderLeft: '2px solid #FBBE63'
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '40px',
              right: '40px',
              width: '80px',
              height: '80px',
              borderBottom: '2px solid #FBBE63',
              borderRight: '2px solid #FBBE63'
            }}
          />

          {/* Decorative circles */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '5%',
              transform: 'translateY(-50%)',
              width: '120px',
              height: '120px',
              border: '1px solid #FBBE63',
              borderRadius: '50%',
              opacity: 0.4
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '50%',
              right: '5%',
              transform: 'translateY(-50%)',
              width: '120px',
              height: '120px',
              border: '1px solid #FBBE63',
              borderRadius: '50%',
              opacity: 0.4
            }}
          />
        </>
      )}

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: isMobile ? '0 16px' : '0 48px', position: 'relative', zIndex: 1 }}>
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: isMobile ? '24px' : '48px' }}>
          {/* Decorative line above label */}
          <div
            style={{
              width: '40px',
              height: '2px',
              backgroundColor: '#FBBE63',
              margin: '0 auto 16px'
            }}
          />
          <p
            style={{
              fontSize: isMobile ? '10px' : '11px',
              color: '#666666',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              marginBottom: '8px'
            }}
          >
            {t('home.ourStoryLabel')}
          </p>
          <h2
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: isMobile ? '20px' : '32px',
              color: '#0A0A0A',
              letterSpacing: isMobile ? '1px' : '2px'
            }}
          >
            {t('home.aboutDysnomia')}
          </h2>
        </div>

        {/* Brand Story Content */}
        <div
          style={{
            textAlign: 'center',
            fontSize: isMobile ? '13px' : '16px',
            lineHeight: 1.8,
            color: '#666666'
          }}
        >
          <p style={{ marginBottom: isMobile ? '16px' : '28px' }}>
            {t('home.brandStoryP1')}
          </p>

          {!isMobile && (
            <>
              {/* Decorative diamond divider */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '32px 0' }}>
                <div style={{ width: '40px', height: '1px', backgroundColor: '#FBBE63', opacity: 0.5 }} />
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    backgroundColor: 'transparent',
                    border: '1px solid #FBBE63',
                    transform: 'rotate(45deg)',
                    margin: '0 12px'
                  }}
                />
                <div style={{ width: '40px', height: '1px', backgroundColor: '#FBBE63', opacity: 0.5 }} />
              </div>

              <p style={{ marginBottom: '28px' }}>
                {t('home.brandStoryP2')}
              </p>

              {/* Decorative diamond divider */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '32px 0' }}>
                <div style={{ width: '40px', height: '1px', backgroundColor: '#FBBE63', opacity: 0.5 }} />
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    backgroundColor: 'transparent',
                    border: '1px solid #FBBE63',
                    transform: 'rotate(45deg)',
                    margin: '0 12px'
                  }}
                />
                <div style={{ width: '40px', height: '1px', backgroundColor: '#FBBE63', opacity: 0.5 }} />
              </div>

              <p style={{ marginBottom: '28px' }}>
                {t('home.brandStoryP3')}
              </p>
            </>
          )}

          {/* Quote */}
          <blockquote
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: isMobile ? '15px' : '20px',
              fontStyle: 'italic',
              color: '#0A0A0A',
              margin: isMobile ? '24px 0 16px' : '48px 0 32px',
              padding: isMobile ? '16px 0' : '24px 0',
              borderTop: '1px solid #FBBE63',
              borderBottom: '1px solid #FBBE63',
              position: 'relative'
            }}
          >
            {!isMobile && (
              <span
                style={{
                  position: 'absolute',
                  top: '-12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: '#FAFAFA',
                  padding: '0 16px',
                  fontSize: '28px',
                  color: '#FBBE63',
                  fontFamily: 'Georgia, serif'
                }}
              >
                ❝
              </span>
            )}
            {t('home.brandQuote')}
          </blockquote>

          <p style={{ fontSize: isMobile ? '12px' : '14px', color: '#999999' }}>
            {t('home.brandSupport')}
          </p>
        </div>
      </div>
    </section>
  );
}
