import { Link } from 'react-router-dom';
import { useLanguage } from '../../hooks/useLanguage';

export default function CartEmpty() {
  const { t } = useLanguage();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 24px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: '120px',
          height: '120px',
          backgroundColor: '#f5f5f5',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '32px',
        }}
      >
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#999999"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      </div>

      <h2
        style={{
          fontSize: '28px',
          fontWeight: 300,
          color: '#1a1a1a',
          marginBottom: '12px',
        }}
      >
        {t('cart.emptyCart')}
      </h2>

      <p
        style={{
          color: '#6b6b6b',
          fontSize: '16px',
          marginBottom: '32px',
          maxWidth: '400px',
        }}
      >
        {t('cart.emptyCartMessage')}
      </p>

      <Link
        to="/shop"
        style={{
          display: 'inline-block',
          padding: '16px 40px',
          backgroundColor: '#B8860B',
          color: '#ffffff',
          fontWeight: 500,
          letterSpacing: '0.02em',
          textDecoration: 'none',
          fontSize: '15px',
          transition: 'background-color 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#9a7209')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#B8860B')}
      >
        {t('common.continueShopping')}
      </Link>
    </div>
  );
}
