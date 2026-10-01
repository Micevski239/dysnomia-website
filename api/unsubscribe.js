/**
 * One-click newsletter unsubscribe (RFC 8058).
 *
 * Mail providers (Gmail, Yahoo…) show their own "Unsubscribe" button next to
 * the sender and call the URL from the List-Unsubscribe header with a POST and
 * no credentials. This endpoint forwards that to the `newsletter` edge function.
 * A person opening the same URL in a browser (GET) is sent to the /unsubscribe page.
 */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function handler(req, res) {
  const token = typeof req.query.token === 'string' ? req.query.token : '';
  if (!UUID_RE.test(token)) {
    res.status(400).json({ success: false, error: 'invalid_token' });
    return;
  }

  if (req.method === 'GET') {
    res.writeHead(302, { Location: `/unsubscribe?token=${token}` });
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    res.status(405).json({ success: false, error: 'Method not allowed' });
    return;
  }

  const base = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  if (!base || !key) {
    res.status(500).json({ success: false, error: 'server_error' });
    return;
  }

  try {
    const response = await fetch(`${base}/functions/v1/newsletter`, {
      method: 'POST',
      headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'unsubscribe', token }),
    });
    res.status(response.ok ? 200 : response.status).json({ success: response.ok });
  } catch {
    res.status(502).json({ success: false, error: 'server_error' });
  }
}
