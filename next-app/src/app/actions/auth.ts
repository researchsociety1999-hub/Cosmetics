"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getSafeNextPath } from "../lib/authRedirect";
import { getConfiguredSiteUrl } from "../lib/siteUrl";
import { createSupabaseServerClient } from "../lib/supabaseServer";

function normalizeField(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

function buildOrigin(forwardedOrigin: string | null, host: string | null) {
  if (forwardedOrigin) {
    return forwardedOrigin.replace(/\/$/, "");
  }

  if (host) {
    const protocol = host.includes("localhost") ? "http" : "https";
    return `${protocol}://${host}`;
  }

  return getConfiguredSiteUrl();
}

function formatAuthErrorMessage(message: string) {
  const normalized = message.trim().toLowerCase();

  if (normalized === "fetch failed") {
    return "We can't reach the sign-in service right now. Check your connection and try again.";
  }

  if (normalized.includes("error sending confirmation email")) {
    return "We couldn't send the sign-in email. Try again in a few minutes, or contact support if it keeps happening.";
  }

  if (normalized.includes("email rate limit exceeded")) {
    return "Too many magic-link emails have been requested recently. Wait a few minutes and try again.";
  }

  if (normalized.includes("signups not allowed") && normalized.includes("otp")) {
    return "Account sign-up isn’t available right now. You can still shop as a guest, or sign in if you already have an account.";
  }

  return message;
}

export async function requestMagicLinkAction(formData: FormData): Promise<void> {
  const email = normalizeField(formData.get("email"));
  const nextPath = getSafeNextPath(
    normalizeField(formData.get("next")) || undefined,
    "/account",
  );
  const mode = normalizeField(formData.get("mode")) === "signup" ? "signup" : "login";
  const statusPath = mode === "signup" ? "/account/signup" : "/account/login";

  if (!email) {
    redirect(`${statusPath}?status=missing-email`);
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect(`${statusPath}?status=not-configured`);
  }

  const headerStore = await headers();
  const origin = buildOrigin(
    headerStore.get("origin"),
    headerStore.get("host"),
  );
  const callbackUrl = new URL("/auth/confirm", origin);
  callbackUrl.searchParams.set("next", nextPath);

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: callbackUrl.toString(),
      shouldCreateUser: mode === "signup",
    },
  });

  if (error) {
    console.error("Magic link request failed", {
      email,
      message: error.message,
      status: error.status,
      name: error.name,
    });
    redirect(
      `${statusPath}?status=error&message=${encodeURIComponent(formatAuthErrorMessage(error.message))}`,
    );
  }

  redirect(
    `${statusPath}?status=check-email&email=${encodeURIComponent(email)}&next=${encodeURIComponent(nextPath)}`,
  );
}

export async function signOutAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();

  if (supabase) {
    await supabase.auth.signOut();
  }

  redirect("/");
}
