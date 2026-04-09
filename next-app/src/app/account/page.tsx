import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "../lib/supabaseServer";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/account/login?next=/account");
  }

  redirect("/account/orders");
}
