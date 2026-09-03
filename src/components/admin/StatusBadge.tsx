import type { ProductStatus, OrderStatus } from '../../types';

type StatusType = 'product' | 'order' | 'review';

interface StatusBadgeProps {
  type: StatusType;
  status: ProductStatus | OrderStatus | boolean;
}

const productStatusStyles: Record<ProductStatus, { bg: string; text: string; border: string }> = {
  draft: { bg: '#F5F5F5', text: '#666666', border: '#E5E5E5' },
  published: { bg: '#DCFCE7', text: '#166534', border: '#BBF7D0' },
  sold: { bg: '#FEF3C7', text: '#92400E', border: '#FDE68A' },
};

const orderStatusStyles: Record<OrderStatus, { bg: string; text: string; border: string }> = {
  pending: { bg: '#FEF3C7', text: '#92400E', border: '#FDE68A' },
  confirmed: { bg: '#DBEAFE', text: '#1E40AF', border: '#BFDBFE' },
  shipped: { bg: '#E0E7FF', text: '#3730A3', border: '#C7D2FE' },
  delivered: { bg: '#DCFCE7', text: '#166534', border: '#BBF7D0' },
  cancelled: { bg: '#FEE2E2', text: '#991B1B', border: '#FECACA' },
};

const orderStatusLabels: Record<OrderStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export default function StatusBadge({ type, status }: StatusBadgeProps) {
  let styles: { bg: string; text: string; border: string };
  let label: string;

  if (type === 'product') {
    const s = status as ProductStatus;
    styles = productStatusStyles[s];
    label = s.charAt(0).toUpperCase() + s.slice(1);
  } else if (type === 'order') {
    const s = status as OrderStatus;
    styles = orderStatusStyles[s];
    label = orderStatusLabels[s];
  } else {
    const isApproved = status as boolean;
    styles = isApproved
      ? { bg: '#DCFCE7', text: '#166534', border: '#BBF7D0' }
      : { bg: '#FEF3C7', text: '#92400E', border: '#FDE68A' };
    label = isApproved ? 'Approved' : 'Pending';
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 12px',
        borderRadius: '9999px',
        fontSize: '12px',
        fontWeight: 600,
        backgroundColor: styles.bg,
        color: styles.text,
        border: `1px solid ${styles.border}`,
        lineHeight: '1.5',
      }}
    >
      {label}
    </span>
  );
}
