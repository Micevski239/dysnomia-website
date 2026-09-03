import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface Announcement {
  id: string;
  text: string;
  text_mk?: string | null;
  highlight: string;
  highlight_mk?: string | null;
  suffix: string;
  suffix_mk?: string | null;
  link: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export function useAnnouncements(activeOnly = false) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('announcements')
      .select('*')
      .order('sort_order', { ascending: true });

    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (!error && data) {
      setAnnouncements(data);
    }
    setLoading(false);
  }, [activeOnly]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const addAnnouncement = async (announcement: Omit<Announcement, 'id' | 'created_at'>) => {
    const { error } = await supabase.from('announcements').insert(announcement);
    if (!error) await fetchAnnouncements();
    return { error };
  };

  const updateAnnouncement = async (id: string, updates: Partial<Announcement>) => {
    const { error } = await supabase.from('announcements').update(updates).eq('id', id);
    if (!error) await fetchAnnouncements();
    return { error };
  };

  const deleteAnnouncement = async (id: string) => {
    const { error } = await supabase.from('announcements').delete().eq('id', id);
    if (!error) await fetchAnnouncements();
    return { error };
  };

  return {
    announcements,
    loading,
    refetch: fetchAnnouncements,
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
  };
}
