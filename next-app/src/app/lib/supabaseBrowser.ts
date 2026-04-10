"use client";

import { createBrowserClient } from "@supabase/ssr";

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

function getPublicSupabaseKey() {
  const value =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!value) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  if (value.startsWith("sb_secret_")) {
    throw new Error(
      "Do not put the Supabase secret key in NEXT_PUBLIC_* variables. Use the anon (public) key from Supabase → Settings → API → Project API keys.",
    );
  }

  return value;
}

export function getSupabaseBrowserClient() {
  if (browserClient) {
    return browserClient;
  }

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;

  if (!supabaseUrl) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL.");
  }

  browserClient = createBrowserClient(supabaseUrl, getPublicSupabaseKey());
  return browserClient;
}
