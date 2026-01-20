import { Link } from 'react-router-dom';

export default function BrandStory() {
  const linkStyle: React.CSSProperties = {
    textDecoration: 'none',
    color: '#0A0A0A',
    borderBottom: '1px solid #FBBE63',
    paddingBottom: '2px',
    transition: 'all 0.2s'
  };

  return (
    <section
      style={{
        padding: '80px 0',
        backgroundColor: '#FAFAFA',
        borderTop: '1px solid #E5E5E5'
      }}
    >
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 48px' }}>
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <p
            style={{
              fontSize: '11px',
              color: '#666666',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              marginBottom: '12px'
            }}
          >
            Our Story
          </p>
          <h2
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '32px',
              color: '#0A0A0A',
              letterSpacing: '2px'
            }}
          >
            About <span style={{ color: '#FBBE63' }}>Dysnomia</span>
          </h2>
        </div>

        {/* Brand Story Content */}
        <div
          style={{
            textAlign: 'center',
            fontSize: '16px',
            lineHeight: 1.9,
            color: '#666666'
          }}
        >
          <p style={{ marginBottom: '28px' }}>
            <span style={{ color: '#0A0A0A', fontFamily: "'Playfair Display', Georgia, serif", fontStyle: 'italic' }}>
              Dysnomia Art Gallery
            </span>{' '}
            is a modern space where{' '}
            <Link to="/artworks" style={linkStyle}>art</Link>,{' '}
            <Link to="/collections" style={linkStyle}>design</Link>, and{' '}
            lifestyle come together. We offer unique artworks and decorative pieces
            crafted with care, style, and high-quality materials.
          </p>

          <p style={{ marginBottom: '28px' }}>
            With a focus on{' '}
            <Link to="/about" style={linkStyle}>aesthetics</Link>,
            eco-friendly production, and original design, Dysnomia brings beauty
            and inspiration into every home. Our curated collection features
            everything from contemporary art to{' '}
            <Link to="/collections/abstract" style={linkStyle}>abstract pieces</Link>,
            each selected to transform your living spaces.
          </p>

          <p style={{ marginBottom: '28px' }}>
            We believe that art should be accessible to everyone. That's why we
            work directly with talented{' '}
            <Link to="/artists" style={linkStyle}>artists</Link>{' '}
            from around the world, offering{' '}
            <Link to="/limited-edition" style={linkStyle}>limited edition</Link>{' '}
            works and exclusive collaborations that you won't find anywhere else.
          </p>

          {/* Quote */}
          <blockquote
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '22px',
              fontStyle: 'italic',
              color: '#0A0A0A',
              margin: '48px 0',
              padding: '24px 0',
              borderTop: '1px solid #E5E5E5',
              borderBottom: '1px solid #E5E5E5',
              position: 'relative'
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: '-16px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: '#FAFAFA',
                padding: '0 16px',
                color: '#FBBE63',
                fontSize: '32px'
              }}
            >
              "
            </span>
            Where contemporary art meets modern living
          </blockquote>

          <p style={{ fontSize: '14px', color: '#999999' }}>
            Need assistance? Our{' '}
            <Link to="/support" style={{ ...linkStyle, color: '#666666', borderColor: '#666666' }}>
              support team
            </Link>{' '}
            is here to help you find the perfect pieces for your home or office.
          </p>
        </div>
      </div>
    </section>
  );
}
