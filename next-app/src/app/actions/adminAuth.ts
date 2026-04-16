"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  getAdminCookieName,
  isAdminConfigured,
  signAdminSession,
  verifyAdminSessionToken,
} from "../lib/adminSession";
import { getSafeNextPath } from "../lib/authRedirect";

const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export async function loginAdminAction(formData: FormData): Promise<void> {
  if (!isAdminConfigured()) {
    redirect("/admin/login?error=config");
  }

  const password = String(formData.get("password") ?? "");
  const expected = process.env.MYSTIQUE_ADMIN_PASSWORD?.trim() ?? "";
  const nextPath = getSafeNextPath(
    String(formData.get("next") || "").trim() || undefined,
    "/admin/orders",
  );

  if (!password || password !== expected) {
    redirect("/admin/login?error=1");
  }

  const token = signAdminSession(MAX_AGE_SECONDS);
  if (!token) {
    redirect("/admin/login?error=config");
  }

  const cookieStore = await cookies();
  cookieStore.set(getAdminCookieName(), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });

  redirect(nextPath);
}

export async function logoutAdminAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(getAdminCookieName());
  redirect("/admin/login");
}

export async function getAdminSessionValid(): Promise<boolean> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(getAdminCookieName())?.value;
  return verifyAdminSessionToken(raw);
}
