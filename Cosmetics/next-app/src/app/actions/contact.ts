"use server";

import { redirect } from "next/navigation";
import {
  escapeHtml,
  getContactNotificationEmail,
  isEmailConfigured,
  renderEmailLayout,
  sendEmail,
} from "../lib/email";

export async function submitContactAction(formData: FormData): Promise<void> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!name || !email || !message) {
    redirect("/contact?status=missing");
  }

  if (!isEmailConfigured()) {
    console.error("Contact email skipped because Resend is not configured.");
    redirect("/contact?status=email-error");
  }

  try {
    await sendEmail({
      to: getContactNotificationEmail(),
      subject: `New contact form message from ${name}`,
      replyTo: email,
      html: renderEmailLayout({
        preview: `New contact form message from ${name}`,
        title: "New contact request",
        body: `
          <p style="margin:0 0 16px;"><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p style="margin:0 0 16px;"><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p style="margin:0 0 8px;"><strong>Message:</strong></p>
          <p style="margin:0;white-space:pre-wrap;">${escapeHtml(message)}</p>
        `,
      }),
      text: [
        "New contact request",
        "",
        `Name: ${name}`,
        `Email: ${email}`,
        "",
        "Message:",
        message,
      ].join("\n"),
    });
  } catch (error) {
    console.error("submitContactAction error", error);
    redirect("/contact?status=email-error");
  }

  redirect("/contact?status=sent");
}
