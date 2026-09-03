import { getCorsHeaders } from '../_shared/cors.ts';
import { getCache, setCache } from '../_shared/redis.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CACHE_KEY = 'products:all';
const TTL = 300; // 5 minutes

Deno.serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Try cache first
    try {
      const cached = await getCache(CACHE_KEY);
      if (cached !== null) {
        return new Response(JSON.stringify(cached), {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'X-Cache': 'HIT',
          },
        });
      }
    } catch {
      // Redis unavailable — fall through to Supabase
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data, error } = await supabase
      .from('products')
      .select(
        'id, title, title_mk, slug, description, description_mk, price, image_url, status, created_at, updated_at'
      )
      .in('status', ['published', 'sold'])
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Store in cache (best-effort)
    try {
      await setCache(CACHE_KEY, data, TTL);
    } catch {
      // Redis write failure is non-critical
    }

    return new Response(JSON.stringify(data), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'X-Cache': 'MISS',
      },
    });
  } catch (err) {
    console.error('cached-products error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
