import { getCorsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * Sends a newsletter to every active subscriber. Admin only.
 *
 * POST { action: 'test', campaign }  → one copy per written language to the admin's own address
 * POST { action: 'send', campaign }  → to all subscribers with status = 'subscribed'
 *
 * campaign = { subject_mk, body_mk, subject_en?, body_en?, image_url?, button_url?,
 *              button_label_mk?, button_label_en?, style?: 'simple' | 'designed' }
 *
 * - Subscribers get the version in their language; when no English version is
 *   written, English subscribers get the Macedonian one.
 * - Every e-mail carries that subscriber's own unsubscribe link, plus the
 *   one-click List-Unsubscribe headers mail providers require from bulk senders.
 * - 'simple' looks like a personal letter (plain text on white); mail providers
 *   are less likely to file it under promotions than the 'designed' layout.
 * - Each send is recorded in public.newsletter_campaigns (migration 011).
 */

const SITE_URL = 'https://dysnomiagallery.com';
// One-click unsubscribe is a POST from the mail provider; the bare domain
// redirects to www, and a redirected POST is dropped.
const UNSUBSCRIBE_API = 'https://www.dysnomiagallery.com/api/unsubscribe';
const BATCH_SIZE = 100; // Resend batch limit
const BATCH_PAUSE_MS = 600; // Resend allows 2 requests per second
const PAGE_SIZE = 1000;

type Lang = 'mk' | 'en';

interface Campaign {
  subject_mk: string;
  body_mk: string;
  subject_en: string;
  body_en: string;
  image_url: string;
  button_url: string;
  button_label_mk: string;
  button_label_en: string;
  style: 'simple' | 'designed';
}

function json(body: unknown, status: number, headers: Record<string, string>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json' },
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function text(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

/** Only https links are allowed in the e-mail (no javascript:, data:, http:). */
function httpsUrl(value: unknown): string {
  const raw = text(value, 1000);
  if (!raw) return '';
  try {
    const url = new URL(raw);
    return url.protocol === 'https:' ? url.toString() : '';
  } catch {
    return '';
  }
}

function parseCampaign(input: unknown): Campaign {
  const c = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>;
  return {
    subject_mk: text(c.subject_mk, 150),
    body_mk: text(c.body_mk, 20000),
    subject_en: text(c.subject_en, 150),
    body_en: text(c.body_en, 20000),
    image_url: httpsUrl(c.image_url),
    button_url: httpsUrl(c.button_url),
    button_label_mk: text(c.button_label_mk, 60),
    button_label_en: text(c.button_label_en, 60),
    style: c.style === 'designed' ? 'designed' : 'simple',
  };
}

function paragraphs(body: string): string[] {
  return body
    .split(/\r?\n[ \t]*\r?\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/** Plain text → HTML paragraphs: blank line = new paragraph, single line break = <br>. */
function bodyToHtml(body: string): string {
  return paragraphs(body)
    .map((p) => `<p style="font-size:15px;line-height:1.7;margin:0 0 18px;">${escapeHtml(p).replace(/\r?\n/g, '<br/>')}</p>`)
    .join('');
}

/** Letter-like layout: no banner, no styled button, default fonts. */
function renderSimple(campaign: Campaign, v: ReturnType<typeof versionFor>, unsubscribeUrl: string): string {
  const image = campaign.image_url
    ? `<p style="margin:0 0 18px;"><img src="${escapeHtml(campaign.image_url)}" alt="" width="520" style="display:block;width:100%;max-width:520px;height:auto;border:0;"/></p>`
    : '';
  const link = campaign.button_url
    ? `<p style="font-size:15px;line-height:1.7;margin:0 0 18px;"><a href="${escapeHtml(campaign.button_url)}" style="color:#0A0A0A;">${escapeHtml(v.button)}</a></p>`
    : '';
  return `<!DOCTYPE html>
<html lang="${v.lang}"><body style="margin:0;padding:24px 16px;background:#ffffff;">
  <div style="max-width:520px;margin:0 auto;font-family:Arial,Helvetica,sans-serif;color:#222;">
    ${image}
    ${bodyToHtml(v.body)}
    ${link}
    <p style="font-size:15px;line-height:1.7;margin:0 0 28px;">Dysnomia Gallery<br/><a href="${SITE_URL}" style="color:#222;">dysnomiagallery.com</a></p>
    <p style="font-size:12px;line-height:1.6;color:#888;margin:0;">${v.footer} <a href="${unsubscribeUrl}" style="color:#888;">${v.unsubscribe}</a></p>
  </div>
</body></html>`;
}

/** Plain-text alternative, sent with every e-mail. */
function renderText(campaign: Campaign, v: ReturnType<typeof versionFor>, unsubscribeUrl: string): string {
  return [
    ...paragraphs(v.body),
    campaign.button_url ? `${v.button}: ${campaign.button_url}` : '',
    `Dysnomia Gallery\n${SITE_URL}`,
    `${v.footer}\n${v.unsubscribe}: ${unsubscribeUrl}`,
  ]
    .filter(Boolean)
    .join('\n\n');
}

function versionFor(campaign: Campaign, language: Lang) {
  const useEnglish = language === 'en' && campaign.subject_en && campaign.body_en;
  return useEnglish
    ? {
        lang: 'en' as Lang,
        subject: campaign.subject_en,
        body: campaign.body_en,
        button: campaign.button_label_en || campaign.button_label_mk || 'View',
        footer: 'You are receiving this email because you signed up at dysnomiagallery.com.',
        unsubscribe: 'Unsubscribe',
      }
    : {
        lang: 'mk' as Lang,
        subject: campaign.subject_mk,
        body: campaign.body_mk,
        button: campaign.button_label_mk || 'Погледни',
        footer: 'Ја добивате оваа порака затоа што се пријавивте на dysnomiagallery.com.',
        unsubscribe: 'Одјави се',
      };
}

function renderEmail(campaign: Campaign, language: Lang, unsubscribeUrl: string) {
  const v = versionFor(campaign, language);
  const text = renderText(campaign, v, unsubscribeUrl);
  if (campaign.style === 'simple') {
    return { subject: v.subject, html: renderSimple(campaign, v, unsubscribeUrl), text };
  }

  const image = campaign.image_url
    ? `<tr><td><img src="${escapeHtml(campaign.image_url)}" alt="" width="560" style="display:block;width:100%;max-width:560px;height:auto;border:0;"/></td></tr>`
    : '';
  const button = campaign.button_url
    ? `<a href="${escapeHtml(campaign.button_url)}" style="display:inline-block;background:#0A0A0A;color:#ffffff;text-decoration:none;padding:14px 28px;margin-top:10px;font-family:Arial,sans-serif;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;">${escapeHtml(v.button)}</a>`
    : '';

  const html = `<!DOCTYPE html>
<html lang="${v.lang}"><body style="margin:0;padding:0;background:#f6f3ed;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f6f3ed;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;">
        <tr><td style="background:#0A0A0A;padding:28px;text-align:center;">
          <a href="${SITE_URL}" style="font-family:Georgia,serif;font-size:26px;letter-spacing:4px;color:#FBBE63;text-decoration:none;">DYSNOMIA</a>
        </td></tr>
        ${image}
        <tr><td style="padding:40px 36px;font-family:Georgia,serif;color:#333;">
          <h1 style="font-weight:normal;font-size:24px;color:#0A0A0A;margin:0 0 20px;">${escapeHtml(v.subject)}</h1>
          ${bodyToHtml(v.body)}
          ${button}
        </td></tr>
        <tr><td style="padding:24px 36px;border-top:1px solid #eee;font-family:Arial,sans-serif;font-size:12px;color:#888;line-height:1.6;">
          ${v.footer}<br/>
          <a href="${unsubscribeUrl}" style="color:#888;">${v.unsubscribe}</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  return { subject: v.subject, html, text };
}

/** `token` is the subscriber's unsubscribe token; a test e-mail has none. */
function buildMessage(from: string, to: string, campaign: Campaign, language: Lang, token: string | null) {
  const unsubscribeUrl = token ? `${SITE_URL}/unsubscribe?token=${token}` : `${SITE_URL}/unsubscribe`;
  const { subject, html, text } = renderEmail(campaign, language, unsubscribeUrl);
  const replyTo = Deno.env.get('NEWSLETTER_REPLY_TO') || Deno.env.get('ADMIN_EMAIL');
  return {
    from,
    to: [to],
    subject,
    html,
    text,
    ...(replyTo ? { reply_to: replyTo } : {}),
    ...(token
      ? {
          headers: {
            'List-Unsubscribe': `<${UNSUBSCRIBE_API}?token=${token}>`,
            'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
          },
        }
      : {}),
  };
}

async function resendError(res: Response): Promise<string> {
  const data = await res.json().catch(() => null);
  return (data && typeof data.message === 'string' ? data.message : '') || `Resend error ${res.status}`;
}

Deno.serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ success: false, error: 'Method not allowed' }, 405, corsHeaders);

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    // ---------------- Admin only ----------------
    const token = (req.headers.get('Authorization') ?? '').replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return json({ success: false, error: 'Authentication required' }, 401, corsHeaders);

    const { data: role } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();
    if (!role) return json({ success: false, error: 'Admin access required' }, 403, corsHeaders);

    const payload = await req.json().catch(() => ({}));
    const campaign = parseCampaign(payload.campaign);
    if (!campaign.subject_mk || !campaign.body_mk) {
      return json({ success: false, error: 'The Macedonian subject and text are required.' }, 400, corsHeaders);
    }
    if (Boolean(campaign.subject_en) !== Boolean(campaign.body_en)) {
      return json({ success: false, error: 'Fill in both the English subject and text, or leave both empty.' }, 400, corsHeaders);
    }

    const apiKey = Deno.env.get('RESEND_API_KEY');
    if (!apiKey) return json({ success: false, error: 'RESEND_API_KEY is not set on the project.' }, 500, corsHeaders);
    const from = Deno.env.get('RESEND_NEWSLETTER_FROM') || Deno.env.get('RESEND_FROM_EMAIL') || 'DYSNOMIA <orders@dysnomia.art>';
    const resendHeaders = { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' };

    // ---------------- Test: only to the admin's own address ----------------
    if (payload.action === 'test') {
      if (!user.email) return json({ success: false, error: 'Your account has no e-mail address.' }, 400, corsHeaders);
      const languages: Lang[] = campaign.subject_en ? ['mk', 'en'] : ['mk'];
      const messages = languages.map((language) =>
        buildMessage(from, user.email!, campaign, language, null)
      );
      const res = await fetch('https://api.resend.com/emails/batch', {
        method: 'POST',
        headers: resendHeaders,
        body: JSON.stringify(messages),
      });
      if (!res.ok) return json({ success: false, error: await resendError(res) }, 502, corsHeaders);
      return json({ success: true, sent: messages.length, to: user.email }, 200, corsHeaders);
    }

    if (payload.action !== 'send') return json({ success: false, error: 'Invalid action' }, 400, corsHeaders);

    // ---------------- Send to all active subscribers ----------------
    // A second click (or a second admin) must not send the same newsletter twice.
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { data: running, error: runningError } = await supabase
      .from('newsletter_campaigns')
      .select('id')
      .eq('status', 'sending')
      .gte('created_at', tenMinutesAgo)
      .limit(1);
    if (runningError) {
      return json(
        { success: false, error: 'Newsletter history table is missing. Apply migration 011_newsletter_campaigns.sql.' },
        500,
        corsHeaders
      );
    }
    if (running && running.length > 0) {
      return json({ success: false, error: 'Another newsletter is being sent right now. Try again in a few minutes.' }, 409, corsHeaders);
    }

    const subscribers: { email: string; language: Lang; unsubscribe_token: string }[] = [];
    for (let offset = 0; ; offset += PAGE_SIZE) {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('email, language, unsubscribe_token')
        .eq('status', 'subscribed')
        .order('created_at', { ascending: true })
        .range(offset, offset + PAGE_SIZE - 1);
      if (error) throw error;
      subscribers.push(...(data ?? []));
      if (!data || data.length < PAGE_SIZE) break;
    }
    if (subscribers.length === 0) {
      return json({ success: false, error: 'There are no active subscribers.' }, 400, corsHeaders);
    }

    const { data: record, error: insertError } = await supabase
      .from('newsletter_campaigns')
      .insert({
        subject_mk: campaign.subject_mk,
        subject_en: campaign.subject_en || null,
        body_mk: campaign.body_mk,
        body_en: campaign.body_en || null,
        image_url: campaign.image_url || null,
        button_url: campaign.button_url || null,
        recipients: subscribers.length,
        created_by: user.id,
      })
      .select('id')
      .single();
    if (insertError) throw insertError;

    let sent = 0;
    let failed = 0;
    let lastError = '';
    for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
      const batch = subscribers.slice(i, i + BATCH_SIZE);
      const messages = batch.map((s) =>
        buildMessage(from, s.email, campaign, s.language === 'en' ? 'en' : 'mk', s.unsubscribe_token)
      );
      try {
        const res = await fetch('https://api.resend.com/emails/batch', {
          method: 'POST',
          headers: resendHeaders,
          body: JSON.stringify(messages),
        });
        if (res.ok) {
          sent += batch.length;
        } else {
          failed += batch.length;
          lastError = await resendError(res);
        }
      } catch (err) {
        failed += batch.length;
        lastError = err instanceof Error ? err.message : 'Network error';
      }
      if (i + BATCH_SIZE < subscribers.length) await new Promise((resolve) => setTimeout(resolve, BATCH_PAUSE_MS));
    }

    await supabase
      .from('newsletter_campaigns')
      .update({
        status: sent > 0 ? 'sent' : 'failed',
        sent_count: sent,
        failed_count: failed,
        finished_at: new Date().toISOString(),
      })
      .eq('id', record.id);

    if (sent === 0) return json({ success: false, error: lastError || 'Sending failed.' }, 502, corsHeaders);
    return json({ success: true, sent, failed, error: failed > 0 ? lastError : undefined }, 200, corsHeaders);
  } catch (err) {
    console.error('send-newsletter error', err);
    return json({ success: false, error: 'server_error' }, 500, corsHeaders);
  }
});
