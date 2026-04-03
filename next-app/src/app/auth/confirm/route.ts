import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "../../lib/supabaseServer";

function getOtpType(type: string): EmailOtpType {
  if (type === "email" || type === "signup") {
    return "email";
  }

  return "magiclink";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/account/orders";

  if (!tokenHash || !type) {
    return new NextResponse("Missing token_hash or type", { status: 400 });
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return NextResponse.redirect(
      new URL("/account/login?status=not-configured", request.url),
    );
  }

  const { error } = await supabase.auth.verifyOtp({
    token_hash: tokenHash,
    type: getOtpType(type),
  });

  if (error) {
    return NextResponse.redirect(
      new URL(
        `/auth/error?message=${encodeURIComponent(error.message)}`,
        request.url,
      ),
    );
  }

  return NextResponse.redirect(new URL(next, request.url));
}
