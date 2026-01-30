import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useOrderDetail, useOrders } from '../../hooks/useOrders';
import { sendOrderEmail } from '../../lib/sendOrderEmail';
import { printTypes } from '../../config/printOptions';
import type { OrderStatus } from '../../types';

const statusToEmailType: Partial<Record<OrderStatus, Parameters<typeof sendOrderEmail>[1]>> = {
  confirmed: 'order_confirmed',
  shipped: 'order_shipped',
  delivered: 'order_delivered',
  cancelled: 'order_cancelled',
};

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

const statusFlow: OrderStatus[] = ['pending', 'confirmed', 'shipped', 'delivered'];

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { order, loading, error, refetch } = useOrderDetail(id);
  const { updateOrderStatus, updateTrackingNumber, addOrderNote } = useOrders();
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [showNotesForm, setShowNotesForm] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingInitialized, setTrackingInitialized] = useState(false);

  // Initialize tracking number from order data once loaded
  if (order && !trackingInitialized) {
    setTrackingNumber(order.tracking_number || '');
    setTrackingInitialized(true);
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (amount: number) => {
    return `${amount.toLocaleString()} MKD`;
  };

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (!order) return;

    setIsUpdating(true);
    setUpdateError(null);

    const tracking = newStatus === 'shipped' ? trackingNumber || undefined : undefined;
    const { error } = await updateOrderStatus(order.id, newStatus, tracking);

    if (error) {
      setUpdateError(error);
    } else {
      // Fire-and-forget: send status email
      const emailType = statusToEmailType[newStatus];
      if (emailType) {
        sendOrderEmail(order, emailType, tracking);
      }
      refetch();
    }

    setIsUpdating(false);
  };

  const handleSaveTracking = async () => {
    if (!order) return;

    setIsUpdating(true);
    setUpdateError(null);

    const { error } = await updateTrackingNumber(order.id, trackingNumber);

    if (error) {
      setUpdateError(error);
    } else {
      refetch();
    }

    setIsUpdating(false);
  };

  const handleSaveNotes = async () => {
    if (!order) return;

    setIsUpdating(true);
    setUpdateError(null);

    const { error } = await addOrderNote(order.id, notes);

    if (error) {
      setUpdateError(error);
    } else {
      refetch();
      setShowNotesForm(false);
    }

    setIsUpdating(false);
  };

  if (loading) {
    return (
      <div style={{ padding: '80px', textAlign: 'center' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
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
    );
  }

  if (error || !order) {
    return (
      <div>
        <Link
          to="/admin/orders"
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
          Back to Orders
        </Link>
        <div
          style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '24px',
            textAlign: 'center',
          }}
        >
          <p style={{ color: '#dc2626' }}>Order not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <Link
          to="/admin/orders"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            color: '#6b6b6b',
            fontSize: '14px',
            textDecoration: 'none',
            marginBottom: '16px',
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
          Back to Orders
        </Link>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div>
            <h1
              style={{
                fontSize: '28px',
                fontWeight: 600,
                color: '#1a1a1a',
                marginBottom: '8px',
              }}
            >
              Order {order.order_number}
            </h1>
            <p style={{ color: '#6b6b6b', fontSize: '14px' }}>{formatDate(order.created_at)}</p>
          </div>
          <span
            style={{
              display: 'inline-block',
              padding: '8px 20px',
              fontSize: '14px',
              fontWeight: 500,
              backgroundColor: statusColors[order.status].bg,
              color: statusColors[order.status].text,
              borderRadius: '9999px',
            }}
          >
            {statusLabels[order.status]}
          </span>
        </div>
      </div>

      {updateError && (
        <div
          style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px',
          }}
        >
          <p style={{ color: '#dc2626', fontSize: '14px' }}>{updateError}</p>
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 350px',
          gap: '32px',
        }}
      >
        {/* Main Content */}
        <div>
          {/* Order Items */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e5e5',
              borderRadius: '8px',
              marginBottom: '24px',
            }}
          >
            <div
              style={{
                padding: '20px',
                borderBottom: '1px solid #e5e5e5',
              }}
            >
              <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a1a' }}>
                Order Items ({order.items.length})
              </h2>
            </div>
            <div style={{ padding: '20px' }}>
              {order.items.map((item, index) => {
                const printType = printTypes.find((p) => p.id === item.printType);
                return (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      gap: '16px',
                      paddingBottom: index < order.items.length - 1 ? '20px' : 0,
                      marginBottom: index < order.items.length - 1 ? '20px' : 0,
                      borderBottom:
                        index < order.items.length - 1 ? '1px solid #e5e5e5' : 'none',
                    }}
                  >
                    <div
                      style={{
                        width: '80px',
                        height: '100px',
                        backgroundColor: '#f5f5f5',
                        flexShrink: 0,
                        borderRadius: '4px',
                        overflow: 'hidden',
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
                      <p style={{ fontWeight: 500, color: '#1a1a1a', marginBottom: '4px' }}>
                        {item.productTitle}
                      </p>
                      <p style={{ fontSize: '13px', color: '#6b6b6b' }}>
                        {printType?.labelMk} • {item.sizeLabel}
                      </p>
                      <p style={{ fontSize: '13px', color: '#6b6b6b', marginTop: '4px' }}>
                        Qty: {item.quantity} × {formatPrice(item.unitPrice)}
                      </p>
                    </div>
                    <p style={{ fontWeight: 500, color: '#1a1a1a' }}>
                      {formatPrice(item.unitPrice * item.quantity)}
                    </p>
                  </div>
                );
              })}
            </div>
            <div
              style={{
                padding: '20px',
                backgroundColor: '#f9f9f9',
                borderTop: '1px solid #e5e5e5',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                }}
              >
                <span style={{ color: '#6b6b6b' }}>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                }}
              >
                <span style={{ color: '#6b6b6b' }}>Shipping</span>
                <span>{order.shipping_cost > 0 ? formatPrice(order.shipping_cost) : 'TBD'}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: '12px',
                  borderTop: '1px solid #e5e5e5',
                  fontSize: '18px',
                  fontWeight: 600,
                }}
              >
                <span>Total</span>
                <span style={{ color: '#B8860B' }}>{formatPrice(order.total_amount)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e5e5',
              borderRadius: '8px',
            }}
          >
            <div
              style={{
                padding: '20px',
                borderBottom: '1px solid #e5e5e5',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a1a' }}>Notes</h2>
              <button
                onClick={() => {
                  setNotes(order.notes || '');
                  setShowNotesForm(!showNotesForm);
                }}
                style={{
                  fontSize: '13px',
                  color: '#B8860B',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                {showNotesForm ? 'Cancel' : 'Edit'}
              </button>
            </div>
            <div style={{ padding: '20px' }}>
              {showNotesForm ? (
                <div>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '12px',
                      fontSize: '14px',
                      border: '1px solid #e5e5e5',
                      borderRadius: '4px',
                      resize: 'vertical',
                      marginBottom: '12px',
                    }}
                  />
                  <button
                    onClick={handleSaveNotes}
                    disabled={isUpdating}
                    style={{
                      padding: '10px 20px',
                      fontSize: '14px',
                      fontWeight: 500,
                      backgroundColor: '#B8860B',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: isUpdating ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {isUpdating ? 'Saving...' : 'Save Notes'}
                  </button>
                </div>
              ) : order.notes ? (
                <p style={{ color: '#4a4a4a', whiteSpace: 'pre-wrap' }}>{order.notes}</p>
              ) : (
                <p style={{ color: '#6b6b6b', fontStyle: 'italic' }}>No notes added.</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div>
          {/* Customer Info */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e5e5',
              borderRadius: '8px',
              marginBottom: '24px',
            }}
          >
            <div
              style={{
                padding: '20px',
                borderBottom: '1px solid #e5e5e5',
              }}
            >
              <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a1a' }}>Customer</h2>
            </div>
            <div style={{ padding: '20px' }}>
              <p style={{ fontWeight: 500, color: '#1a1a1a', marginBottom: '4px' }}>
                {order.customer_name}
              </p>
              <p style={{ fontSize: '14px', color: '#6b6b6b', marginBottom: '4px' }}>
                {order.customer_email}
              </p>
              {order.customer_phone && (
                <p style={{ fontSize: '14px', color: '#6b6b6b' }}>{order.customer_phone}</p>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e5e5',
              borderRadius: '8px',
              marginBottom: '24px',
            }}
          >
            <div
              style={{
                padding: '20px',
                borderBottom: '1px solid #e5e5e5',
              }}
            >
              <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a1a' }}>
                Shipping Address
              </h2>
            </div>
            <div style={{ padding: '20px' }}>
              <p style={{ fontSize: '14px', color: '#4a4a4a', marginBottom: '4px' }}>
                {order.shipping_address.address}
              </p>
              <p style={{ fontSize: '14px', color: '#4a4a4a', marginBottom: '4px' }}>
                {order.shipping_address.city}, {order.shipping_address.postalCode}
              </p>
              <p style={{ fontSize: '14px', color: '#4a4a4a' }}>
                {order.shipping_address.country}
              </p>
            </div>
          </div>

          {/* Tracking Number */}
          {order.status !== 'pending' && order.status !== 'cancelled' && (
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e5e5',
                borderRadius: '8px',
                marginBottom: '24px',
              }}
            >
              <div
                style={{
                  padding: '20px',
                  borderBottom: '1px solid #e5e5e5',
                }}
              >
                <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a1a' }}>
                  Tracking Number
                </h2>
              </div>
              <div style={{ padding: '20px' }}>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking number"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '14px',
                    border: '1px solid #e5e5e5',
                    borderRadius: '4px',
                    marginBottom: '12px',
                    boxSizing: 'border-box',
                  }}
                />
                <button
                  onClick={handleSaveTracking}
                  disabled={isUpdating}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    fontSize: '14px',
                    fontWeight: 500,
                    backgroundColor: '#B8860B',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isUpdating ? 'not-allowed' : 'pointer',
                    opacity: isUpdating ? 0.7 : 1,
                  }}
                >
                  {isUpdating ? 'Saving...' : 'Save Tracking Number'}
                </button>
              </div>
            </div>
          )}

          {/* Status Update */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e5e5',
              borderRadius: '8px',
            }}
          >
            <div
              style={{
                padding: '20px',
                borderBottom: '1px solid #e5e5e5',
              }}
            >
              <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a1a' }}>Update Status</h2>
            </div>
            <div style={{ padding: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {statusFlow.map((status) => {
                  const isActive = order.status === status;
                  const isPast =
                    statusFlow.indexOf(status) < statusFlow.indexOf(order.status);
                  return (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      disabled={isUpdating || isActive}
                      style={{
                        padding: '12px 16px',
                        fontSize: '14px',
                        fontWeight: 500,
                        backgroundColor: isActive
                          ? statusColors[status].bg
                          : isPast
                          ? '#f5f5f5'
                          : '#ffffff',
                        color: isActive ? statusColors[status].text : '#4a4a4a',
                        border: isActive
                          ? `2px solid ${statusColors[status].text}`
                          : '1px solid #e5e5e5',
                        borderRadius: '4px',
                        cursor: isUpdating || isActive ? 'not-allowed' : 'pointer',
                        textAlign: 'left',
                        opacity: isUpdating ? 0.7 : 1,
                      }}
                    >
                      {statusLabels[status]}
                      {isActive && ' (Current)'}
                    </button>
                  );
                })}
                <button
                  onClick={() => handleStatusChange('cancelled')}
                  disabled={isUpdating || order.status === 'cancelled'}
                  style={{
                    padding: '12px 16px',
                    fontSize: '14px',
                    fontWeight: 500,
                    backgroundColor:
                      order.status === 'cancelled' ? statusColors.cancelled.bg : '#ffffff',
                    color:
                      order.status === 'cancelled' ? statusColors.cancelled.text : '#dc2626',
                    border:
                      order.status === 'cancelled'
                        ? `2px solid ${statusColors.cancelled.text}`
                        : '1px solid #fecaca',
                    borderRadius: '4px',
                    cursor:
                      isUpdating || order.status === 'cancelled' ? 'not-allowed' : 'pointer',
                    textAlign: 'left',
                    marginTop: '8px',
                    opacity: isUpdating ? 0.7 : 1,
                  }}
                >
                  Cancel Order
                  {order.status === 'cancelled' && ' (Current)'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
