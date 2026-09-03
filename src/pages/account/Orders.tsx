import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import { useLanguage } from '../../hooks/useLanguage';
import { useCurrency } from '../../hooks/useCurrency';
import { supabase } from '../../lib/supabase';
import type { Order, OrderStatus } from '../../types';

const statusColors: Record<OrderStatus, { bg: string; text: string }> = {
  pending: { bg: '#fef3c7', text: '#92400e' },
  confirmed: { bg: '#dbeafe', text: '#1e40af' },
  shipped: { bg: '#e0e7ff', text: '#3730a3' },
  delivered: { bg: '#dcfce7', text: '#166534' },
  cancelled: { bg: '#fee2e2', text: '#991b1b' },
};

const statusLabels: Record<OrderStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export default function AccountOrders() {
  const { user, loading: authLoading } = useAuthContext();
  const { t } = useLanguage();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user?.email) return;

    async function fetchOrders() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('customer_email', user!.email)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setOrders(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [user]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (authLoading || loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#ffffff',
          paddingTop: '120px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            border: '3px solid #E5E5E5',
            borderTopColor: '#B8860B',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!user) {
    return null;
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
        {/* Back Link */}
        <Link
          to="/account"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            color: '#6b6b6b',
            fontSize: '14px',
            textDecoration: 'none',
            marginBottom: '24px',
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
          Back to Account
        </Link>

        <h1
          style={{
            fontSize: 'clamp(28px, 4vw, 36px)',
            fontWeight: 300,
            color: '#1a1a1a',
            marginBottom: '32px',
          }}
        >
          {t('account.orderHistory')}
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

        {orders.length === 0 ? (
          <div
            style={{
              backgroundColor: '#f9f9f9',
              borderRadius: '8px',
              padding: '80px 24px',
              textAlign: 'center',
            }}
          >
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#cccccc"
              strokeWidth="1.5"
              style={{ margin: '0 auto 16px' }}
            >
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p style={{ color: '#6b6b6b', marginBottom: '24px' }}>{t('account.noOrders')}</p>
            <Link
              to="/shop"
              style={{
                display: 'inline-block',
                padding: '14px 32px',
                backgroundColor: '#B8860B',
                color: '#ffffff',
                fontWeight: 500,
                textDecoration: 'none',
                borderRadius: '4px',
              }}
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {orders.map((order) => (
              <div
                key={order.id}
                style={{
                  backgroundColor: '#f9f9f9',
                  borderRadius: '8px',
                  padding: '24px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '16px',
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontSize: '16px',
                        fontWeight: 500,
                        color: '#1a1a1a',
                        marginBottom: '4px',
                      }}
                    >
                      {order.order_number}
                    </p>
                    <p style={{ fontSize: '13px', color: '#6b6b6b' }}>
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      fontSize: '12px',
                      fontWeight: 500,
                      backgroundColor: statusColors[order.status].bg,
                      color: statusColors[order.status].text,
                      borderRadius: '9999px',
                    }}
                  >
                    {statusLabels[order.status]}
                  </span>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <p style={{ fontSize: '14px', color: '#4a4a4a' }}>
                    {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                  </p>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '16px',
                    borderTop: '1px solid #e5e5e5',
                  }}
                >
                  <p
                    style={{
                      fontSize: '16px',
                      fontWeight: 600,
                      color: '#B8860B',
                    }}
                  >
                    {formatPrice(order.total_amount)}
                  </p>
                  <Link
                    to={`/order-confirmation/${order.id}`}
                    style={{
                      fontSize: '14px',
                      color: '#B8860B',
                      textDecoration: 'none',
                      fontWeight: 500,
                    }}
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
