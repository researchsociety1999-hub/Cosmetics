/**
 * Inspects the runtime environment for whether each operational subsystem is
 * configured. Never reads or returns secret VALUES — only "configured: yes/no".
 *
 * Designed for the admin Settings page so an operator can quickly see why a
 * given subsystem might be misbehaving (e.g. chat returning 503) without ever
 * exposing key material to the browser.
 */

export type ConfigItemStatus = "ok" | "missing" | "partial";

export interface ConfigItem {
  /** Short human label. */
  label: string;
  status: ConfigItemStatus;
  /** Short explanation: what's missing, what's optional, what's wired up. */
  note: string;
  /** Names of env vars this item depends on. Values are never read for display. */
  envVars: ReadonlyArray<string>;
}

export interface ConfigGroup {
  label: string;
  items: ConfigItem[];
}

function has(envVar: string): boolean {
  return Boolean(process.env[envVar]?.trim());
}

function anyOf(envVars: string[]): boolean {
  return envVars.some((v) => has(v));
}

function statusForRequired(required: string[]): ConfigItemStatus {
  const present = required.filter((v) => has(v));
  if (present.length === required.length) return "ok";
  if (present.length === 0) return "missing";
  return "partial";
}

export function getAdminConfigGroups(): ConfigGroup[] {
  // Supabase: accepts either NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL,
  // and either ANON or PUBLISHABLE on the public side.
  const supabaseUrlOk = anyOf(["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_URL"]);
  const supabaseAnonOk = anyOf([
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_ANON_KEY",
  ]);
  const supabaseServiceOk = anyOf([
    "SUPABASE_SECRET_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
  ]);

  const supabaseDb: ConfigItem = {
    label: "Database URL",
    status: supabaseUrlOk ? "ok" : "missing",
    note: supabaseUrlOk
      ? "Supabase URL is set."
      : "Set NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL).",
    envVars: ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_URL"],
  };

  const supabasePublicKey: ConfigItem = {
    label: "Public (anon) key",
    status: supabaseAnonOk ? "ok" : "missing",
    note: supabaseAnonOk
      ? "Browser client is configured for RLS-gated reads."
      : "Set NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    envVars: [
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    ],
  };

  const supabaseServiceKey: ConfigItem = {
    label: "Service-role key",
    status: supabaseServiceOk ? "ok" : "missing",
    note: supabaseServiceOk
      ? "Admin queries can use the service-role client (server-only)."
      : "Required for admin dashboards: set SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY.",
    envVars: ["SUPABASE_SECRET_KEY", "SUPABASE_SERVICE_ROLE_KEY"],
  };

  const stripeSecret: ConfigItem = {
    label: "Stripe secret key",
    status: has("STRIPE_SECRET_KEY") ? "ok" : "missing",
    note: has("STRIPE_SECRET_KEY")
      ? "Server can create Checkout sessions and read payments."
      : "Set STRIPE_SECRET_KEY to enable checkout + payment lookups.",
    envVars: ["STRIPE_SECRET_KEY"],
  };

  const stripeWebhook: ConfigItem = {
    label: "Stripe webhook secret",
    status: has("STRIPE_WEBHOOK_SECRET") ? "ok" : "missing",
    note: has("STRIPE_WEBHOOK_SECRET")
      ? "Webhook signature verification is configured."
      : "Set STRIPE_WEBHOOK_SECRET so order-paid events can be trusted.",
    envVars: ["STRIPE_WEBHOOK_SECRET"],
  };

  const stripePublishable: ConfigItem = {
    label: "Stripe publishable key",
    status: has("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY") ? "ok" : "missing",
    note: has("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY")
      ? "Storefront can mount the Payment Element."
      : "Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY for client-side Stripe.",
    envVars: ["NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"],
  };

  const chatApiKey: ConfigItem = {
    label: "Chat API key",
    status: has("OPENROUTER_API_KEY") ? "ok" : "missing",
    note: has("OPENROUTER_API_KEY")
      ? "OpenRouter client can authenticate."
      : "Set OPENROUTER_API_KEY to enable the Ritual Companion.",
    envVars: ["OPENROUTER_API_KEY"],
  };

  const chatModel: ConfigItem = {
    label: "Chat model",
    status: has("OPENROUTER_MODEL") ? "ok" : "missing",
    note: has("OPENROUTER_MODEL")
      ? "A specific OpenRouter model is selected."
      : "Set OPENROUTER_MODEL (e.g. anthropic/claude-3.5-sonnet) for the chat route.",
    envVars: ["OPENROUTER_MODEL"],
  };

  const adminPassword: ConfigItem = {
    label: "Admin password",
    status: has("MYSTIQUE_ADMIN_PASSWORD") ? "ok" : "missing",
    note: has("MYSTIQUE_ADMIN_PASSWORD")
      ? "Password gate is active."
      : "Set MYSTIQUE_ADMIN_PASSWORD to enable /admin login.",
    envVars: ["MYSTIQUE_ADMIN_PASSWORD"],
  };

  const adminSecret: ConfigItem = {
    label: "Admin session secret",
    status: statusForRequired(["MYSTIQUE_ADMIN_SECRET"]),
    note: has("MYSTIQUE_ADMIN_SECRET")
      ? "Session cookies are signed with HMAC-SHA256."
      : "Set MYSTIQUE_ADMIN_SECRET (≥32 random chars) to sign session cookies.",
    envVars: ["MYSTIQUE_ADMIN_SECRET"],
  };

  const siteUrl: ConfigItem = {
    label: "Public site URL",
    status: has("NEXT_PUBLIC_SITE_URL") ? "ok" : "partial",
    note: has("NEXT_PUBLIC_SITE_URL")
      ? "Canonical URLs and Stripe redirects use the configured origin."
      : "Optional but recommended — defaults to a hard-coded fallback otherwise.",
    envVars: ["NEXT_PUBLIC_SITE_URL"],
  };

  return [
    {
      label: "Database (Supabase)",
      items: [supabaseDb, supabasePublicKey, supabaseServiceKey],
    },
    {
      label: "Payments (Stripe)",
      items: [stripeSecret, stripeWebhook, stripePublishable],
    },
    {
      label: "Chatbot (OpenRouter)",
      items: [chatApiKey, chatModel],
    },
    {
      label: "Admin auth",
      items: [adminPassword, adminSecret],
    },
    {
      label: "Site",
      items: [siteUrl],
    },
  ];
}
