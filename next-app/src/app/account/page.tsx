import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SiteChrome } from "../components/SiteChrome";
import { getCartSummary } from "../lib/cart";
import { getUserOrders } from "../lib/queries";
import { getAuthenticatedUser } from "../lib/supabaseServer";
import { AccountDashboard } from "./AccountDashboard";

export const metadata: Metadata = {
  title: "Account",
  description:
    "Mystique account hub — orders, saved bag after sign-in, and magic-link access.",
};

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await getAuthenticatedUser();

  // Option B: redirect unauthenticated visitors straight to login.
  // This satisfies the Playwright test which asserts url includes /account/login.
  if (!user) {
    redirect("/account/login");
  }

  const [orders, cart] = await Promise.all([
    getUserOrders(user.id),
    getCartSummary(user),
  ]);

  return (
    <SiteChrome>
      <AccountDashboard user={user} orders={orders} cart={cart} />
    </SiteChrome>
  );
}
