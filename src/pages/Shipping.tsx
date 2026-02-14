import { useLanguage } from '../hooks/useLanguage';
import { useBreakpoint } from '../hooks/useBreakpoint';

export default function Shipping() {
  const { t } = useLanguage();
  const { isMobileOrTablet } = useBreakpoint();

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', paddingTop: isMobileOrTablet ? '100px' : '120px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 clamp(16px, 4vw, 48px) clamp(48px, 8vw, 80px)' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <p
            style={{
              fontSize: '11px',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              color: '#FBBE63',
              marginBottom: '12px',
            }}
          >
            {t('shipping.subtitle')}
          </p>
          <h1
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 'clamp(32px, 5vw, 42px)',
              color: '#0A0A0A',
              marginBottom: '16px',
            }}
          >
            {t('shipping.title')}
          </h1>
          <p style={{ fontSize: '16px', color: '#666666', lineHeight: 1.7 }}>
            {t('shipping.description')}
          </p>
        </div>

        {/* Standard Shipping */}
        <section style={{ marginBottom: '48px' }}>
          <h2
            style={{
              fontSize: '12px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: '#FBBE63',
              marginBottom: '24px',
              paddingBottom: '12px',
              borderBottom: '1px solid #E5E5E5',
            }}
          >
            {t('shipping.shippingOption')}
          </h2>
          <div
            style={{
              padding: '24px',
              backgroundColor: '#FAFAFA',
              border: '1px solid #E5E5E5',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '16px', color: '#0A0A0A', fontWeight: 600 }}>{t('shipping.standardTitle')}</h3>
              <span style={{ fontSize: '14px', color: '#FBBE63', fontWeight: 600 }}>{t('shipping.standardPrice')}</span>
            </div>
            <p style={{ fontSize: '14px', color: '#666666' }}>{t('shipping.standardDetails')}</p>
          </div>
        </section>

        {/* Processing Time */}
        <section style={{ marginBottom: '48px' }}>
          <h2
            style={{
              fontSize: '12px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: '#FBBE63',
              marginBottom: '24px',
              paddingBottom: '12px',
              borderBottom: '1px solid #E5E5E5',
            }}
          >
            {t('shipping.processingTitle')}
          </h2>
          <p style={{ fontSize: '15px', color: '#666666', lineHeight: 1.8, marginBottom: '16px' }}>
            {t('shipping.processingText1')}
          </p>
          <p style={{ fontSize: '15px', color: '#666666', lineHeight: 1.8 }}>
            {t('shipping.processingText2')}
          </p>
        </section>

        {/* Tracking */}
        <section style={{ marginBottom: '48px' }}>
          <h2
            style={{
              fontSize: '12px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: '#FBBE63',
              marginBottom: '24px',
              paddingBottom: '12px',
              borderBottom: '1px solid #E5E5E5',
            }}
          >
            {t('shipping.trackingTitle')}
          </h2>
          <p style={{ fontSize: '15px', color: '#666666', lineHeight: 1.8 }}>
            {t('shipping.trackingText')}
          </p>
        </section>

        {/* Returns */}
        <section style={{ marginBottom: '48px' }}>
          <h2
            style={{
              fontSize: '12px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: '#FBBE63',
              marginBottom: '24px',
              paddingBottom: '12px',
              borderBottom: '1px solid #E5E5E5',
            }}
          >
            {t('shipping.returnsTitle')}
          </h2>
          <p style={{ fontSize: '15px', color: '#666666', lineHeight: 1.8, marginBottom: '16px' }}>
            {t('shipping.returnsText')}
          </p>
          <ul style={{ fontSize: '15px', color: '#666666', lineHeight: 1.8, paddingLeft: '24px' }}>
            <li style={{ marginBottom: '8px' }}>{t('shipping.returnItem1')}</li>
            <li style={{ marginBottom: '8px' }}>{t('shipping.returnItem2')}</li>
            <li style={{ marginBottom: '8px' }}>{t('shipping.returnItem3')}</li>
            <li style={{ marginBottom: '8px' }}>{t('shipping.returnItem4')}</li>
          </ul>
        </section>

        {/* Damaged Items */}
        <section
          style={{
            padding: '32px',
            backgroundColor: '#FAFAFA',
            border: '1px solid #E5E5E5',
          }}
        >
          <h3
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '20px',
              color: '#0A0A0A',
              marginBottom: '12px',
            }}
          >
            {t('shipping.damagedTitle')}
          </h3>
          <p style={{ fontSize: '15px', color: '#666666', lineHeight: 1.7, marginBottom: '16px' }}>
            {t('shipping.damagedText')}
          </p>
          <a
            href="mailto:contact_dysnomia@yahoo.com"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              backgroundColor: '#0A0A0A',
              color: '#FFFFFF',
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              textDecoration: 'none',
            }}
          >
            {t('shipping.contactSupport')}
          </a>
        </section>
      </div>

      {/* Gold Accent Line */}
      <div style={{ height: '4px', backgroundColor: '#FBBE63', marginTop: 'clamp(48px, 8vw, 80px)' }} />
    </div>
  );
}
