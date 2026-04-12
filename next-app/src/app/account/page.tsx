import type { Metadata } from "next";
import { SiteChrome } from "../components/SiteChrome";
import { getCartSummary } from "../lib/cart";
import { getUserOrders } from "../lib/queries";
import { getAuthenticatedUser } from "../lib/supabaseServer";
import { AccountDashboard } from "./AccountDashboard";
import { AccountGuestHub } from "./AccountGuestHub";

export const metadata: Metadata = {
  title: "Account",
  description:
    "Your Mystique account—profile, order history, and bag in one place. Sign in with a secure magic link.",
};

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    const cart = await getCartSummary();
    return (
      <SiteChrome>
        <AccountGuestHub cart={cart} />
      </SiteChrome>
    );
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
