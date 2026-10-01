import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { fetchAllRows } from '../lib/fetchAllRows';

/** Hard cap on raw page_views rows loaded for the charts. */
export const VISITOR_ROWS_CAP = 50_000;

interface PageViewRow {
  page_path: string;
  page_title: string | null;
  referrer: string | null;
  session_id: string;
  screen_width: number | null;
  created_at: string;
}

interface VisitorSummary {
  totalViews: number;
  uniqueVisitors: number;
  todayViews: number;
  todayVisitors: number;
}

interface DailyData {
  date: string;
  views: number;
  visitors: number;
}

interface PageData {
  path: string;
  title: string;
  views: number;
  visitors: number;
}

interface DeviceData {
  device: string;
  count: number;
}

interface ReferrerData {
  referrer: string;
  count: number;
}

interface VisitorStats {
  summary: VisitorSummary;
  viewsOverTime: DailyData[];
  popularPages: PageData[];
  deviceBreakdown: DeviceData[];
  topReferrers: ReferrerData[];
  /** True when the raw rows hit VISITOR_ROWS_CAP; charts then cover only the most recent rows. */
  truncated: boolean;
  /** Number of raw rows the charts are based on. */
  rowsLoaded: number;
}

function classifyDevice(width: number | null): string {
  if (!width) return 'Unknown';
  if (width < 768) return 'Mobile';
  if (width < 1024) return 'Tablet';
  return 'Desktop';
}

export function useVisitorStats(days: number = 30) {
  const [stats, setStats] = useState<VisitorStats>({
    summary: { totalViews: 0, uniqueVisitors: 0, todayViews: 0, todayVisitors: 0 },
    viewsOverTime: [],
    popularPages: [],
    deviceBreakdown: [],
    topReferrers: [],
    truncated: false,
    rowsLoaded: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const since = new Date();
      since.setDate(since.getDate() - days);
      const sinceISO = since.toISOString();
      // Fixed upper bound so rows inserted while paging don't shift the offsets
      const untilISO = new Date().toISOString();

      // Fetch summary RPC + raw rows in parallel. Raw rows are paged (PostgREST
      // returns max 1000 per request), newest first so a capped result keeps recent data.
      const [summaryResult, rowsResult] = await Promise.all([
        supabase.rpc('get_visitor_summary', { p_days: days }),
        fetchAllRows<PageViewRow>(
          (from, to) =>
            supabase
              .from('page_views')
              .select('page_path, page_title, referrer, session_id, screen_width, created_at')
              .gte('created_at', sinceISO)
              .lte('created_at', untilISO)
              .order('created_at', { ascending: false })
              .order('id', { ascending: false })
              .range(from, to),
          { maxRows: VISITOR_ROWS_CAP }
        ),
      ]);

      if (summaryResult.error) throw summaryResult.error;
      if (rowsResult.error) throw rowsResult.error;

      const summaryData = summaryResult.data as Record<string, number>;
      const summary: VisitorSummary = {
        totalViews: summaryData.total_views ?? 0,
        uniqueVisitors: summaryData.unique_visitors ?? 0,
        todayViews: summaryData.today_views ?? 0,
        todayVisitors: summaryData.today_visitors ?? 0,
      };

      const rows = rowsResult.data;

      // Group by date for viewsOverTime
      const dateMap = new Map<string, { views: number; sessions: Set<string> }>();
      for (const row of rows) {
        const date = row.created_at.slice(0, 10); // YYYY-MM-DD
        const entry = dateMap.get(date) || { views: 0, sessions: new Set<string>() };
        entry.views++;
        entry.sessions.add(row.session_id);
        dateMap.set(date, entry);
      }
      const viewsOverTime: DailyData[] = Array.from(dateMap.entries())
        .map(([date, v]) => ({
          date,
          views: v.views,
          visitors: v.sessions.size,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Group by page_path for popularPages
      const pageMap = new Map<string, { title: string; views: number; sessions: Set<string> }>();
      for (const row of rows) {
        const entry = pageMap.get(row.page_path) || { title: row.page_title || row.page_path, views: 0, sessions: new Set<string>() };
        entry.views++;
        entry.sessions.add(row.session_id);
        pageMap.set(row.page_path, entry);
      }
      const popularPages: PageData[] = Array.from(pageMap.entries())
        .map(([path, v]) => ({ path, title: v.title, views: v.views, visitors: v.sessions.size }))
        .sort((a, b) => b.views - a.views);

      // Device breakdown
      const deviceMap = new Map<string, number>();
      for (const row of rows) {
        const device = classifyDevice(row.screen_width);
        deviceMap.set(device, (deviceMap.get(device) || 0) + 1);
      }
      const deviceBreakdown: DeviceData[] = Array.from(deviceMap.entries())
        .map(([device, count]) => ({ device, count }))
        .sort((a, b) => b.count - a.count);

      // Top referrers
      const refMap = new Map<string, number>();
      for (const row of rows) {
        if (row.referrer) {
          const ref = row.referrer;
          refMap.set(ref, (refMap.get(ref) || 0) + 1);
        }
      }
      const topReferrers: ReferrerData[] = Array.from(refMap.entries())
        .map(([referrer, count]) => ({ referrer, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      setStats({
        summary,
        viewsOverTime,
        popularPages,
        deviceBreakdown,
        topReferrers,
        truncated: rowsResult.truncated,
        rowsLoaded: rows.length,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch visitor stats');
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
}
