import { isEmailConfigured } from "./email";
import { isNewsletterBackendConfigured } from "./newsletter";
import {
  hasInvalidSupabasePublicKey,
  hasInvalidSupabaseUrl,
  hasSupabaseEnv,
  hasSupabasePublicEnv,
  hasSupabaseServiceEnv,
} from "./supabaseClient";
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
  newsletter: string[];
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

  if (!hasSupabasePublicEnv) {
    auth.push(
      "NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY (or PUBLISHABLE_KEY / SUPABASE_ANON_KEY) — required for magic-link sign-in, session cookies, and cart_items",
    );
  }

  if (hasSupabaseServiceEnv && !hasSupabasePublicEnv) {
    auth.push(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY — required for magic-link sessions and SSR cookies; service role alone cannot authenticate shoppers",
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
      "SUPABASE_SERVICE_ROLE_KEY — promo codes, newsletter inserts, and recommended for checkout/order writes (see repository root SUPABASE_SETUP.md)",
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

  const newsletter: string[] = [];
  if (!isNewsletterBackendConfigured()) {
    newsletter.push(
      "SUPABASE_SERVICE_ROLE_KEY (newsletter_subscribers table) or RESEND_API_KEY + RESEND_FROM_EMAIL (studio email fallback)",
    );
  }

  return {
    catalog: dedupe(catalog),
    auth: dedupe(auth),
    checkout: dedupe(checkout),
    supabaseServiceRole: dedupe(supabaseServiceRole),
    orderEmails: dedupe(orderEmails),
    contactForm: dedupe(contactForm.filter(Boolean)),
    stripeWebhooks: dedupe(stripeWebhooks),
    newsletter: dedupe(newsletter),
  };
}

export function getIntegrationReadiness(): {
  supabaseCatalog: boolean;
  supabaseAuth: boolean;
  stripeCheckout: boolean;
  stripeWebhooks: boolean;
  resendEmail: boolean;
  supabaseServiceRole: boolean;
  /** DB insert or Resend studio notification — see `newsletter.ts`. */
  newsletter: boolean;
} {
  return {
    supabaseCatalog: hasSupabaseEnv,
    supabaseAuth: hasSupabasePublicEnv,
    stripeCheckout: isStripeConfigured(),
    stripeWebhooks: isStripeWebhookConfigured(),
    resendEmail: isEmailConfigured(),
    supabaseServiceRole: hasSupabaseServiceEnv,
    newsletter: isNewsletterBackendConfigured(),
  };
}

function dedupe(list: string[]): string[] {
  return [...new Set(list)];
}
