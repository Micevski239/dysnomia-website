import { Link } from 'react-router-dom';
import type { CartItem as CartItemType } from '../../context/CartContext';
import { useCurrency } from '../../hooks/useCurrency';
import { useLanguage } from '../../hooks/useLanguage';
import { printTypes } from '../../config/printOptions';

interface CartItemProps {
  item: CartItemType;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
}

export default function CartItem({ item, onIncrement, onDecrement, onRemove }: CartItemProps) {
  const { formatPrice } = useCurrency();
  const { t } = useLanguage();

  const printType = printTypes.find((p) => p.id === item.printType);
  const printTypeLabel = printType?.labelMk ?? item.printType;

  return (
    <div
      style={{
        display: 'flex',
        gap: '20px',
        padding: '24px 0',
        borderBottom: '1px solid #e5e5e5',
      }}
    >
      {/* Product Image */}
      <Link to={`/artwork/${item.productSlug}`}>
        <div
          style={{
            width: 'clamp(80px, 15vw, 120px)',
            height: 'clamp(100px, 18vw, 150px)',
            backgroundColor: '#f5f5f5',
            flexShrink: 0,
          }}
        >
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.productTitle}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
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
                stroke="#cccccc"
                strokeWidth="1"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
          )}
        </div>
      </Link>

      {/* Product Details */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Link
          to={`/artwork/${item.productSlug}`}
          style={{
            textDecoration: 'none',
            color: '#1a1a1a',
          }}
        >
          <h3
            style={{
              fontSize: '16px',
              fontWeight: 500,
              marginBottom: '8px',
            }}
          >
            {item.productTitle}
          </h3>
        </Link>

        <p
          style={{
            fontSize: '14px',
            color: '#6b6b6b',
            marginBottom: '4px',
          }}
        >
          {printTypeLabel}
        </p>

        <p
          style={{
            fontSize: '14px',
            color: '#6b6b6b',
            marginBottom: '16px',
          }}
        >
          {item.sizeLabel}
        </p>

        {/* Quantity Controls */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginTop: 'auto',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              border: '1px solid #e5e5e5',
              borderRadius: '4px',
            }}
          >
            <button
              onClick={onDecrement}
              style={{
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                fontSize: '18px',
                color: '#4a4a4a',
              }}
              aria-label={t('cart.updateQuantity')}
            >
              −
            </button>
            <span
              style={{
                width: '40px',
                textAlign: 'center',
                fontSize: '14px',
                fontWeight: 500,
              }}
            >
              {item.quantity}
            </span>
            <button
              onClick={onIncrement}
              style={{
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                fontSize: '18px',
                color: '#4a4a4a',
              }}
              aria-label={t('cart.updateQuantity')}
            >
              +
            </button>
          </div>

          <button
            onClick={onRemove}
            style={{
              fontSize: '13px',
              color: '#6b6b6b',
              textDecoration: 'underline',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            {t('cart.removeItem')}
          </button>
        </div>
      </div>

      {/* Price */}
      <div
        style={{
          textAlign: 'right',
          flexShrink: 0,
        }}
      >
        <p
          style={{
            fontSize: '16px',
            fontWeight: 600,
            color: '#1a1a1a',
          }}
        >
          {formatPrice(item.unitPrice * item.quantity)}
        </p>
        {item.quantity > 1 && (
          <p
            style={{
              fontSize: '13px',
              color: '#6b6b6b',
              marginTop: '4px',
            }}
          >
            {formatPrice(item.unitPrice)} each
          </p>
        )}
      </div>
    </div>
  );
}
