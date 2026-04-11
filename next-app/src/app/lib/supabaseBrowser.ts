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
      "Do not put sb_secret_* in NEXT_PUBLIC_* variables. Use the publishable or anon public key from Supabase → Settings → API.",
    );
  }

  return value;
}

export function getSupabaseBrowserClient() {
  if (browserClient) {
    return browserClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!supabaseUrl) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL. (Server-only SUPABASE_URL is not available in the browser bundle.)",
    );
  }

  browserClient = createBrowserClient(supabaseUrl, getPublicSupabaseKey());
  return browserClient;
}
