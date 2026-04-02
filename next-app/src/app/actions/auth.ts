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
  const nextPath = normalizeField(formData.get("next")) || "/account/orders";

  if (!email) {
    redirect("/account/login?status=missing-email");
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect("/account/login?status=not-configured");
  }

  const headerStore = await headers();
  const origin = buildOrigin(
    headerStore.get("origin"),
    headerStore.get("host"),
  );
  const callbackUrl = new URL("/auth/callback", origin);
  callbackUrl.searchParams.set("next", nextPath);

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: callbackUrl.toString(),
    },
  });

  if (error) {
    console.error("Magic link request failed", {
      email,
      message: error.message,
      status: error.status,
      name: error.name,
    });
    redirect("/account/login?status=error");
  }

  redirect(`/account/login?status=check-email&email=${encodeURIComponent(email)}`);
}
