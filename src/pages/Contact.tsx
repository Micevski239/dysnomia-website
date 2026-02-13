import { useLanguage } from '../hooks/useLanguage';
import { useBreakpoint } from '../hooks/useBreakpoint';

export default function Contact() {
  const { t } = useLanguage();
  const { isMobile } = useBreakpoint();

  const cards = [
    {
      label: t('contact.email'),
      icon: (
        <svg style={{ width: '28px', height: '28px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      value: 'contact_dysnomia@yahoo.com',
      href: 'mailto:contact_dysnomia@yahoo.com',
    },
    {
      label: 'Instagram',
      icon: (
        <svg style={{ width: '28px', height: '28px' }} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
        </svg>
      ),
      value: '@dysnomia_art.gallery666',
      href: 'https://www.instagram.com/dysnomia_art.gallery666/',
    },
    {
      label: 'Facebook',
      icon: (
        <svg style={{ width: '28px', height: '28px' }} fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
      value: 'Dysnomia Art Gallery',
      href: 'https://www.facebook.com/profile.php?id=61575933645818',
    },
    {
      label: 'TikTok',
      icon: (
        <svg style={{ width: '28px', height: '28px' }} fill="currentColor" viewBox="0 0 24 24">
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.46V13a8.16 8.16 0 005.58 2.18v-3.45a4.85 4.85 0 01-3.77-1.81V6.69h3.77z" />
        </svg>
      ),
      value: '@dysnomia_art',
      href: 'https://www.tiktok.com/@dysnomia_art',
    },
  ];

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', paddingTop: isMobile ? '100px' : '120px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 clamp(16px, 4vw, 48px) clamp(48px, 8vw, 80px)' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 'clamp(32px, 6vw, 64px)' }}>
          <p
            style={{
              fontSize: '12px',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              color: '#FBBE63',
              marginBottom: '12px',
            }}
          >
            {t('contact.subtitle')}
          </p>
          <h1
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 'clamp(32px, 5vw, 42px)',
              color: '#0A0A0A',
              marginBottom: '16px',
            }}
          >
            {t('contact.title')}
          </h1>
          <p style={{ fontSize: '16px', color: '#666666', lineHeight: 1.7, maxWidth: '500px', margin: '0 auto' }}>
            {t('contact.description')}
          </p>
        </div>

        {/* Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(2, 1fr)',
            gap: isMobile ? '16px' : '24px',
          }}
        >
          {cards.map((card) => (
            <a
              key={card.label}
              href={card.href}
              target={card.label === t('contact.email') ? undefined : '_blank'}
              rel={card.label === t('contact.email') ? undefined : 'noopener noreferrer'}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                padding: isMobile ? '24px 16px' : '40px 24px',
                backgroundColor: '#FAFAFA',
                border: '1px solid #E5E5E5',
                textDecoration: 'none',
                transition: 'border-color 0.3s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#FBBE63';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E5E5E5';
              }}
            >
              <div style={{ color: '#FBBE63', marginBottom: '16px' }}>
                {card.icon}
              </div>
              <h3
                style={{
                  fontSize: '12px',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  color: '#0A0A0A',
                  marginBottom: '8px',
                  fontWeight: 600,
                }}
              >
                {card.label}
              </h3>
              <p style={{ fontSize: isMobile ? '12px' : '14px', color: '#666666', wordBreak: 'break-word' }}>
                {card.value}
              </p>
            </a>
          ))}
        </div>
      </div>

      {/* Gold Accent Line */}
      <div style={{ height: '4px', backgroundColor: '#FBBE63', marginTop: 'clamp(48px, 8vw, 80px)' }} />
    </div>
  );
}
