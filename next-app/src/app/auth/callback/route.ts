import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getSafeNextPath } from "../../lib/authRedirect";
import { mergeGuestCartIntoUserCart } from "../../lib/cart";
import { createSupabaseServerClient } from "../../lib/supabaseServer";

function loginWithStatus(origin: string, status: string, next: string) {
  const url = new URL("/account/login", origin);
  url.searchParams.set("status", status);
  url.searchParams.set("next", next);
  return NextResponse.redirect(url);
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = getSafeNextPath(requestUrl.searchParams.get("next"), "/account");
  const redirectUrl = new URL(next, requestUrl.origin);

  if (!code) {
    return loginWithStatus(requestUrl.origin, "auth-error", next);
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return loginWithStatus(requestUrl.origin, "not-configured", next);
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return loginWithStatus(requestUrl.origin, "auth-error", next);
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
      console.error("[auth/callback] Guest cart merge failed:", mergeError);
    }
  }

  return NextResponse.redirect(redirectUrl);
}
