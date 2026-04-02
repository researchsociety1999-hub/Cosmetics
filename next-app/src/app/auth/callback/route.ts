import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../lib/supabaseServer";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/account/orders";
  const redirectUrl = new URL(next, requestUrl.origin);

  if (!code) {
    redirectUrl.pathname = "/account/login";
    redirectUrl.search = "?status=auth-error";
    return NextResponse.redirect(redirectUrl);
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirectUrl.pathname = "/account/login";
    redirectUrl.search = "?status=not-configured";
    return NextResponse.redirect(redirectUrl);
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    redirectUrl.pathname = "/account/login";
    redirectUrl.search = "?status=auth-error";
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.redirect(redirectUrl);
}
