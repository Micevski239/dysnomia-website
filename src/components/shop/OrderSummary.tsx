import type { CartItem } from '../../context/CartContext';
import { useCurrency } from '../../hooks/useCurrency';
import { useLanguage } from '../../hooks/useLanguage';
import { printTypes } from '../../config/printOptions';

interface OrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  shippingCost?: number;
}

export default function OrderSummary({ items, subtotal, shippingCost = 0 }: OrderSummaryProps) {
  const { formatPrice } = useCurrency();
  const { t } = useLanguage();

  const total = subtotal + shippingCost;

  return (
    <div
      style={{
        backgroundColor: '#f9f9f9',
        padding: '32px',
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

      {/* Items List */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          marginBottom: '24px',
          maxHeight: '300px',
          overflowY: 'auto',
        }}
      >
        {items.map((item) => {
          const printType = printTypes.find((p) => p.id === item.printType);
          const printTypeLabel = printType?.labelMk ?? item.printType;

          return (
            <div
              key={`${item.productId}-${item.printType}-${item.sizeId}`}
              style={{
                display: 'flex',
                gap: '12px',
              }}
            >
              <div
                style={{
                  width: '60px',
                  height: '75px',
                  backgroundColor: '#e5e5e5',
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
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#1a1a1a',
                    marginBottom: '4px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.productTitle}
                </p>
                <p
                  style={{
                    fontSize: '12px',
                    color: '#6b6b6b',
                  }}
                >
                  {printTypeLabel} • {item.sizeLabel} • Qty: {item.quantity}
                </p>
              </div>
              <p
                style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#1a1a1a',
                  flexShrink: 0,
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
          borderTop: '1px solid #e5e5e5',
          paddingTop: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '14px',
          }}
        >
          <span style={{ color: '#6b6b6b' }}>{t('cart.subtotal')}</span>
          <span style={{ color: '#1a1a1a' }}>{formatPrice(subtotal)}</span>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '14px',
          }}
        >
          <span style={{ color: '#6b6b6b' }}>{t('cart.shipping')}</span>
          <span style={{ color: '#1a1a1a' }}>
            {shippingCost > 0 ? formatPrice(shippingCost) : t('cart.shippingCalculated')}
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            paddingTop: '12px',
            borderTop: '1px solid #e5e5e5',
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
            {formatPrice(total)}
          </span>
        </div>
      </div>
    </div>
  );
}
