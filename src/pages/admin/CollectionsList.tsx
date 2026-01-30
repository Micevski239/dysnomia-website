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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '20px' }}>
          <div>
            <div style={{ height: '14px', width: '80px', backgroundColor: '#F5F5F5', borderRadius: '6px', marginBottom: '12px' }} className="animate-pulse" />
            <div style={{ height: '40px', width: '200px', backgroundColor: '#F5F5F5', borderRadius: '8px' }} className="animate-pulse" />
          </div>
          <div style={{ height: '52px', width: '180px', backgroundColor: '#F5F5F5', borderRadius: '12px' }} className="animate-pulse" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E8E8E8',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)',
                overflow: 'hidden',
              }}
            >
              <div style={{ aspectRatio: '16/10', backgroundColor: '#F5F5F5' }} className="animate-pulse" />
              <div style={{ padding: '24px' }}>
                <div style={{ height: '18px', backgroundColor: '#F5F5F5', borderRadius: '6px', width: '75%', marginBottom: '12px' }} className="animate-pulse" />
                <div style={{ height: '14px', backgroundColor: '#F5F5F5', borderRadius: '6px', width: '50%' }} className="animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '20px' }}>
        <div>
          <p style={{
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            color: '#999999',
            marginBottom: '8px',
            fontWeight: 600,
          }}>
            Organize
          </p>
          <h1 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: '36px',
            fontWeight: 500,
            color: '#0A0A0A',
          }}>
            Collections
          </h1>
          <p style={{ fontSize: '15px', color: '#888888', marginTop: '8px' }}>
            {collections.length} {collections.length === 1 ? 'collection' : 'collections'} in your gallery
          </p>
        </div>
        <Link
          to="/admin/collections/new"
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
            textDecoration: 'none',
          }}
        >
          <Plus style={{ width: '18px', height: '18px' }} />
          Add Collection
        </Link>
      </div>

      {error && (
        <div style={{
          backgroundColor: '#FEF2F2',
          border: '1px solid #FECACA',
          borderRadius: '12px',
          padding: '16px 20px',
          color: '#DC2626',
          fontSize: '14px',
        }}>
          {error}
        </div>
      )}

      {collections.length === 0 ? (
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E8E8E8',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)',
          padding: '80px 32px',
          textAlign: 'center',
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 24px',
            borderRadius: '20px',
            backgroundColor: '#F5F5F5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Layers style={{ width: '40px', height: '40px', color: '#CCCCCC' }} />
          </div>
          <h3 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: '24px',
            fontWeight: 500,
            color: '#0A0A0A',
            marginBottom: '8px',
          }}>
            No collections yet
          </h3>
          <p style={{ fontSize: '15px', color: '#888888', marginBottom: '32px' }}>
            Organize your products by creating collections.
          </p>
          <Link
            to="/admin/collections/new"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '16px 32px',
              backgroundColor: '#FBBE63',
              color: '#0A0A0A',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            <Plus style={{ width: '18px', height: '18px' }} />
            Create your first collection
          </Link>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '24px',
        }}>
          {collections.map((collection) => (
            <div
              key={collection.id}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E8E8E8',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)',
                overflow: 'hidden',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(251,190,99,0.5)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.06)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E8E8E8';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)';
              }}
            >
              {/* Image */}
              <div style={{
                aspectRatio: '16/10',
                backgroundColor: '#F5F5F5',
                position: 'relative',
                overflow: 'hidden',
              }}>
                {collection.cover_image || collection.cover_image_url ? (
                  <img
                    src={collection.cover_image || collection.cover_image_url || ''}
                    alt={collection.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.5s',
                    }}
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Layers style={{ width: '48px', height: '48px', color: '#CCCCCC' }} />
                  </div>
                )}
                {/* Badges */}
                <div style={{ position: 'absolute', top: '16px', left: '16px', display: 'flex', gap: '8px' }}>
                  <span style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 600,
                    backgroundColor: collection.is_active ? 'rgba(22, 163, 74, 0.9)' : 'rgba(255,255,255,0.9)',
                    color: collection.is_active ? '#FFFFFF' : '#666666',
                    backdropFilter: 'blur(8px)',
                  }}>
                    {collection.is_active ? 'Active' : 'Hidden'}
                  </span>
                  {collection.is_featured && (
                    <span style={{
                      padding: '6px 14px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 600,
                      backgroundColor: 'rgba(251, 190, 99, 0.9)',
                      color: '#0A0A0A',
                      backdropFilter: 'blur(8px)',
                    }}>
                      Featured
                    </span>
                  )}
                </div>
              </div>

              {/* Content */}
              <div style={{ padding: '24px' }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 600,
                  color: '#0A0A0A',
                  marginBottom: '4px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {collection.title}
                </h3>
                <p style={{ fontSize: '13px', color: '#999999', marginBottom: '4px' }}>
                  /collections/{collection.slug}
                </p>
                <p style={{ fontSize: '14px', color: '#888888', marginBottom: '20px' }}>
                  Display order: {collection.display_order}
                </p>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <Link
                    to={`/admin/collections/${collection.id}/edit`}
                    style={{
                      flex: 1,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '12px 16px',
                      backgroundColor: '#0A0A0A',
                      color: '#FFFFFF',
                      borderRadius: '10px',
                      fontSize: '14px',
                      fontWeight: 600,
                      textDecoration: 'none',
                      transition: 'background-color 0.15s',
                    }}
                  >
                    <Edit2 style={{ width: '15px', height: '15px' }} />
                    Edit
                  </Link>
                  <Link
                    to={`/collections/${collection.slug}`}
                    target="_blank"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '12px 14px',
                      backgroundColor: '#F5F5F5',
                      color: '#666666',
                      borderRadius: '10px',
                      textDecoration: 'none',
                      transition: 'background-color 0.15s',
                    }}
                  >
                    <ExternalLink style={{ width: '16px', height: '16px' }} />
                  </Link>
                  {deleteConfirm === collection.id ? (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleDelete(collection.id)}
                        disabled={mutationLoading}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '12px 18px',
                          backgroundColor: '#DC2626',
                          color: '#FFFFFF',
                          borderRadius: '10px',
                          fontSize: '14px',
                          fontWeight: 600,
                          border: 'none',
                          cursor: mutationLoading ? 'not-allowed' : 'pointer',
                          opacity: mutationLoading ? 0.5 : 1,
                        }}
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '12px 14px',
                          backgroundColor: '#F5F5F5',
                          color: '#666666',
                          borderRadius: '10px',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        <X style={{ width: '16px', height: '16px' }} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(collection.id)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '12px 14px',
                        backgroundColor: '#FEF2F2',
                        color: '#DC2626',
                        borderRadius: '10px',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s',
                      }}
                    >
                      <Trash2 style={{ width: '16px', height: '16px' }} />
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
