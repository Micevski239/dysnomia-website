import { useState } from 'react';
import { Plus, Save, Trash2, Eye, EyeOff, ExternalLink, Image as ImageIcon, X } from 'lucide-react';
import { AdminCard } from '../../components/admin';
import { useExhibitionMutations, type ExhibitionInput } from '../../hooks/useExhibitions';
import { generateSlug } from '../../lib/utils';
import {
  ART_SCENE_PATH,
  EXHIBITION_CITIES,
  exhibitionSeoDescription,
  exhibitionSeoTitle,
  exhibitionSlugSource,
  exhibitionStatus,
  formatDateRange,
} from '../../config/artScene';
import type { Exhibition } from '../../types';

type Draft = Omit<ExhibitionInput, 'published_at'> & { published_at: string | null };

const EMPTY: Draft = {
  slug: '',
  title_mk: '',
  title: '',
  artist_mk: '',
  artist: '',
  exhibition_type: 'solo',
  start_date: '',
  end_date: '',
  city: 'skopje',
  venue_mk: '',
  venue: '',
  organizer_mk: '',
  organizer: '',
  official_url: '',
  cover_image: null,
  cover_alt_mk: '',
  cover_alt: '',
  photo_credit: '',
  summary_mk: '',
  summary: '',
  content_mk: '',
  content: '',
  artist_bio_mk: '',
  artist_bio: '',
  opening_hours_mk: '',
  opening_hours: '',
  admission_mk: '',
  admission: '',
  seo_title_mk: '',
  seo_title: '',
  seo_description_mk: '',
  seo_description: '',
  is_published: false,
  published_at: null,
};

const STATUS_LABEL = { current: 'On now', upcoming: 'Coming soon', ended: 'Ended' } as const;
const STATUS_COLORS = {
  current: { backgroundColor: '#FFF3D6', color: '#8a6a1f' },
  upcoming: { backgroundColor: '#E8F0FE', color: '#1a56b0' },
  ended: { backgroundColor: '#F2F2F2', color: '#777' },
} as const;

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '10px',
  border: '1px solid #E8E8E8',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box',
  backgroundColor: '#FFFFFF',
  fontFamily: 'inherit',
};
const textareaStyle: React.CSSProperties = { ...inputStyle, minHeight: '90px', resize: 'vertical' };
const labelStyle: React.CSSProperties = { fontSize: '12px', fontWeight: 600, color: '#666', marginBottom: '4px', display: 'block' };
const hintStyle: React.CSSProperties = { fontSize: '12px', color: '#999', marginTop: '4px' };
const groupTitle: React.CSSProperties = { fontSize: '12px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#555' };
const twoCols: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' };

/** Empty strings become null so optional columns stay empty in the database. */
function toInput(draft: Draft): ExhibitionInput {
  const out: Record<string, unknown> = { ...draft };
  for (const [key, value] of Object.entries(out)) {
    if (typeof value === 'string' && value.trim() === '' && key !== 'slug') out[key] = null;
    else if (typeof value === 'string') out[key] = value.trim();
  }
  return out as ExhibitionInput;
}

function fromRow(row: Exhibition): Draft {
  const draft = { ...EMPTY };
  for (const key of Object.keys(EMPTY) as (keyof Draft)[]) {
    const value = row[key as keyof Exhibition];
    (draft as Record<string, unknown>)[key] = value ?? (typeof EMPTY[key] === 'string' ? '' : EMPTY[key]);
  }
  return draft;
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
      {hint && <p style={hintStyle}>{hint}</p>}
    </div>
  );
}

export default function ArtScenaAdmin() {
  const { exhibitions, loading, error, uploadImage, addExhibition, updateExhibition, deleteExhibition } =
    useExhibitionMutations();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [slugTouched, setSlugTouched] = useState(false);
  const [showSeo, setShowSeo] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);

  const set = (patch: Partial<Draft>) =>
    setDraft((prev) => {
      const next = { ...prev, ...patch };
      // The address follows artist + title until it is edited by hand
      if (!slugTouched && ('artist_mk' in patch || 'title_mk' in patch)) {
        next.slug = generateSlug(exhibitionSlugSource(next.artist_mk, next.title_mk));
      }
      return next;
    });

  const open = (row: Exhibition | null) => {
    setNotice(null);
    setShowSeo(false);
    if (row) {
      setEditingId(row.id);
      setIsAdding(false);
      setDraft(fromRow(row));
      setSlugTouched(true);
    } else {
      setEditingId(null);
      setIsAdding(true);
      setDraft(EMPTY);
      setSlugTouched(false);
    }
  };

  const close = () => {
    setEditingId(null);
    setIsAdding(false);
    setDraft(EMPTY);
  };

  const missing = [
    !draft.title_mk.trim() && 'title (MK)',
    !draft.artist_mk.trim() && 'artist (MK)',
    !draft.venue_mk.trim() && 'venue (MK)',
    !draft.start_date && 'start date',
    !draft.slug.trim() && 'address',
  ].filter(Boolean) as string[];
  const datesInvalid = Boolean(draft.start_date && draft.end_date && draft.end_date < draft.start_date);
  const urlInvalid = Boolean(draft.official_url && !/^https?:\/\//i.test(draft.official_url.trim()));

  const handleSave = async (publish?: boolean) => {
    if (missing.length > 0 || datesInvalid || urlInvalid) return;
    setSaving(true);
    setNotice(null);
    const isPublished = publish ?? draft.is_published;
    const input = toInput({
      ...draft,
      is_published: isPublished,
      published_at: isPublished ? draft.published_at || new Date().toISOString() : draft.published_at,
    });
    const { error } = editingId ? await updateExhibition(editingId, input) : await addExhibition(input);
    setSaving(false);
    if (error) {
      const duplicate = /duplicate|unique/i.test(error.message);
      setNotice({ type: 'error', text: duplicate ? 'This address is already used by another exhibition.' : error.message });
      return;
    }
    setNotice({ type: 'ok', text: isPublished ? 'Saved and published.' : 'Saved as draft.' });
    close();
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      set({ cover_image: url });
    } catch (err) {
      setNotice({ type: 'error', text: err instanceof Error ? `Upload failed: ${err.message}` : 'Upload failed' });
    }
    setUploading(false);
  };

  const handleDelete = async (row: Exhibition) => {
    if (!window.confirm(`Delete "${row.title_mk}"? This cannot be undone.`)) return;
    const { error } = await deleteExhibition(row.id);
    setNotice(error ? { type: 'error', text: error.message } : { type: 'ok', text: 'Exhibition deleted.' });
    if (editingId === row.id) close();
  };

  const handleTogglePublish = async (row: Exhibition) => {
    const publish = !row.is_published;
    const { error } = await updateExhibition(row.id, {
      is_published: publish,
      published_at: publish ? row.published_at || new Date().toISOString() : row.published_at,
    });
    if (error) setNotice({ type: 'error', text: error.message });
  };

  // Preview of what Google will show, from the current draft
  const previewRow = { ...EMPTY, ...draft, end_date: draft.end_date || null, city: draft.city } as unknown as Exhibition;
  const canPreview = draft.title_mk.trim() && draft.artist_mk.trim() && draft.venue_mk.trim();
  const status = draft.start_date ? exhibitionStatus({ start_date: draft.start_date, end_date: draft.end_date || null }) : null;

  const renderForm = () => (
    <div
      style={{
        padding: '24px',
        borderRadius: '12px',
        backgroundColor: isAdding ? '#F6FBF6' : '#FFF8E7',
        border: `1px solid ${isAdding ? '#A5D6A7' : '#FBBE63'}`,
        display: 'flex',
        flexDirection: 'column',
        gap: '22px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <p style={{ fontSize: '14px', fontWeight: 700, color: '#1a1a1a' }}>{isAdding ? 'New exhibition' : 'Edit exhibition'}</p>
        {status && (
          <span style={{ fontSize: '12px', color: '#666' }}>
            Status from the dates:{' '}
            <span style={{ ...STATUS_COLORS[status], fontWeight: 600, padding: '3px 10px', borderRadius: '20px' }}>
              {STATUS_LABEL[status]}
            </span>
          </span>
        )}
      </div>

      {/* Basics */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <p style={groupTitle}>Basics</p>
        <div style={twoCols}>
          <Field label="Title (MK) *">
            <input style={inputStyle} value={draft.title_mk} onChange={(e) => set({ title_mk: e.target.value })} placeholder="Пресек" />
          </Field>
          <Field label="Title (EN)">
            <input style={inputStyle} value={draft.title || ''} onChange={(e) => set({ title: e.target.value })} placeholder="Cross-Section" />
          </Field>
          <Field label="Artist(s) (MK) *">
            <input style={inputStyle} value={draft.artist_mk} onChange={(e) => set({ artist_mk: e.target.value })} placeholder="Ирена Паскали" />
          </Field>
          <Field label="Artist(s) (EN)">
            <input style={inputStyle} value={draft.artist || ''} onChange={(e) => set({ artist: e.target.value })} placeholder="Irena Paskali" />
          </Field>
          <Field label="Type">
            <select style={inputStyle} value={draft.exhibition_type} onChange={(e) => set({ exhibition_type: e.target.value as Draft['exhibition_type'] })}>
              <option value="solo">Solo exhibition</option>
              <option value="group">Group exhibition</option>
            </select>
          </Field>
          <Field label="City">
            <select style={inputStyle} value={draft.city} onChange={(e) => set({ city: e.target.value as Draft['city'] })}>
              {EXHIBITION_CITIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.mk}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Start date *">
            <input type="date" style={inputStyle} value={draft.start_date} onChange={(e) => set({ start_date: e.target.value })} />
          </Field>
          <Field label="End date" hint={datesInvalid ? undefined : 'Empty = open-ended'}>
            <input type="date" style={inputStyle} value={draft.end_date || ''} onChange={(e) => set({ end_date: e.target.value })} />
            {datesInvalid && <p style={{ ...hintStyle, color: '#c62828' }}>The end date is before the start date.</p>}
          </Field>
          <Field label="Venue (MK) *">
            <input style={inputStyle} value={draft.venue_mk} onChange={(e) => set({ venue_mk: e.target.value })} placeholder="Национална галерија – Чифте Амам" />
          </Field>
          <Field label="Venue (EN)">
            <input style={inputStyle} value={draft.venue || ''} onChange={(e) => set({ venue: e.target.value })} placeholder="National Gallery – Cifte Amam" />
          </Field>
          <Field label="Organiser (MK)">
            <input style={inputStyle} value={draft.organizer_mk || ''} onChange={(e) => set({ organizer_mk: e.target.value })} />
          </Field>
          <Field label="Organiser (EN)">
            <input style={inputStyle} value={draft.organizer || ''} onChange={(e) => set({ organizer: e.target.value })} />
          </Field>
        </div>
        <Field label="Official link" hint={urlInvalid ? undefined : 'The organiser’s page about this exhibition'}>
          <input type="url" style={inputStyle} value={draft.official_url || ''} onChange={(e) => set({ official_url: e.target.value })} placeholder="https://" />
          {urlInvalid && <p style={{ ...hintStyle, color: '#c62828' }}>The link must start with https://</p>}
        </Field>
        <Field label="Address *" hint={`${ART_SCENE_PATH}/${draft.slug || '…'}`}>
          <input
            style={inputStyle}
            value={draft.slug}
            onChange={(e) => {
              setSlugTouched(true);
              setDraft((prev) => ({ ...prev, slug: generateSlug(e.target.value) || '' }));
            }}
            placeholder="irena-paskali-presek"
          />
        </Field>
      </div>

      {/* Photo */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <p style={groupTitle}>Photo</p>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          {draft.cover_image ? (
            <div style={{ position: 'relative' }}>
              <img src={draft.cover_image} alt="" style={{ width: '200px', aspectRatio: '4 / 3', objectFit: 'cover', borderRadius: '10px', display: 'block' }} />
              <button
                type="button"
                onClick={() => set({ cover_image: null })}
                aria-label="Remove photo"
                style={{ position: 'absolute', top: '6px', right: '6px', width: '28px', height: '28px', borderRadius: '50%', border: 'none', backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X style={{ width: '14px', height: '14px' }} />
              </button>
            </div>
          ) : (
            <div style={{ width: '200px', aspectRatio: '4 / 3', borderRadius: '10px', backgroundColor: '#EEE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ImageIcon style={{ width: '20px', height: '20px', color: '#BBB' }} />
            </div>
          )}
          <label
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              borderRadius: '10px',
              border: '1px dashed #CCCCCC',
              backgroundColor: '#FFFFFF',
              fontSize: '13px',
              color: '#666',
              cursor: uploading ? 'wait' : 'pointer',
              opacity: uploading ? 0.6 : 1,
            }}
          >
            <Plus style={{ width: '16px', height: '16px' }} />
            {uploading ? 'Uploading…' : draft.cover_image ? 'Replace photo' : 'Upload photo'}
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleUpload} disabled={uploading} style={{ display: 'none' }} />
          </label>
        </div>
        <div style={twoCols}>
          <Field label="Image description (MK)" hint="For Google and screen readers">
            <input style={inputStyle} value={draft.cover_alt_mk || ''} onChange={(e) => set({ cover_alt_mk: e.target.value })} placeholder="Ирена Паскали – изложбата „Пресек“ во Чифте Амам" />
          </Field>
          <Field label="Image description (EN)">
            <input style={inputStyle} value={draft.cover_alt || ''} onChange={(e) => set({ cover_alt: e.target.value })} />
          </Field>
          <Field label="Photo credit" hint="Required when the photo is someone else’s">
            <input style={inputStyle} value={draft.photo_credit || ''} onChange={(e) => set({ photo_credit: e.target.value })} />
          </Field>
        </div>
      </div>

      {/* Text */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <p style={groupTitle}>Text</p>
        <div style={twoCols}>
          <Field label="Short description (MK)" hint="1–2 sentences. Used when there is no longer text.">
            <textarea style={textareaStyle} value={draft.summary_mk || ''} onChange={(e) => set({ summary_mk: e.target.value })} />
          </Field>
          <Field label="Short description (EN)">
            <textarea style={textareaStyle} value={draft.summary || ''} onChange={(e) => set({ summary: e.target.value })} />
          </Field>
          <Field label="About the exhibition (MK)" hint="Our own text, not copied from the organiser. Empty line = new paragraph.">
            <textarea style={{ ...textareaStyle, minHeight: '160px' }} value={draft.content_mk || ''} onChange={(e) => set({ content_mk: e.target.value })} />
          </Field>
          <Field label="About the exhibition (EN)">
            <textarea style={{ ...textareaStyle, minHeight: '160px' }} value={draft.content || ''} onChange={(e) => set({ content: e.target.value })} />
          </Field>
          <Field label="About the artist (MK)">
            <textarea style={textareaStyle} value={draft.artist_bio_mk || ''} onChange={(e) => set({ artist_bio_mk: e.target.value })} />
          </Field>
          <Field label="About the artist (EN)">
            <textarea style={textareaStyle} value={draft.artist_bio || ''} onChange={(e) => set({ artist_bio: e.target.value })} />
          </Field>
          <Field label="Opening hours (MK)">
            <input style={inputStyle} value={draft.opening_hours_mk || ''} onChange={(e) => set({ opening_hours_mk: e.target.value })} placeholder="вторник – недела, 10–18 ч." />
          </Field>
          <Field label="Opening hours (EN)">
            <input style={inputStyle} value={draft.opening_hours || ''} onChange={(e) => set({ opening_hours: e.target.value })} />
          </Field>
          <Field label="Admission (MK)">
            <input style={inputStyle} value={draft.admission_mk || ''} onChange={(e) => set({ admission_mk: e.target.value })} placeholder="Слободен влез" />
          </Field>
          <Field label="Admission (EN)">
            <input style={inputStyle} value={draft.admission || ''} onChange={(e) => set({ admission: e.target.value })} />
          </Field>
        </div>
      </div>

      {/* SEO */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <p style={groupTitle}>Google (filled in automatically)</p>
          <button
            type="button"
            onClick={() => setShowSeo((v) => !v)}
            style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #E8E8E8', backgroundColor: '#FFFFFF', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
          >
            {showSeo ? 'Hide manual fields' : 'Edit manually'}
          </button>
        </div>
        {canPreview ? (
          <div style={{ border: '1px solid #EFEFEF', backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '12px', color: '#4d5156' }}>dysnomiagallery.com › art-scena › {draft.slug || '…'}</span>
            <span style={{ fontSize: '18px', color: '#1a0dab' }}>{exhibitionSeoTitle(previewRow, 'mk')}</span>
            <span style={{ fontSize: '13px', lineHeight: 1.5, color: '#4d5156' }}>{exhibitionSeoDescription(previewRow, 'mk')}</span>
          </div>
        ) : (
          <p style={{ fontSize: '13px', color: '#999' }}>Fill in title, artist and venue to see the Google preview.</p>
        )}
        {showSeo && (
          <div style={twoCols}>
            <Field label="Google title (MK)" hint="Empty = automatic">
              <input style={inputStyle} maxLength={120} value={draft.seo_title_mk || ''} onChange={(e) => set({ seo_title_mk: e.target.value })} />
            </Field>
            <Field label="Google title (EN)" hint="Empty = automatic">
              <input style={inputStyle} maxLength={120} value={draft.seo_title || ''} onChange={(e) => set({ seo_title: e.target.value })} />
            </Field>
            <Field label="Google description (MK)" hint="Empty = automatic, max 160 characters recommended">
              <textarea style={textareaStyle} maxLength={300} value={draft.seo_description_mk || ''} onChange={(e) => set({ seo_description_mk: e.target.value })} />
            </Field>
            <Field label="Google description (EN)" hint="Empty = automatic">
              <textarea style={textareaStyle} maxLength={300} value={draft.seo_description || ''} onChange={(e) => set({ seo_description: e.target.value })} />
            </Field>
          </div>
        )}
      </div>

      {(missing.length > 0 || notice?.type === 'error') && (
        <p style={{ fontSize: '13px', color: '#c62828' }}>
          {notice?.type === 'error' ? notice.text : `Required: ${missing.join(', ')}.`}
        </p>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => handleSave(true)}
          disabled={saving || missing.length > 0 || datesInvalid || urlInvalid}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 20px', borderRadius: '10px', border: 'none', backgroundColor: '#1a1a1a', color: '#FFFFFF', fontSize: '13px', fontWeight: 600, cursor: 'pointer', opacity: saving || missing.length > 0 || datesInvalid || urlInvalid ? 0.5 : 1 }}
        >
          <Eye style={{ width: '14px', height: '14px' }} />
          {saving ? 'Saving…' : 'Save & publish'}
        </button>
        <button
          type="button"
          onClick={() => handleSave(false)}
          disabled={saving || missing.length > 0 || datesInvalid || urlInvalid}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 20px', borderRadius: '10px', border: '1px solid #1a1a1a', backgroundColor: '#FFFFFF', color: '#1a1a1a', fontSize: '13px', fontWeight: 600, cursor: 'pointer', opacity: saving || missing.length > 0 || datesInvalid || urlInvalid ? 0.5 : 1 }}
        >
          <Save style={{ width: '14px', height: '14px' }} />
          Save as draft
        </button>
        <button
          type="button"
          onClick={close}
          style={{ padding: '10px 20px', borderRadius: '10px', border: '1px solid #E8E8E8', backgroundColor: '#FFFFFF', color: '#666', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}
        >
          Cancel
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1a1a1a', marginBottom: '4px' }}>Art Scena</h1>
          <p style={{ fontSize: '14px', color: '#777' }}>
            Exhibitions shown on{' '}
            <a href={ART_SCENE_PATH} target="_blank" rel="noopener noreferrer" style={{ color: '#1a1a1a' }}>
              {ART_SCENE_PATH}
            </a>
            . “On now”, “Coming soon” and “Ended” follow the dates automatically.
          </p>
        </div>
        {notice?.type === 'ok' && <span style={{ fontSize: '13px', color: '#2E7D32', fontWeight: 500 }}>{notice.text}</span>}
      </div>

      <AdminCard
        title={`Exhibitions (${exhibitions.length})`}
        action={
          !isAdding && !editingId ? (
            <button
              type="button"
              onClick={() => open(null)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#1a1a1a', color: '#FFFFFF', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
            >
              <Plus style={{ width: '14px', height: '14px' }} />
              Add exhibition
            </button>
          ) : undefined
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {isAdding && renderForm()}
          {error ? (
            <p style={{ padding: '20px', textAlign: 'center', fontSize: '14px', color: '#c62828' }}>
              {error}. Make sure migration 012_art_scena.sql has been applied.
            </p>
          ) : loading ? (
            <p style={{ padding: '20px', textAlign: 'center', fontSize: '14px', color: '#999' }}>Loading...</p>
          ) : exhibitions.length === 0 && !isAdding ? (
            <p style={{ padding: '20px', textAlign: 'center', fontSize: '14px', color: '#999' }}>
              No exhibitions yet. Click “Add exhibition” to create the first one.
            </p>
          ) : (
            exhibitions.map((row) => {
              if (editingId === row.id) return <div key={row.id}>{renderForm()}</div>;
              const rowStatus = exhibitionStatus(row);
              return (
                <div
                  key={row.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    borderRadius: '10px',
                    backgroundColor: '#FAFAFA',
                    border: '1px solid #E8E8E8',
                    opacity: row.is_published ? 1 : 0.7,
                  }}
                >
                  {row.cover_image ? (
                    <img src={row.cover_image} alt="" style={{ width: '56px', height: '42px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: '56px', height: '42px', borderRadius: '6px', backgroundColor: '#EEE', flexShrink: 0 }} />
                  )}
                  <button
                    type="button"
                    onClick={() => open(row)}
                    style={{ flex: 1, minWidth: 0, textAlign: 'left', background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    <p style={{ fontSize: '14px', color: '#1a1a1a', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {row.artist_mk} – „{row.title_mk}“
                    </p>
                    <p style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}>
                      {formatDateRange(row.start_date, row.end_date, 'mk')} · {row.venue_mk}
                    </p>
                  </button>
                  <span style={{ ...STATUS_COLORS[rowStatus], fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '20px', flexShrink: 0 }}>
                    {STATUS_LABEL[rowStatus]}
                  </span>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      padding: '4px 10px',
                      borderRadius: '20px',
                      flexShrink: 0,
                      backgroundColor: row.is_published ? '#E8F5E9' : '#FFF3E0',
                      color: row.is_published ? '#2E7D32' : '#E65100',
                    }}
                  >
                    {row.is_published ? 'Published' : 'Draft'}
                  </span>
                  {row.is_published && (
                    <a
                      href={`${ART_SCENE_PATH}/${row.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open on the site"
                      aria-label="Open on the site"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '8px', color: '#999' }}
                    >
                      <ExternalLink style={{ width: '16px', height: '16px' }} />
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => handleTogglePublish(row)}
                    title={row.is_published ? 'Unpublish' : 'Publish'}
                    aria-label={row.is_published ? 'Unpublish' : 'Publish'}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '8px', border: 'none', cursor: 'pointer', backgroundColor: row.is_published ? '#E8F5E9' : 'transparent', color: row.is_published ? '#4CAF50' : '#999' }}
                  >
                    {row.is_published ? <Eye style={{ width: '16px', height: '16px' }} /> : <EyeOff style={{ width: '16px', height: '16px' }} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(row)}
                    title="Delete"
                    aria-label="Delete"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '8px', border: 'none', cursor: 'pointer', backgroundColor: 'transparent', color: '#999' }}
                  >
                    <Trash2 style={{ width: '16px', height: '16px' }} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </AdminCard>
    </div>
  );
}
