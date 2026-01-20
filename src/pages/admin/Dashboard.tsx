import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProducts, useProductMutations } from '../../hooks/useProducts';
import { useCollections } from '../../hooks/useCollections';
import { formatPrice } from '../../lib/utils';
import type { Product, ProductStatus } from '../../types';

export default function Dashboard() {
  const { products, loading, error, refetch } = useProducts(true);
  const { collections } = useCollections(true);
  const { updateProduct, deleteProduct } = useProductMutations();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;

    setActionLoading(true);
    const { error } = await deleteProduct(productToDelete.id);

    if (!error) {
      refetch();
    }

    setActionLoading(false);
    setDeleteModalOpen(false);
    setProductToDelete(null);
  };

  const handleStatusChange = async (product: Product, newStatus: ProductStatus) => {
    setActionLoading(true);
    await updateProduct(product.id, {
      title: product.title,
      slug: product.slug,
      description: product.description || '',
      price: product.price.toString(),
      status: newStatus,
      image: null,
    }, product.image_url);
    refetch();
    setActionLoading(false);
  };

  // Stats
  const totalProducts = products.length;
  const publishedProducts = products.filter((p) => p.status === 'published').length;
  const totalCollections = collections.length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1
            className="text-3xl font-medium text-[#0A0A0A]"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Dashboard
          </h1>
          <p className="text-[15px] text-[#666666] mt-1">
            Welcome to your gallery admin panel
          </p>
        </div>
        <Link
          to="/admin/products/new"
          className="inline-flex items-center gap-2 px-5 py-3 bg-[#0A0A0A] text-white rounded-xl text-[14px] font-medium hover:bg-[#1a1a1a] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Product
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="bg-white rounded-2xl border border-[#E5E5E5] p-6">
          <p className="text-[13px] text-[#999999] uppercase tracking-wide">Total Products</p>
          <p className="text-3xl font-semibold text-[#0A0A0A] mt-2">{totalProducts}</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#E5E5E5] p-6">
          <p className="text-[13px] text-[#999999] uppercase tracking-wide">Published</p>
          <p className="text-3xl font-semibold text-[#0A0A0A] mt-2">{publishedProducts}</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#E5E5E5] p-6">
          <p className="text-[13px] text-[#999999] uppercase tracking-wide">Collections</p>
          <p className="text-3xl font-semibold text-[#0A0A0A] mt-2">{totalCollections}</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl mb-6 text-[14px]">
          {error}
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-[#E5E5E5] overflow-hidden">
        <div className="px-6 py-5 border-b border-[#E5E5E5]">
          <h2 className="text-lg font-medium text-[#0A0A0A]">Recent Products</h2>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0A0A0A] mx-auto"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-[#666666]">
            <p className="mb-4">No products yet. Add your first product!</p>
            <Link
              to="/admin/products/new"
              className="inline-flex items-center gap-2 px-5 py-3 bg-[#FBBE63] text-[#0A0A0A] rounded-xl text-[14px] font-medium hover:bg-[#f0b050] transition-colors"
            >
              Add Product
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#FAFAFA]">
                <tr>
                  <th className="px-6 py-4 text-left text-[12px] font-medium text-[#999999] uppercase tracking-wider">
                    Image
                  </th>
                  <th className="px-6 py-4 text-left text-[12px] font-medium text-[#999999] uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-4 text-left text-[12px] font-medium text-[#999999] uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-4 text-left text-[12px] font-medium text-[#999999] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-[12px] font-medium text-[#999999] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                {products.slice(0, 10).map((product) => (
                  <tr key={product.id} className="hover:bg-[#FAFAFA]/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="w-14 h-14 bg-[#F5F5F5] rounded-xl overflow-hidden">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#CCCCCC]">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-[#0A0A0A] text-[15px]">{product.title}</p>
                      <p className="text-[13px] text-[#999999]">/artwork/{product.slug}</p>
                    </td>
                    <td className="px-6 py-4 text-[#0A0A0A] font-medium text-[15px]">
                      {formatPrice(product.price)}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={product.status}
                        onChange={(e) => handleStatusChange(product, e.target.value as ProductStatus)}
                        disabled={actionLoading}
                        className="text-[13px] border border-[#E5E5E5] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#FBBE63] focus:border-transparent bg-white"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="sold">Sold</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          to={`/admin/products/${product.id}/edit`}
                          className="text-[#666666] hover:text-[#FBBE63] transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(product)}
                          className="text-[#666666] hover:text-red-500 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {products.length > 10 && (
          <div className="px-6 py-4 border-t border-[#E5E5E5] text-center">
            <Link
              to="/admin/products"
              className="text-[14px] text-[#666666] hover:text-[#FBBE63] transition-colors"
            >
              View all {products.length} products →
            </Link>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setDeleteModalOpen(false)}
          />
          <div className="relative bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-xl font-medium text-[#0A0A0A] mb-4">Delete Product</h3>
            <p className="text-[#666666] mb-8">
              Are you sure you want to delete "{productToDelete?.title}"? This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="flex-1 px-5 py-3 border border-[#E5E5E5] text-[#666666] rounded-xl text-[14px] font-medium hover:bg-[#F5F5F5] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={actionLoading}
                className="flex-1 px-5 py-3 bg-red-500 text-white rounded-xl text-[14px] font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {actionLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
