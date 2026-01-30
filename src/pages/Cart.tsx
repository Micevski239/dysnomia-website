import { useCart } from '../hooks/useCart';
import { useLanguage } from '../hooks/useLanguage';
import CartItem from '../components/shop/CartItem';
import CartSummary from '../components/shop/CartSummary';
import CartEmpty from '../components/shop/CartEmpty';

export default function Cart() {
  const { items, itemCount, totalPrice, incrementQuantity, decrementQuantity, removeFromCart } =
    useCart();
  const { t } = useLanguage();

  if (items.length === 0) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', paddingTop: '120px' }}>
        <CartEmpty />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', paddingTop: '120px' }}>
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '48px 24px',
        }}
      >
        <h1
          style={{
            fontSize: 'clamp(28px, 4vw, 40px)',
            fontWeight: 300,
            color: '#1a1a1a',
            marginBottom: '48px',
          }}
        >
          {t('cart.yourCart')}
        </h1>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '48px',
          }}
        >
          {/* Cart Items */}
          <div>
            {items.map((item) => (
              <CartItem
                key={`${item.productId}-${item.printType}-${item.sizeId}`}
                item={item}
                onIncrement={() => incrementQuantity(item)}
                onDecrement={() => decrementQuantity(item)}
                onRemove={() => removeFromCart(item)}
              />
            ))}
          </div>

          {/* Cart Summary */}
          <div>
            <CartSummary subtotal={totalPrice} itemCount={itemCount} />
          </div>
        </div>
      </div>
    </div>
  );
}
