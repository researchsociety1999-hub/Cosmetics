import {
  hasInvalidSupabasePublicKey,
  hasInvalidSupabaseUrl,
  hasSupabaseEnv,
  hasSupabasePublicEnv,
  hasSupabaseServiceEnv,
} from "./supabaseClient";
import { isEmailConfigured } from "./email";
import { isStripeConfigured, isStripeWebhookConfigured } from "./stripe";

/**
 * Variable *names* only (no secrets) — for `/api/health/integrations` and docs.
 */
export function getMissingIntegrationEnv(): {
  catalog: string[];
  auth: string[];
  checkout: string[];
  /** Service role: promo validation, newsletter DB, recommended for orders/checkout. */
  supabaseServiceRole: string[];
  orderEmails: string[];
  contactForm: string[];
  stripeWebhooks: string[];
} {
  const catalog: string[] = [];
  const auth: string[] = [];

  if (hasInvalidSupabaseUrl) {
    catalog.push("NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL (invalid URL)");
  } else if (!process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() && !process.env.SUPABASE_URL?.trim()) {
    catalog.push("NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL");
  }

  if (hasInvalidSupabasePublicKey) {
    catalog.push(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY — must be the anon JWT, not sb_secret_* (use SUPABASE_SERVICE_ROLE_KEY for service role)",
    );
  } else if (!hasSupabasePublicEnv && !hasSupabaseServiceEnv) {
    catalog.push(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, or SUPABASE_ANON_KEY (or SUPABASE_SERVICE_ROLE_KEY for server-only client)",
    );
  }

  if (!hasSupabaseEnv) {
    auth.push(
      "Same Supabase URL + anon (or service) as above — required for sign-in and cart_items",
    );
  }

  const checkout: string[] = [];
  if (!process.env.STRIPE_SECRET_KEY?.trim()) {
    checkout.push("STRIPE_SECRET_KEY");
  }
  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim()) {
    checkout.push("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY");
  }

  const supabaseServiceRole: string[] = [];
  if (!hasSupabaseServiceEnv) {
    supabaseServiceRole.push(
      "SUPABASE_SERVICE_ROLE_KEY — promo codes, newsletter inserts, and recommended for checkout/order writes (see SUPABASE_SETUP.md)",
    );
  }

  const orderEmails: string[] = [];
  if (!process.env.RESEND_API_KEY?.trim()) {
    orderEmails.push("RESEND_API_KEY");
  }
  if (!process.env.RESEND_FROM_EMAIL?.trim()) {
    orderEmails.push("RESEND_FROM_EMAIL");
  }

  const contactForm: string[] = [];
  if (!isEmailConfigured()) {
    contactForm.push("RESEND_API_KEY", "RESEND_FROM_EMAIL");
  }

  const stripeWebhooks: string[] = [];
  if (!isStripeWebhookConfigured()) {
    stripeWebhooks.push("STRIPE_WEBHOOK_SECRET (plus endpoint /api/stripe/webhook in Stripe Dashboard)");
  }

  return {
    catalog: dedupe(catalog),
    auth: dedupe(auth),
    checkout: dedupe(checkout),
    supabaseServiceRole: dedupe(supabaseServiceRole),
    orderEmails: dedupe(orderEmails),
    contactForm: dedupe(contactForm.filter(Boolean)),
    stripeWebhooks: dedupe(stripeWebhooks),
  };
}

export function getIntegrationReadiness(): {
  supabaseCatalog: boolean;
  supabaseAuth: boolean;
  stripeCheckout: boolean;
  stripeWebhooks: boolean;
  resendEmail: boolean;
  supabaseServiceRole: boolean;
} {
  return {
    supabaseCatalog: hasSupabaseEnv,
    supabaseAuth: hasSupabasePublicEnv,
    stripeCheckout: isStripeConfigured(),
    stripeWebhooks: isStripeWebhookConfigured(),
    resendEmail: isEmailConfigured(),
    supabaseServiceRole: hasSupabaseServiceEnv,
  };
}

function dedupe(list: string[]): string[] {
  return [...new Set(list)];
}
