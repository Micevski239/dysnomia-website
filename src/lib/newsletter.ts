import { supabase, PUBLIC_FUNCTION_HEADERS } from './supabase';

export type NewsletterError = 'invalid_email' | 'consent_required' | 'rate_limited' | 'invalid_token' | 'server_error';

interface NewsletterResult {
  success: boolean;
  error?: NewsletterError;
}

async function callNewsletter(body: Record<string, unknown>): Promise<NewsletterResult> {
  try {
    const { data, error } = await supabase.functions.invoke('newsletter', {
      body,
      headers: PUBLIC_FUNCTION_HEADERS,
    });
    if (error) {
      // Non-2xx: the function still returns { success: false, error: code }
      const context = (error as { context?: Response }).context;
      const parsed = context ? await context.json().catch(() => null) : null;
      return { success: false, error: parsed?.error || 'server_error' };
    }
    return data?.success ? { success: true } : { success: false, error: data?.error || 'server_error' };
  } catch {
    return { success: false, error: 'server_error' };
  }
}

export function subscribeToNewsletter(params: {
  email: string;
  consent: boolean;
  language: string;
  website?: string;
  source?: string;
}): Promise<NewsletterResult> {
  return callNewsletter({ action: 'subscribe', ...params });
}

export function unsubscribeFromNewsletter(token: string): Promise<NewsletterResult> {
  return callNewsletter({ action: 'unsubscribe', token });
}
