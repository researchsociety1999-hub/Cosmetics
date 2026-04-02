import { NextResponse } from "next/server";
import {
  getOrderNotificationEmail,
  isEmailConfigured,
  sendEmail,
} from "../../lib/email";

export async function POST(request: Request) {
  if (!isEmailConfigured()) {
    return NextResponse.json(
      { success: false, error: "Email is not configured." },
      { status: 500 },
    );
  }

  try {
    const body = await request.json();
    const { to, subject, html, text, replyTo } = body;

    if (!subject || !html) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: subject, html" },
        { status: 400 },
      );
    }

    await sendEmail({
      to: to ?? getOrderNotificationEmail(),
      subject,
      html,
      text: text ?? "",
      replyTo,
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
