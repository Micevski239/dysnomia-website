import { useState, useMemo } from 'react';
import { useAllReviews } from '../../hooks/useReviews';
import { AdminCard, DataTable, SearchInput, StatusBadge, EmptyState } from '../../components/admin';
import type { Column } from '../../components/admin';
import StarRating from '../../components/shop/StarRating';
import { MessageSquare, Check, Trash2 } from 'lucide-react';
import type { Review } from '../../types';

type ReviewWithProduct = Review & { product_title?: string };

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

export default function ReviewsList() {
  const [showPendingOnly, setShowPendingOnly] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all');
  const { reviews, loading, error, approveReview, deleteReview } = useAllReviews(showPendingOnly);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });

  const filteredReviews = useMemo(() => {
    let filtered = reviews;
    if (ratingFilter !== 'all') filtered = filtered.filter((r) => r.rating === ratingFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.customer_name.toLowerCase().includes(q) ||
          r.customer_email.toLowerCase().includes(q) ||
          (r.product_title && r.product_title.toLowerCase().includes(q)) ||
          (r.title && r.title.toLowerCase().includes(q)) ||
          (r.content && r.content.toLowerCase().includes(q))
      );
    }
    return filtered;
  }, [reviews, ratingFilter, searchQuery]);

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    await approveReview(id);
    setActionLoading(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this review?')) return;
    setActionLoading(id);
    await deleteReview(id);
    setActionLoading(null);
  };

  const handleBulkApprove = async () => {
    if (selectedIds.size === 0) return;
    setBulkLoading(true);
    for (const id of selectedIds) await approveReview(id);
    setSelectedIds(new Set());
    setBulkLoading(false);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Delete ${selectedIds.size} reviews?`)) return;
    setBulkLoading(true);
    for (const id of selectedIds) await deleteReview(id);
    setSelectedIds(new Set());
    setBulkLoading(false);
  };

  const columns: Column<ReviewWithProduct>[] = [
    {
      key: 'product',
      header: 'Product',
      render: (r) => (
        <div>
          <p style={{ fontWeight: 600, color: '#B8860B', fontSize: '14px' }}>{r.product_title}</p>
          <StarRating rating={r.rating} size={14} />
        </div>
      ),
    },
    {
      key: 'review',
      header: 'Review',
      render: (r) => (
        <div style={{ maxWidth: '360px' }}>
          {r.title && <p style={{ fontWeight: 600, color: '#1a1a1a', fontSize: '14px', marginBottom: '4px' }}>{r.title}</p>}
          {r.content && (
            <p style={{ fontSize: '13px', color: '#888888', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any }}>
              {r.content}
            </p>
          )}
          {!r.title && !r.content && <p style={{ fontSize: '13px', color: '#BBBBBB', fontStyle: 'italic' }}>No content</p>}
        </div>
      ),
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (r) => (
        <div>
          <p style={{ color: '#1a1a1a', fontSize: '14px' }}>{r.customer_name}</p>
          <p style={{ fontSize: '12px', color: '#888888', marginTop: '2px' }}>{r.customer_email}</p>
        </div>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      sortable: true,
      sortKey: 'created_at',
      render: (r) => <span style={{ fontSize: '14px', color: '#888888' }}>{formatDate(r.created_at)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => <StatusBadge type="review" status={r.is_approved} />,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (r) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
          {!r.is_approved && (
            <button
              onClick={() => handleApprove(r.id)}
              disabled={actionLoading === r.id}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '8px 14px',
                backgroundColor: '#DCFCE7', color: '#166534', border: '1px solid #BBF7D0',
                borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                opacity: actionLoading === r.id ? 0.5 : 1,
              }}
            >
              <Check style={{ width: '14px', height: '14px' }} /> Approve
            </button>
          )}
          <button
            onClick={() => handleDelete(r.id)}
            disabled={actionLoading === r.id}
            style={{
              padding: '8px', background: 'none', border: 'none', cursor: 'pointer',
              borderRadius: '8px', color: '#888888', display: 'flex',
              opacity: actionLoading === r.id ? 0.5 : 1,
            }}
          >
            <Trash2 style={{ width: '16px', height: '16px' }} />
          </button>
        </div>
      ),
    },
  ];

  const bulkBtn = (bg: string, color: string): React.CSSProperties => ({
    padding: '8px 16px', fontSize: '13px', fontWeight: 600, backgroundColor: bg, color,
    border: 'none', borderRadius: '8px', cursor: 'pointer', opacity: bulkLoading ? 0.5 : 1,
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
      {/* Header */}
      <div>
        <p style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#999999', marginBottom: '8px', fontWeight: 600 }}>Moderate</p>
        <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '36px', fontWeight: 500, color: '#0A0A0A' }}>Reviews</h1>
        <p style={{ fontSize: '15px', color: '#888888', marginTop: '8px' }}>
          {filteredReviews.length} {filteredReviews.length === 1 ? 'review' : 'reviews'}
          {showPendingOnly ? ' (pending)' : ''}
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '20px' }}>
        <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search reviews..." style={{ width: '320px' }} />
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setShowPendingOnly(true)} style={filterBtn(showPendingOnly)}>Pending</button>
          <button onClick={() => setShowPendingOnly(false)} style={filterBtn(!showPendingOnly)}>All</button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', color: '#888888' }}>Rating:</span>
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            style={{
              padding: '8px 12px', fontSize: '13px', border: '2px solid #E5E5E5', borderRadius: '8px',
              outline: 'none', backgroundColor: '#FFF', color: '#1a1a1a',
            }}
          >
            <option value="all">All</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '20px', padding: '20px 24px',
          backgroundColor: 'rgba(184,134,11,0.08)', border: '1px solid rgba(184,134,11,0.2)', borderRadius: '12px',
        }}>
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#B8860B' }}>{selectedIds.size} selected</span>
          <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
            {showPendingOnly && (
              <button onClick={handleBulkApprove} disabled={bulkLoading} style={bulkBtn('#DCFCE7', '#166534')}>Approve Selected</button>
            )}
            <button onClick={handleBulkDelete} disabled={bulkLoading} style={bulkBtn('#FEE2E2', '#991B1B')}>Delete Selected</button>
            <button onClick={() => setSelectedIds(new Set())} style={{ ...bulkBtn('transparent', '#888888'), textDecoration: 'underline' }}>Clear</button>
          </div>
        </div>
      )}

      {error && (
        <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '12px', padding: '16px', color: '#DC2626', fontSize: '14px' }}>
          {error}
        </div>
      )}

      <AdminCard noPadding>
        <DataTable
          columns={columns}
          data={filteredReviews}
          keyExtractor={(r) => r.id}
          loading={loading}
          selectable
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          emptyState={
            <EmptyState
              icon={<MessageSquare style={{ width: '32px', height: '32px' }} />}
              title={showPendingOnly ? 'No pending reviews' : 'No reviews found'}
              description={
                searchQuery || ratingFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : showPendingOnly
                  ? 'All reviews have been moderated'
                  : 'Reviews will appear here when customers leave feedback'
              }
            />
          }
        />
      </AdminCard>
    </div>
  );
}
