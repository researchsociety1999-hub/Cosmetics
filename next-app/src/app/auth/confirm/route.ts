import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { mergeGuestCartIntoUserCart } from "../../lib/cart";
import { createSupabaseServerClient } from "../../lib/supabaseServer";

function getOtpType(type: string): EmailOtpType {
  if (type === "email" || type === "signup") {
    return "email";
  }

  return "magiclink";
}

function getSafeNextPath(next: string | null) {
  if (!next || !next.startsWith("/")) {
    return "/account";
  }

  if (next.startsWith("//")) {
    return "/account";
  }

  return next;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const { searchParams } = requestUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = getSafeNextPath(searchParams.get("next"));

  if (!code && (!tokenHash || !type)) {
    return NextResponse.redirect(
      new URL("/account/login?status=auth-error", requestUrl),
    );
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return NextResponse.redirect(
      new URL("/account/login?status=not-configured", requestUrl),
    );
  }

  const { error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : await supabase.auth.verifyOtp({
        token_hash: tokenHash!,
        type: getOtpType(type!),
      });

  if (error) {
    return NextResponse.redirect(
      new URL(
        `/auth/error?message=${encodeURIComponent(error.message)}`,
        requestUrl,
      ),
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    try {
      await mergeGuestCartIntoUserCart(supabase, user.id);
      revalidatePath("/cart");
      revalidatePath("/checkout");
      revalidatePath("/shop");
    } catch (mergeError) {
      console.error("[auth/confirm] Guest cart merge failed:", mergeError);
    }
  }

  return NextResponse.redirect(new URL(next, requestUrl));
}
