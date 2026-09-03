import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// The cached-* edge functions serve public data through a service-role client —
// they never need the visitor's token. By default functions.invoke() sends the
// stored session access_token, and getSession() hands back an expired one without
// refreshing it, so the gateway rejects the call with 401. Pin the anon key.
export const PUBLIC_FUNCTION_HEADERS = {
  Authorization: `Bearer ${supabaseAnonKey}`,
};
