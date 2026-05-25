/**
 * Singleton Supabase client used by every Supabase module.
 *
 * IMPORTANT: mystique-sync is a back-office tool. We use the **service role**
 * key (SUPABASE_KEY in .env) so we can write protected columns and bypass RLS.
 * Never ship this client to the browser.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { loadEnv } from "../../config/env.js";

let cached: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (cached) return cached;
  const env = loadEnv();
  cached = createClient(env.supabaseUrl, env.supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: { "X-Client-Info": "mystique-sync/1.0" },
    },
  });
  return cached;
}

/** Test-only: drop the cached client. */
export function resetSupabaseForTests(): void {
  cached = null;
}
