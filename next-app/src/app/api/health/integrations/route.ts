import { NextResponse } from "next/server";
import {
  getIntegrationReadiness,
  getMissingIntegrationEnv,
} from "../../../lib/integrationEnv";
import {
  hasInvalidSupabasePublicKey,
  hasInvalidSupabaseUrl,
  hasSupabaseEnv,
  hasSupabasePublicEnv,
  hasSupabaseServiceEnv,
  resolvedSupabaseUrl,
  supabase,
} from "../../../lib/supabaseClient";

export const dynamic = "force-dynamic";

/**
 * Non-secret integration snapshot for debugging (enable in dev or set ENABLE_INTEGRATION_HEALTH=1).
 */
export async function GET() {
  if (
    process.env.NODE_ENV === "production" &&
    process.env.ENABLE_INTEGRATION_HEALTH !== "1"
  ) {
    return new NextResponse(null, { status: 404 });
  }

  const stripeSecret = Boolean(process.env.STRIPE_SECRET_KEY);
  const stripePublishable = Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
  const resend = Boolean(process.env.RESEND_API_KEY);

  let productsProbe: {
    ok: boolean;
    count: number | null;
    error: string | null;
  } = { ok: false, count: null, error: null };

  if (hasSupabaseEnv && supabase) {
    const { count, error } = await supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("is_published", true);

    if (error) {
      productsProbe = {
        ok: false,
        count: null,
        error: `${error.message} (${error.code ?? "no code"})`,
      };
    } else {
      productsProbe = { ok: true, count: count ?? 0, error: null };
    }
  } else {
    productsProbe = {
      ok: false,
      count: null,
      error: "Supabase client not configured (check URL + anon or service key).",
    };
  }

  const missingEnv = getMissingIntegrationEnv();
  const readiness = getIntegrationReadiness();

  return NextResponse.json({
    supabase: {
      urlConfigured: Boolean(resolvedSupabaseUrl),
      invalidUrl: hasInvalidSupabaseUrl,
      publicKeyConfigured: hasSupabasePublicEnv,
      invalidPublicKeySlot: hasInvalidSupabasePublicKey,
      serviceRoleConfigured: hasSupabaseServiceEnv,
      clientReady: hasSupabaseEnv,
      productsPublishedCount: productsProbe,
    },
    stripe: {
      secretConfigured: stripeSecret,
      publishableConfigured: stripePublishable,
    },
    resend: {
      apiKeyConfigured: resend,
    },
    readiness,
    missingEnv,
    envTemplate: "Copy next-app/.env.example to next-app/.env.local (gitignored) and fill values.",
    hints: [
      "Storefront reads `products` with `is_published = true` only.",
      "If count is 0, publish rows in Supabase or set `is_published` to true.",
      "If productsProbe shows an error, check RLS: anon needs SELECT on `products` (see SUPABASE_SETUP.md).",
      "missingEnv lists variable *names* still unset — no secrets in this response.",
    ],
  });
}
