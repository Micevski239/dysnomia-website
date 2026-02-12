import { Link } from 'react-router-dom';
import { useBreakpoint } from '../../hooks/useBreakpoint';

interface FeatureItem {
  title: string;
  link: string;
  image: string;
}

interface FeatureGridProps {
  features?: FeatureItem[];
}

const defaultFeatures: FeatureItem[] = [
  {
    title: 'BESTSELLERS',
    link: '/top-sellers',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop'
  },
  {
    title: 'Ribbed Frames',
    link: '/frames/ribbed',
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&h=600&fit=crop'
  },
  {
    title: 'PHOTO ART',
    link: '/posters/photography',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=600&fit=crop'
  }
];

export default function FeatureGrid({ features = defaultFeatures }: FeatureGridProps) {
  const { isMobile } = useBreakpoint();

  return (
    <section style={{ padding: 'clamp(24px, 4vw, 40px) 0' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 clamp(16px, 4vw, 48px)' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: '6px'
          }}
        >
          {features.map((feature, index) => (
            <Link
              key={index}
              to={feature.link}
              style={{
                position: 'relative',
                aspectRatio: '1',
                overflow: 'hidden',
                textDecoration: 'none'
              }}
            >
              <img
                src={feature.image}
                alt={feature.title}
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
                  background: 'linear-gradient(to top, rgba(0,0,0,0.4), transparent)'
                }}
              />

              {/* Title */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '24px',
                  left: '24px',
                  right: '24px'
                }}
              >
                <h3
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    color: 'white'
                  }}
                >
                  {feature.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
