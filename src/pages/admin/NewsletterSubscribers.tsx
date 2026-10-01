import { useMemo, useState } from 'react';
import { Download, Trash2, UserMinus } from 'lucide-react';
import { AdminCard, NewsletterComposer } from '../../components/admin';
import { useNewsletterSubscribers, type NewsletterSubscriber } from '../../hooks/useNewsletterSubscribers';

type Filter = 'subscribed' | 'unsubscribed' | 'all';

function toCsv(rows: NewsletterSubscriber[]): string {
  const header = ['email', 'language', 'status', 'consent_at', 'source', 'created_at', 'unsubscribed_at'];
  const escape = (v: unknown) => {
    const s = v == null ? '' : String(v);
    // Quote everything and neutralise spreadsheet formulas
    return `"${(/^[=+\-@]/.test(s) ? `'${s}` : s).replace(/"/g, '""')}"`;
  };
  const lines = rows.map((r) =>
    [r.email, r.language, r.status, r.consent_at, r.source, r.created_at, r.unsubscribed_at].map(escape).join(',')
  );
  return [header.join(','), ...lines].join('\n');
}

export default function NewsletterSubscribers() {
  const { subscribers, loading, error, unsubscribe, remove } = useNewsletterSubscribers();
  const [filter, setFilter] = useState<Filter>('subscribed');
  const [search, setSearch] = useState('');

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return subscribers.filter(
      (s) => (filter === 'all' || s.status === filter) && (!q || s.email.toLowerCase().includes(q))
    );
  }, [subscribers, filter, search]);

  const active = subscribers.filter((s) => s.status === 'subscribed');
  const activeCount = active.length;
  const englishCount = active.filter((s) => s.language === 'en').length;

  const handleExport = () => {
    const blob = new Blob(['﻿' + toCsv(visible)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-[#1a1a1a] mb-1">Newsletter</h1>
        <p className="text-sm text-[#777]">
          {activeCount} active subscribers · sign-ups from the site forms. Write a newsletter below and send it to all of
          them, or export the list to CSV.
        </p>
      </div>

      <NewsletterComposer activeCount={activeCount} englishCount={englishCount} />

      <AdminCard
        title={`Subscribers (${visible.length})`}
        action={
          <button
            onClick={handleExport}
            disabled={visible.length === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1a1a1a] text-white text-[13px] font-semibold disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        }
      >
        <div className="flex flex-wrap gap-3 mb-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search email…"
            className="px-3 py-2 rounded-lg border border-[#E8E8E8] text-sm outline-none min-w-[220px]"
          />
          {(['subscribed', 'unsubscribed', 'all'] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-lg text-[13px] font-medium border ${
                filter === f ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]' : 'bg-white text-[#666] border-[#E8E8E8]'
              }`}
            >
              {f === 'subscribed' ? 'Active' : f === 'unsubscribed' ? 'Unsubscribed' : 'All'}
            </button>
          ))}
        </div>

        {error ? (
          <p className="p-5 text-center text-sm text-red-600">
            {error}. Make sure migration 009_october_2026_update.sql has been applied.
          </p>
        ) : loading ? (
          <p className="p-5 text-center text-sm text-[#999]">Loading...</p>
        ) : visible.length === 0 ? (
          <p className="p-5 text-center text-sm text-[#999]">No subscribers yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-[#999] border-b border-[#E8E8E8]">
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Lang</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Subscribed</th>
                  <th className="py-2 pr-4">Welcome</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody>
                {visible.map((s) => (
                  <tr key={s.id} className="border-b border-[#F2F2F2]">
                    <td className="py-2.5 pr-4 text-[#1a1a1a]">{s.email}</td>
                    <td className="py-2.5 pr-4 uppercase text-[#666]">{s.language}</td>
                    <td className="py-2.5 pr-4">
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                          s.status === 'subscribed' ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'bg-[#F5F5F5] text-[#999]'
                        }`}
                      >
                        {s.status === 'subscribed' ? 'Active' : 'Unsubscribed'}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 text-[#666]">{new Date(s.consent_at || s.created_at).toLocaleDateString()}</td>
                    <td className="py-2.5 pr-4 text-[#666]">{s.welcome_sent_at ? 'Sent' : '—'}</td>
                    <td className="py-2.5 text-right whitespace-nowrap">
                      {s.status === 'subscribed' && (
                        <button
                          onClick={() => unsubscribe(s.id)}
                          title="Mark as unsubscribed"
                          className="p-1.5 rounded-md text-[#999] hover:text-[#1a1a1a]"
                        >
                          <UserMinus className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (window.confirm(`Permanently delete ${s.email}?`)) remove(s.id);
                        }}
                        title="Delete (GDPR erase request)"
                        className="p-1.5 rounded-md text-[#999] hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>
    </div>
  );
}
