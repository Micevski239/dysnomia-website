import { useState } from 'react';
import { Send, FlaskConical, Mail, Palette } from 'lucide-react';
import AdminCard from './AdminCard';
import { useNewsletterCampaigns, type NewsletterDraft } from '../../hooks/useNewsletterCampaigns';

type Lang = 'mk' | 'en';

const EMPTY_DRAFT: NewsletterDraft = {
  subject_mk: '',
  body_mk: '',
  subject_en: '',
  body_en: '',
  image_url: '',
  button_url: '',
  button_label_mk: '',
  button_label_en: '',
  style: 'simple',
};

const inputClass =
  'w-full px-3.5 py-2.5 rounded-xl border border-[#E8E8E8] bg-white text-sm text-[#1a1a1a] outline-none transition-colors focus:border-[#1a1a1a] placeholder:text-[#bbb]';
const labelClass = 'block text-[12px] font-semibold text-[#555] mb-1.5';
const hintClass = 'mt-1 text-[12px] text-[#999]';

const STYLES: { value: NewsletterDraft['style']; label: string; hint: string; icon: typeof Mail }[] = [
  { value: 'simple', label: 'Simple letter', hint: 'Looks like a personal e-mail. Best chance to reach the main inbox.', icon: Mail },
  { value: 'designed', label: 'Designed', hint: 'Black Dysnomia banner and button. More likely to land in Promotions.', icon: Palette },
];

function paragraphs(body: string): string[] {
  return body
    .split(/\r?\n[ \t]*\r?\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

interface Props {
  /** Active subscribers, shown on the send button and in the confirmation. */
  activeCount: number;
  englishCount: number;
}

export default function NewsletterComposer({ activeCount, englishCount }: Props) {
  const { campaigns, loading, error: historyError, sendTest, send } = useNewsletterCampaigns();
  const [draft, setDraft] = useState<NewsletterDraft>(EMPTY_DRAFT);
  const [lang, setLang] = useState<Lang>('mk');
  const [busy, setBusy] = useState<'test' | 'send' | null>(null);
  const [notice, setNotice] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);

  const set = (patch: Partial<NewsletterDraft>) => setDraft((prev) => ({ ...prev, ...patch }));

  const hasEnglish = Boolean(draft.subject_en.trim() || draft.body_en.trim());
  const englishComplete = Boolean(draft.subject_en.trim() && draft.body_en.trim());
  const ready = Boolean(draft.subject_mk.trim() && draft.body_mk.trim()) && (!hasEnglish || englishComplete);

  const subject = lang === 'mk' ? draft.subject_mk : draft.subject_en;
  const body = lang === 'mk' ? draft.body_mk : draft.body_en;
  const buttonLabel = lang === 'mk' ? draft.button_label_mk : draft.button_label_en;

  // The preview mirrors what the server sends: English falls back to Macedonian.
  const previewEnglish = lang === 'en' && englishComplete;
  const previewSubject = (previewEnglish ? draft.subject_en : draft.subject_mk).trim();
  const previewBody = paragraphs(previewEnglish ? draft.body_en : draft.body_mk);
  const previewButton =
    (previewEnglish ? draft.button_label_en || draft.button_label_mk : draft.button_label_mk).trim() ||
    (previewEnglish ? 'View' : 'Погледни');
  const previewFooter = previewEnglish
    ? 'You are receiving this email because you signed up at dysnomiagallery.com.'
    : 'Ја добивате оваа порака затоа што се пријавивте на dysnomiagallery.com.';
  const previewUnsubscribe = previewEnglish ? 'Unsubscribe' : 'Одјави се';

  const handleTest = async () => {
    setBusy('test');
    setNotice(null);
    const result = await sendTest(draft);
    setNotice(
      result.success
        ? { type: 'ok', text: `Test sent to ${result.to}. Check how it looks before sending to everyone.` }
        : { type: 'error', text: result.error || 'The test could not be sent.' }
    );
    setBusy(null);
  };

  const handleSend = async () => {
    const englishNote =
      englishCount > 0 && !hasEnglish ? `\n\n${englishCount} English subscribers will get the Macedonian text.` : '';
    if (!window.confirm(`Send "${draft.subject_mk.trim()}" to ${activeCount} subscribers? This cannot be undone.${englishNote}`)) {
      return;
    }
    setBusy('send');
    setNotice(null);
    const result = await send(draft);
    if (result.success) {
      setNotice({
        type: result.failed ? 'error' : 'ok',
        text: result.failed
          ? `Sent to ${result.sent}, failed for ${result.failed}: ${result.error || 'unknown error'}`
          : `Sent to ${result.sent} subscribers.`,
      });
      setDraft(EMPTY_DRAFT);
      setLang('mk');
    } else {
      setNotice({ type: 'error', text: result.error || 'The newsletter could not be sent.' });
    }
    setBusy(null);
  };

  return (
    <>
      <AdminCard title="Send a newsletter" noPadding>
        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
          {/* ---------------- Form ---------------- */}
          <div className="flex flex-col gap-5 p-6 md:p-8">
            {/* Language tabs */}
            <div className="inline-flex self-start p-1 rounded-xl bg-[#F3F1EB]">
              {(['mk', 'en'] as Lang[]).map((l) => {
                const filled = l === 'mk' ? Boolean(draft.subject_mk.trim() && draft.body_mk.trim()) : englishComplete;
                return (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLang(l)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors ${
                      lang === l ? 'bg-white text-[#1a1a1a] shadow-sm' : 'text-[#777] hover:text-[#1a1a1a]'
                    }`}
                  >
                    {l === 'mk' ? 'Македонски' : 'English'}
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${filled ? 'bg-[#2E7D32]' : 'bg-[#ccc]'}`}
                      title={filled ? 'Written' : 'Empty'}
                    />
                  </button>
                );
              })}
            </div>
            <p className="-mt-3 text-[12px] text-[#999]">
              {lang === 'mk'
                ? 'Required. Every subscriber gets this version unless an English one is written.'
                : 'Optional. Leave empty and English subscribers get the Macedonian version.'}
            </p>

            <div>
              <label className={labelClass}>Subject</label>
              <input
                className={inputClass}
                value={subject}
                maxLength={150}
                onChange={(e) => set(lang === 'mk' ? { subject_mk: e.target.value } : { subject_en: e.target.value })}
                placeholder={lang === 'mk' ? 'Нова колекција во Dysnomia' : 'New collection at Dysnomia'}
              />
            </div>

            <div>
              <label className={labelClass}>Text</label>
              <textarea
                className={`${inputClass} min-h-[220px] leading-relaxed resize-y`}
                value={body}
                onChange={(e) => set(lang === 'mk' ? { body_mk: e.target.value } : { body_en: e.target.value })}
                placeholder={lang === 'mk' ? 'Здраво,\n\nОваа недела…' : 'Hello,\n\nThis week…'}
              />
              <p className={hintClass}>Leave an empty line between paragraphs.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Link text (optional)</label>
                <input
                  className={inputClass}
                  value={buttonLabel}
                  maxLength={60}
                  onChange={(e) => set(lang === 'mk' ? { button_label_mk: e.target.value } : { button_label_en: e.target.value })}
                  placeholder={lang === 'mk' ? 'Погледни ги новите дела' : 'See the new artworks'}
                />
              </div>
              <div>
                <label className={labelClass}>Link address (optional)</label>
                <input
                  className={inputClass}
                  type="url"
                  value={draft.button_url}
                  onChange={(e) => set({ button_url: e.target.value })}
                  placeholder="https://dysnomiagallery.com/new-arrivals"
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Image address (optional)</label>
              <input
                className={inputClass}
                type="url"
                value={draft.image_url}
                onChange={(e) => set({ image_url: e.target.value })}
                placeholder="https://…"
              />
              <p className={hintClass}>Shown at the top. E-mails without an image are more likely to reach the main inbox.</p>
            </div>

            <div>
              <span className={labelClass}>Look</span>
              <div className="grid gap-3 sm:grid-cols-2">
                {STYLES.map(({ value, label, hint, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => set({ style: value })}
                    aria-pressed={draft.style === value}
                    className={`text-left p-4 rounded-xl border transition-colors ${
                      draft.style === value ? 'border-[#1a1a1a] bg-[#FAFAFA]' : 'border-[#E8E8E8] hover:border-[#bbb]'
                    }`}
                  >
                    <span className="flex items-center gap-2 text-[13px] font-semibold text-[#1a1a1a]">
                      <Icon className="w-4 h-4" />
                      {label}
                    </span>
                    <span className="block mt-1 text-[12px] leading-snug text-[#777]">{hint}</span>
                  </button>
                ))}
              </div>
            </div>

            {hasEnglish && !englishComplete && (
              <p className="text-[13px] text-red-600">Fill in both the English subject and text, or leave both empty.</p>
            )}

            {notice && (
              <p
                role={notice.type === 'error' ? 'alert' : 'status'}
                className={`px-4 py-3 rounded-xl text-[13px] ${
                  notice.type === 'ok' ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'bg-red-50 text-red-700'
                }`}
              >
                {notice.text}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-5 border-t border-[#F0F0F0]">
              <button
                onClick={handleTest}
                disabled={!ready || busy !== null}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#1a1a1a] text-[#1a1a1a] text-[13px] font-semibold transition-opacity disabled:opacity-40"
              >
                <FlaskConical className="w-4 h-4" />
                {busy === 'test' ? 'Sending test…' : 'Send test to me'}
              </button>
              <button
                onClick={handleSend}
                disabled={!ready || busy !== null || activeCount === 0}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1a1a1a] text-white text-[13px] font-semibold transition-opacity disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
                {busy === 'send' ? 'Sending…' : `Send to ${activeCount} subscribers`}
              </button>
            </div>
          </div>

          {/* ---------------- Preview ---------------- */}
          <div className="p-6 md:p-8 bg-[#F3F1EB] border-t lg:border-t-0 lg:border-l border-[#E8E8E8]">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#999] mb-3">
              Preview · {previewEnglish ? 'English' : 'Macedonian'}
            </p>
            <div className="rounded-xl bg-white border border-[#E8E8E8] overflow-hidden">
              <div className="px-4 py-3 border-b border-[#F0F0F0]">
                <p className="text-[13px] font-semibold text-[#1a1a1a] truncate">{previewSubject || 'Subject'}</p>
                <p className="text-[12px] text-[#999]">Dysnomia Gallery</p>
              </div>

              {draft.style === 'designed' && (
                <div className="bg-[#0A0A0A] py-5 text-center font-serif text-[20px] tracking-[4px] text-[#FBBE63]">DYSNOMIA</div>
              )}
              {draft.image_url.trim() && (
                <img src={draft.image_url.trim()} alt="" className="block w-full h-auto" />
              )}

              <div className={`p-5 text-[13px] leading-relaxed text-[#333] ${draft.style === 'designed' ? 'font-serif' : ''}`}>
                {draft.style === 'designed' && previewSubject && (
                  <p className="text-[18px] text-[#0A0A0A] mb-3">{previewSubject}</p>
                )}
                {previewBody.length === 0 ? (
                  <p className="text-[#bbb]">The text of the newsletter appears here.</p>
                ) : (
                  previewBody.map((p, i) => (
                    <p key={i} className="mb-3 whitespace-pre-line break-words">
                      {p}
                    </p>
                  ))
                )}
                {draft.button_url.trim() &&
                  (draft.style === 'designed' ? (
                    <span className="inline-block mt-1 px-5 py-2.5 bg-[#0A0A0A] text-white font-sans text-[11px] tracking-[1.5px] uppercase">
                      {previewButton}
                    </span>
                  ) : (
                    <p className="mb-3 underline text-[#0A0A0A]">{previewButton}</p>
                  ))}
                {draft.style === 'simple' && (
                  <p className="mt-3">
                    Dysnomia Gallery
                    <br />
                    <span className="underline">dysnomiagallery.com</span>
                  </p>
                )}
              </div>

              <div className="px-5 py-4 border-t border-[#F0F0F0] text-[11px] leading-relaxed text-[#999]">
                {previewFooter} <span className="underline">{previewUnsubscribe}</span>
              </div>
            </div>
            <p className="mt-3 text-[12px] leading-snug text-[#999]">
              Every e-mail has its own unsubscribe link, and Gmail shows its own “Unsubscribe” button next to the sender.
            </p>
          </div>
        </div>
      </AdminCard>

      <AdminCard title="Sent newsletters">
        {historyError ? (
          <p className="p-5 text-center text-sm text-red-600">
            {historyError}. Make sure migration 011_newsletter_campaigns.sql has been applied.
          </p>
        ) : loading ? (
          <p className="p-5 text-center text-sm text-[#999]">Loading...</p>
        ) : campaigns.length === 0 ? (
          <p className="p-5 text-center text-sm text-[#999]">Nothing sent yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-[#999] border-b border-[#E8E8E8]">
                  <th className="py-2 pr-4">Subject</th>
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4">Sent</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => (
                  <tr key={c.id} className="border-b border-[#F2F2F2]">
                    <td className="py-2.5 pr-4 text-[#1a1a1a]">{c.subject_mk}</td>
                    <td className="py-2.5 pr-4 text-[#666]">{new Date(c.created_at).toLocaleString()}</td>
                    <td className="py-2.5 pr-4 text-[#666]">
                      {c.sent_count} / {c.recipients}
                    </td>
                    <td className="py-2.5">
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                          c.status === 'sent' && c.failed_count === 0
                            ? 'bg-[#E8F5E9] text-[#2E7D32]'
                            : c.status === 'sending'
                              ? 'bg-[#F5F5F5] text-[#999]'
                              : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {c.status === 'sending' ? 'Sending' : c.failed_count > 0 ? `${c.failed_count} failed` : 'Sent'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>
    </>
  );
}
