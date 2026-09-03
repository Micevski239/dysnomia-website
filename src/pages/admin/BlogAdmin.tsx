import { useState } from 'react';
import { useBlogMutations } from '../../hooks/useBlog';
import { AdminCard } from '../../components/admin';
import { Plus, Trash2, Save, Eye, EyeOff, Image as ImageIcon } from 'lucide-react';
import type { BlogPost } from '../../types';

type Draft = {
  title: string;
  title_mk: string;
  slug: string;
  excerpt: string;
  excerpt_mk: string;
  content: string;
  content_mk: string;
  cover_image: string | null;
  author: string;
  is_published: boolean;
  published_at: string | null;
};

const emptyDraft: Draft = {
  title: '',
  title_mk: '',
  slug: '',
  excerpt: '',
  excerpt_mk: '',
  content: '',
  content_mk: '',
  cover_image: null,
  author: 'Dysnomia',
  is_published: false,
  published_at: null,
};

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function BlogAdmin() {
  const { posts, loading, addPost, updatePost, deletePost } = useBlogMutations();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleTitleChange = (value: string) => {
    const newDraft = { ...draft, title: value };
    if (isAdding || (!editingId && !draft.slug)) {
      newDraft.slug = generateSlug(value);
    }
    setDraft(newDraft);
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setCoverPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAdd = async () => {
    if (!draft.title.trim()) return;
    setSaving(true);
    try {
      const { error } = await addPost(
        {
          title: draft.title,
          title_mk: draft.title_mk || null,
          slug: draft.slug || generateSlug(draft.title),
          excerpt: draft.excerpt || null,
          excerpt_mk: draft.excerpt_mk || null,
          content: draft.content || null,
          content_mk: draft.content_mk || null,
          cover_image: draft.cover_image,
          author: draft.author || 'Dysnomia',
          is_published: draft.is_published,
          published_at: draft.is_published ? new Date().toISOString() : null,
        },
        coverFile
      );
      if (!error) {
        setDraft(emptyDraft);
        setCoverFile(null);
        setCoverPreview(null);
        setIsAdding(false);
        showFeedback('Blog post added!');
      }
    } catch {
      showFeedback('Error adding post');
    }
    setSaving(false);
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    setSaving(true);
    try {
      const { error } = await updatePost(
        editingId,
        {
          title: draft.title,
          title_mk: draft.title_mk || null,
          slug: draft.slug,
          excerpt: draft.excerpt || null,
          excerpt_mk: draft.excerpt_mk || null,
          content: draft.content || null,
          content_mk: draft.content_mk || null,
          cover_image: draft.cover_image,
          author: draft.author || 'Dysnomia',
          is_published: draft.is_published,
          published_at: draft.published_at,
        },
        coverFile
      );
      if (!error) {
        setEditingId(null);
        setDraft(emptyDraft);
        setCoverFile(null);
        setCoverPreview(null);
        showFeedback('Blog post updated!');
      }
    } catch {
      showFeedback('Error updating post');
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    setSaving(true);
    await deletePost(id);
    setSaving(false);
    showFeedback('Blog post deleted.');
  };

  const handleTogglePublish = async (post: BlogPost) => {
    const newPublished = !post.is_published;
    await updatePost(post.id, {
      is_published: newPublished,
      published_at: newPublished ? (post.published_at || new Date().toISOString()) : post.published_at,
    });
  };

  const startEdit = (post: BlogPost) => {
    setIsAdding(false);
    setEditingId(post.id);
    setCoverFile(null);
    setCoverPreview(post.cover_image || null);
    setDraft({
      title: post.title,
      title_mk: post.title_mk || '',
      slug: post.slug,
      excerpt: post.excerpt || '',
      excerpt_mk: post.excerpt_mk || '',
      content: post.content || '',
      content_mk: post.content_mk || '',
      cover_image: post.cover_image,
      author: post.author,
      is_published: post.is_published,
      published_at: post.published_at,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    setDraft(emptyDraft);
    setCoverFile(null);
    setCoverPreview(null);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '10px',
    border: '1px solid #E8E8E8',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const textareaStyle: React.CSSProperties = {
    ...inputStyle,
    minHeight: '80px',
    resize: 'vertical',
    fontFamily: 'inherit',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '12px',
    fontWeight: 600,
    color: '#666',
    marginBottom: '4px',
    display: 'block',
  };

  const renderForm = (isNew: boolean) => (
    <div
      style={{
        padding: '20px',
        borderRadius: '12px',
        backgroundColor: isNew ? '#F0FFF0' : '#FFF8E7',
        border: `1px solid ${isNew ? '#4CAF50' : '#FBBE63'}`,
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      <p style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a' }}>
        {isNew ? 'New Blog Post' : 'Edit Blog Post'}
      </p>

      {/* Title & Title MK */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <label style={labelStyle}>Title (EN) *</label>
          <input
            style={inputStyle}
            value={draft.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Post title in English"
          />
        </div>
        <div>
          <label style={labelStyle}>Title (MK)</label>
          <input
            style={inputStyle}
            value={draft.title_mk}
            onChange={(e) => setDraft({ ...draft, title_mk: e.target.value })}
            placeholder="Наслов на македонски"
          />
        </div>
      </div>

      {/* Slug & Author */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <label style={labelStyle}>Slug</label>
          <input
            style={inputStyle}
            value={draft.slug}
            onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
            placeholder="auto-generated-from-title"
          />
        </div>
        <div>
          <label style={labelStyle}>Author</label>
          <input
            style={inputStyle}
            value={draft.author}
            onChange={(e) => setDraft({ ...draft, author: e.target.value })}
            placeholder="Dysnomia"
          />
        </div>
      </div>

      {/* Excerpt EN/MK */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <label style={labelStyle}>Excerpt (EN)</label>
          <textarea
            style={textareaStyle}
            value={draft.excerpt}
            onChange={(e) => setDraft({ ...draft, excerpt: e.target.value })}
            placeholder="Short summary in English..."
          />
        </div>
        <div>
          <label style={labelStyle}>Excerpt (MK)</label>
          <textarea
            style={textareaStyle}
            value={draft.excerpt_mk}
            onChange={(e) => setDraft({ ...draft, excerpt_mk: e.target.value })}
            placeholder="Краток опис на македонски..."
          />
        </div>
      </div>

      {/* Content EN/MK */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <label style={labelStyle}>Content (EN)</label>
          <textarea
            style={{ ...textareaStyle, minHeight: '160px' }}
            value={draft.content}
            onChange={(e) => setDraft({ ...draft, content: e.target.value })}
            placeholder="Full content in English. Separate paragraphs with blank lines..."
          />
        </div>
        <div>
          <label style={labelStyle}>Content (MK)</label>
          <textarea
            style={{ ...textareaStyle, minHeight: '160px' }}
            value={draft.content_mk}
            onChange={(e) => setDraft({ ...draft, content_mk: e.target.value })}
            placeholder="Целосна содржина на македонски. Параграфите одвојте со празен ред..."
          />
        </div>
      </div>

      {/* Cover Image */}
      <div>
        <label style={labelStyle}>Cover Image</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <label
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              borderRadius: '10px',
              border: '1px solid #E8E8E8',
              cursor: 'pointer',
              backgroundColor: '#FFFFFF',
              fontSize: '13px',
              color: '#666',
            }}
          >
            <ImageIcon style={{ width: '16px', height: '16px' }} />
            Choose Image
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleCoverChange}
              style={{ display: 'none' }}
            />
          </label>
          {coverPreview && (
            <img
              src={coverPreview}
              alt="Cover preview"
              style={{
                width: '80px',
                height: '45px',
                objectFit: 'cover',
                borderRadius: '8px',
                border: '1px solid #E8E8E8',
              }}
            />
          )}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={isNew ? handleAdd : handleUpdate}
          disabled={saving}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '10px 20px',
            borderRadius: '10px',
            border: 'none',
            cursor: saving ? 'not-allowed' : 'pointer',
            backgroundColor: '#1a1a1a',
            color: '#FFFFFF',
            fontSize: '13px',
            fontWeight: 600,
            opacity: saving ? 0.6 : 1,
          }}
        >
          {isNew ? <Plus style={{ width: '14px', height: '14px' }} /> : <Save style={{ width: '14px', height: '14px' }} />}
          {saving ? 'Saving...' : isNew ? 'Add Post' : 'Save'}
        </button>
        <button
          onClick={cancelEdit}
          style={{
            padding: '10px 20px',
            borderRadius: '10px',
            border: '1px solid #E8E8E8',
            cursor: 'pointer',
            backgroundColor: '#FFFFFF',
            color: '#666',
            fontSize: '13px',
            fontWeight: 500,
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1a1a1a', marginBottom: '4px' }}>
            Blog
          </h1>
          <p style={{ fontSize: '14px', color: '#777' }}>
            Manage blog posts shown on the public blog page
          </p>
        </div>
        {feedback && (
          <span style={{ fontSize: '13px', color: '#4CAF50', fontWeight: 500 }}>{feedback}</span>
        )}
      </div>

      {/* Posts List */}
      <AdminCard
        title={`All Posts (${posts.length})`}
        action={
          !isAdding && !editingId ? (
            <button
              onClick={() => {
                setIsAdding(true);
                setEditingId(null);
                setDraft(emptyDraft);
                setCoverFile(null);
                setCoverPreview(null);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: '#1a1a1a',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 600,
              }}
            >
              <Plus style={{ width: '14px', height: '14px' }} />
              Add Post
            </button>
          ) : undefined
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {loading ? (
            <p style={{ padding: '20px', textAlign: 'center', fontSize: '14px', color: '#999' }}>
              Loading...
            </p>
          ) : posts.length === 0 && !isAdding ? (
            <p style={{ padding: '20px', textAlign: 'center', fontSize: '14px', color: '#999' }}>
              No blog posts yet. Click "Add Post" to create one.
            </p>
          ) : (
            posts.map((post) =>
              editingId === post.id ? (
                <div key={post.id}>{renderForm(false)}</div>
              ) : (
                <div
                  key={post.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    borderRadius: '10px',
                    backgroundColor: post.is_published ? '#FAFAFA' : '#F5F5F5',
                    border: '1px solid #E8E8E8',
                    opacity: post.is_published ? 1 : 0.7,
                    cursor: 'pointer',
                  }}
                  onClick={() => startEdit(post)}
                >
                  {/* Thumbnail */}
                  {post.cover_image ? (
                    <img
                      src={post.cover_image}
                      alt=""
                      style={{
                        width: '48px',
                        height: '32px',
                        objectFit: 'cover',
                        borderRadius: '6px',
                        flexShrink: 0,
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '48px',
                        height: '32px',
                        backgroundColor: '#EEE',
                        borderRadius: '6px',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <ImageIcon style={{ width: '14px', height: '14px', color: '#CCC' }} />
                    </div>
                  )}

                  {/* Title & Date */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: '14px',
                        color: '#1a1a1a',
                        fontWeight: 500,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {post.title}
                    </p>
                    <p style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}>
                      {post.published_at
                        ? new Date(post.published_at).toLocaleDateString()
                        : new Date(post.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Status Badge */}
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      padding: '4px 10px',
                      borderRadius: '20px',
                      backgroundColor: post.is_published ? '#E8F5E9' : '#FFF3E0',
                      color: post.is_published ? '#2E7D32' : '#E65100',
                      flexShrink: 0,
                    }}
                  >
                    {post.is_published ? 'Published' : 'Draft'}
                  </span>

                  {/* Publish Toggle */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTogglePublish(post);
                    }}
                    title={post.is_published ? 'Unpublish' : 'Publish'}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: post.is_published ? '#E8F5E9' : 'transparent',
                      color: post.is_published ? '#4CAF50' : '#999',
                    }}
                  >
                    {post.is_published ? (
                      <Eye style={{ width: '16px', height: '16px' }} />
                    ) : (
                      <EyeOff style={{ width: '16px', height: '16px' }} />
                    )}
                  </button>

                  {/* Delete */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(post.id);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: 'transparent',
                      color: '#999',
                    }}
                  >
                    <Trash2 style={{ width: '16px', height: '16px' }} />
                  </button>
                </div>
              )
            )
          )}

          {/* Add form */}
          {isAdding && renderForm(true)}
        </div>
      </AdminCard>

      {/* Database Info */}
      <AdminCard title="Database Setup">
        <div style={{ fontSize: '13px', color: '#666', lineHeight: 1.6 }}>
          <p style={{ marginBottom: '8px' }}>
            Make sure the{' '}
            <code style={{ backgroundColor: '#F5F5F5', padding: '2px 6px', borderRadius: '4px' }}>
              blog_posts
            </code>{' '}
            table exists in Supabase with the following columns:
          </p>
          <ul style={{ paddingLeft: '20px', margin: '0' }}>
            <li>
              <code style={{ backgroundColor: '#F5F5F5', padding: '1px 4px', borderRadius: '3px' }}>id</code> - uuid, primary key
            </li>
            <li>
              <code style={{ backgroundColor: '#F5F5F5', padding: '1px 4px', borderRadius: '3px' }}>title</code>,{' '}
              <code style={{ backgroundColor: '#F5F5F5', padding: '1px 4px', borderRadius: '3px' }}>title_mk</code> - text
            </li>
            <li>
              <code style={{ backgroundColor: '#F5F5F5', padding: '1px 4px', borderRadius: '3px' }}>slug</code> - text, unique
            </li>
            <li>
              <code style={{ backgroundColor: '#F5F5F5', padding: '1px 4px', borderRadius: '3px' }}>excerpt</code>,{' '}
              <code style={{ backgroundColor: '#F5F5F5', padding: '1px 4px', borderRadius: '3px' }}>excerpt_mk</code> - text
            </li>
            <li>
              <code style={{ backgroundColor: '#F5F5F5', padding: '1px 4px', borderRadius: '3px' }}>content</code>,{' '}
              <code style={{ backgroundColor: '#F5F5F5', padding: '1px 4px', borderRadius: '3px' }}>content_mk</code> - text
            </li>
            <li>
              <code style={{ backgroundColor: '#F5F5F5', padding: '1px 4px', borderRadius: '3px' }}>cover_image</code> - text
            </li>
            <li>
              <code style={{ backgroundColor: '#F5F5F5', padding: '1px 4px', borderRadius: '3px' }}>author</code> - text, default 'Dysnomia'
            </li>
            <li>
              <code style={{ backgroundColor: '#F5F5F5', padding: '1px 4px', borderRadius: '3px' }}>is_published</code> - boolean, default false
            </li>
            <li>
              <code style={{ backgroundColor: '#F5F5F5', padding: '1px 4px', borderRadius: '3px' }}>published_at</code> - timestamptz
            </li>
            <li>
              <code style={{ backgroundColor: '#F5F5F5', padding: '1px 4px', borderRadius: '3px' }}>created_at</code>,{' '}
              <code style={{ backgroundColor: '#F5F5F5', padding: '1px 4px', borderRadius: '3px' }}>updated_at</code> - timestamptz
            </li>
          </ul>
        </div>
      </AdminCard>
    </div>
  );
}
