import { Link } from 'react-router-dom';

interface CategoryItem {
  title: string;
  link: string;
  image: string;
}

interface CategoryGridProps {
  categories: CategoryItem[];
}

const defaultCategories: CategoryItem[] = [
  {
    title: 'NEW ARRIVALS',
    link: '/new-arrivals',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=800&fit=crop'
  },
  {
    title: 'Postery x The Beatles',
    link: '/collections/beatles',
    image: 'https://images.unsplash.com/photo-1578926288207-a90a5366759d?w=600&h=800&fit=crop'
  },
  {
    title: 'KIDS POSTERS',
    link: '/kids',
    image: 'https://images.unsplash.com/photo-1617791160505-6f00504e3519?w=600&h=800&fit=crop'
  }
];

export default function CategoryGrid({ categories = defaultCategories }: CategoryGridProps) {
  return (
    <section style={{ padding: '40px 0' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 48px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '6px'
          }}
        >
          {categories.map((category, index) => (
            <Link
              key={index}
              to={category.link}
              style={{
                position: 'relative',
                aspectRatio: '3/4',
                overflow: 'hidden',
                textDecoration: 'none'
              }}
            >
              <img
                src={category.image}
                alt={category.title}
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
                  {category.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
