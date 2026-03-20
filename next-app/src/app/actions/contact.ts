"use server";

import { redirect } from "next/navigation";

export async function submitContactAction(formData: FormData): Promise<void> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!name || !email || !message) {
    redirect("/contact?status=missing");
  }

  redirect("/contact?status=sent");
}
