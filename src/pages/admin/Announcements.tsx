import { useState } from 'react';
import { useAnnouncements } from '../../hooks/useAnnouncements';
import type { Announcement } from '../../hooks/useAnnouncements';
import { AdminCard } from '../../components/admin';
import { Plus, Trash2, Save, GripVertical, Eye, EyeOff } from 'lucide-react';

type Draft = Omit<Announcement, 'id' | 'created_at'>;

const emptyDraft: Draft = {
  text: '',
  text_mk: '',
  highlight: '',
  highlight_mk: '',
  suffix: '',
  suffix_mk: '',
  link: '',
  is_active: true,
  sort_order: 0,
};

export default function Announcements() {
  const { announcements, loading, addAnnouncement, updateAnnouncement, deleteAnnouncement } = useAnnouncements();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [isAdding, setIsAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleAdd = async () => {
    if (!draft.text.trim() && !draft.highlight.trim()) return;
    setSaving(true);
    const { error } = await addAnnouncement({
      ...draft,
      sort_order: draft.sort_order || announcements.length,
    });
    setSaving(false);
    if (!error) {
      setDraft(emptyDraft);
      setIsAdding(false);
      showFeedback('Announcement added!');
    }
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    setSaving(true);
    const { error } = await updateAnnouncement(editingId, draft);
    setSaving(false);
    if (!error) {
      setEditingId(null);
      setDraft(emptyDraft);
      showFeedback('Announcement updated!');
    }
  };

  const handleDelete = async (id: string) => {
    setSaving(true);
    await deleteAnnouncement(id);
    setSaving(false);
    showFeedback('Announcement deleted.');
  };

  const handleToggleActive = async (a: Announcement) => {
    await updateAnnouncement(a.id, { is_active: !a.is_active });
  };

  const startEdit = (a: Announcement) => {
    setIsAdding(false);
    setEditingId(a.id);
    setDraft({
      text: a.text,
      text_mk: a.text_mk || '',
      highlight: a.highlight,
      highlight_mk: a.highlight_mk || '',
      suffix: a.suffix,
      suffix_mk: a.suffix_mk || '',
      link: a.link,
      is_active: a.is_active,
      sort_order: a.sort_order,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    setDraft(emptyDraft);
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

  const labelStyle: React.CSSProperties = {
    fontSize: '12px',
    fontWeight: 600,
    color: '#666',
    marginBottom: '4px',
    display: 'block',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1a1a1a', marginBottom: '4px' }}>
            Announcements
          </h1>
          <p style={{ fontSize: '14px', color: '#777' }}>
            Manage the top banner announcements shown across the store
          </p>
        </div>
        {feedback && (
          <span style={{ fontSize: '13px', color: '#4CAF50', fontWeight: 500 }}>{feedback}</span>
        )}
      </div>

      {/* Preview */}
      <AdminCard title="Preview">
        <div
          style={{
            backgroundColor: '#0A0A0A',
            borderRadius: '8px',
            padding: '10px 16px',
            textAlign: 'center',
          }}
        >
          {announcements.filter((a) => a.is_active).length === 0 ? (
            <span style={{ fontSize: '12px', color: '#666' }}>No active announcements</span>
          ) : (
            <span style={{ fontSize: '12px', color: '#FFFFFF', letterSpacing: '0.5px' }}>
              {announcements.filter((a) => a.is_active)[0]?.text}
              <strong style={{ fontWeight: 700, color: '#FBBE63' }}>
                {announcements.filter((a) => a.is_active)[0]?.highlight}
              </strong>
              {announcements.filter((a) => a.is_active)[0]?.suffix}
            </span>
          )}
        </div>
      </AdminCard>

      {/* Announcements List */}
      <AdminCard
        title={`All Announcements (${announcements.length})`}
        action={
          !isAdding && !editingId ? (
            <button
              onClick={() => { setIsAdding(true); setEditingId(null); setDraft(emptyDraft); }}
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
              Add
            </button>
          ) : undefined
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {loading ? (
            <p style={{ padding: '20px', textAlign: 'center', fontSize: '14px', color: '#999' }}>Loading...</p>
          ) : announcements.length === 0 && !isAdding ? (
            <p style={{ padding: '20px', textAlign: 'center', fontSize: '14px', color: '#999' }}>
              No announcements yet. Click "Add" to create one.
            </p>
          ) : (
            announcements.map((a) =>
              editingId === a.id ? (
                /* Inline edit form */
                <div
                  key={a.id}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    backgroundColor: '#FFF8E7',
                    border: '1px solid #FBBE63',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={labelStyle}>Text (before highlight)</label>
                      <input style={inputStyle} value={draft.text} onChange={(e) => setDraft({ ...draft, text: e.target.value })} placeholder="e.g. Free shipping on orders over " />
                    </div>
                    <div>
                      <label style={labelStyle}>Text MK</label>
                      <input style={inputStyle} value={draft.text_mk || ''} onChange={(e) => setDraft({ ...draft, text_mk: e.target.value })} placeholder="Македонски текст" />
                    </div>
                    <div>
                      <label style={labelStyle}>Highlight (gold text)</label>
                      <input style={inputStyle} value={draft.highlight} onChange={(e) => setDraft({ ...draft, highlight: e.target.value })} placeholder="e.g. $50" />
                    </div>
                    <div>
                      <label style={labelStyle}>Highlight MK</label>
                      <input style={inputStyle} value={draft.highlight_mk || ''} onChange={(e) => setDraft({ ...draft, highlight_mk: e.target.value })} placeholder="Истакнат текст МК" />
                    </div>
                    <div>
                      <label style={labelStyle}>Suffix (after highlight)</label>
                      <input style={inputStyle} value={draft.suffix} onChange={(e) => setDraft({ ...draft, suffix: e.target.value })} placeholder="e.g.  - Shop now!" />
                    </div>
                    <div>
                      <label style={labelStyle}>Suffix MK</label>
                      <input style={inputStyle} value={draft.suffix_mk || ''} onChange={(e) => setDraft({ ...draft, suffix_mk: e.target.value })} placeholder="Суфикс МК" />
                    </div>
                    <div>
                      <label style={labelStyle}>Link URL</label>
                      <input style={inputStyle} value={draft.link} onChange={(e) => setDraft({ ...draft, link: e.target.value })} placeholder="/shop" />
                    </div>
                    <div>
                      <label style={labelStyle}>Sort Order</label>
                      <input style={inputStyle} type="number" value={draft.sort_order} onChange={(e) => setDraft({ ...draft, sort_order: parseInt(e.target.value) || 0 })} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={handleUpdate}
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
                      <Save style={{ width: '14px', height: '14px' }} />
                      {saving ? 'Saving...' : 'Save'}
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
              ) : (
                /* Display row */
                <div
                  key={a.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    borderRadius: '10px',
                    backgroundColor: a.is_active ? '#FAFAFA' : '#F5F5F5',
                    border: '1px solid #E8E8E8',
                    opacity: a.is_active ? 1 : 0.6,
                    cursor: 'pointer',
                  }}
                  onClick={() => startEdit(a)}
                >
                  <GripVertical style={{ width: '16px', height: '16px', color: '#CCC', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '14px', color: '#1a1a1a', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {a.text}
                      <span style={{ color: '#FBBE63', fontWeight: 700 }}>{a.highlight}</span>
                      {a.suffix}
                    </p>
                    {a.link && (
                      <p style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}>{a.link}</p>
                    )}
                  </div>
                  <span style={{ fontSize: '11px', color: '#999', flexShrink: 0 }}>#{a.sort_order}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleToggleActive(a); }}
                    title={a.is_active ? 'Deactivate' : 'Activate'}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: a.is_active ? '#E8F5E9' : 'transparent',
                      color: a.is_active ? '#4CAF50' : '#999',
                    }}
                  >
                    {a.is_active ? <Eye style={{ width: '16px', height: '16px' }} /> : <EyeOff style={{ width: '16px', height: '16px' }} />}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(a.id); }}
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
          {isAdding && (
            <div
              style={{
                padding: '16px',
                borderRadius: '12px',
                backgroundColor: '#F0FFF0',
                border: '1px solid #4CAF50',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a' }}>New Announcement</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Text (before highlight)</label>
                  <input style={inputStyle} value={draft.text} onChange={(e) => setDraft({ ...draft, text: e.target.value })} placeholder="e.g. Free shipping on orders over " />
                </div>
                <div>
                  <label style={labelStyle}>Highlight (gold text)</label>
                  <input style={inputStyle} value={draft.highlight} onChange={(e) => setDraft({ ...draft, highlight: e.target.value })} placeholder="e.g. $50" />
                </div>
                <div>
                  <label style={labelStyle}>Suffix (after highlight)</label>
                  <input style={inputStyle} value={draft.suffix} onChange={(e) => setDraft({ ...draft, suffix: e.target.value })} placeholder="e.g.  - Shop now!" />
                </div>
                <div>
                  <label style={labelStyle}>Link URL</label>
                  <input style={inputStyle} value={draft.link} onChange={(e) => setDraft({ ...draft, link: e.target.value })} placeholder="/shop" />
                </div>
                <div>
                  <label style={labelStyle}>Sort Order</label>
                  <input style={inputStyle} type="number" value={draft.sort_order} onChange={(e) => setDraft({ ...draft, sort_order: parseInt(e.target.value) || 0 })} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleAdd}
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
                  <Plus style={{ width: '14px', height: '14px' }} />
                  {saving ? 'Adding...' : 'Add Announcement'}
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
          )}
        </div>
      </AdminCard>

      {/* SQL Info */}
      <AdminCard title="Database Setup">
        <div style={{ fontSize: '13px', color: '#666', lineHeight: 1.6 }}>
          <p style={{ marginBottom: '8px' }}>
            Make sure the <code style={{ backgroundColor: '#F5F5F5', padding: '2px 6px', borderRadius: '4px' }}>announcements</code> table exists in Supabase with columns:
          </p>
          <ul style={{ paddingLeft: '20px', margin: '0' }}>
            <li><code style={{ backgroundColor: '#F5F5F5', padding: '1px 4px', borderRadius: '3px' }}>id</code> - uuid, primary key, default gen_random_uuid()</li>
            <li><code style={{ backgroundColor: '#F5F5F5', padding: '1px 4px', borderRadius: '3px' }}>text</code> - text</li>
            <li><code style={{ backgroundColor: '#F5F5F5', padding: '1px 4px', borderRadius: '3px' }}>highlight</code> - text</li>
            <li><code style={{ backgroundColor: '#F5F5F5', padding: '1px 4px', borderRadius: '3px' }}>suffix</code> - text</li>
            <li><code style={{ backgroundColor: '#F5F5F5', padding: '1px 4px', borderRadius: '3px' }}>link</code> - text</li>
            <li><code style={{ backgroundColor: '#F5F5F5', padding: '1px 4px', borderRadius: '3px' }}>is_active</code> - boolean, default true</li>
            <li><code style={{ backgroundColor: '#F5F5F5', padding: '1px 4px', borderRadius: '3px' }}>sort_order</code> - integer, default 0</li>
            <li><code style={{ backgroundColor: '#F5F5F5', padding: '1px 4px', borderRadius: '3px' }}>created_at</code> - timestamptz, default now()</li>
          </ul>
        </div>
      </AdminCard>
    </div>
  );
}
