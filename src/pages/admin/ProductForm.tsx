import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProductById, useProductMutations } from '../../hooks/useProducts';
import { useCollections } from '../../hooks/useCollections';
import { supabase } from '../../lib/supabase';
import { generateSlug } from '../../lib/utils';
import type { ProductFormData, ProductStatus } from '../../types';
import { ArrowLeft, Upload, Package } from 'lucide-react';

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'sold', label: 'Sold' },
];

export default function ProductForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const { product, loading: productLoading } = useProductById(id);
  const { createProduct, updateProduct, loading, error } = useProductMutations();
  const { collections } = useCollections(true);

  const [formData, setFormData] = useState<ProductFormData>({
    title: '',
    slug: '',
    description: '',
    price: '',
    status: 'draft',
    image: null,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>('');

  useEffect(() => {
    if (product && isEditing) {
      setFormData({
        title: product.title,
        slug: product.slug,
        description: product.description || '',
        price: product.price.toString(),
        status: product.status,
        image: null,
      });
      setImagePreview(product.image_url);
      setSlugManuallyEdited(true);
    }
  }, [product, isEditing]);

  useEffect(() => {
    if (!isEditing || !id) return;
    let isMounted = true;

    async function loadLinkedCollection() {
      const { data, error: linkError } = await supabase
        .from('collection_products')
        .select('collection_id')
        .eq('product_id', id)
        .limit(1)
        .maybeSingle();

      if (!isMounted) return;
      if (linkError) {
        console.warn('Failed to load product collection link', linkError);
        return;
      }
      setSelectedCollectionId(data?.collection_id ?? '');
    }

    loadLinkedCollection();

    return () => {
      isMounted = false;
    };
  }, [id, isEditing]);

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title,
      slug: slugManuallyEdited ? prev.slug : generateSlug(title),
    }));
  };

  const handleSlugChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSlugManuallyEdited(true);
    setFormData((prev) => ({
      ...prev,
      slug: generateSlug(e.target.value),
    }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    let result;
    if (isEditing && id) {
      result = await updateProduct(id, formData, product?.image_url || null);
      if (!result.error) {
        await syncCollectionLink(id);
        navigate('/admin/products');
      }
      return;
    }

    result = await createProduct(formData);
    if (!result.error && result.data?.id) {
      await syncCollectionLink(result.data.id);
      navigate('/admin/products');
    }
  };

  const syncCollectionLink = async (productId: string) => {
    await supabase.from('collection_products').delete().eq('product_id', productId);
    if (selectedCollectionId) {
      await supabase.from('collection_products').insert({
        collection_id: selectedCollectionId,
        product_id: productId,
      });
    }
  };

  if (productLoading && isEditing) {
    return (
      <div className="max-w-3xl">
        <div className="space-y-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-white rounded-xl animate-pulse border border-[#E5E5E5]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      {/* Back Link */}
      <Link
        to="/admin/products"
        className="inline-flex items-center gap-2 text-[14px] text-[#666666] hover:text-[#0A0A0A] transition-colors mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Products
      </Link>

      {/* Header */}
      <div className="mb-8">
        <p className="text-[12px] uppercase tracking-[0.2em] text-[#999999] mb-2">
          {isEditing ? 'Edit' : 'Create'}
        </p>
        <h1
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          className="text-[36px] font-medium text-[#0A0A0A]"
        >
          {isEditing ? 'Edit Product' : 'New Product'}
        </h1>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 border border-red-200 px-6 py-4 text-[15px] text-red-700 mb-8">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Image Upload */}
        <div className="bg-white rounded-2xl border border-[#E5E5E5] p-8">
          <label className="block text-[14px] font-medium text-[#0A0A0A] mb-4">
            Product Image
          </label>
          <div className="flex items-start gap-6">
            <div className="w-40 h-40 rounded-xl bg-[#F5F5F5] overflow-hidden flex-shrink-0">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="h-10 w-10 text-[#CCCCCC]" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <label className="cursor-pointer">
                <div className="inline-flex items-center gap-3 px-6 py-4 bg-[#F5F5F5] text-[#0A0A0A] rounded-xl text-[15px] font-medium hover:bg-[#E5E5E5] transition-colors">
                  <Upload className="h-5 w-5" />
                  {imagePreview ? 'Change Image' : 'Upload Image'}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              <p className="text-[13px] text-[#999999] mt-3">
                Recommended: 800x1000px or larger, JPG or PNG
              </p>
            </div>
          </div>
        </div>

        {/* Basic Info */}
        <div className="bg-white rounded-2xl border border-[#E5E5E5] p-8 space-y-6">
          <h2 className="text-[18px] font-medium text-[#0A0A0A] mb-2">Basic Information</h2>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-[14px] font-medium text-[#0A0A0A] mb-2">
              Title
            </label>
            <input
              id="title"
              type="text"
              placeholder="Enter product title"
              value={formData.title}
              onChange={handleTitleChange}
              required
              className="w-full px-5 py-4 rounded-xl border border-[#E5E5E5] text-[16px] text-[#0A0A0A] placeholder:text-[#999999] focus:outline-none focus:border-[#FBBE63] transition-colors"
            />
          </div>

          {/* Slug */}
          <div>
            <label htmlFor="slug" className="block text-[14px] font-medium text-[#0A0A0A] mb-2">
              URL Slug
            </label>
            <input
              id="slug"
              type="text"
              placeholder="product-slug"
              value={formData.slug}
              onChange={handleSlugChange}
              required
              className="w-full px-5 py-4 rounded-xl border border-[#E5E5E5] text-[16px] text-[#0A0A0A] placeholder:text-[#999999] focus:outline-none focus:border-[#FBBE63] transition-colors"
            />
            <p className="text-[13px] text-[#999999] mt-2">
              URL: /artwork/{formData.slug || 'your-slug'}
            </p>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-[14px] font-medium text-[#0A0A0A] mb-2">
              Description
            </label>
            <textarea
              id="description"
              placeholder="Describe the artwork..."
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              rows={5}
              className="w-full px-5 py-4 rounded-xl border border-[#E5E5E5] text-[16px] text-[#0A0A0A] placeholder:text-[#999999] focus:outline-none focus:border-[#FBBE63] transition-colors resize-none"
            />
          </div>
        </div>

        {/* Pricing & Status */}
        <div className="bg-white rounded-2xl border border-[#E5E5E5] p-8 space-y-6">
          <h2 className="text-[18px] font-medium text-[#0A0A0A] mb-2">Pricing & Status</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Price */}
            <div>
              <label htmlFor="price" className="block text-[14px] font-medium text-[#0A0A0A] mb-2">
                Price (USD)
              </label>
              <input
                id="price"
                type="number"
                placeholder="0.00"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                required
                className="w-full px-5 py-4 rounded-xl border border-[#E5E5E5] text-[16px] text-[#0A0A0A] placeholder:text-[#999999] focus:outline-none focus:border-[#FBBE63] transition-colors"
              />
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-[14px] font-medium text-[#0A0A0A] mb-2">
                Status
              </label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value as ProductStatus }))}
                className="w-full px-5 py-4 rounded-xl border border-[#E5E5E5] text-[16px] text-[#0A0A0A] focus:outline-none focus:border-[#FBBE63] transition-colors appearance-none bg-white"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Collection */}
          <div>
            <label htmlFor="collection" className="block text-[14px] font-medium text-[#0A0A0A] mb-2">
              Collection
            </label>
            <select
              id="collection"
              value={selectedCollectionId}
              onChange={(e) => setSelectedCollectionId(e.target.value)}
              className="w-full px-5 py-4 rounded-xl border border-[#E5E5E5] text-[16px] text-[#0A0A0A] focus:outline-none focus:border-[#FBBE63] transition-colors appearance-none bg-white"
            >
              <option value="">No collection</option>
              {collections.map((collection) => (
                <option key={collection.id} value={collection.id}>
                  {collection.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-3 px-8 py-4 bg-[#0A0A0A] text-white rounded-xl text-[15px] font-medium hover:bg-[#1a1a1a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? isEditing
                ? 'Updating...'
                : 'Creating...'
              : isEditing
              ? 'Update Product'
              : 'Create Product'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="inline-flex items-center gap-3 px-8 py-4 bg-white text-[#666666] rounded-xl text-[15px] font-medium border border-[#E5E5E5] hover:bg-[#F5F5F5] transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
