import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <section
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        overflow: 'hidden'
      }}
    >
      {/* Logo as full background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url(/logo.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />

      {/* Dark overlay for text readability */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(10, 10, 10, 0.85) 0%, rgba(10, 10, 10, 0.5) 40%, rgba(10, 10, 10, 0.3) 70%, rgba(10, 10, 10, 0.4) 100%)'
        }}
      />

      {/* Gold accent line - left side */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '48px',
          width: '2px',
          height: '150px',
          background: 'linear-gradient(to bottom, transparent, #FBBE63, transparent)',
          transform: 'translateY(-50%)'
        }}
      />

      {/* Content */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '0 120px 100px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end'
        }}
      >
        {/* Left side - Main content */}
        <div style={{ maxWidth: '650px' }}>
          {/* Brand name */}
          <h1
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '64px',
              fontWeight: 600,
              color: '#FBBE63',
              letterSpacing: '10px',
              textTransform: 'uppercase',
              marginBottom: '16px',
              textShadow: '0 2px 20px rgba(0,0,0,0.3)'
            }}
          >
            DYSNOMIA
          </h1>

          {/* Tagline */}
          <p
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '20px',
              color: 'rgba(255,255,255,0.8)',
              letterSpacing: '5px',
              textTransform: 'uppercase',
              marginBottom: '28px'
            }}
          >
            Art • Design • Lifestyle
          </p>

          {/* Description */}
          <p
            style={{
              fontSize: '17px',
              color: 'rgba(255,255,255,0.75)',
              lineHeight: 1.8,
              marginBottom: '40px',
              maxWidth: '500px'
            }}
          >
            Where contemporary art meets modern living. Discover unique artworks
            and decorative pieces crafted with care, style, and sustainability.
          </p>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', gap: '16px' }}>
            <Link
              to="/collections"
              style={{
                display: 'inline-block',
                backgroundColor: '#FBBE63',
                color: '#0A0A0A',
                padding: '18px 44px',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '2px',
                textTransform: 'uppercase',
                textDecoration: 'none',
                transition: 'all 0.3s',
                border: '2px solid #FBBE63'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#FBBE63';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FBBE63';
                e.currentTarget.style.color = '#0A0A0A';
              }}
            >
              Explore Collection
            </Link>

            <Link
              to="/about"
              style={{
                display: 'inline-block',
                backgroundColor: 'transparent',
                color: '#FFFFFF',
                padding: '18px 44px',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '2px',
                textTransform: 'uppercase',
                textDecoration: 'none',
                transition: 'all 0.3s',
                border: '2px solid rgba(255,255,255,0.4)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#FBBE63';
                e.currentTarget.style.color = '#FBBE63';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)';
                e.currentTarget.style.color = '#FFFFFF';
              }}
            >
              Our Story
            </Link>
          </div>
        </div>

      </div>

      {/* Scroll indicator */}
      <div
        style={{
          position: 'absolute',
          bottom: '40px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px'
        }}
      >
        <span
          style={{
            fontSize: '10px',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.5)'
          }}
        >
          Scroll
        </span>
        <div
          style={{
            width: '1px',
            height: '35px',
            background: 'linear-gradient(to bottom, #FBBE63, transparent)'
          }}
        />
      </div>

      {/* Corner accents */}
      <div
        style={{
          position: 'absolute',
          top: '100px',
          right: '48px',
          width: '50px',
          height: '50px',
          borderTop: '2px solid #FBBE63',
          borderRight: '2px solid #FBBE63',
          opacity: 0.6
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '40px',
          right: '120px',
          width: '50px',
          height: '50px',
          borderBottom: '2px solid #FBBE63',
          borderRight: '2px solid #FBBE63',
          opacity: 0.6
        }}
      />
    </section>
  );
}
