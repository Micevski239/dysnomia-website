import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface NewsletterSubscriber {
  id: string;
  email: string;
  language: 'en' | 'mk';
  status: 'subscribed' | 'unsubscribed';
  consent: boolean;
  consent_at: string | null;
  source: string;
  welcome_sent_at: string | null;
  provider_synced_at: string | null;
  unsubscribed_at: string | null;
  created_at: string;
}

const PAGE_SIZE = 1000;

export function useNewsletterSubscribers() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscribers = useCallback(async () => {
    setLoading(true);
    setError(null);
    // Page through the list so it is never silently cut at the 1000-row API limit
    const all: NewsletterSubscriber[] = [];
    for (let from = 0; ; from += PAGE_SIZE) {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('id, email, language, status, consent, consent_at, source, welcome_sent_at, provider_synced_at, unsubscribed_at, created_at')
        .order('created_at', { ascending: false })
        .range(from, from + PAGE_SIZE - 1);
      if (error) {
        setError(error.message);
        break;
      }
      all.push(...(data as NewsletterSubscriber[]));
      if (!data || data.length < PAGE_SIZE) break;
    }
    setSubscribers(all);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSubscribers();
  }, [fetchSubscribers]);

  const unsubscribe = async (id: string) => {
    const { error } = await supabase
      .from('newsletter_subscribers')
      .update({ status: 'unsubscribed', unsubscribed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', id);
    if (!error) await fetchSubscribers();
    return { error };
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from('newsletter_subscribers').delete().eq('id', id);
    if (!error) await fetchSubscribers();
    return { error };
  };

  return { subscribers, loading, error, refetch: fetchSubscribers, unsubscribe, remove };
}
