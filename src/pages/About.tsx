import { Link } from 'react-router-dom';

const VALUES = [
  {
    title: 'Original Design',
    description:
      'Every piece in our collection is thoughtfully designed to stand out. We celebrate creativity and originality, offering artworks that bring a unique character to any space.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
  },
  {
    title: 'Quality Materials',
    description:
      'We use only premium materials in our artworks and decorative pieces. From fine papers to carefully selected frames, quality is at the heart of everything we create.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    title: 'Eco-Friendly Production',
    description:
      'Sustainability matters to us. We prioritize eco-conscious production methods and materials, ensuring our art is gentle on the planet while beautiful in your home.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 22c4-4 8-7.5 8-12a8 8 0 10-16 0c0 4.5 4 8 8 12z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
  {
    title: 'Crafted with Care',
    description:
      'Each artwork is crafted with attention to detail and passion. We believe that art should be made with intention, bringing warmth and inspiration into every home.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
      </svg>
    ),
  },
];

const STATS = [
  { number: '500+', label: 'Artworks Created' },
  { number: '12', label: 'Countries Shipped' },
  { number: '100%', label: 'Eco-Friendly Materials' },
  { number: '2018', label: 'Year Founded' },
];

export default function About() {
  return (
    <div style={{ backgroundColor: '#FFFFFF', minHeight: '100vh', paddingTop: '120px' }}>
      {/* Hero Section */}
      <section style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 48px 100px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '80px',
            alignItems: 'center',
          }}
        >
          {/* Text Content */}
          <div>
            <p
              style={{
                fontSize: '12px',
                letterSpacing: '3px',
                textTransform: 'uppercase',
                color: '#FBBE63',
                marginBottom: '20px',
              }}
            >
              About Us
            </p>
            <h1
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: '52px',
                lineHeight: 1.1,
                letterSpacing: '0.5px',
                color: '#0A0A0A',
                marginBottom: '28px',
              }}
            >
              Where Art, Design & Lifestyle Come Together
            </h1>
            <p
              style={{
                fontSize: '18px',
                color: '#666666',
                lineHeight: 1.8,
                marginBottom: '24px',
              }}
            >
              Dysnomia Art Gallery is a modern space where art, design, and lifestyle come together.
              We offer unique artworks and decorative pieces crafted with care, style, and high-quality materials.
            </p>
            <p
              style={{
                fontSize: '17px',
                color: '#666666',
                lineHeight: 1.8,
                marginBottom: '40px',
              }}
            >
              With a focus on aesthetics, eco-friendly production, and original design,
              Dysnomia brings beauty and inspiration into every home.
            </p>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <Link
                to="/shop"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '18px 40px',
                  backgroundColor: '#0A0A0A',
                  color: '#FFFFFF',
                  fontSize: '12px',
                  fontWeight: 600,
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                  transition: 'all 0.3s',
                }}
              >
                Explore Artworks
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                to="/collections"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '18px 40px',
                  backgroundColor: '#FFFFFF',
                  color: '#0A0A0A',
                  fontSize: '12px',
                  fontWeight: 600,
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                  border: '1px solid #E5E5E5',
                  transition: 'all 0.3s',
                }}
              >
                View Collections
              </Link>
            </div>
          </div>

          {/* Hero Image */}
          <div
            style={{
              position: 'relative',
              aspectRatio: '4/5',
              overflow: 'hidden',
            }}
          >
            <img
              src="/logo.png"
              alt="Dysnomia Art Gallery"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: '32px',
                left: '32px',
                right: '32px',
                padding: '24px',
                backgroundColor: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <p
                style={{
                  fontSize: '11px',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  color: '#FBBE63',
                  marginBottom: '8px',
                }}
              >
                Our Mission
              </p>
              <p
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: '18px',
                  color: '#0A0A0A',
                  lineHeight: 1.5,
                }}
              >
                "To bring beauty and inspiration into every home through thoughtfully crafted art."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section
        style={{
          backgroundColor: '#0A0A0A',
          padding: '60px 48px',
        }}
      >
        <div
          style={{
            maxWidth: '1400px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '32px',
            textAlign: 'center',
          }}
        >
          {STATS.map((stat) => (
            <div key={stat.label}>
              <p
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: '48px',
                  color: '#FBBE63',
                  marginBottom: '8px',
                }}
              >
                {stat.number}
              </p>
              <p
                style={{
                  fontSize: '13px',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.7)',
                }}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Values Section */}
      <section style={{ maxWidth: '1400px', margin: '0 auto', padding: '100px 48px' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <p
            style={{
              fontSize: '12px',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              color: '#FBBE63',
              marginBottom: '16px',
            }}
          >
            Our Values
          </p>
          <h2
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '42px',
              color: '#0A0A0A',
              marginBottom: '20px',
            }}
          >
            What We Stand For
          </h2>
          <p
            style={{
              fontSize: '17px',
              color: '#666666',
              maxWidth: '600px',
              margin: '0 auto',
              lineHeight: 1.7,
            }}
          >
            Every piece we create reflects our commitment to quality, sustainability,
            and original design. These are the principles that guide everything we do.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '32px',
          }}
        >
          {VALUES.map((value) => (
            <div
              key={value.title}
              style={{
                padding: '48px',
                backgroundColor: '#FAFAFA',
                border: '1px solid #E5E5E5',
                transition: 'all 0.3s',
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E5E5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '24px',
                  color: '#FBBE63',
                }}
              >
                {value.icon}
              </div>
              <h3
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: '24px',
                  color: '#0A0A0A',
                  marginBottom: '16px',
                }}
              >
                {value.title}
              </h3>
              <p
                style={{
                  fontSize: '15px',
                  color: '#666666',
                  lineHeight: 1.7,
                }}
              >
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Story Section */}
      <section
        style={{
          backgroundColor: '#FAFAFA',
          borderTop: '1px solid #E5E5E5',
          borderBottom: '1px solid #E5E5E5',
        }}
      >
        <div
          style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '100px 48px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '80px',
            alignItems: 'center',
          }}
        >
          <div>
            <img
              src="https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&h=600&fit=crop"
              alt="Art studio"
              style={{
                width: '100%',
                height: '400px',
                objectFit: 'cover',
              }}
            />
          </div>
          <div>
            <p
              style={{
                fontSize: '12px',
                letterSpacing: '3px',
                textTransform: 'uppercase',
                color: '#FBBE63',
                marginBottom: '20px',
              }}
            >
              Our Story
            </p>
            <h2
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: '36px',
                color: '#0A0A0A',
                marginBottom: '24px',
                lineHeight: 1.2,
              }}
            >
              From Passion to Gallery
            </h2>
            <p
              style={{
                fontSize: '16px',
                color: '#666666',
                lineHeight: 1.8,
                marginBottom: '20px',
              }}
            >
              Dysnomia started with a simple belief: everyone deserves to live surrounded by beauty.
              What began as a small collection of curated artworks has grown into a gallery that
              serves art lovers across the globe.
            </p>
            <p
              style={{
                fontSize: '16px',
                color: '#666666',
                lineHeight: 1.8,
                marginBottom: '32px',
              }}
            >
              Today, we continue to seek out unique pieces that blend modern aesthetics with timeless
              appeal. Each artwork is selected not just for its beauty, but for its ability to
              transform a space and inspire those who live with it.
            </p>
            <Link
              to="/collections"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '13px',
                fontWeight: 600,
                letterSpacing: '1px',
                textTransform: 'uppercase',
                color: '#0A0A0A',
                textDecoration: 'none',
                borderBottom: '2px solid #FBBE63',
                paddingBottom: '4px',
              }}
            >
              Discover Our Collections
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '100px 48px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr',
            gap: '64px',
            alignItems: 'start',
          }}
        >
          <div>
            <p
              style={{
                fontSize: '12px',
                letterSpacing: '3px',
                textTransform: 'uppercase',
                color: '#FBBE63',
                marginBottom: '20px',
              }}
            >
              Get in Touch
            </p>
            <h2
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: '36px',
                color: '#0A0A0A',
                marginBottom: '24px',
              }}
            >
              We'd Love to Hear From You
            </h2>
            <p
              style={{
                fontSize: '16px',
                color: '#666666',
                lineHeight: 1.8,
                marginBottom: '40px',
              }}
            >
              Whether you have questions about our artworks, need help choosing the perfect piece
              for your space, or want to discuss a custom project, we're here to help.
            </p>
            <a
              href="mailto:hello@dysnomia.gallery"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                padding: '20px 48px',
                backgroundColor: '#FBBE63',
                color: '#0A0A0A',
                fontSize: '13px',
                fontWeight: 600,
                letterSpacing: '2px',
                textTransform: 'uppercase',
                textDecoration: 'none',
                transition: 'all 0.3s',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              Contact Us
            </a>
          </div>

          <div
            style={{
              backgroundColor: '#FAFAFA',
              border: '1px solid #E5E5E5',
              padding: '40px',
            }}
          >
            <div style={{ marginBottom: '32px' }}>
              <p
                style={{
                  fontSize: '11px',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  color: '#999999',
                  marginBottom: '8px',
                }}
              >
                Email
              </p>
              <p style={{ fontSize: '16px', color: '#0A0A0A' }}>hello@dysnomia.gallery</p>
            </div>
            <div style={{ marginBottom: '32px' }}>
              <p
                style={{
                  fontSize: '11px',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  color: '#999999',
                  marginBottom: '8px',
                }}
              >
                Location
              </p>
              <p style={{ fontSize: '16px', color: '#0A0A0A', lineHeight: 1.6 }}>
                Skopje, North Macedonia
                <br />
                Shipping Worldwide
              </p>
            </div>
            <div>
              <p
                style={{
                  fontSize: '11px',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  color: '#999999',
                  marginBottom: '12px',
                }}
              >
                Follow Us
              </p>
              <div style={{ display: 'flex', gap: '16px' }}>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: '44px',
                    height: '44px',
                    border: '1px solid #E5E5E5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#0A0A0A',
                    textDecoration: 'none',
                    transition: 'all 0.3s',
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </a>
                <a
                  href="https://pinterest.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: '44px',
                    height: '44px',
                    border: '1px solid #E5E5E5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#0A0A0A',
                    textDecoration: 'none',
                    transition: 'all 0.3s',
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M8 12a4 4 0 118 0c0 2.5-1.5 5-4 7l-1-4" />
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: '44px',
                    height: '44px',
                    border: '1px solid #E5E5E5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#0A0A0A',
                    textDecoration: 'none',
                    transition: 'all 0.3s',
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gold Accent Line */}
      <div style={{ height: '4px', backgroundColor: '#FBBE63' }} />
    </div>
  );
}
