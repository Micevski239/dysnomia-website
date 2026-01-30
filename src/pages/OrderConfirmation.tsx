import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { useCurrency } from '../hooks/useCurrency';
import { useOrderDetail } from '../hooks/useOrders';
import { printTypes } from '../config/printOptions';

export default function OrderConfirmation() {
  const { orderId } = useParams<{ orderId: string }>();
  const { order, loading, error } = useOrderDetail(orderId);
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', paddingTop: '120px' }}>
        <div
          style={{
            maxWidth: '800px',
            margin: '0 auto',
            padding: '80px 24px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              border: '3px solid #E5E5E5',
              borderTopColor: '#B8860B',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto',
            }}
          />
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', paddingTop: '120px' }}>
        <div
          style={{
            maxWidth: '600px',
            margin: '0 auto',
            padding: '80px 24px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              margin: '0 auto 24px',
              backgroundColor: '#fef2f2',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#dc2626"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h1
            style={{
              fontSize: '24px',
              fontWeight: 300,
              color: '#1a1a1a',
              marginBottom: '16px',
            }}
          >
            Order Not Found
          </h1>
          <p style={{ color: '#6b6b6b', marginBottom: '32px' }}>
            We couldn't find this order. Please check the order number and try again.
          </p>
          <Link
            to="/"
            style={{
              display: 'inline-block',
              padding: '16px 40px',
              backgroundColor: '#B8860B',
              color: '#ffffff',
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            {t('common.home')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', paddingTop: '120px' }}>
      <div
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '48px 24px',
        }}
      >
        {/* Success Message */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div
            style={{
              width: '80px',
              height: '80px',
              margin: '0 auto 24px',
              backgroundColor: '#f0fdf4',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#22c55e"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1
            style={{
              fontSize: 'clamp(28px, 4vw, 36px)',
              fontWeight: 300,
              color: '#1a1a1a',
              marginBottom: '12px',
            }}
          >
            {t('order.thankYou')}
          </h1>
          <p style={{ color: '#6b6b6b', fontSize: '16px' }}>
            {t('order.orderReceived')}
          </p>
        </div>

        {/* Order Number */}
        <div
          style={{
            backgroundColor: '#f9f9f9',
            padding: '24px',
            borderRadius: '8px',
            textAlign: 'center',
            marginBottom: '40px',
          }}
        >
          <p
            style={{
              fontSize: '14px',
              color: '#6b6b6b',
              marginBottom: '8px',
            }}
          >
            {t('order.orderNumber')}
          </p>
          <p
            style={{
              fontSize: '24px',
              fontWeight: 600,
              color: '#B8860B',
              letterSpacing: '0.05em',
            }}
          >
            {order.order_number}
          </p>
        </div>

        {/* Order Details */}
        <div style={{ marginBottom: '40px' }}>
          <h2
            style={{
              fontSize: '18px',
              fontWeight: 600,
              color: '#1a1a1a',
              marginBottom: '24px',
              paddingBottom: '12px',
              borderBottom: '1px solid #e5e5e5',
            }}
          >
            {t('order.orderDetails')}
          </h2>

          {/* Items */}
          <div style={{ marginBottom: '24px' }}>
            {order.items.map((item, index) => {
              const printType = printTypes.find((p) => p.id === item.printType);
              return (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    gap: '16px',
                    padding: '16px 0',
                    borderBottom: index < order.items.length - 1 ? '1px solid #e5e5e5' : 'none',
                  }}
                >
                  <div
                    style={{
                      width: '80px',
                      height: '100px',
                      backgroundColor: '#f5f5f5',
                      flexShrink: 0,
                    }}
                  >
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.productTitle}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p
                      style={{
                        fontSize: '15px',
                        fontWeight: 500,
                        color: '#1a1a1a',
                        marginBottom: '4px',
                      }}
                    >
                      {item.productTitle}
                    </p>
                    <p style={{ fontSize: '13px', color: '#6b6b6b' }}>
                      {printType?.labelMk} • {item.sizeLabel} • Qty: {item.quantity}
                    </p>
                  </div>
                  <p
                    style={{
                      fontSize: '15px',
                      fontWeight: 500,
                      color: '#1a1a1a',
                    }}
                  >
                    {formatPrice(item.unitPrice * item.quantity)}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Totals */}
          <div
            style={{
              backgroundColor: '#f9f9f9',
              padding: '20px',
              borderRadius: '8px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '12px',
              }}
            >
              <span style={{ color: '#6b6b6b' }}>{t('cart.subtotal')}</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '12px',
              }}
            >
              <span style={{ color: '#6b6b6b' }}>{t('cart.shipping')}</span>
              <span>{order.shipping_cost > 0 ? formatPrice(order.shipping_cost) : 'TBD'}</span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '12px',
                borderTop: '1px solid #e5e5e5',
              }}
            >
              <span style={{ fontWeight: 600 }}>{t('cart.total')}</span>
              <span
                style={{
                  fontSize: '18px',
                  fontWeight: 600,
                  color: '#B8860B',
                }}
              >
                {formatPrice(order.total_amount)}
              </span>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div style={{ marginBottom: '40px' }}>
          <h2
            style={{
              fontSize: '18px',
              fontWeight: 600,
              color: '#1a1a1a',
              marginBottom: '16px',
            }}
          >
            {t('checkout.shippingAddress')}
          </h2>
          <div
            style={{
              backgroundColor: '#f9f9f9',
              padding: '20px',
              borderRadius: '8px',
            }}
          >
            <p style={{ marginBottom: '4px' }}>{order.customer_name}</p>
            <p style={{ color: '#6b6b6b', fontSize: '14px' }}>
              {order.shipping_address.address}
            </p>
            <p style={{ color: '#6b6b6b', fontSize: '14px' }}>
              {order.shipping_address.city}, {order.shipping_address.postalCode}
            </p>
            <p style={{ color: '#6b6b6b', fontSize: '14px' }}>
              {order.shipping_address.country}
            </p>
            <p style={{ color: '#6b6b6b', fontSize: '14px', marginTop: '12px' }}>
              {order.customer_email}
            </p>
            {order.customer_phone && (
              <p style={{ color: '#6b6b6b', fontSize: '14px' }}>{order.customer_phone}</p>
            )}
          </div>
        </div>

        {/* Continue Shopping */}
        <div style={{ textAlign: 'center' }}>
          <Link
            to="/shop"
            style={{
              display: 'inline-block',
              padding: '16px 40px',
              backgroundColor: '#B8860B',
              color: '#ffffff',
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            {t('common.continueShopping')}
          </Link>
        </div>
      </div>
    </div>
  );
}
