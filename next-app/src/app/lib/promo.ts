import { cookies } from "next/headers";
import { hasSupabaseServiceEnv, supabaseAdmin } from "./supabaseClient";
import type { AppliedPromo, PromoCode } from "./types";

export const PROMO_COOKIE_NAME = "mystique-promo-code";

export type PromoValidationFailure =
  | "missing"
  | "not-found"
  | "inactive"
  | "not-started"
  | "expired"
  | "minimum-subtotal";

export type PromoValidationResult =
  | { ok: true; appliedPromo: AppliedPromo }
  | { ok: false; reason: PromoValidationFailure; message: string };

function requireAdminClient() {
  if (!supabaseAdmin || !hasSupabaseServiceEnv) {
    throw new Error("Supabase service role is not configured.");
  }

  return supabaseAdmin;
}

export function normalizePromoCode(code: string): string {
  return code.trim().toUpperCase();
}

export function getPromoFailureMessage(reason: PromoValidationFailure, minimumSubtotal?: number | null) {
  if (reason === "missing") {
    return "Enter a promo code to apply it to your cart.";
  }

  if (reason === "inactive") {
    return "That promo code is not active right now.";
  }

  if (reason === "not-started") {
    return "That promo code is not available yet.";
  }

  if (reason === "expired") {
    return "That promo code has expired.";
  }

  if (reason === "minimum-subtotal") {
    if (typeof minimumSubtotal === "number") {
      return `That code requires a cart subtotal of at least $${(minimumSubtotal / 100).toFixed(2)}.`;
    }

    return "That code requires a higher cart subtotal before it can be applied.";
  }

  return "We couldn't find that promo code.";
}

export async function getPromoCodeByCode(code: string): Promise<PromoCode | null> {
  const normalizedCode = normalizePromoCode(code);

  if (!normalizedCode) {
    return null;
  }

  const client = requireAdminClient();
  const { data, error } = await client
    .from("promo_codes")
    .select("*")
    .ilike("code", normalizedCode)
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as PromoCode;
}

export function calculatePromoDiscountCents(
  promo: PromoCode,
  subtotalCents: number,
): number {
  if (subtotalCents <= 0) {
    return 0;
  }

  if (promo.discount_type === "percent") {
    const percentage = Math.min(Math.max(promo.discount_value, 0), 100);
    return Math.min(subtotalCents, Math.round((subtotalCents * percentage) / 100));
  }

  return Math.min(subtotalCents, Math.max(0, Math.round(promo.discount_value)));
}

export async function validatePromoCodeForSubtotal({
  code,
  subtotalCents,
}: {
  code: string;
  subtotalCents: number;
}): Promise<PromoValidationResult> {
  const normalizedCode = normalizePromoCode(code);

  if (!normalizedCode) {
    return {
      ok: false,
      reason: "missing",
      message: getPromoFailureMessage("missing"),
    };
  }

  const promo = await getPromoCodeByCode(normalizedCode);

  if (!promo) {
    return {
      ok: false,
      reason: "not-found",
      message: getPromoFailureMessage("not-found"),
    };
  }

  if (!promo.is_active) {
    return {
      ok: false,
      reason: "inactive",
      message: getPromoFailureMessage("inactive"),
    };
  }

  const now = Date.now();
  if (promo.starts_at && new Date(promo.starts_at).getTime() > now) {
    return {
      ok: false,
      reason: "not-started",
      message: getPromoFailureMessage("not-started"),
    };
  }

  if (promo.expires_at && new Date(promo.expires_at).getTime() < now) {
    return {
      ok: false,
      reason: "expired",
      message: getPromoFailureMessage("expired"),
    };
  }

  if (
    typeof promo.minimum_subtotal === "number" &&
    subtotalCents < promo.minimum_subtotal
  ) {
    return {
      ok: false,
      reason: "minimum-subtotal",
      message: getPromoFailureMessage("minimum-subtotal", promo.minimum_subtotal),
    };
  }

  return {
    ok: true,
    appliedPromo: {
      promo,
      discountCents: calculatePromoDiscountCents(promo, subtotalCents),
    },
  };
}

export async function getStoredPromoCode(): Promise<string | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get(PROMO_COOKIE_NAME)?.value ?? "";
  const normalized = normalizePromoCode(value);
  return normalized || null;
}

export async function setStoredPromoCode(code: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(PROMO_COOKIE_NAME, normalizePromoCode(code), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearStoredPromoCode(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(PROMO_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function getAppliedPromoFromStoredCode(
  subtotalCents: number,
): Promise<{
  storedCode: string | null;
  appliedPromo: AppliedPromo | null;
  invalidMessage: string | null;
}> {
  const storedCode = await getStoredPromoCode();

  if (!storedCode) {
    return {
      storedCode: null,
      appliedPromo: null,
      invalidMessage: null,
    };
  }

  if (subtotalCents <= 0) {
    return {
      storedCode,
      appliedPromo: null,
      invalidMessage: "Your cart is empty, so that promo code is no longer applied.",
    };
  }

  let result: PromoValidationResult;
  try {
    result = await validatePromoCodeForSubtotal({
      code: storedCode,
      subtotalCents,
    });
  } catch (error) {
    return {
      storedCode,
      appliedPromo: null,
      invalidMessage:
        error instanceof Error && error.message === "Supabase service role is not configured."
          ? "Promo codes are not configured right now."
          : "We couldn't validate your promo code right now.",
    };
  }

  if (!result.ok) {
    return {
      storedCode,
      appliedPromo: null,
      invalidMessage: result.message,
    };
  }

  return {
    storedCode,
    appliedPromo: result.appliedPromo,
    invalidMessage: null,
  };
}
