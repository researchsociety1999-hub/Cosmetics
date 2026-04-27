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
    return "New accounts are turned off in authentication settings (only existing customers can use email sign-in). You can still shop as a guest, or sign in with an account that already exists.";
  }

  return message;
}

function isSignupDisabledOtpError(message: string): boolean {
  const normalized = message.trim().toLowerCase();
  return normalized.includes("signups not allowed") && normalized.includes("otp");
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
      // Production-safe behavior:
      // - login: existing accounts only (works even when signups are disabled)
      // - signup: create new user (requires Supabase Email/OTP signups enabled)
      shouldCreateUser: mode === "signup",
    },
  });

  if (error) {
    const signupDisabled = isSignupDisabledOtpError(error.message);
    const hint = signupDisabled
      ? "Fix: Supabase Dashboard → Authentication → Sign In / Providers → Email → enable allowing new users (sign-ups). Redirect URLs must include your app origin + /auth/confirm. See SUPABASE_SETUP.md → Magic links & sign-up."
      : undefined;
    console.error("Magic link request failed", {
      email,
      message: error.message,
      status: error.status,
      name: error.name,
      hint,
    });

    // If signups are disabled and the shopper is on the login screen,
    // treat this as "no account found" (we don't want login to behave like login-or-signup).
    if (mode === "login" && signupDisabled) {
      redirect(`${statusPath}?status=no-account&email=${encodeURIComponent(email)}`);
    }
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
