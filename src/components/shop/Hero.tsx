import { Link } from 'react-router-dom';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { useLanguage } from '../../hooks/useLanguage';

export default function Hero() {
  const { isMobile } = useBreakpoint();
  const { t } = useLanguage();

  return (
    <section
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        overflow: 'hidden'
      }}
    >
      {/* Logo as full background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url(/logo.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 0%',
          backgroundRepeat: 'no-repeat'
        }}
      />

      {/* Dark overlay for text readability */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(10, 10, 10, 0.85) 0%, rgba(10, 10, 10, 0.5) 40%, rgba(10, 10, 10, 0.3) 70%, rgba(10, 10, 10, 0.4) 100%)'
        }}
      />

      {/* Gold accent line - left side - hidden on mobile */}
      {!isMobile && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '48px',
            width: '2px',
            height: '150px',
            background: 'linear-gradient(to bottom, transparent, #FBBE63, transparent)',
            transform: 'translateY(-50%)'
          }}
        />
      )}

      {/* Content */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: `0 clamp(24px, 8vw, 120px) clamp(60px, 10vw, 100px)`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end'
        }}
      >
        {/* Left side - Main content */}
        <div style={{ maxWidth: '650px' }}>
          {/* Brand name */}
          <h1
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 'clamp(32px, 8vw, 64px)',
              fontWeight: 600,
              color: '#FBBE63',
              letterSpacing: 'clamp(4px, 1.5vw, 10px)',
              textTransform: 'uppercase',
              marginBottom: '16px',
              textShadow: '0 2px 20px rgba(0,0,0,0.3)'
            }}
          >
            DYSNOMIA
          </h1>

          {/* Tagline */}
          <p
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 'clamp(14px, 3vw, 20px)',
              color: 'rgba(255,255,255,0.8)',
              letterSpacing: 'clamp(2px, 0.8vw, 5px)',
              textTransform: 'uppercase',
              marginBottom: 'clamp(16px, 3vw, 28px)'
            }}
          >
            {t('home.tagline')}
          </p>

          {/* Description */}
          <p
            style={{
              fontSize: 'clamp(14px, 2vw, 17px)',
              color: 'rgba(255,255,255,0.75)',
              lineHeight: 1.8,
              marginBottom: 'clamp(24px, 4vw, 40px)',
              maxWidth: '500px'
            }}
          >
            {t('home.heroDescription')}
          </p>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', gap: isMobile ? '12px' : '16px', flexDirection: isMobile ? 'column' : 'row', flexWrap: 'wrap' }}>
            <Link
              to="/collections"
              style={{
                display: 'inline-block',
                backgroundColor: '#FBBE63',
                color: '#0A0A0A',
                padding: isMobile ? '12px 24px' : 'clamp(14px, 2vw, 18px) clamp(28px, 4vw, 44px)',
                fontSize: isMobile ? '11px' : '12px',
                fontWeight: 700,
                letterSpacing: '2px',
                textTransform: 'uppercase',
                textDecoration: 'none',
                transition: 'all 0.3s',
                border: '2px solid #FBBE63',
                textAlign: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#FBBE63';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FBBE63';
                e.currentTarget.style.color = '#0A0A0A';
              }}
            >
              {t('home.exploreCollection')}
            </Link>

            <Link
              to="/about"
              style={{
                display: 'inline-block',
                backgroundColor: 'transparent',
                color: '#FFFFFF',
                padding: isMobile ? '12px 24px' : 'clamp(14px, 2vw, 18px) clamp(28px, 4vw, 44px)',
                fontSize: isMobile ? '11px' : '12px',
                fontWeight: 700,
                letterSpacing: '2px',
                textTransform: 'uppercase',
                textDecoration: 'none',
                transition: 'all 0.3s',
                border: '2px solid rgba(255,255,255,0.4)',
                textAlign: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#FBBE63';
                e.currentTarget.style.color = '#FBBE63';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)';
                e.currentTarget.style.color = '#FFFFFF';
              }}
            >
              {t('home.ourStory')}
            </Link>
          </div>
        </div>

      </div>

      {/* Scroll indicator - hidden on mobile */}
      {!isMobile && (
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <span
            style={{
              fontSize: '10px',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.5)'
            }}
          >
            {t('home.scroll')}
          </span>
          <div
            style={{
              width: '1px',
              height: '35px',
              background: 'linear-gradient(to bottom, #FBBE63, transparent)'
            }}
          />
        </div>
      )}

      {/* Corner accents - hidden on mobile */}
      {!isMobile && (
        <>
          <div
            style={{
              position: 'absolute',
              top: '100px',
              right: '48px',
              width: '50px',
              height: '50px',
              borderTop: '2px solid #FBBE63',
              borderRight: '2px solid #FBBE63',
              opacity: 0.6
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '40px',
              right: '120px',
              width: '50px',
              height: '50px',
              borderBottom: '2px solid #FBBE63',
              borderRight: '2px solid #FBBE63',
              opacity: 0.6
            }}
          />
        </>
      )}
    </section>
  );
}
