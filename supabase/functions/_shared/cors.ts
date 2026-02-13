const ALLOWED_ORIGINS = [
  'https://dysnomia.art',
  'https://www.dysnomia.art',
];

// In development, also allow localhost
if (Deno.env.get('ENVIRONMENT') !== 'production') {
  ALLOWED_ORIGINS.push('http://localhost:5173', 'http://localhost:4173');
}

export function getCorsHeaders(request?: Request): Record<string, string> {
  const origin = request?.headers.get('origin') ?? '';
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  };
}

// Backwards-compatible export for existing usage
export const corsHeaders = getCorsHeaders();
