import { Link } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import { formatPrice } from '../../lib/utils';
import { Plus, Package, ExternalLink, Edit2 } from 'lucide-react';

const placeholderImage = 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=600&h=800&fit=crop';

export default function ProductsList() {
  const { products, loading, error } = useProducts(true);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="h-4 w-20 bg-[#F5F5F5] rounded animate-pulse mb-2" />
            <div className="h-10 w-48 bg-[#F5F5F5] rounded animate-pulse" />
          </div>
          <div className="h-14 w-40 bg-[#F5F5F5] rounded-xl animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-white rounded-2xl border border-[#E5E5E5] overflow-hidden">
              <div className="aspect-[4/3] bg-[#F5F5F5] animate-pulse" />
              <div className="p-6 space-y-3">
                <div className="h-5 bg-[#F5F5F5] rounded w-3/4 animate-pulse" />
                <div className="h-4 bg-[#F5F5F5] rounded w-1/2 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[12px] uppercase tracking-[0.2em] text-[#999999] mb-2">
            Manage
          </p>
          <h1
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            className="text-[36px] font-medium text-[#0A0A0A]"
          >
            Products
          </h1>
          <p className="text-[15px] text-[#666666] mt-2">
            {products.length} {products.length === 1 ? 'product' : 'products'} in your gallery
          </p>
        </div>
        <Link
          to="/admin/products/new"
          className="inline-flex items-center gap-3 px-6 py-4 bg-[#0A0A0A] text-white rounded-xl text-[15px] font-medium hover:bg-[#1a1a1a] transition-colors"
        >
          <Plus className="h-5 w-5" />
          Add Product
        </Link>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 border border-red-200 px-6 py-4 text-[15px] text-red-700">
          {error}
        </div>
      )}

      {products.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E5E5E5] py-20 text-center">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-[#F5F5F5] flex items-center justify-center mb-6">
            <Package className="h-10 w-10 text-[#CCCCCC]" />
          </div>
          <h3
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            className="text-[24px] font-medium text-[#0A0A0A] mb-2"
          >
            No products yet
          </h3>
          <p className="text-[15px] text-[#666666] mb-8">
            Start building your gallery by adding your first product.
          </p>
          <Link
            to="/admin/products/new"
            className="inline-flex items-center gap-3 px-6 py-4 bg-[#FBBE63] text-[#0A0A0A] rounded-xl text-[15px] font-medium hover:bg-[#f0b050] transition-colors"
          >
            <Plus className="h-5 w-5" />
            Create your first product
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl border border-[#E5E5E5] overflow-hidden group hover:border-[#FBBE63]/50 transition-colors"
            >
              {/* Image */}
              <div className="aspect-[4/3] bg-[#F5F5F5] relative overflow-hidden">
                <img
                  src={product.image_url || placeholderImage}
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* Status Badge */}
                <span
                  className={`absolute top-4 left-4 px-3 py-1.5 rounded-full text-[12px] font-medium ${
                    product.status === 'published'
                      ? 'bg-green-100 text-green-700'
                      : product.status === 'sold'
                      ? 'bg-[#FBBE63] text-[#0A0A0A]'
                      : 'bg-white text-[#666666]'
                  }`}
                >
                  {product.status}
                </span>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-[18px] font-medium text-[#0A0A0A] mb-1 truncate">
                  {product.title}
                </h3>
                <p className="text-[13px] text-[#999999] mb-4">
                  /artwork/{product.slug}
                </p>
                <p
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  className="text-[24px] font-medium text-[#0A0A0A] mb-5"
                >
                  {formatPrice(product.price)}
                </p>

                {/* Actions */}
                <div className="flex gap-3">
                  <Link
                    to={`/admin/products/${product.id}/edit`}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-[#0A0A0A] text-white rounded-xl text-[14px] font-medium hover:bg-[#1a1a1a] transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit
                  </Link>
                  <Link
                    to={`/artwork/${product.slug}`}
                    target="_blank"
                    className="inline-flex items-center justify-center px-4 py-3 bg-[#F5F5F5] text-[#666666] rounded-xl text-[14px] font-medium hover:bg-[#E5E5E5] transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
