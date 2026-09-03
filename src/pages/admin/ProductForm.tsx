import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProductById, useProductMutations } from '../../hooks/useProducts';
import { useCollections } from '../../hooks/useCollections';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { supabase } from '../../lib/supabase';
import { generateSlug } from '../../lib/utils';
import { validateProduct, type ProductFormErrors } from '../../lib/validation';
import type { ProductFormData, ProductStatus } from '../../types';
import { ArrowLeft, Upload, Package } from 'lucide-react';

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'sold', label: 'Sold' },
];

const imageTypes = [
  { key: 'image_canvas', label: 'Canvas Print', dbField: 'image_url_canvas' },
  { key: 'image_roll', label: 'Roll Print', dbField: 'image_url_roll' },
  { key: 'image_framed', label: 'Framed Print', dbField: 'image_url_framed' },
] as const;

const cardStyle: React.CSSProperties = {
  backgroundColor: '#FFFFFF',
  borderRadius: '16px',
  border: '1px solid #E8E8E8',
  boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)',
  padding: '32px',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '14px',
  fontWeight: 600,
  color: '#0A0A0A',
  marginBottom: '10px',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '14px 18px',
  borderRadius: '12px',
  border: '2px solid #E5E5E5',
  fontSize: '15px',
  color: '#0A0A0A',
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  backgroundColor: '#FFFFFF',
};

const hintStyle: React.CSSProperties = {
  fontSize: '13px',
  color: '#999999',
  marginTop: '8px',
};

const errorTextStyle: React.CSSProperties = {
  fontSize: '13px',
  color: '#DC2626',
  marginTop: '8px',
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: 600,
  color: '#0A0A0A',
  marginBottom: '8px',
};

export default function ProductForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const { isMobile } = useBreakpoint();

  const { product, loading: productLoading } = useProductById(id);
  const { createProduct, updateProduct, loading, error } = useProductMutations();
  const { collections } = useCollections(true);

  const [formData, setFormData] = useState<ProductFormData>({
    title: '',
    title_mk: '',
    slug: '',
    description: '',
    description_mk: '',
    price: '',
    status: 'draft',
    image: null,
    image_canvas: null,
    image_roll: null,
    image_framed: null,
    product_code: '',
    details: '',
    details_mk: '',
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imagePreviews, setImagePreviews] = useState<{
    image_canvas: string | null;
    image_roll: string | null;
    image_framed: string | null;
  }>({
    image_canvas: null,
    image_roll: null,
    image_framed: null,
  });
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<ProductFormErrors>({});

  useEffect(() => {
    if (product && isEditing) {
      setFormData({
        title: product.title,
        title_mk: (product as any).title_mk || '',
        slug: product.slug,
        description: product.description || '',
        description_mk: (product as any).description_mk || '',
        price: product.price.toString(),
        status: product.status,
        image: null,
        image_canvas: null,
        image_roll: null,
        image_framed: null,
        product_code: product.product_code || '',
        details: product.details || '',
        details_mk: (product as any).details_mk || '',
      });
      setImagePreview(product.image_url);
      setImagePreviews({
        image_canvas: product.image_url_canvas || null,
        image_roll: product.image_url_roll || null,
        image_framed: product.image_url_framed || null,
      });
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

  const handleCategoryImageChange = (
    e: ChangeEvent<HTMLInputElement>,
    imageKey: 'image_canvas' | 'image_roll' | 'image_framed'
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, [imageKey]: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => ({ ...prev, [imageKey]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    const validationResult = validateProduct({
      title: formData.title,
      slug: formData.slug,
      description: formData.description,
      price: formData.price,
      status: formData.status,
      product_code: formData.product_code,
      details: formData.details,
    });

    if (!validationResult.success) {
      setFieldErrors(validationResult.errors);
      return;
    }

    const currentImages = product
      ? {
          image_url: product.image_url || null,
          image_url_canvas: product.image_url_canvas || null,
          image_url_roll: product.image_url_roll || null,
          image_url_framed: product.image_url_framed || null,
        }
      : {
          image_url: null,
          image_url_canvas: null,
          image_url_roll: null,
          image_url_framed: null,
        };

    let result;
    if (isEditing && id) {
      result = await updateProduct(id, formData, currentImages);
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
      <div style={{ maxWidth: '780px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              style={{
                height: '64px',
                backgroundColor: '#F5F5F5',
                borderRadius: '12px',
              }}
              className="animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '780px' }}>
      {/* Back Link */}
      <Link
        to="/admin/products"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px',
          color: '#666666',
          textDecoration: 'none',
          marginBottom: '32px',
        }}
      >
        <ArrowLeft style={{ width: '16px', height: '16px' }} />
        Back to Products
      </Link>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <p style={{
          fontSize: '12px',
          textTransform: 'uppercase',
          letterSpacing: '0.2em',
          color: '#999999',
          marginBottom: '8px',
          fontWeight: 600,
        }}>
          {isEditing ? 'Edit' : 'Create'}
        </p>
        <h1 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: '36px',
          fontWeight: 500,
          color: '#0A0A0A',
        }}>
          {isEditing ? 'Edit Product' : 'New Product'}
        </h1>
      </div>

      {error && (
        <div style={{
          backgroundColor: '#FEF2F2',
          border: '1px solid #FECACA',
          borderRadius: '12px',
          padding: '16px 20px',
          color: '#DC2626',
          fontSize: '14px',
          marginBottom: '32px',
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {/* Main Image Upload */}
        <div style={cardStyle}>
          <p style={labelStyle}>Main Product Image</p>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px' }}>
            <div style={{
              width: '160px',
              height: '160px',
              borderRadius: '12px',
              backgroundColor: '#F5F5F5',
              overflow: 'hidden',
              flexShrink: 0,
              border: '2px solid #E5E5E5',
            }}>
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Package style={{ width: '40px', height: '40px', color: '#CCCCCC' }} />
                </div>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ cursor: 'pointer' }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '14px 24px',
                  backgroundColor: '#F5F5F5',
                  border: '2px solid #E5E5E5',
                  borderRadius: '12px',
                  color: '#0A0A0A',
                  fontSize: '15px',
                  fontWeight: 600,
                }}>
                  <Upload style={{ width: '18px', height: '18px' }} />
                  {imagePreview ? 'Change Image' : 'Upload Image'}
                </span>
                <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
              </label>
              <p style={{ ...hintStyle, marginTop: '12px' }}>
                Default image shown in listings. 800x1000px or larger, JPG or PNG
              </p>
            </div>
          </div>
        </div>

        {/* Category Images */}
        <div style={cardStyle}>
          <p style={sectionTitleStyle}>Category Images</p>
          <p style={{ ...hintStyle, marginBottom: '24px', marginTop: '0' }}>
            Upload separate images for each print type. These will be shown when customers select different options.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '24px' }}>
            {imageTypes.map((imgType) => {
              const preview = imagePreviews[imgType.key];
              return (
                <div key={imgType.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{
                    width: '100%',
                    aspectRatio: '1',
                    borderRadius: '12px',
                    backgroundColor: '#F5F5F5',
                    overflow: 'hidden',
                    marginBottom: '12px',
                    border: '2px solid #E5E5E5',
                  }}>
                    {preview ? (
                      <img src={preview} alt={imgType.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Package style={{ width: '32px', height: '32px', color: '#CCCCCC' }} />
                      </div>
                    )}
                  </div>
                  <label style={{ cursor: 'pointer', width: '100%' }}>
                    <span style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '10px 16px',
                      backgroundColor: '#F5F5F5',
                      border: '2px solid #E5E5E5',
                      borderRadius: '10px',
                      color: '#0A0A0A',
                      fontSize: '13px',
                      fontWeight: 600,
                    }}>
                      <Upload style={{ width: '14px', height: '14px' }} />
                      {preview ? 'Change' : 'Upload'}
                    </span>
                    <input type="file" accept="image/*" onChange={(e) => handleCategoryImageChange(e, imgType.key)} style={{ display: 'none' }} />
                  </label>
                  <p style={{ fontSize: '12px', color: '#666666', marginTop: '8px', textAlign: 'center' }}>{imgType.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Basic Info */}
        <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <p style={sectionTitleStyle}>Basic Information</p>

          {/* Title */}
          <div>
            <label htmlFor="title" style={labelStyle}>Title</label>
            <input
              id="title"
              type="text"
              placeholder="Enter product title"
              value={formData.title}
              onChange={handleTitleChange}
              required
              style={{
                ...inputStyle,
                borderColor: fieldErrors.title ? '#DC2626' : '#E5E5E5',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#B8860B'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(184,134,11,0.1)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = fieldErrors.title ? '#DC2626' : '#E5E5E5'; e.currentTarget.style.boxShadow = 'none'; }}
            />
            {fieldErrors.title && <p style={errorTextStyle}>{fieldErrors.title}</p>}
          </div>

          {/* Title MK */}
          <div>
            <label htmlFor="title_mk" style={labelStyle}>Title (Macedonian)</label>
            <input
              id="title_mk"
              type="text"
              placeholder="Наслов на производот"
              value={formData.title_mk || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, title_mk: e.target.value }))}
              style={inputStyle}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#B8860B'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(184,134,11,0.1)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#E5E5E5'; e.currentTarget.style.boxShadow = 'none'; }}
            />
          </div>

          {/* Slug */}
          <div>
            <label htmlFor="slug" style={labelStyle}>URL Slug</label>
            <input
              id="slug"
              type="text"
              placeholder="product-slug"
              value={formData.slug}
              onChange={handleSlugChange}
              required
              style={{
                ...inputStyle,
                borderColor: fieldErrors.slug ? '#DC2626' : '#E5E5E5',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#B8860B'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(184,134,11,0.1)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = fieldErrors.slug ? '#DC2626' : '#E5E5E5'; e.currentTarget.style.boxShadow = 'none'; }}
            />
            {fieldErrors.slug ? (
              <p style={errorTextStyle}>{fieldErrors.slug}</p>
            ) : (
              <p style={hintStyle}>URL: /artwork/{formData.slug || 'your-slug'}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" style={labelStyle}>Description</label>
            <textarea
              id="description"
              placeholder="Describe the artwork..."
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              rows={5}
              style={{
                ...inputStyle,
                minHeight: '140px',
                resize: 'vertical' as const,
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#B8860B'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(184,134,11,0.1)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#E5E5E5'; e.currentTarget.style.boxShadow = 'none'; }}
            />
          </div>

          {/* Description MK */}
          <div>
            <label htmlFor="description_mk" style={labelStyle}>Description (Macedonian)</label>
            <textarea
              id="description_mk"
              placeholder="Опис на делото..."
              value={formData.description_mk || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, description_mk: e.target.value }))}
              rows={5}
              style={{
                ...inputStyle,
                minHeight: '140px',
                resize: 'vertical' as const,
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#B8860B'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(184,134,11,0.1)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#E5E5E5'; e.currentTarget.style.boxShadow = 'none'; }}
            />
          </div>

          {/* Product Code */}
          <div>
            <label htmlFor="product_code" style={labelStyle}>Product Code</label>
            <input
              id="product_code"
              type="text"
              placeholder="e.g., 4322"
              value={formData.product_code || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, product_code: e.target.value }))}
              style={inputStyle}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#B8860B'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(184,134,11,0.1)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#E5E5E5'; e.currentTarget.style.boxShadow = 'none'; }}
            />
            <p style={hintStyle}>Custom product identifier displayed on the product page</p>
          </div>

          {/* Details */}
          <div>
            <label htmlFor="details" style={labelStyle}>Details</label>
            <textarea
              id="details"
              placeholder="Additional product details (materials, dimensions, care instructions...)"
              value={formData.details || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, details: e.target.value }))}
              rows={4}
              style={{
                ...inputStyle,
                minHeight: '120px',
                resize: 'vertical' as const,
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#B8860B'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(184,134,11,0.1)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#E5E5E5'; e.currentTarget.style.boxShadow = 'none'; }}
            />
          </div>
          {/* Details MK */}
          <div>
            <label htmlFor="details_mk" style={labelStyle}>Details (Macedonian)</label>
            <textarea
              id="details_mk"
              placeholder="Дополнителни детали за производот..."
              value={formData.details_mk || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, details_mk: e.target.value }))}
              rows={4}
              style={{
                ...inputStyle,
                minHeight: '120px',
                resize: 'vertical' as const,
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#B8860B'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(184,134,11,0.1)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#E5E5E5'; e.currentTarget.style.boxShadow = 'none'; }}
            />
          </div>
        </div>

        {/* Pricing & Status */}
        <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <p style={sectionTitleStyle}>Pricing & Status</p>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '24px' }}>
            {/* Price */}
            <div>
              <label htmlFor="price" style={labelStyle}>Price (USD)</label>
              <input
                id="price"
                type="number"
                placeholder="0.00"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                required
                style={{
                  ...inputStyle,
                  borderColor: fieldErrors.price ? '#DC2626' : '#E5E5E5',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#B8860B'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(184,134,11,0.1)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = fieldErrors.price ? '#DC2626' : '#E5E5E5'; e.currentTarget.style.boxShadow = 'none'; }}
              />
              {fieldErrors.price && <p style={errorTextStyle}>{fieldErrors.price}</p>}
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" style={labelStyle}>Status</label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value as ProductStatus }))}
                style={{
                  ...inputStyle,
                  cursor: 'pointer',
                  appearance: 'none' as const,
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = '#B8860B'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(184,134,11,0.1)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = '#E5E5E5'; e.currentTarget.style.boxShadow = 'none'; }}
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
            <label htmlFor="collection" style={labelStyle}>Collection</label>
            <select
              id="collection"
              value={selectedCollectionId}
              onChange={(e) => setSelectedCollectionId(e.target.value)}
              style={{
                ...inputStyle,
                cursor: 'pointer',
                appearance: 'none' as const,
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#B8860B'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(184,134,11,0.1)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#E5E5E5'; e.currentTarget.style.boxShadow = 'none'; }}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingTop: '8px' }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '16px 32px',
              backgroundColor: '#0A0A0A',
              color: '#FFFFFF',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: 600,
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1,
            }}
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
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '16px 32px',
              backgroundColor: '#FFFFFF',
              color: '#666666',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: 600,
              border: '2px solid #E5E5E5',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
