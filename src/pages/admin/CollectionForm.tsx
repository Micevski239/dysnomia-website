import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Input, Textarea } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useCollectionById, useCollectionMutations } from '../../hooks/useCollections';
import { generateSlug } from '../../lib/utils';
import { validateCollection, type CollectionFormErrors } from '../../lib/validation';
import type { CollectionFormData } from '../../types';
import { Upload, ImageIcon } from 'lucide-react';

export default function CollectionForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const { collection, loading: collectionLoading } = useCollectionById(id);
  const { createCollection, updateCollection, loading, error } = useCollectionMutations();

  const [formData, setFormData] = useState<CollectionFormData>({
    title: '',
    title_mk: '',
    slug: '',
    description: '',
    description_mk: '',
    display_order: 0,
    is_active: true,
    is_featured: false,
    coverImage: null,
  });
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<CollectionFormErrors>({});

  useEffect(() => {
    if (collection && isEditing) {
      setFormData({
        title: collection.title,
        title_mk: (collection as any).title_mk || '',
        slug: collection.slug,
        description: collection.description || '',
        description_mk: (collection as any).description_mk || '',
        display_order: collection.display_order ?? 0,
        is_active: collection.is_active,
        is_featured: collection.is_featured,
        coverImage: null,
      });
      setCoverPreview(collection.cover_image || collection.cover_image_url || null);
      setSlugManuallyEdited(true);
    }
  }, [collection, isEditing]);

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

  const handleCoverChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, coverImage: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    const validationResult = validateCollection({
      title: formData.title,
      slug: formData.slug,
      description: formData.description,
      display_order: formData.display_order,
      is_active: formData.is_active,
      is_featured: formData.is_featured,
    });

    if (!validationResult.success) {
      setFieldErrors(validationResult.errors);
      return;
    }

    let result;
    if (isEditing && id) {
      result = await updateCollection(
        id,
        formData,
        collection?.cover_image || collection?.cover_image_url || null
      );
    } else {
      result = await createCollection(formData);
    }

    if (!result.error) {
      navigate('/admin/collections');
    }
  };

  if (collectionLoading && isEditing) {
    return (
      <div style={{ maxWidth: '720px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              style={{
                height: '56px',
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
    <div style={{ maxWidth: '720px' }}>
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
          {isEditing ? 'Edit Collection' : 'New Collection'}
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
          marginBottom: '24px',
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E8E8E8',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)',
          padding: '32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '28px',
        }}>
          {/* Title */}
          <div>
            <Input
              id="title"
              label="Title"
              placeholder="Enter collection title"
              value={formData.title}
              onChange={handleTitleChange}
              required
            />
            {fieldErrors.title && (
              <p style={{ fontSize: '13px', color: '#dc2626', marginTop: '6px' }}>{fieldErrors.title}</p>
            )}
          </div>

          {/* Title MK */}
          <div>
            <Input
              id="title_mk"
              label="Title (Macedonian)"
              placeholder="Наслов на колекцијата"
              value={formData.title_mk || ''}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title_mk: e.target.value }))
              }
            />
          </div>

          {/* Slug */}
          <div>
            <Input
              id="slug"
              label="Slug (URL)"
              placeholder="collection-slug"
              value={formData.slug}
              onChange={handleSlugChange}
              required
            />
            {fieldErrors.slug ? (
              <p style={{ fontSize: '13px', color: '#dc2626', marginTop: '6px' }}>{fieldErrors.slug}</p>
            ) : (
              <p style={{ fontSize: '13px', color: '#999999', marginTop: '6px' }}>
                URL: /collections/{formData.slug || 'your-slug'}
              </p>
            )}
          </div>

          {/* Description */}
          <Textarea
            id="description"
            label="Description"
            placeholder="Describe this collection..."
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            rows={4}
          />

          {/* Description MK */}
          <Textarea
            id="description_mk"
            label="Description (Macedonian)"
            placeholder="Опис на колекцијата..."
            value={formData.description_mk || ''}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description_mk: e.target.value }))
            }
            rows={4}
          />

          {/* Display Order */}
          <div style={{ maxWidth: '200px' }}>
            <Input
              id="display_order"
              label="Display Order"
              type="number"
              placeholder="0"
              value={formData.display_order}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  display_order: Number.isNaN(Number(e.target.value))
                    ? 0
                    : Number(e.target.value),
                }))
              }
              required
            />
          </div>

          {/* Checkboxes */}
          <div style={{ display: 'flex', gap: '32px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '15px',
              color: '#1a1a1a',
              cursor: 'pointer',
            }}>
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, is_active: e.target.checked }))
                }
                style={{ width: '20px', height: '20px', accentColor: '#B8860B', cursor: 'pointer' }}
              />
              Visible on site
            </label>

            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '15px',
              color: '#1a1a1a',
              cursor: 'pointer',
            }}>
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, is_featured: e.target.checked }))
                }
                style={{ width: '20px', height: '20px', accentColor: '#B8860B', cursor: 'pointer' }}
              />
              Mark as featured
            </label>
          </div>

          {/* Cover Image */}
          <div>
            <p style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#1a1a1a',
              marginBottom: '12px',
            }}>
              Cover Image
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              {coverPreview ? (
                <div style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '2px solid #E5E5E5',
                  flexShrink: 0,
                }}>
                  <img
                    src={coverPreview}
                    alt="Cover preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              ) : (
                <div style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '12px',
                  border: '2px dashed #E5E5E5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#FAFAFA',
                  flexShrink: 0,
                }}>
                  <ImageIcon style={{ width: '32px', height: '32px', color: '#CCCCCC' }} />
                </div>
              )}
              <label style={{ cursor: 'pointer' }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  backgroundColor: '#F5F5F5',
                  border: '2px solid #E5E5E5',
                  borderRadius: '12px',
                  color: '#1a1a1a',
                  fontSize: '14px',
                  fontWeight: 600,
                  transition: 'all 0.15s',
                }}>
                  <Upload style={{ width: '16px', height: '16px' }} />
                  {coverPreview ? 'Change Image' : 'Upload Image'}
                </span>
                <input type="file" accept="image/*" onChange={handleCoverChange} style={{ display: 'none' }} />
              </label>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex',
          gap: '16px',
          marginTop: '24px',
        }}>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading
              ? isEditing
                ? 'Updating...'
                : 'Creating...'
              : isEditing
              ? 'Update Collection'
              : 'Create Collection'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate('/admin/collections')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
