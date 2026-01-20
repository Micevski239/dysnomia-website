const pressLogos = [
  { name: 'H&M HOME', width: 100 },
  { name: 'ARKET', width: 80 },
  { name: 'ELLE DECORATION', width: 130 },
  { name: 'RESIDENCE', width: 100 },
  { name: 'NYARUM', width: 90 },
  { name: 'THE WORLD OF INTERIORS', width: 150 }
];

export default function PressLogos() {
  return (
    <section
      style={{
        padding: '48px 0',
        borderTop: '1px solid #E5E5E5',
        borderBottom: '1px solid #E5E5E5'
      }}
    >
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 48px' }}>
        {/* Label */}
        <p
          style={{
            textAlign: 'center',
            fontSize: '11px',
            color: '#7F7F7F',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            marginBottom: '32px'
          }}
        >
          Featured In
        </p>

        {/* Logos */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '48px'
          }}
        >
          {pressLogos.map((logo, index) => (
            <div
              key={index}
              style={{
                opacity: 0.4,
                transition: 'opacity 0.3s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '0.4'}
            >
              <span
                style={{
                  color: '#151515',
                  fontWeight: 500,
                  fontSize: '11px',
                  letterSpacing: '1px',
                  whiteSpace: 'nowrap'
                }}
              >
                {logo.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
