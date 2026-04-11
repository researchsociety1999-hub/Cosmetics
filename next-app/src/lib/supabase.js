// Shared Supabase JS client — import as `@/lib/supabase`.
//
// This repo also uses `@/app/lib/supabaseClient` (anon + explicit admin),
// `@/app/lib/supabaseServer` (cookie auth on the server), and
// `@/app/lib/supabaseBrowser` (Client Components). Prefer those for catalog,
// cart, and auth; use this module when you want a single default export.
import { createClient } from "@supabase/supabase-js";

// Public values (client-side bundle and most server reads)
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.SUPABASE_ANON_KEY;

// Server-only service role (API routes, scripts — never exposed to the browser)
const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;

// Server: service role when available; browser: anon (or publishable) key only
const clientKey =
  typeof window === "undefined" && serviceRoleKey
    ? serviceRoleKey
    : supabaseAnonKey;

if (!supabaseUrl || !clientKey) {
  throw new Error(
    "Missing Supabase env: set NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) and NEXT_PUBLIC_SUPABASE_ANON_KEY (or publishable key); service role is optional on the server.",
  );
}

export const supabase = createClient(supabaseUrl, clientKey);
