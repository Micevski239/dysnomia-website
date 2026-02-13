import { Link } from 'react-router-dom';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { useLanguage } from '../hooks/useLanguage';

const VALUE_ICONS = [
  (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <path d="M16 8h-2a3 3 0 000 6h0a3 3 0 010 6H8M12 2v2m0 16v2" />
    </svg>
  ),
  (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="12" y1="18" x2="12" y2="12" />
      <line x1="9" y1="15" x2="15" y2="15" />
    </svg>
  ),
  (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  ),
  (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
];

const VALUE_KEYS: Array<{ title: string; desc: string }> = [
  { title: 'about.affordableArt', desc: 'about.affordableArtDesc' },
  { title: 'about.madeToOrder', desc: 'about.madeToOrderDesc' },
  { title: 'about.transformSpace', desc: 'about.transformSpaceDesc' },
  { title: 'about.boldExpression', desc: 'about.boldExpressionDesc' },
];

export default function About() {
  const { isMobile } = useBreakpoint();
  const { t } = useLanguage();

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', paddingTop: '120px' }}>
      {/* Hero Section */}
      <section style={{ maxWidth: '1400px', margin: '0 auto', padding: `0 clamp(16px, 4vw, 48px) clamp(60px, 10vw, 100px)` }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: 'clamp(32px, 8vw, 80px)',
            alignItems: 'center',
          }}
        >
          {/* Text Content */}
          <div>
            <p
              style={{
                fontSize: '12px',
                letterSpacing: '3px',
                textTransform: 'uppercase',
                color: '#FBBE63',
                marginBottom: '20px',
              }}
            >
              {t('about.label')}
            </p>
            <h1
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 'clamp(32px, 6vw, 52px)',
                lineHeight: 1.1,
                letterSpacing: '0.5px',
                color: '#0A0A0A',
                marginBottom: '28px',
              }}
            >
              {t('about.heroTitle')}
            </h1>
            <p
              style={{
                fontSize: '18px',
                color: '#666666',
                lineHeight: 1.8,
                marginBottom: '24px',
              }}
            >
              {t('about.heroP1')}
            </p>
            <p
              style={{
                fontSize: '17px',
                color: '#666666',
                lineHeight: 1.8,
                marginBottom: '40px',
              }}
            >
              {t('about.heroP2')}
            </p>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <Link
                to="/shop"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '18px 40px',
                  backgroundColor: '#0A0A0A',
                  color: '#FFFFFF',
                  fontSize: '12px',
                  fontWeight: 600,
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                  transition: 'all 0.3s',
                }}
              >
                {t('about.exploreArtworks')}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                to="/collections"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '18px 40px',
                  backgroundColor: '#FFFFFF',
                  color: '#0A0A0A',
                  fontSize: '12px',
                  fontWeight: 600,
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                  border: '1px solid #E5E5E5',
                  transition: 'all 0.3s',
                }}
              >
                {t('about.viewCollections')}
              </Link>
            </div>
          </div>

          {/* Hero Image */}
          <div
            style={{
              position: 'relative',
              aspectRatio: '4/5',
              overflow: 'hidden',
            }}
          >
            <img
              src="/logo.webp"
              alt="Dysnomia Art Gallery"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: '32px',
                left: '32px',
                right: '32px',
                padding: '24px',
                backgroundColor: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <p
                style={{
                  fontSize: '11px',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  color: '#FBBE63',
                  marginBottom: '8px',
                }}
              >
                {t('about.ourMission')}
              </p>
              <p
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: '18px',
                  color: '#0A0A0A',
                  lineHeight: 1.5,
                }}
              >
                {t('about.missionQuote')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section style={{ maxWidth: '1400px', margin: '0 auto', padding: `clamp(60px, 10vw, 100px) clamp(16px, 4vw, 48px)` }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <p
            style={{
              fontSize: '12px',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              color: '#FBBE63',
              marginBottom: '16px',
            }}
          >
            {t('about.ourValues')}
          </p>
          <h2
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 'clamp(32px, 5vw, 42px)',
              color: '#0A0A0A',
              marginBottom: '20px',
            }}
          >
            {t('about.whatWeStandFor')}
          </h2>
          <p
            style={{
              fontSize: '17px',
              color: '#666666',
              maxWidth: '600px',
              margin: '0 auto',
              lineHeight: 1.7,
            }}
          >
            {t('about.valuesDescription')}
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
            gap: 'clamp(16px, 3vw, 32px)',
          }}
        >
          {VALUE_KEYS.map((value, i) => (
            <div
              key={value.title}
              style={{
                padding: 'clamp(24px, 4vw, 48px)',
                backgroundColor: '#FAFAFA',
                border: '1px solid #E5E5E5',
                transition: 'all 0.3s',
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E5E5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '24px',
                  color: '#FBBE63',
                }}
              >
                {VALUE_ICONS[i]}
              </div>
              <h3
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: '24px',
                  color: '#0A0A0A',
                  marginBottom: '16px',
                }}
              >
                {t(value.title)}
              </h3>
              <p
                style={{
                  fontSize: '15px',
                  color: '#666666',
                  lineHeight: 1.7,
                }}
              >
                {t(value.desc)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Story Section */}
      <section
        style={{
          backgroundColor: '#FAFAFA',
          borderTop: '1px solid #E5E5E5',
          borderBottom: '1px solid #E5E5E5',
        }}
      >
        <div
          style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: `clamp(60px, 10vw, 100px) clamp(16px, 4vw, 48px)`,
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: 'clamp(32px, 8vw, 80px)',
            alignItems: 'center',
          }}
        >
          <div style={{ order: isMobile ? 2 : 1 }}>
            <img
              src="https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&h=600&fit=crop"
              alt="Art studio"
              style={{
                width: '100%',
                height: isMobile ? '280px' : '400px',
                objectFit: 'cover',
              }}
            />
          </div>
          <div style={{ order: isMobile ? 1 : 2 }}>
            <p
              style={{
                fontSize: '12px',
                letterSpacing: '3px',
                textTransform: 'uppercase',
                color: '#FBBE63',
                marginBottom: '20px',
              }}
            >
              {t('about.ourStory')}
            </p>
            <h2
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 'clamp(28px, 5vw, 36px)',
                color: '#0A0A0A',
                marginBottom: '24px',
                lineHeight: 1.2,
              }}
            >
              {t('about.fromPassion')}
            </h2>
            <p
              style={{
                fontSize: '16px',
                color: '#666666',
                lineHeight: 1.8,
                marginBottom: '20px',
              }}
            >
              {t('about.storyP1')}
            </p>
            <p
              style={{
                fontSize: '16px',
                color: '#666666',
                lineHeight: 1.8,
                marginBottom: '32px',
              }}
            >
              {t('about.storyP2')}
            </p>
            <Link
              to="/collections"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '13px',
                fontWeight: 600,
                letterSpacing: '1px',
                textTransform: 'uppercase',
                color: '#0A0A0A',
                textDecoration: 'none',
                borderBottom: '2px solid #FBBE63',
                paddingBottom: '4px',
              }}
            >
              {t('about.discoverCollections')}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: `clamp(60px, 10vw, 100px) clamp(16px, 4vw, 48px)` }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1.2fr 1fr',
            gap: 'clamp(32px, 6vw, 64px)',
            alignItems: 'start',
          }}
        >
          <div>
            <p
              style={{
                fontSize: '12px',
                letterSpacing: '3px',
                textTransform: 'uppercase',
                color: '#FBBE63',
                marginBottom: '20px',
              }}
            >
              {t('about.getInTouch')}
            </p>
            <h2
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 'clamp(28px, 5vw, 36px)',
                color: '#0A0A0A',
                marginBottom: '24px',
              }}
            >
              {t('about.loveToHear')}
            </h2>
            <p
              style={{
                fontSize: '16px',
                color: '#666666',
                lineHeight: 1.8,
                marginBottom: '40px',
              }}
            >
              {t('about.contactDescription')}
            </p>
            <a
              href="mailto:contact_dysnomia@yahoo.com"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                padding: '20px 48px',
                backgroundColor: '#FBBE63',
                color: '#0A0A0A',
                fontSize: '13px',
                fontWeight: 600,
                letterSpacing: '2px',
                textTransform: 'uppercase',
                textDecoration: 'none',
                transition: 'all 0.3s',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              {t('about.contactUs')}
            </a>
          </div>

          <div
            style={{
              backgroundColor: '#FAFAFA',
              border: '1px solid #E5E5E5',
              padding: '40px',
            }}
          >
            <div style={{ marginBottom: '32px' }}>
              <p
                style={{
                  fontSize: '11px',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  color: '#999999',
                  marginBottom: '8px',
                }}
              >
                {t('about.email')}
              </p>
              <p style={{ fontSize: '16px', color: '#0A0A0A' }}>contact_dysnomia@yahoo.com</p>
            </div>
            <div style={{ marginBottom: '32px' }}>
              <p
                style={{
                  fontSize: '11px',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  color: '#999999',
                  marginBottom: '8px',
                }}
              >
                {t('about.location')}
              </p>
              <p style={{ fontSize: '16px', color: '#0A0A0A', lineHeight: 1.6 }}>
                {t('about.locationValue')}
                <br />
                {t('about.shippingWorldwide')}
              </p>
            </div>
            <div>
              <p
                style={{
                  fontSize: '11px',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  color: '#999999',
                  marginBottom: '12px',
                }}
              >
                {t('about.followUs')}
              </p>
              <div style={{ display: 'flex', gap: '16px' }}>
                <a
                  href="https://www.instagram.com/dysnomia_art.gallery666/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: '44px',
                    height: '44px',
                    border: '1px solid #E5E5E5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#0A0A0A',
                    textDecoration: 'none',
                    transition: 'all 0.3s',
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </a>
                <a
                  href="https://www.facebook.com/profile.php?id=61575933645818"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: '44px',
                    height: '44px',
                    border: '1px solid #E5E5E5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#0A0A0A',
                    textDecoration: 'none',
                    transition: 'all 0.3s',
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gold Accent Line */}
      <div style={{ height: '4px', backgroundColor: '#FBBE63' }} />
    </div>
  );
}
