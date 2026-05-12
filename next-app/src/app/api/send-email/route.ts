import { NextResponse } from "next/server";
import {
  getOrderNotificationEmail,
  isEmailConfigured,
  sendEmail,
} from "../../lib/email";

export async function POST(request: Request) {
  // This endpoint is intended for local/dev smoke tests only.
  // In production, require an internal token so the route can't be abused as an open relay.
  if (process.env.NODE_ENV === "production") {
    const expected = process.env.MYSTIQUE_ADMIN_SECRET?.trim();
    const provided = request.headers.get("x-mystique-email-token")?.trim();
    if (!expected || provided !== expected) {
      return NextResponse.json({ success: false }, { status: 404 });
    }
  }

  if (!isEmailConfigured()) {
    return NextResponse.json(
      { success: false, error: "Email is not configured." },
      { status: 500 },
    );
  }

  try {
    const body = await request.json();
    const { to, subject, html, text, replyTo } = body as Record<string, unknown>;

    if (!subject || !html) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: subject, html" },
        { status: 400 },
      );
    }

    const fallbackTo = getOrderNotificationEmail();
    const resolvedTo: string | string[] =
      typeof to === "string"
        ? to
        : Array.isArray(to) && to.every((v) => typeof v === "string")
          ? (to as string[])
          : fallbackTo;

    await sendEmail({
      to: resolvedTo,
      subject: String(subject),
      html: String(html),
      text: typeof text === "string" ? text : "",
      replyTo: typeof replyTo === "string" ? replyTo : undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending email with Resend:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send email" },
      { status: 500 },
    );
  }
}
