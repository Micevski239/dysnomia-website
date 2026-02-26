import { useState } from 'react';
import { useVisitorStats } from '../../hooks/useVisitorStats';
import { AdminCard, StatsCard, DataTable } from '../../components/admin';
import type { Column } from '../../components/admin';
import { Eye, Users, TrendingUp, UserCheck } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const ACCENT = '#FBBE63';
const ACCENT_SECONDARY = '#3498DB';

const rangeBtnBase: React.CSSProperties = {
  padding: '8px 20px',
  borderRadius: '10px',
  fontSize: '13px',
  fontWeight: 600,
  border: '1px solid #E5E5E5',
  cursor: 'pointer',
  transition: 'all 0.15s',
};

interface PageRow {
  path: string;
  title: string;
  views: number;
  visitors: number;
}

interface DeviceRow {
  device: string;
  count: number;
}

interface ReferrerRow {
  referrer: string;
  count: number;
}

const pageColumns: Column<PageRow>[] = [
  {
    key: 'path',
    header: 'Page',
    sortable: true,
    sortKey: 'path',
    render: (row) => (
      <div>
        <p style={{ fontWeight: 600, color: '#1a1a1a' }}>{row.title}</p>
        <p style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}>{row.path}</p>
      </div>
    ),
  },
  {
    key: 'views',
    header: 'Views',
    sortable: true,
    sortKey: 'views',
    align: 'right',
    width: '100px',
    render: (row) => <span style={{ fontWeight: 600 }}>{row.views.toLocaleString()}</span>,
  },
  {
    key: 'visitors',
    header: 'Visitors',
    sortable: true,
    sortKey: 'visitors',
    align: 'right',
    width: '100px',
    render: (row) => row.visitors.toLocaleString(),
  },
];

const referrerColumns: Column<ReferrerRow>[] = [
  {
    key: 'referrer',
    header: 'Referrer',
    sortable: true,
    sortKey: 'referrer',
    render: (row) => {
      try {
        return new URL(row.referrer).hostname;
      } catch {
        return row.referrer;
      }
    },
  },
  {
    key: 'count',
    header: 'Views',
    sortable: true,
    sortKey: 'count',
    align: 'right',
    width: '100px',
    render: (row) => <span style={{ fontWeight: 600 }}>{row.count.toLocaleString()}</span>,
  },
];

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function Statistics() {
  const [days, setDays] = useState(30);
  const { stats, loading } = useVisitorStats(days);
  const { summary, viewsOverTime, popularPages, deviceBreakdown, topReferrers } = stats;

  const chartData = viewsOverTime.map((d) => ({
    ...d,
    label: formatDate(d.date),
  }));

  const maxDevice = deviceBreakdown.length > 0 ? deviceBreakdown[0].count : 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <p style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#999999', marginBottom: '8px', fontWeight: 600 }}>
            Analytics
          </p>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '36px', fontWeight: 500, color: '#0A0A0A' }}>
            Visitor Statistics
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[7, 30, 90].map((range) => (
            <button
              key={range}
              onClick={() => setDays(range)}
              style={{
                ...rangeBtnBase,
                backgroundColor: days === range ? '#0A0A0A' : '#FFFFFF',
                color: days === range ? '#FFFFFF' : '#666666',
                borderColor: days === range ? '#0A0A0A' : '#E5E5E5',
              }}
            >
              {range}d
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
        <StatsCard
          title="Total Views"
          value={summary.totalViews.toLocaleString()}
          subtitle={`Last ${days} days`}
          icon={<Eye style={{ width: '24px', height: '24px' }} />}
          loading={loading}
          accentColor={ACCENT}
        />
        <StatsCard
          title="Unique Visitors"
          value={summary.uniqueVisitors.toLocaleString()}
          subtitle={`Last ${days} days`}
          icon={<Users style={{ width: '24px', height: '24px' }} />}
          loading={loading}
          accentColor={ACCENT_SECONDARY}
        />
        <StatsCard
          title="Today's Views"
          value={summary.todayViews.toLocaleString()}
          icon={<TrendingUp style={{ width: '24px', height: '24px' }} />}
          loading={loading}
          accentColor="#27AE60"
        />
        <StatsCard
          title="Today's Visitors"
          value={summary.todayVisitors.toLocaleString()}
          icon={<UserCheck style={{ width: '24px', height: '24px' }} />}
          loading={loading}
          accentColor="#9B59B6"
        />
      </div>

      {/* Views Over Time Chart */}
      <AdminCard title="Views Over Time">
        {loading ? (
          <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                border: '3px solid #E5E5E5',
                borderTopColor: ACCENT,
                borderRadius: '50%',
              }}
              className="animate-spin"
            />
          </div>
        ) : chartData.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#999', padding: '60px 0' }}>No data for this period</p>
        ) : (
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={ACCENT} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={ACCENT} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="visitorsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={ACCENT_SECONDARY} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={ACCENT_SECONDARY} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 12, fill: '#999' }}
                  tickLine={false}
                  axisLine={{ stroke: '#E8E8E8' }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#999' }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #E8E8E8',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    fontSize: '13px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="views"
                  stroke={ACCENT}
                  strokeWidth={2}
                  fill="url(#viewsGrad)"
                  name="Views"
                />
                <Area
                  type="monotone"
                  dataKey="visitors"
                  stroke={ACCENT_SECONDARY}
                  strokeWidth={2}
                  fill="url(#visitorsGrad)"
                  name="Visitors"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </AdminCard>

      {/* Popular Pages + Device Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <AdminCard title="Popular Pages" noPadding>
          <DataTable<PageRow>
            columns={pageColumns}
            data={popularPages}
            keyExtractor={(row) => row.path}
            loading={loading}
            pageSize={8}
            emptyState={
              <p style={{ textAlign: 'center', color: '#999', padding: '40px 0' }}>No page data yet</p>
            }
          />
        </AdminCard>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <AdminCard title="Device Breakdown">
            {loading ? (
              <div style={{ height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    border: '3px solid #E5E5E5',
                    borderTopColor: ACCENT,
                    borderRadius: '50%',
                  }}
                  className="animate-spin"
                />
              </div>
            ) : deviceBreakdown.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#999', padding: '40px 0' }}>No data</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {deviceBreakdown.map((d: DeviceRow) => (
                  <div key={d.device}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a' }}>{d.device}</span>
                      <span style={{ fontSize: '13px', color: '#888' }}>{d.count.toLocaleString()}</span>
                    </div>
                    <div style={{ height: '8px', borderRadius: '4px', backgroundColor: '#F0F0F0', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          borderRadius: '4px',
                          backgroundColor: d.device === 'Desktop' ? ACCENT : d.device === 'Mobile' ? ACCENT_SECONDARY : '#27AE60',
                          width: `${(d.count / maxDevice) * 100}%`,
                          transition: 'width 0.3s',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </AdminCard>

          <AdminCard title="Top Referrers" noPadding>
            <DataTable<ReferrerRow>
              columns={referrerColumns}
              data={topReferrers}
              keyExtractor={(row) => row.referrer}
              loading={loading}
              pageSize={5}
              emptyState={
                <p style={{ textAlign: 'center', color: '#999', padding: '40px 0' }}>No referrer data yet</p>
              }
            />
          </AdminCard>
        </div>
      </div>
    </div>
  );
}
