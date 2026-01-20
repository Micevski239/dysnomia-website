import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Input, Textarea } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useCollectionById, useCollectionMutations } from '../../hooks/useCollections';
import { generateSlug } from '../../lib/utils';
import type { CollectionFormData } from '../../types';

export default function CollectionForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const { collection, loading: collectionLoading } = useCollectionById(id);
  const { createCollection, updateCollection, loading, error } = useCollectionMutations();

  const [formData, setFormData] = useState<CollectionFormData>({
    title: '',
    slug: '',
    description: '',
    display_order: 0,
    is_active: true,
    is_featured: false,
    coverImage: null,
  });
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  useEffect(() => {
    if (collection && isEditing) {
      setFormData({
        title: collection.title,
        slug: collection.slug,
        description: collection.description || '',
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
      <div className="max-w-2xl">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-white animate-pulse border border-border"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-medium text-dark mb-6">
        {isEditing ? 'Edit Collection' : 'Add New Collection'}
      </h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 mb-6 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white border border-border p-6">
        <Input
          id="title"
          label="Title"
          placeholder="Enter collection title"
          value={formData.title}
          onChange={handleTitleChange}
          required
        />

        <div>
          <Input
            id="slug"
            label="Slug (URL)"
            placeholder="collection-slug"
            value={formData.slug}
            onChange={handleSlugChange}
            required
          />
          <p className="text-xs text-muted mt-1.5">URL: /collections/{formData.slug || 'your-slug'}</p>
        </div>

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

        <div className="grid grid-cols-2 gap-4">
          <label className="flex items-center space-x-3 text-sm text-dark">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, is_active: e.target.checked }))
              }
              className="w-4 h-4"
            />
            <span>Visible on site</span>
          </label>

          <label className="flex items-center space-x-3 text-sm text-dark">
            <input
              type="checkbox"
              checked={formData.is_featured}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, is_featured: e.target.checked }))
              }
              className="w-4 h-4"
            />
            <span>Mark as featured</span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-dark mb-1.5">
            Cover Image
          </label>
          <div className="flex items-center space-x-4">
            {coverPreview && (
              <img
                src={coverPreview}
                alt="Cover preview"
                className="w-24 h-24 object-cover border border-border"
              />
            )}
            <label className="cursor-pointer">
              <span className="inline-flex items-center px-4 py-2.5 bg-surface-alt border border-border text-dark text-sm hover:bg-border transition-colors">
                {coverPreview ? 'Change Image' : 'Upload Image'}
              </span>
              <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
            </label>
          </div>
        </div>

        <div className="flex space-x-4 pt-4 border-t border-border">
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
