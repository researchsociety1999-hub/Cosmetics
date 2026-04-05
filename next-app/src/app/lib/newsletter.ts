import { supabase } from "./supabaseClient";
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

function requireAdminClient() {
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  return supabase;
}

export async function subscribeToNewsletter({
  email,
  source,
}: {
  email: string;
  source: string;
}): Promise<{ status: "created" | "duplicate"; subscriber: NewsletterSubscriber | null }> {
  const client = requireAdminClient();
  const normalizedEmail = normalizeNewsletterEmail(email);
  const existing = await client
    .from("newsletter_subscribers")
    .select("*")
    .ilike("email", normalizedEmail)
    .limit(1)
    .maybeSingle();

  if (existing.data) {
    return {
      status: "duplicate",
      subscriber: existing.data as NewsletterSubscriber,
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
