import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: 'calc(100vh - 200px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        padding: '40px 20px',
      }}
    >
      <div style={{ textAlign: 'center', maxWidth: '500px' }}>
        <div
          style={{
            width: '120px',
            height: '120px',
            margin: '0 auto 32px',
            backgroundColor: '#F5F5F5',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '48px',
              color: '#FBBE63',
              fontWeight: 600,
            }}
          >
            404
          </span>
        </div>

        <h1
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: '36px',
            color: '#0A0A0A',
            marginBottom: '16px',
            letterSpacing: '1px',
          }}
        >
          Page Not Found
        </h1>

        <p
          style={{
            fontSize: '15px',
            color: '#666666',
            lineHeight: 1.6,
            marginBottom: '32px',
          }}
        >
          The page you're looking for doesn't exist or has been moved.
          Let's get you back to exploring our collection.
        </p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            to="/"
            style={{
              padding: '14px 32px',
              backgroundColor: '#0A0A0A',
              color: '#FFFFFF',
              textDecoration: 'none',
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              transition: 'background-color 0.3s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FBBE63')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0A0A0A')}
          >
            Back to Home
          </Link>
          <Link
            to="/shop"
            style={{
              padding: '14px 32px',
              backgroundColor: '#FFFFFF',
              color: '#0A0A0A',
              textDecoration: 'none',
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              border: '1px solid #E5E5E5',
              transition: 'all 0.3s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#FBBE63';
              e.currentTarget.style.color = '#FBBE63';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#E5E5E5';
              e.currentTarget.style.color = '#0A0A0A';
            }}
          >
            Browse Shop
          </Link>
        </div>

        <div
          style={{
            marginTop: '48px',
            width: '60px',
            height: '2px',
            backgroundColor: '#FBBE63',
            margin: '48px auto 0',
          }}
        />
      </div>
    </div>
  );
}
