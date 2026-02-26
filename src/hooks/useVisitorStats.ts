import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

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

      // Fetch summary RPC + raw rows in parallel
      const [summaryResult, rowsResult] = await Promise.all([
        supabase.rpc('get_visitor_summary', { p_days: days }),
        supabase
          .from('page_views')
          .select('page_path, page_title, referrer, session_id, screen_width, created_at')
          .gte('created_at', sinceISO)
          .order('created_at', { ascending: true }),
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

      const rows = rowsResult.data || [];

      // Group by date for viewsOverTime
      const dateMap = new Map<string, { views: number; sessions: Set<string> }>();
      for (const row of rows) {
        const date = row.created_at.slice(0, 10); // YYYY-MM-DD
        const entry = dateMap.get(date) || { views: 0, sessions: new Set<string>() };
        entry.views++;
        entry.sessions.add(row.session_id);
        dateMap.set(date, entry);
      }
      const viewsOverTime: DailyData[] = Array.from(dateMap.entries()).map(([date, v]) => ({
        date,
        views: v.views,
        visitors: v.sessions.size,
      }));

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

      setStats({ summary, viewsOverTime, popularPages, deviceBreakdown, topReferrers });
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
