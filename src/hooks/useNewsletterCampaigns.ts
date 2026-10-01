import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface NewsletterCampaign {
  id: string;
  subject_mk: string;
  subject_en: string | null;
  status: 'sending' | 'sent' | 'failed';
  recipients: number;
  sent_count: number;
  failed_count: number;
  created_at: string;
}

export interface NewsletterDraft {
  subject_mk: string;
  body_mk: string;
  subject_en: string;
  body_en: string;
  image_url: string;
  button_url: string;
  button_label_mk: string;
  button_label_en: string;
}

interface SendResult {
  success: boolean;
  sent?: number;
  failed?: number;
  to?: string;
  error?: string;
}

export function useNewsletterCampaigns() {
  const [campaigns, setCampaigns] = useState<NewsletterCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [reloadKey, setReloadKey] = useState(0);
  const refetch = useCallback(() => setReloadKey((key) => key + 1), []);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from('newsletter_campaigns')
      .select('id, subject_mk, subject_en, status, recipients, sent_count, failed_count, created_at')
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data, error }) => {
        if (cancelled) return;
        setError(error ? error.message : null);
        setCampaigns((data as NewsletterCampaign[]) || []);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  // The send-newsletter function checks the admin role from the session token.
  const call = async (action: 'test' | 'send', campaign: NewsletterDraft): Promise<SendResult> => {
    try {
      const { data, error } = await supabase.functions.invoke('send-newsletter', { body: { action, campaign } });
      if (error) {
        // Non-2xx: the function still returns { success: false, error }
        const context = (error as { context?: Response }).context;
        const parsed = context ? await context.json().catch(() => null) : null;
        return { success: false, error: parsed?.error || error.message };
      }
      return data as SendResult;
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Request failed' };
    }
  };

  const sendTest = (campaign: NewsletterDraft) => call('test', campaign);

  const send = async (campaign: NewsletterDraft) => {
    const result = await call('send', campaign);
    refetch();
    return result;
  };

  return { campaigns, loading, error, sendTest, send };
}
