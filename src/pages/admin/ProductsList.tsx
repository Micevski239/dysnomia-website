import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useProducts, useProductMutations } from '../../hooks/useProducts';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { formatPrice } from '../../lib/utils';
import { AdminCard, DataTable, SearchInput, StatusBadge, EmptyState } from '../../components/admin';
import type { Column } from '../../components/admin';
import type { Product, ProductStatus } from '../../types';
import { Plus, Package, ExternalLink, Edit2, Trash2 } from 'lucide-react';

const statusOptions: { value: ProductStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
  { value: 'sold', label: 'Sold' },
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

const iconBtn: React.CSSProperties = {
  padding: '8px',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  borderRadius: '8px',
  color: '#888888',
  display: 'flex',
  transition: 'all 0.15s',
};

const placeholderImage = 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=600&h=800&fit=crop';

export default function ProductsList() {
  const { products, loading, error, refetch } = useProducts(true);
  const { deleteProduct, updateProduct } = useProductMutations();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProductStatus | 'all'>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const { isMobile } = useBreakpoint();

  const filteredProducts = useMemo(() => {
    let filtered = products;
    if (statusFilter !== 'all') filtered = filtered.filter((p) => p.status === statusFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }
    return filtered;
  }, [products, statusFilter, searchQuery]);

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setActionLoading(true);
    await deleteProduct(productToDelete.id);
    refetch();
    setActionLoading(false);
    setDeleteModalOpen(false);
    setProductToDelete(null);
  };

  const handleBulkStatusChange = async (newStatus: ProductStatus) => {
    if (selectedIds.size === 0) return;
    setActionLoading(true);
    const selected = products.filter((p) => selectedIds.has(p.id));
    for (const product of selected) {
      await updateProduct(product.id, {
        title: product.title, slug: product.slug, description: product.description || '',
        price: product.price.toString(), status: newStatus,
        image: null, image_canvas: null, image_roll: null, image_framed: null,
      }, {
        image_url: product.image_url, image_url_canvas: product.image_url_canvas || null,
        image_url_roll: product.image_url_roll || null, image_url_framed: product.image_url_framed || null,
      });
    }
    refetch();
    setSelectedIds(new Set());
    setActionLoading(false);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Delete ${selectedIds.size} products?`)) return;
    setActionLoading(true);
    for (const id of selectedIds) await deleteProduct(id);
    refetch();
    setSelectedIds(new Set());
    setActionLoading(false);
  };

  const columns: Column<Product>[] = [
    {
      key: 'image',
      header: '',
      width: '72px',
      render: (p) => (
        <div style={{ width: '56px', height: '56px', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#F5F5F5' }}>
          <img src={p.image_url || placeholderImage} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      ),
    },
    {
      key: 'title',
      header: 'Title',
      sortable: true,
      sortKey: 'title',
      render: (p) => (
        <div>
          <p style={{ fontWeight: 600, color: '#1a1a1a', fontSize: '14px' }}>{p.title}</p>
          <p style={{ fontSize: '12px', color: '#AAAAAA', marginTop: '2px' }}>/artwork/{p.slug}</p>
        </div>
      ),
    },
    {
      key: 'price',
      header: 'Price',
      sortable: true,
      sortKey: 'price',
      render: (p) => <span style={{ fontWeight: 600, color: '#1a1a1a', fontSize: '14px' }}>{formatPrice(p.price)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (p) => <StatusBadge type="product" status={p.status} />,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (p) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
          <Link to={`/admin/products/${p.id}/edit`} style={{ ...iconBtn, textDecoration: 'none' }}>
            <Edit2 style={{ width: '16px', height: '16px' }} />
          </Link>
          <Link to={`/artwork/${p.slug}`} target="_blank" style={{ ...iconBtn, textDecoration: 'none' }}>
            <ExternalLink style={{ width: '16px', height: '16px' }} />
          </Link>
          <button onClick={() => handleDeleteClick(p)} style={iconBtn}>
            <Trash2 style={{ width: '16px', height: '16px' }} />
          </button>
        </div>
      ),
    },
  ];

  const bulkBtn = (bg: string, color: string): React.CSSProperties => ({
    padding: '8px 16px', fontSize: '13px', fontWeight: 600, backgroundColor: bg, color,
    border: 'none', borderRadius: '8px', cursor: 'pointer', opacity: actionLoading ? 0.5 : 1,
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '20px' }}>
        <div>
          <p style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#999999', marginBottom: '8px', fontWeight: 600 }}>Manage</p>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '36px', fontWeight: 500, color: '#0A0A0A' }}>Products</h1>
          <p style={{ fontSize: '15px', color: '#888888', marginTop: '8px' }}>
            {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
            {statusFilter !== 'all' ? ` (${statusFilter})` : ''}
          </p>
        </div>
        <Link
          to="/admin/products/new"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '16px 32px',
            backgroundColor: '#0A0A0A', color: '#FFFFFF', borderRadius: '12px',
            fontSize: '15px', fontWeight: 600, textDecoration: 'none',
          }}
        >
          <Plus style={{ width: '18px', height: '18px' }} />
          Add Product
        </Link>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '20px' }}>
        <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search products..." style={{ width: isMobile ? '100%' : 'clamp(200px, 40vw, 320px)' }} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {statusOptions.map((opt) => (
            <button key={opt.value} onClick={() => setStatusFilter(opt.value)} style={filterBtn(statusFilter === opt.value)}>
              {opt.label}
            </button>
          ))}
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
            <button onClick={() => handleBulkStatusChange('published')} disabled={actionLoading} style={bulkBtn('#DCFCE7', '#166534')}>Publish</button>
            <button onClick={() => handleBulkStatusChange('draft')} disabled={actionLoading} style={bulkBtn('#F0F0F0', '#555555')}>Set Draft</button>
            <button onClick={handleBulkDelete} disabled={actionLoading} style={bulkBtn('#FEE2E2', '#991B1B')}>Delete</button>
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
          data={filteredProducts}
          keyExtractor={(p) => p.id}
          loading={loading}
          selectable
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          emptyState={
            <EmptyState
              icon={<Package style={{ width: '32px', height: '32px' }} />}
              title="No products found"
              description={
                searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Start building your gallery by adding your first product'
              }
              actionLabel={!searchQuery && statusFilter === 'all' ? 'Add Product' : undefined}
              actionTo={!searchQuery && statusFilter === 'all' ? '/admin/products/new' : undefined}
            />
          }
        />
      </AdminCard>

      {/* Delete Modal */}
      {deleteModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setDeleteModalOpen(false)} />
          <div style={{ position: 'relative', backgroundColor: '#FFF', borderRadius: '20px', padding: '36px', maxWidth: '440px', width: '100%', margin: '0 16px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#0A0A0A', marginBottom: '16px' }}>Delete Product</h3>
            <p style={{ color: '#888888', fontSize: '15px', marginBottom: '32px', lineHeight: 1.6 }}>
              Are you sure you want to delete "{productToDelete?.title}"? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setDeleteModalOpen(false)}
                style={{ flex: 1, padding: '14px', border: '1px solid #E5E5E5', backgroundColor: '#FFF', color: '#888888', borderRadius: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
              >Cancel</button>
              <button
                onClick={handleConfirmDelete}
                disabled={actionLoading}
                style={{ flex: 1, padding: '14px', border: 'none', backgroundColor: '#DC2626', color: '#FFF', borderRadius: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', opacity: actionLoading ? 0.5 : 1 }}
              >{actionLoading ? 'Deleting...' : 'Delete'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
