import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Browser-safe values only: the anon key is public by design; the service-role key never belongs here.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let client: SupabaseClient | null = null;

export const supabaseEnabled = Boolean(url && anonKey);

export function getSupabase(): SupabaseClient | null {
  if (!supabaseEnabled) return null;
  if (!client) client = createClient(url!, anonKey!, { auth: { persistSession: true, autoRefreshToken: true } });
  return client;
}
