import { createClient } from "@supabase/supabase-js";
import { getStripeServerClient, isStripeServerConfigured } from "./stripe";

/** Read-only Stripe ping (no charges). */
export async function probeStripeApi(): Promise<{
  ok: boolean;
  livemode: boolean | null;
  error: string | null;
}> {
  if (!isStripeServerConfigured()) {
    return { ok: false, livemode: null, error: "STRIPE_SECRET_KEY not set" };
  }

  try {
    const stripe = getStripeServerClient();
    const balance = await stripe.balance.retrieve();
    return { ok: true, livemode: balance.livemode, error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, livemode: null, error: message };
  }
}

/**
 * Resend API reachability (domains list). Does not send email.
 * @see https://resend.com/docs/api-reference/domains/list-domains
 */
export async function probeResendApi(): Promise<{
  ok: boolean;
  error: string | null;
}> {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) {
    return { ok: false, error: "RESEND_API_KEY not set" };
  }

  try {
    const response = await fetch("https://api.resend.com/domains", {
      method: "GET",
      headers: { Authorization: `Bearer ${key}` },
    });

    if (!response.ok) {
      const body = await response.text();
      return {
        ok: false,
        error: `HTTP ${response.status}: ${body.slice(0, 200)}`,
      };
    }

    return { ok: true, error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, error: message };
  }
}

/** Supabase anon (or fallback) read of published products — matches storefront RLS. */
export async function probeSupabaseCatalog(): Promise<{
  ok: boolean;
  count: number | null;
  error: string | null;
}> {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? process.env.SUPABASE_URL?.trim();
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ??
    process.env.SUPABASE_ANON_KEY?.trim();

  if (!url || !anonKey) {
    return {
      ok: false,
      count: null,
      error: "Missing NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) and anon/publishable key",
    };
  }

  if (anonKey.startsWith("sb_secret_")) {
    return {
      ok: false,
      count: null,
      error: "Anon slot contains sb_secret_* — use publishable/anon key for catalog probe",
    };
  }

  try {
    const supabase = createClient(url, anonKey);
    const { count, error } = await supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("is_published", true);

    if (error) {
      return {
        ok: false,
        count: null,
        error: `${error.message} (${error.code ?? "no code"})`,
      };
    }

    return { ok: true, count: count ?? 0, error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, count: null, error: message };
  }
}
