import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useLanguage } from '../hooks/useLanguage';
import { useOrders } from '../hooks/useOrders';
import { sendOrderEmail } from '../lib/sendOrderEmail';
import CheckoutForm from '../components/shop/CheckoutForm';
import OrderSummary from '../components/shop/OrderSummary';
import type { CheckoutFormData } from '../lib/checkoutValidation';

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const { t } = useLanguage();
  const { createOrder } = useOrders();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: CheckoutFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const orderData = {
        customerEmail: formData.email,
        customerName: formData.fullName,
        customerPhone: formData.phone,
        shippingAddress: {
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country,
        },
        items: items.map((item) => ({
          productId: item.productId,
          productTitle: item.productTitle,
          productSlug: item.productSlug,
          imageUrl: item.imageUrl,
          printType: item.printType,
          sizeId: item.sizeId,
          sizeLabel: item.sizeLabel,
          quantity: item.quantity,
          unitPrice: item.unitPrice, // client-side price for display; server re-validates
        })),
        subtotal: totalPrice, // server recalculates from price matrix
        shippingCost: 0,
        totalAmount: totalPrice,
        notes: formData.notes,
      };

      const result = await createOrder(orderData);

      if (result.error) {
        setError(result.error);
        setIsSubmitting(false);
        return;
      }

      // Fire-and-forget: send confirmation email (never blocks order flow)
      if (result.data) {
        sendOrderEmail(result.data, 'order_placed');
      }

      // Clear cart and redirect to confirmation
      clearCart();
      navigate(`/order-confirmation/${result.data?.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
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
          <h1
            style={{
              fontSize: '28px',
              fontWeight: 300,
              color: '#1a1a1a',
              marginBottom: '16px',
            }}
          >
            {t('cart.emptyCart')}
          </h1>
          <p
            style={{
              color: '#6b6b6b',
              marginBottom: '32px',
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
              textDecoration: 'none',
            }}
          >
            {t('common.continueShopping')}
          </Link>
        </div>
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
        {/* Back Link */}
        <Link
          to="/cart"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            color: '#6b6b6b',
            fontSize: '14px',
            textDecoration: 'none',
            marginBottom: '32px',
          }}
        >
          <svg
            style={{ width: '16px', height: '16px', marginRight: '8px' }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          {t('common.back')} to Cart
        </Link>

        <h1
          style={{
            fontSize: 'clamp(28px, 4vw, 40px)',
            fontWeight: 300,
            color: '#1a1a1a',
            marginBottom: '48px',
          }}
        >
          {t('checkout.checkout')}
        </h1>

        {error && (
          <div
            style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '24px',
            }}
          >
            <p style={{ color: '#dc2626', fontSize: '14px' }}>{error}</p>
          </div>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 'clamp(24px, 4vw, 48px)',
          }}
        >
          {/* Checkout Form */}
          <div>
            <CheckoutForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
          </div>

          {/* Order Summary */}
          <div>
            <div style={{ position: 'sticky', top: '120px' }}>
              <OrderSummary items={items} subtotal={totalPrice} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
