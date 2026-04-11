import { NextResponse } from "next/server";
import {
  getIntegrationReadiness,
  getMissingIntegrationEnv,
} from "../../../lib/integrationEnv";
import {
  probeResendApi,
  probeStripeApi,
  probeSupabaseCatalog,
} from "../../../lib/integrationProbes";
import {
  hasInvalidSupabasePublicKey,
  hasInvalidSupabaseUrl,
  hasSupabaseEnv,
  hasSupabasePublicEnv,
  hasSupabaseServiceEnv,
  resolvedSupabaseUrl,
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

  const [productsProbe, stripeProbe, resendProbe] = await Promise.all([
    hasSupabasePublicEnv || hasSupabaseServiceEnv
      ? probeSupabaseCatalog()
      : Promise.resolve({
          ok: false,
          count: null,
          error:
            "Supabase anon/publishable not configured (need URL + anon key for catalog probe).",
        }),
    stripeSecret ? probeStripeApi() : Promise.resolve(null),
    resend ? probeResendApi() : Promise.resolve(null),
  ]);

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
      apiProbe: stripeProbe ?? { skipped: true as const },
    },
    resend: {
      apiKeyConfigured: resend,
      apiProbe: resendProbe ?? { skipped: true as const },
    },
    /** Live checks (Stripe balance, Resend domains, Supabase anon count). */
    probes: {
      supabaseCatalog: productsProbe,
      stripe: stripeProbe ?? { skipped: true as const },
      resend: resendProbe ?? { skipped: true as const },
    },
    readiness,
    missingEnv,
    envTemplate: "Copy next-app/.env.example to next-app/.env.local (gitignored) and fill values.",
    hints: [
      "Storefront reads `products` with `is_published = true` only.",
      "If count is 0, publish rows in Supabase or set `is_published` to true.",
      "If productsProbe shows an error, check RLS: anon needs SELECT on `products` (see repository root SUPABASE_SETUP.md).",
      "Magic links and cart sessions require `supabase.publicKeyConfigured` (anon/publishable). Service role alone is not enough for auth.",
      "missingEnv lists variable *names* still unset — no secrets in this response.",
      "probes.stripe uses a read-only Balance API call; probes.resend lists domains (no email sent).",
    ],
  });
}
