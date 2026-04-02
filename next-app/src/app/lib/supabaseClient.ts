import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function isValidHttpUrl(value: string | undefined): value is string {
  if (!value) {
    return false;
  }

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

const rawSupabaseUrl =
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey =
  process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
const rawSupabasePublicKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const hasSecretInPublicKeySlot = rawSupabasePublicKey?.startsWith("sb_secret_") ?? false;
const supabaseAnonKey = hasSecretInPublicKeySlot ? null : rawSupabasePublicKey;
const supabaseUrl = isValidHttpUrl(rawSupabaseUrl) ? rawSupabaseUrl : null;
const supabaseKey = supabaseServiceKey ?? supabaseAnonKey;

export const hasSupabaseEnv = Boolean(supabaseUrl && supabaseKey);
export const hasSupabasePublicEnv = Boolean(supabaseUrl && supabaseAnonKey);
export const hasInvalidSupabaseUrl = Boolean(rawSupabaseUrl && !supabaseUrl);
export const hasInvalidSupabasePublicKey = Boolean(
  rawSupabasePublicKey && hasSecretInPublicKeySlot,
);
export const resolvedSupabaseUrl = supabaseUrl;

export const supabase: SupabaseClient | null = hasSupabaseEnv
  ? createClient(supabaseUrl!, supabaseKey!)
  : null;
