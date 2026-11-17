import { useLanguage } from '../hooks/useLanguage';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { POLICIES, POLICY_EMAIL } from '../config/policies';

export default function Shipping() {
  const { language } = useLanguage();
  const { isMobileOrTablet } = useBreakpoint();
  const policies = POLICIES[language];

  const sectionHeadingStyle: React.CSSProperties = {
    fontSize: '12px',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    color: '#FBBE63',
    marginBottom: '16px',
    paddingBottom: '12px',
    borderBottom: '1px solid #E5E5E5',
  };

  const paragraphStyle: React.CSSProperties = {
    fontSize: '15px',
    color: '#666666',
    lineHeight: 1.8,
    marginBottom: '16px',
  };

  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', paddingTop: isMobileOrTablet ? '100px' : '120px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 clamp(16px, 4vw, 48px) clamp(48px, 8vw, 80px)' }}>
        {policies.map((policy, index) => (
          <article
            key={policy.id}
            id={policy.id}
            style={{ marginBottom: 'clamp(56px, 9vw, 96px)', scrollMarginTop: isMobileOrTablet ? '90px' : '110px' }}
          >
            <header style={{ textAlign: 'center', marginBottom: '40px' }}>
              {index === 0 ? (
                <h1
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: 'clamp(30px, 5vw, 42px)',
                    color: '#0A0A0A',
                    marginBottom: '16px',
                  }}
                >
                  {policy.title}
                </h1>
              ) : (
                <h2
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: 'clamp(30px, 5vw, 42px)',
                    color: '#0A0A0A',
                    marginBottom: '16px',
                    fontWeight: 400,
                  }}
                >
                  {policy.title}
                </h2>
              )}
              <p style={{ fontSize: '16px', color: '#666666', lineHeight: 1.7 }}>{policy.intro}</p>
            </header>

            {policy.sections.map((section) => (
              <section key={section.heading} style={{ marginBottom: '36px' }}>
                <h3 style={sectionHeadingStyle}>{section.heading}</h3>
                {section.paragraphs.map((text) => (
                  <p key={text} style={paragraphStyle}>
                    {text}
                  </p>
                ))}
                {section.showEmail && (
                  <p style={{ ...paragraphStyle, marginBottom: 0 }}>
                    {language === 'mk' ? 'Е-пошта' : 'Email'}:{' '}
                    <a href={`mailto:${POLICY_EMAIL}`} style={{ color: '#0A0A0A', fontWeight: 600 }}>
                      {POLICY_EMAIL}
                    </a>
                  </p>
                )}
              </section>
            ))}
          </article>
        ))}
      </div>

      {/* Gold Accent Line */}
      <div style={{ height: '4px', backgroundColor: '#FBBE63' }} />
    </div>
  );
}
