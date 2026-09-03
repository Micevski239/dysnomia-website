import { Link } from 'react-router-dom';
import { useCurrency } from '../../hooks/useCurrency';
import { useLanguage } from '../../hooks/useLanguage';

interface CartSummaryProps {
  subtotal: number;
  itemCount: number;
}

export default function CartSummary({ subtotal, itemCount }: CartSummaryProps) {
  const { formatPrice } = useCurrency();
  const { t } = useLanguage();

  return (
    <div
      style={{
        backgroundColor: '#f9f9f9',
        padding: 'clamp(20px, 3vw, 32px)',
        borderRadius: '8px',
      }}
    >
      <h2
        style={{
          fontSize: '18px',
          fontWeight: 600,
          color: '#1a1a1a',
          marginBottom: '24px',
        }}
      >
        {t('checkout.orderSummary')}
      </h2>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '14px',
          }}
        >
          <span style={{ color: '#6b6b6b' }}>
            {t('cart.subtotal')} ({itemCount} {itemCount === 1 ? 'item' : 'items'})
          </span>
          <span style={{ color: '#1a1a1a', fontWeight: 500 }}>{formatPrice(subtotal)}</span>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '14px',
          }}
        >
          <span style={{ color: '#6b6b6b' }}>{t('cart.shipping')}</span>
          <span style={{ color: '#6b6b6b', fontSize: '13px' }}>
            {t('cart.shippingCalculated')}
          </span>
        </div>
      </div>

      <div
        style={{
          borderTop: '1px solid #e5e5e5',
          paddingTop: '16px',
          marginBottom: '24px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <span
            style={{
              fontSize: '16px',
              fontWeight: 600,
              color: '#1a1a1a',
            }}
          >
            {t('cart.total')}
          </span>
          <span
            style={{
              fontSize: '20px',
              fontWeight: 600,
              color: '#B8860B',
            }}
          >
            {formatPrice(subtotal)}
          </span>
        </div>
      </div>

      <Link
        to="/checkout"
        style={{
          display: 'block',
          width: '100%',
          padding: '16px',
          backgroundColor: '#B8860B',
          color: '#ffffff',
          fontWeight: 500,
          letterSpacing: '0.02em',
          textDecoration: 'none',
          fontSize: '15px',
          textAlign: 'center',
          transition: 'background-color 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#9a7209')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#B8860B')}
      >
        {t('common.proceedToCheckout')}
      </Link>

      <Link
        to="/shop"
        style={{
          display: 'block',
          width: '100%',
          padding: '16px',
          color: '#6b6b6b',
          fontWeight: 500,
          textDecoration: 'none',
          fontSize: '14px',
          textAlign: 'center',
          marginTop: '12px',
        }}
      >
        {t('common.continueShopping')}
      </Link>
    </div>
  );
}
