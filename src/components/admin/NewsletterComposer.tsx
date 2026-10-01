import { useState } from 'react';
import { Send, FlaskConical } from 'lucide-react';
import AdminCard from './AdminCard';
import { useNewsletterCampaigns, type NewsletterDraft } from '../../hooks/useNewsletterCampaigns';

const EMPTY_DRAFT: NewsletterDraft = {
  subject_mk: '',
  body_mk: '',
  subject_en: '',
  body_en: '',
  image_url: '',
  button_url: '',
  button_label_mk: '',
  button_label_en: '',
};

const inputClass = 'w-full px-3 py-2 rounded-lg border border-[#E8E8E8] text-sm outline-none focus:border-[#1a1a1a]';
const labelClass = 'block text-[12px] font-semibold text-[#666] mb-1';

interface Props {
  /** Active subscribers per language, shown in the confirmation. */
  activeCount: number;
  englishCount: number;
}

export default function NewsletterComposer({ activeCount, englishCount }: Props) {
  const { campaigns, loading, error: historyError, sendTest, send } = useNewsletterCampaigns();
  const [draft, setDraft] = useState<NewsletterDraft>(EMPTY_DRAFT);
  const [busy, setBusy] = useState<'test' | 'send' | null>(null);
  const [notice, setNotice] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);

  const set = (patch: Partial<NewsletterDraft>) => setDraft((prev) => ({ ...prev, ...patch }));

  const hasEnglish = Boolean(draft.subject_en.trim() || draft.body_en.trim());
  const englishComplete = Boolean(draft.subject_en.trim() && draft.body_en.trim());
  const ready = Boolean(draft.subject_mk.trim() && draft.body_mk.trim()) && (!hasEnglish || englishComplete);

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
    } else {
      setNotice({ type: 'error', text: result.error || 'The newsletter could not be sent.' });
    }
    setBusy(null);
  };

  return (
    <>
      <AdminCard title="Send a newsletter">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-3">
            <p className="text-[13px] font-semibold text-[#1a1a1a]">Macedonian (required)</p>
            <div>
              <label className={labelClass}>Subject</label>
              <input
                className={inputClass}
                value={draft.subject_mk}
                maxLength={150}
                onChange={(e) => set({ subject_mk: e.target.value })}
                placeholder="Нова колекција во Dysnomia"
              />
            </div>
            <div>
              <label className={labelClass}>Text</label>
              <textarea
                className={`${inputClass} min-h-[200px]`}
                value={draft.body_mk}
                onChange={(e) => set({ body_mk: e.target.value })}
                placeholder="Leave an empty line between paragraphs."
              />
            </div>
            <div>
              <label className={labelClass}>Button text (optional)</label>
              <input
                className={inputClass}
                value={draft.button_label_mk}
                maxLength={60}
                onChange={(e) => set({ button_label_mk: e.target.value })}
                placeholder="Погледни"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-[13px] font-semibold text-[#1a1a1a]">English (optional)</p>
            <div>
              <label className={labelClass}>Subject</label>
              <input
                className={inputClass}
                value={draft.subject_en}
                maxLength={150}
                onChange={(e) => set({ subject_en: e.target.value })}
                placeholder="New collection at Dysnomia"
              />
            </div>
            <div>
              <label className={labelClass}>Text</label>
              <textarea
                className={`${inputClass} min-h-[200px]`}
                value={draft.body_en}
                onChange={(e) => set({ body_en: e.target.value })}
                placeholder="Empty = English subscribers get the Macedonian text."
              />
            </div>
            <div>
              <label className={labelClass}>Button text (optional)</label>
              <input
                className={inputClass}
                value={draft.button_label_en}
                maxLength={60}
                onChange={(e) => set({ button_label_en: e.target.value })}
                placeholder="View"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 mt-4">
          <div>
            <label className={labelClass}>Button link (optional, https://…)</label>
            <input
              className={inputClass}
              type="url"
              value={draft.button_url}
              onChange={(e) => set({ button_url: e.target.value })}
              placeholder="https://dysnomiagallery.com/new-arrivals"
            />
          </div>
          <div>
            <label className={labelClass}>Image link (optional, https://…)</label>
            <input
              className={inputClass}
              type="url"
              value={draft.image_url}
              onChange={(e) => set({ image_url: e.target.value })}
              placeholder="Shown at the top of the e-mail"
            />
          </div>
        </div>

        {hasEnglish && !englishComplete && (
          <p className="mt-3 text-[13px] text-red-600">Fill in both the English subject and text, or leave both empty.</p>
        )}

        {notice && (
          <p
            role={notice.type === 'error' ? 'alert' : 'status'}
            className={`mt-4 px-3 py-2 rounded-lg text-[13px] ${
              notice.type === 'ok' ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'bg-red-50 text-red-700'
            }`}
          >
            {notice.text}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3 mt-5">
          <button
            onClick={handleTest}
            disabled={!ready || busy !== null}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#1a1a1a] text-[#1a1a1a] text-[13px] font-semibold disabled:opacity-50"
          >
            <FlaskConical className="w-3.5 h-3.5" />
            {busy === 'test' ? 'Sending test…' : 'Send test to me'}
          </button>
          <button
            onClick={handleSend}
            disabled={!ready || busy !== null || activeCount === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1a1a1a] text-white text-[13px] font-semibold disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            {busy === 'send' ? 'Sending…' : `Send to ${activeCount} subscribers`}
          </button>
          <span className="text-[12px] text-[#999]">Every e-mail gets its own unsubscribe link.</span>
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
