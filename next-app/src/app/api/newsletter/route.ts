import { NextResponse } from "next/server";
import {
  normalizeNewsletterEmail,
  subscribeToNewsletter,
  validateNewsletterEmail,
} from "../../lib/newsletter";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; source?: string };
    const email = normalizeNewsletterEmail(body.email ?? "");
    const validationError = validateNewsletterEmail(email);

    if (validationError) {
      return NextResponse.json(
        { success: false, error: validationError },
        { status: 400 },
      );
    }

    const result = await subscribeToNewsletter({
      email,
      source: body.source?.trim() || "site",
    });

    if (result.status === "duplicate") {
      return NextResponse.json({
        success: true,
        duplicate: true,
        message: "You're already on the list. We'll keep sending Mystique launch notes and seasonal drops there.",
      });
    }

    return NextResponse.json({
      success: true,
      duplicate: false,
      message: "You're on the list. Expect early access, ritual drops, and seasonal notes.",
    });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          success: false,
          error: "We couldn't read that signup request. Please refresh and try again.",
        },
        { status: 400 },
      );
    }

    console.error("newsletter signup error", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error &&
          error.message === "Supabase service role is not configured."
            ? "Newsletter signup isn't available right now. Please try again later."
            : "We couldn't save your newsletter signup right now. Please try again in a moment.",
      },
      { status: 500 },
    );
  }
}
