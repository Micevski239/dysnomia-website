import { getCorsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * Newsletter sign-up and unsubscribe.
 *
 * POST { action: 'subscribe', email, consent: true, language: 'mk' | 'en', website? }
 * POST { action: 'unsubscribe', token }
 *
 * - Stores the subscriber in public.newsletter_subscribers (migration 009).
 * - Sends a bilingual welcome email via Resend with an unsubscribe link.
 * - Optionally syncs to Brevo (set BREVO_API_KEY + BREVO_LIST_ID secrets).
 *   Mailchimp or another tool can be added in syncSubscribe/syncUnsubscribe.
 * - Responses never reveal whether an email was already on the list.
 */

const SITE_URL = 'https://dysnomiagallery.com';
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const RATE_LIMIT_PER_HOUR = 5;

const CONSENT_TEXT = {
  mk: 'Се согласувам да добивам понуди и новости од Dysnomia Gallery по е-пошта. Можам да се одјавам во секое време.',
  en: 'I agree to receive offers and news from Dysnomia Gallery by email. I can unsubscribe at any time.',
};

type Lang = 'mk' | 'en';

function json(body: unknown, status: number, headers: Record<string, string>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json' },
  });
}

function welcomeEmail(language: Lang, unsubscribeUrl: string) {
  const t = language === 'mk'
    ? {
        subject: 'Добредојдовте во Dysnomia Gallery',
        heading: 'Ви благодариме што се пријавивте',
        body: 'Отсега први ќе дознавате за новите уметнички дела, колекциите и специјалните понуди на Dysnomia Gallery.',
        cta: 'Разгледај ги делата',
        footer: 'Ја добивате оваа порака затоа што се пријавивте на dysnomiagallery.com.',
        unsubscribe: 'Одјави се',
      }
    : {
        subject: 'Welcome to Dysnomia Gallery',
        heading: 'Thank you for subscribing',
        body: 'You will be the first to hear about new artworks, collections and special offers from Dysnomia Gallery.',
        cta: 'Browse the artworks',
        footer: 'You are receiving this email because you signed up at dysnomiagallery.com.',
        unsubscribe: 'Unsubscribe',
      };

  const html = `<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#f6f3ed;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f6f3ed;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;">
        <tr><td style="background:#0A0A0A;padding:28px;text-align:center;">
          <span style="font-family:Georgia,serif;font-size:26px;letter-spacing:4px;color:#FBBE63;">DYSNOMIA</span>
        </td></tr>
        <tr><td style="padding:40px 36px;font-family:Georgia,serif;color:#333;">
          <h1 style="font-weight:normal;font-size:24px;color:#0A0A0A;margin:0 0 16px;">${t.heading}</h1>
          <p style="font-size:15px;line-height:1.7;margin:0 0 28px;">${t.body}</p>
          <a href="${SITE_URL}/new-arrivals" style="display:inline-block;background:#0A0A0A;color:#ffffff;text-decoration:none;padding:14px 28px;font-family:Arial,sans-serif;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;">${t.cta}</a>
        </td></tr>
        <tr><td style="padding:24px 36px;border-top:1px solid #eee;font-family:Arial,sans-serif;font-size:12px;color:#888;line-height:1.6;">
          ${t.footer}<br/>
          <a href="${unsubscribeUrl}" style="color:#888;">${t.unsubscribe}</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  return { subject: t.subject, html };
}

async function sendWelcome(email: string, language: Lang, token: string): Promise<boolean> {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  if (!apiKey) return false;
  const from = Deno.env.get('RESEND_NEWSLETTER_FROM') || Deno.env.get('RESEND_FROM_EMAIL') || 'DYSNOMIA <orders@dysnomia.art>';
  const unsubscribeUrl = `${SITE_URL}/unsubscribe?token=${token}`;
  const { subject, html } = welcomeEmail(language, unsubscribeUrl);

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: [email],
      subject,
      html,
      headers: {
        // One-click unsubscribe is a POST; api/unsubscribe.js handles it (www: the bare domain redirects)
        'List-Unsubscribe': `<https://www.dysnomiagallery.com/api/unsubscribe?token=${token}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
    }),
  });
  return res.ok;
}

async function syncSubscribe(email: string, language: Lang): Promise<boolean> {
  const apiKey = Deno.env.get('BREVO_API_KEY');
  const listId = Number(Deno.env.get('BREVO_LIST_ID'));
  if (!apiKey || !listId) return false;
  const res = await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: { 'api-key': apiKey, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      email,
      listIds: [listId],
      updateEnabled: true,
      attributes: { LANGUAGE: language },
    }),
  });
  return res.ok;
}

async function syncUnsubscribe(email: string): Promise<void> {
  const apiKey = Deno.env.get('BREVO_API_KEY');
  const listId = Number(Deno.env.get('BREVO_LIST_ID'));
  if (!apiKey || !listId) return;
  await fetch(`https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}`, {
    method: 'PUT',
    headers: { 'api-key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ unlinkListIds: [listId] }),
  });
}

Deno.serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ success: false, error: 'Method not allowed' }, 405, corsHeaders);

  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return json({ success: false, error: 'Invalid request' }, 400, corsHeaders);
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    // ---------------- Unsubscribe ----------------
    if (payload.action === 'unsubscribe') {
      const token = String(payload.token ?? '');
      if (!UUID_RE.test(token)) return json({ success: false, error: 'invalid_token' }, 400, corsHeaders);

      const { data: row } = await supabase
        .from('newsletter_subscribers')
        .select('id, email, status')
        .eq('unsubscribe_token', token)
        .maybeSingle();
      if (!row) return json({ success: false, error: 'invalid_token' }, 404, corsHeaders);

      if (row.status !== 'unsubscribed') {
        await supabase
          .from('newsletter_subscribers')
          .update({ status: 'unsubscribed', unsubscribed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
          .eq('id', row.id);
        try { await syncUnsubscribe(row.email); } catch { /* provider sync is best-effort */ }
      }
      return json({ success: true }, 200, corsHeaders);
    }

    // ---------------- Subscribe ----------------
    if (payload.action !== 'subscribe') return json({ success: false, error: 'Invalid action' }, 400, corsHeaders);

    // Honeypot: real visitors never fill the hidden "website" field
    if (payload.website) return json({ success: true }, 200, corsHeaders);

    const email = String(payload.email ?? '').trim().toLowerCase();
    const language: Lang = payload.language === 'en' ? 'en' : 'mk';
    if (!EMAIL_RE.test(email) || email.length > 254) {
      return json({ success: false, error: 'invalid_email' }, 400, corsHeaders);
    }
    if (payload.consent !== true) {
      return json({ success: false, error: 'consent_required' }, 400, corsHeaders);
    }

    // Rate limit per IP (reuses public.rate_limits from migration 004)
    const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';
    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from('rate_limits')
      .select('id', { count: 'exact', head: true })
      .eq('action', 'newsletter_subscribe')
      .eq('identifier', ip)
      .gte('created_at', since);
    if ((count ?? 0) >= RATE_LIMIT_PER_HOUR) {
      return json({ success: false, error: 'rate_limited' }, 429, corsHeaders);
    }
    await supabase.from('rate_limits').insert({ action: 'newsletter_subscribe', identifier: ip });

    const now = new Date().toISOString();
    const { data: existing } = await supabase
      .from('newsletter_subscribers')
      .select('id, status, unsubscribe_token')
      .eq('email', email)
      .maybeSingle();

    // Already subscribed: answer the same way, send nothing
    if (existing?.status === 'subscribed') return json({ success: true }, 200, corsHeaders);

    let token: string;
    let id: string;
    if (existing) {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .update({
          status: 'subscribed',
          language,
          consent: true,
          consent_at: now,
          consent_text: CONSENT_TEXT[language],
          unsubscribed_at: null,
          updated_at: now,
        })
        .eq('id', existing.id);
      if (error) throw error;
      token = existing.unsubscribe_token;
      id = existing.id;
    } else {
      const { data: inserted, error } = await supabase
        .from('newsletter_subscribers')
        .insert({
          email,
          language,
          consent: true,
          consent_at: now,
          consent_text: CONSENT_TEXT[language],
          source: typeof payload.source === 'string' ? payload.source.slice(0, 40) : 'footer',
        })
        .select('id, unsubscribe_token')
        .single();
      if (error) throw error;
      token = inserted.unsubscribe_token;
      id = inserted.id;
    }

    const [welcomeSent, synced] = await Promise.all([
      sendWelcome(email, language, token).catch(() => false),
      syncSubscribe(email, language).catch(() => false),
    ]);
    await supabase
      .from('newsletter_subscribers')
      .update({
        ...(welcomeSent ? { welcome_sent_at: now } : {}),
        ...(synced ? { provider_synced_at: now } : {}),
      })
      .eq('id', id);

    return json({ success: true }, 200, corsHeaders);
  } catch (err) {
    console.error('newsletter error', err);
    return json({ success: false, error: 'server_error' }, 500, corsHeaders);
  }
});
