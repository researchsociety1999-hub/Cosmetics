import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { hasSupabasePublicEnv, resolvedSupabaseUrl } from "./supabaseClient";

function getSupabaseUrl() {
  const value = resolvedSupabaseUrl;

  if (!value) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL.");
  }

  return value;
}

function getSupabaseAnonKey() {
  const value =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.SUPABASE_ANON_KEY;

  if (!value) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY / SUPABASE_ANON_KEY).",
    );
  }

  if (value.startsWith("sb_secret_")) {
    throw new Error(
      "Invalid key: sb_secret_* belongs in SUPABASE_SERVICE_ROLE_KEY only, not in NEXT_PUBLIC_*. Use the publishable or anon public key from Supabase → Settings → API.",
    );
  }

  return value;
}

export async function createSupabaseServerClient() {
  if (!hasSupabasePublicEnv) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options as CookieOptions);
          });
        } catch {
          // Server Components may read auth state without being able to write cookies.
        }
      },
    },
  });
}

export async function getAuthenticatedUser(): Promise<User | null> {
  try {
    const supabase = await createSupabaseServerClient();

    if (!supabase) {
      return null;
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.warn("[auth] getUser:", error.message);
      return null;
    }

    return user;
  } catch (e) {
    console.error("[auth] getAuthenticatedUser:", e);
    return null;
  }
}
