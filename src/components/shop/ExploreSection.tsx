import { Link } from 'react-router-dom';
import { useBreakpoint } from '../../hooks/useBreakpoint';

const exploreItems = [
  {
    title: 'Discover our artists',
    subtitle: 'Meet the creatives',
    link: '/artists',
    image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=600&h=800&fit=crop'
  },
  {
    title: 'Read our Stories',
    subtitle: 'Interior inspiration',
    link: '/stories',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e35a6?w=600&h=800&fit=crop'
  }
];

export default function ExploreSection() {
  const { isMobile } = useBreakpoint();

  return (
    <section style={{ padding: 'clamp(24px, 4vw, 40px) 0' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 clamp(16px, 4vw, 48px)' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
            gap: '6px'
          }}
        >
          {exploreItems.map((item, index) => (
            <Link
              key={index}
              to={item.link}
              style={{
                position: 'relative',
                aspectRatio: '4/5',
                overflow: 'hidden',
                textDecoration: 'none'
              }}
            >
              <img
                src={item.image}
                alt={item.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.7s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              />
              {/* Gradient Overlay */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.5), rgba(0,0,0,0.2), transparent)'
                }}
              />

              {/* Content */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '32px',
                  left: '32px',
                  right: '32px'
                }}
              >
                <p
                  style={{
                    fontSize: '11px',
                    color: 'rgba(255,255,255,0.7)',
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    marginBottom: '8px'
                  }}
                >
                  {item.subtitle}
                </p>
                <h3
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontStyle: 'italic',
                    color: 'white',
                    fontSize: '28px'
                  }}
                >
                  {item.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
