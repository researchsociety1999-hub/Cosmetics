"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
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

  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export async function requestMagicLinkAction(formData: FormData): Promise<void> {
  const email = normalizeField(formData.get("email"));
  const nextPath = normalizeField(formData.get("next")) || "/account/login?status=confirmed";
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
      shouldCreateUser: true,
    },
  });

  if (error) {
    console.error("Magic link request failed", {
      email,
      message: error.message,
      status: error.status,
      name: error.name,
    });
    redirect(`${statusPath}?status=error`);
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
