import { useLanguage } from '../hooks/useLanguage';
import { useBreakpoint } from '../hooks/useBreakpoint';

export default function Shipping() {
  const { t } = useLanguage();
  const { isMobileOrTablet } = useBreakpoint();

  const sectionHeadingStyle: React.CSSProperties = {
    fontSize: '12px',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    color: '#FBBE63',
    marginBottom: '24px',
    paddingBottom: '12px',
    borderBottom: '1px solid #E5E5E5',
  };

  const paragraphStyle: React.CSSProperties = {
    fontSize: '15px',
    color: '#666666',
    lineHeight: 1.8,
    marginBottom: '16px',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '15px',
    color: '#0A0A0A',
    fontWeight: 600,
    marginBottom: '4px',
  };

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', paddingTop: isMobileOrTablet ? '100px' : '120px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 clamp(16px, 4vw, 48px) clamp(48px, 8vw, 80px)' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
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

        {/* Return & Exchange Policy Details */}
        <section style={{ marginBottom: '48px' }}>
          <p style={labelStyle}>{t('shipping.returnsLabel')}</p>
          <p style={paragraphStyle}>{t('shipping.returnsText')}</p>

          <p style={labelStyle}>{t('shipping.exchangesLabel')}</p>
          <p style={paragraphStyle}>{t('shipping.exchangesText')}</p>

          <p style={labelStyle}>{t('shipping.conditionLabel')}</p>
          <p style={paragraphStyle}>{t('shipping.conditionText')}</p>

          <p style={labelStyle}>{t('shipping.costsLabel')}</p>
          <p style={paragraphStyle}>{t('shipping.costsText')}</p>

          <p style={{ fontSize: '15px', color: '#0A0A0A', lineHeight: 1.8, fontStyle: 'italic', marginTop: '24px' }}>
            {t('shipping.closingText')}
          </p>
        </section>

        {/* Processing Time */}
        <section style={{ marginBottom: '48px' }}>
          <h2 style={sectionHeadingStyle}>
            {t('shipping.processingTitle')}
          </h2>
          <p style={paragraphStyle}>
            {t('shipping.processingText1')}
          </p>
          <p style={{ ...paragraphStyle, marginBottom: 0 }}>
            {t('shipping.processingText2')}
          </p>
        </section>
      </div>

      {/* Gold Accent Line */}
      <div style={{ height: '4px', backgroundColor: '#FBBE63', marginTop: 'clamp(48px, 8vw, 80px)' }} />
    </div>
  );
}
