import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const resendFromEmail = process.env.RESEND_FROM_EMAIL;

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function isEmailConfigured(): boolean {
  return Boolean(resendApiKey && resendFromEmail);
}

function getResendClient(): Resend {
  if (!resendApiKey) {
    throw new Error("Missing RESEND_API_KEY");
  }

  return new Resend(resendApiKey);
}

function getFromEmail(): string {
  if (!resendFromEmail) {
    throw new Error("Missing RESEND_FROM_EMAIL");
  }

  return resendFromEmail;
}

export function getContactNotificationEmail(): string {
  const email = process.env.CONTACT_NOTIFICATION_EMAIL;

  if (!email) {
    throw new Error("Missing CONTACT_NOTIFICATION_EMAIL");
  }

  return email;
}

export function getOrderNotificationEmail(): string {
  return (
    process.env.ORDER_NOTIFICATION_EMAIL ??
    process.env.CONTACT_NOTIFICATION_EMAIL ??
    getFromEmail()
  );
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
  replyTo,
}: {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string | string[];
}): Promise<void> {
  const resend = getResendClient();

  await resend.emails.send({
    from: getFromEmail(),
    to,
    subject,
    html,
    text,
    replyTo,
  });
}

export function renderEmailLayout({
  preview,
  title,
  body,
}: {
  preview: string;
  title: string;
  body: string;
}): string {
  return `
    <html>
      <body style="margin:0;padding:24px;background:#05070d;color:#f5eee3;font-family:Georgia,serif;">
        <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preview)}</div>
        <div style="max-width:640px;margin:0 auto;border:1px solid rgba(214,168,95,0.22);border-radius:24px;background:#0b0e14;padding:32px;">
          <p style="margin:0 0 12px;font-size:12px;letter-spacing:0.28em;text-transform:uppercase;color:#d6a85f;">Mystique</p>
          <h1 style="margin:0 0 20px;font-size:32px;letter-spacing:0.08em;font-weight:600;">${escapeHtml(title)}</h1>
          <div style="font-size:15px;line-height:1.7;color:#d8c6aa;">${body}</div>
        </div>
      </body>
    </html>
  `;
}
