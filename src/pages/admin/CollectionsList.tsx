import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCollections, useCollectionMutations } from '../../hooks/useCollections';
import { Plus, Layers, ExternalLink, Edit2, Trash2, X } from 'lucide-react';

export default function CollectionsList() {
  const { collections, loading, error, refetch } = useCollections(true);
  const { deleteCollection, loading: mutationLoading } = useCollectionMutations();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    const result = await deleteCollection(id);
    if (!result.error) {
      setDeleteConfirm(null);
      refetch();
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="h-4 w-20 bg-[#F5F5F5] rounded animate-pulse mb-2" />
            <div className="h-10 w-48 bg-[#F5F5F5] rounded animate-pulse" />
          </div>
          <div className="h-14 w-44 bg-[#F5F5F5] rounded-xl animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-white rounded-2xl border border-[#E5E5E5] overflow-hidden">
              <div className="aspect-[16/9] bg-[#F5F5F5] animate-pulse" />
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
            Organize
          </p>
          <h1
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            className="text-[36px] font-medium text-[#0A0A0A]"
          >
            Collections
          </h1>
          <p className="text-[15px] text-[#666666] mt-2">
            {collections.length} {collections.length === 1 ? 'collection' : 'collections'} in your gallery
          </p>
        </div>
        <Link
          to="/admin/collections/new"
          className="inline-flex items-center gap-3 px-6 py-4 bg-[#0A0A0A] text-white rounded-xl text-[15px] font-medium hover:bg-[#1a1a1a] transition-colors"
        >
          <Plus className="h-5 w-5" />
          Add Collection
        </Link>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 border border-red-200 px-6 py-4 text-[15px] text-red-700">
          {error}
        </div>
      )}

      {collections.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E5E5E5] py-20 text-center">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-[#F5F5F5] flex items-center justify-center mb-6">
            <Layers className="h-10 w-10 text-[#CCCCCC]" />
          </div>
          <h3
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            className="text-[24px] font-medium text-[#0A0A0A] mb-2"
          >
            No collections yet
          </h3>
          <p className="text-[15px] text-[#666666] mb-8">
            Organize your products by creating collections.
          </p>
          <Link
            to="/admin/collections/new"
            className="inline-flex items-center gap-3 px-6 py-4 bg-[#FBBE63] text-[#0A0A0A] rounded-xl text-[15px] font-medium hover:bg-[#f0b050] transition-colors"
          >
            <Plus className="h-5 w-5" />
            Create your first collection
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((collection) => (
            <div
              key={collection.id}
              className="bg-white rounded-2xl border border-[#E5E5E5] overflow-hidden group hover:border-[#FBBE63]/50 transition-colors"
            >
              {/* Image */}
              <div className="aspect-[16/9] bg-[#F5F5F5] relative overflow-hidden">
                {collection.cover_image || collection.cover_image_url ? (
                  <img
                    src={collection.cover_image || collection.cover_image_url || ''}
                    alt={collection.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Layers className="h-12 w-12 text-[#CCCCCC]" />
                  </div>
                )}
                {/* Badges */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <span
                    className={`px-3 py-1.5 rounded-full text-[12px] font-medium ${
                      collection.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-white text-[#666666]'
                    }`}
                  >
                    {collection.is_active ? 'Active' : 'Hidden'}
                  </span>
                  {collection.is_featured && (
                    <span className="px-3 py-1.5 rounded-full text-[12px] font-medium bg-[#FBBE63] text-[#0A0A0A]">
                      Featured
                    </span>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-[18px] font-medium text-[#0A0A0A] mb-1 truncate">
                  {collection.title}
                </h3>
                <p className="text-[13px] text-[#999999] mb-2">
                  /collections/{collection.slug}
                </p>
                <p className="text-[14px] text-[#666666] mb-5">
                  Display order: {collection.display_order}
                </p>

                {/* Actions */}
                <div className="flex gap-3">
                  <Link
                    to={`/admin/collections/${collection.id}/edit`}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-[#0A0A0A] text-white rounded-xl text-[14px] font-medium hover:bg-[#1a1a1a] transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit
                  </Link>
                  <Link
                    to={`/collections/${collection.slug}`}
                    target="_blank"
                    className="inline-flex items-center justify-center px-4 py-3 bg-[#F5F5F5] text-[#666666] rounded-xl text-[14px] font-medium hover:bg-[#E5E5E5] transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                  {deleteConfirm === collection.id ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDelete(collection.id)}
                        disabled={mutationLoading}
                        className="inline-flex items-center justify-center px-4 py-3 bg-red-500 text-white rounded-xl text-[14px] font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="inline-flex items-center justify-center px-3 py-3 bg-[#F5F5F5] text-[#666666] rounded-xl hover:bg-[#E5E5E5] transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(collection.id)}
                      className="inline-flex items-center justify-center px-4 py-3 bg-red-50 text-red-600 rounded-xl text-[14px] font-medium hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
