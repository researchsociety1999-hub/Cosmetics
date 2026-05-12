import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { getSafeNextPath } from "../../lib/authRedirect";
import { mergeGuestCartIntoUserCart } from "../../lib/cart";
import { createSupabaseServerClient } from "../../lib/supabaseServer";

function getOtpType(type: string): EmailOtpType {
  if (type === "email" || type === "signup") {
    return "email";
  }

  return "magiclink";
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const { searchParams } = requestUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = getSafeNextPath(searchParams.get("next"));

  if (!code && (!tokenHash || !type)) {
    const url = new URL("/account/login", requestUrl.origin);
    url.searchParams.set("status", "auth-error");
    url.searchParams.set("next", next);
    return NextResponse.redirect(url);
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    const url = new URL("/account/login", requestUrl.origin);
    url.searchParams.set("status", "not-configured");
    url.searchParams.set("next", next);
    return NextResponse.redirect(url);
  }

  const { error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : await supabase.auth.verifyOtp({
        token_hash: tokenHash!,
        type: getOtpType(type!),
      });

  if (error) {
    const loginUrl = new URL("/account/login", requestUrl.origin);
    loginUrl.searchParams.set("status", "link-invalid");
    loginUrl.searchParams.set("next", next);
    return NextResponse.redirect(loginUrl);
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
