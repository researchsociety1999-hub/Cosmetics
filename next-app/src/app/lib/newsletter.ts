import {
  escapeHtml,
  getContactNotificationEmail,
  isEmailConfigured,
  renderEmailLayout,
  sendEmail,
} from "./email";
import { hasSupabaseServiceEnv, supabaseAdmin } from "./supabaseClient";
import type { NewsletterSubscriber } from "./types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeNewsletterEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function validateNewsletterEmail(email: string): string | null {
  if (!email) {
    return "Enter your email address to join the Mystique newsletter.";
  }

  if (!EMAIL_PATTERN.test(email)) {
    return "Enter a valid email address.";
  }

  return null;
}

/** True when signup can run: Supabase admin (DB row) or Resend (notification email). */
export function isNewsletterBackendConfigured(): boolean {
  return Boolean(hasSupabaseServiceEnv && supabaseAdmin) || isEmailConfigured();
}

function requireAdminClient() {
  if (!supabaseAdmin || !hasSupabaseServiceEnv) {
    throw new Error("Supabase service role is not configured.");
  }

  return supabaseAdmin;
}

async function subscribeViaDatabase(
  email: string,
  source: string,
): Promise<{ status: "created" | "duplicate"; subscriber: NewsletterSubscriber | null }> {
  const client = requireAdminClient();
  const normalizedEmail = normalizeNewsletterEmail(email);
  const { data: existing, error: existingError } = await client
    .from("newsletter_subscribers")
    .select("*")
    .ilike("email", normalizedEmail)
    .limit(1)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (existing) {
    return {
      status: "duplicate",
      subscriber: existing as NewsletterSubscriber,
    };
  }

  const { data, error } = await client
    .from("newsletter_subscribers")
    .insert({
      email: normalizedEmail,
      source,
    })
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      return {
        status: "duplicate",
        subscriber: null,
      };
    }

    throw new Error(error.message);
  }

  return {
    status: "created",
    subscriber: data as NewsletterSubscriber,
  };
}

/** When the DB is unavailable, Resend notifies the studio. Duplicate emails are not deduped on this path. */
async function subscribeViaStudioEmail(
  email: string,
  source: string,
): Promise<{ status: "created"; subscriber: null }> {
  const normalizedEmail = normalizeNewsletterEmail(email);
  const html = renderEmailLayout({
    preview: "New Mystique newsletter signup",
    title: "Newsletter signup",
    body: `<p style="margin:0 0 12px;">A visitor joined the list from <strong>${escapeHtml(source)}</strong>.</p><p style="margin:0;"><strong>Email:</strong> ${escapeHtml(normalizedEmail)}</p>`,
  });
  await sendEmail({
    to: getContactNotificationEmail(),
    subject: "Mystique — new newsletter signup",
    html,
    text: `Newsletter signup\nSource: ${source}\nEmail: ${normalizedEmail}`,
    replyTo: normalizedEmail,
  });
  return { status: "created", subscriber: null };
}

export async function subscribeToNewsletter({
  email,
  source,
}: {
  email: string;
  source: string;
}): Promise<{ status: "created" | "duplicate"; subscriber: NewsletterSubscriber | null }> {
  if (hasSupabaseServiceEnv && supabaseAdmin) {
    return subscribeViaDatabase(email, source);
  }

  if (isEmailConfigured()) {
    return subscribeViaStudioEmail(email, source);
  }

  throw new Error("Supabase service role is not configured.");
}
