const uspItems = [
  {
    icon: '🎨',
    title: 'Contemporary Art',
    description: 'Curated collection of modern masterpieces'
  },
  {
    icon: '🖌️',
    title: 'Unique Artworks',
    description: 'One-of-a-kind pieces from talented artists'
  },
  {
    icon: '✨',
    title: 'Design & Aesthetics',
    description: 'Style that transforms your space'
  },
  {
    icon: '🌿',
    title: 'Eco-Friendly',
    description: 'Sustainable materials & production'
  },
  {
    icon: '🏠',
    title: 'Home Décor',
    description: 'Decorative pieces for every room'
  }
];

export default function USPSection() {
  return (
    <section
      style={{
        backgroundColor: '#FAFAFA',
        padding: '64px 0',
        borderTop: '1px solid #E5E5E5',
        borderBottom: '1px solid #E5E5E5'
      }}
    >
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 48px' }}>
        {/* Section Title */}
        <h2
          style={{
            textAlign: 'center',
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: '28px',
            color: '#0A0A0A',
            letterSpacing: '2px',
            marginBottom: '48px'
          }}
        >
          Why Choose <span style={{ color: '#FBBE63' }}>Dysnomia</span>
        </h2>

        {/* USP Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '24px'
          }}
        >
          {uspItems.map((item, index) => (
            <div
              key={index}
              style={{
                backgroundColor: '#FFFFFF',
                padding: '32px 24px',
                textAlign: 'center',
                border: '1px solid #E5E5E5',
                transition: 'all 0.3s',
                cursor: 'default'
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
                  fontSize: '36px',
                  marginBottom: '16px'
                }}
              >
                {item.icon}
              </div>

              {/* Title */}
              <h3
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: '16px',
                  color: '#0A0A0A',
                  fontWeight: 500,
                  marginBottom: '8px',
                  letterSpacing: '0.5px'
                }}
              >
                {item.title}
              </h3>

              {/* Description */}
              <p
                style={{
                  fontSize: '13px',
                  color: '#666666',
                  lineHeight: 1.5
                }}
              >
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
