import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "../../lib/supabaseServer";

export const dynamic = "force-dynamic";

/**
 * Order history now lives on `/account`. This route remains for bookmarks and
 * external links; it sends signed-in shoppers to the unified account page.
 */
export default async function OrdersIndexRedirect() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/account/login?next=%2Faccount%2Forders");
  }

  redirect("/account#order-history");
}
