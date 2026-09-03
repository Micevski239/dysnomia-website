import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useOrdersList } from '../../hooks/useOrders';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { AdminCard, DataTable, SearchInput, StatusBadge, EmptyState } from '../../components/admin';
import type { Column } from '../../components/admin';
import type { Order, OrderStatus } from '../../types';
import { ClipboardList, Eye } from 'lucide-react';

const statusOptions: { value: OrderStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

const filterBtn = (active: boolean): React.CSSProperties => ({
  padding: '10px 20px',
  fontSize: '13px',
  fontWeight: 600,
  borderRadius: '8px',
  border: 'none',
  cursor: 'pointer',
  backgroundColor: active ? '#1a1a1a' : '#F0F0F0',
  color: active ? '#FFFFFF' : '#555555',
  transition: 'all 0.15s',
});

export default function OrdersList() {
  const [statusFilter, setStatusFilter] = useState<OrderStatus | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const { orders, loading, error } = useOrdersList(statusFilter);
  const { isMobile } = useBreakpoint();

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });

  const formatPrice = (amount: number) => `${amount.toLocaleString()} MKD`;

  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders;
    const q = searchQuery.toLowerCase();
    return orders.filter(
      (o) =>
        o.order_number.toLowerCase().includes(q) ||
        o.customer_name.toLowerCase().includes(q) ||
        o.customer_email.toLowerCase().includes(q)
    );
  }, [orders, searchQuery]);

  const columns: Column<Order>[] = [
    {
      key: 'order',
      header: 'Order',
      sortable: true,
      sortKey: 'order_number',
      render: (o) => (
        <div>
          <p style={{ fontWeight: 600, color: '#1a1a1a', fontSize: '14px' }}>{o.order_number}</p>
          <p style={{ fontSize: '12px', color: '#888888', marginTop: '2px' }}>
            {o.items.length} {o.items.length === 1 ? 'item' : 'items'}
          </p>
        </div>
      ),
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (o) => (
        <div>
          <p style={{ color: '#1a1a1a', fontSize: '14px' }}>{o.customer_name}</p>
          <p style={{ fontSize: '12px', color: '#888888', marginTop: '2px' }}>{o.customer_email}</p>
        </div>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      sortable: true,
      sortKey: 'created_at',
      render: (o) => <span style={{ fontSize: '14px', color: '#888888' }}>{formatDate(o.created_at)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (o) => <StatusBadge type="order" status={o.status} />,
    },
    {
      key: 'total',
      header: 'Total',
      align: 'right',
      sortable: true,
      sortKey: 'total_amount',
      render: (o) => <span style={{ fontWeight: 600, color: '#1a1a1a', fontSize: '14px' }}>{formatPrice(o.total_amount)}</span>,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (o) => (
        <Link
          to={`/admin/orders/${o.id}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            backgroundColor: '#F5F5F5',
            color: '#1a1a1a',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
            textDecoration: 'none',
            border: '1px solid #E5E5E5',
          }}
        >
          <Eye style={{ width: '14px', height: '14px' }} />
          View
        </Link>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
      {/* Header */}
      <div>
        <p style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#999999', marginBottom: '8px', fontWeight: 600 }}>
          Manage
        </p>
        <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '36px', fontWeight: 500, color: '#0A0A0A' }}>
          Orders
        </h1>
        <p style={{ fontSize: '15px', color: '#888888', marginTop: '8px' }}>
          {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'}
          {statusFilter ? ` (${statusFilter})` : ''}
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '20px' }}>
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search orders, customers..."
          style={{ width: isMobile ? '100%' : 'clamp(200px, 40vw, 320px)' }}
        />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value === 'all' ? undefined : opt.value)}
              style={filterBtn((opt.value === 'all' && !statusFilter) || statusFilter === opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '12px', padding: '16px', color: '#DC2626', fontSize: '14px' }}>
          {error}
        </div>
      )}

      <AdminCard noPadding>
        <DataTable
          columns={columns}
          data={filteredOrders}
          keyExtractor={(o) => o.id}
          loading={loading}
          emptyState={
            <EmptyState
              icon={<ClipboardList style={{ width: '32px', height: '32px' }} />}
              title="No orders found"
              description={
                searchQuery
                  ? 'Try adjusting your search or filters'
                  : statusFilter
                  ? `No ${statusFilter} orders yet`
                  : 'Orders will appear here when customers make purchases'
              }
            />
          }
        />
      </AdminCard>
    </div>
  );
}
