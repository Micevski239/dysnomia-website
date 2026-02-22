import { getCorsHeaders } from '../_shared/cors.ts';
import { getCache, setCache } from '../_shared/redis.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const TTL = 300; // 5 minutes

Deno.serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Extract slug from query string or POST body
    let slug: string | null = null;

    const url = new URL(req.url);
    slug = url.searchParams.get('slug');

    if (!slug && req.method === 'POST') {
      const body = await req.json();
      slug = body.slug;
    }

    if (!slug) {
      return new Response(
        JSON.stringify({ error: 'Missing slug parameter' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const cacheKey = `product:${slug}`;

    // Try cache first
    try {
      const cached = await getCache(cacheKey);
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
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      const status = error.code === 'PGRST116' ? 404 : 500;
      return new Response(
        JSON.stringify({ error: status === 404 ? 'Product not found' : error.message }),
        {
          status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Store in cache (best-effort)
    try {
      await setCache(cacheKey, data, TTL);
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
    console.error('cached-product error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
