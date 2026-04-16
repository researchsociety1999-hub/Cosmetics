import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { logoutAdminAction } from "../../actions/adminAuth";
import { getOrdersForAdmin } from "../../lib/adminOrders";
import {
  getAdminCookieName,
  isAdminConfigured,
  verifyAdminSessionToken,
} from "../../lib/adminSession";
import { formatMoney } from "../../lib/format";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "Orders",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function formatDate(iso: string | null | undefined): string {
  if (!iso) {
    return "—";
  }
  try {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default async function AdminOrdersPage() {
  if (!isAdminConfigured()) {
    redirect("/admin/login?error=config");
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(getAdminCookieName())?.value;
  if (!verifyAdminSessionToken(token)) {
    redirect("/admin/login?next=%2Fadmin%2Forders");
  }

  const rows = await getOrdersForAdmin(100);

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="flex flex-col gap-4 border-b border-[rgba(214,168,95,0.15)] pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[0.75rem] uppercase tracking-[0.28em] text-[#b8ab95]">
            Mystique admin
          </p>
          <h1 className="mt-2 font-literata text-3xl tracking-[0.1em]">Orders</h1>
          <p className="mt-2 max-w-xl text-sm text-[#b8ab95]">
            Recent orders from Supabase (newest first). For guest checkouts,{" "}
            <code className="text-[#d8c6aa]">user_id</code> is empty.
          </p>
        </div>
        <form action={logoutAdminAction}>
          <button
            type="submit"
            className="mystic-button-secondary inline-flex min-h-[44px] items-center justify-center px-5 py-2 text-xs uppercase tracking-[0.2em]"
          >
            Sign out
          </button>
        </form>
      </div>

      {rows.length === 0 ? (
        <p className="mt-10 text-sm text-[#b8ab95]">
          No orders yet — complete a test checkout with Stripe webhook forwarding enabled.
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-[16px] border border-[rgba(214,168,95,0.12)] bg-[rgba(255,255,255,0.02)]">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[rgba(214,168,95,0.12)] text-[0.65rem] uppercase tracking-[0.2em] text-[#9a8f7a]">
                <th className="px-4 py-3 font-medium">When</th>
                <th className="px-4 py-3 font-medium">Order #</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Total</th>
                <th className="px-4 py-3 font-medium">Items</th>
              </tr>
            </thead>
            <tbody className="text-[#d8c6aa]">
              {rows.map((row) => {
                const items = row.order_items ?? [];
                const itemSummary = items
                  .slice(0, 3)
                  .map((i) => `${i.quantity}×#${i.product_id}`)
                  .join(", ");
                const more =
                  items.length > 3 ? ` +${items.length - 3} more` : "";
                return (
                  <tr
                    key={row.id}
                    className="border-b border-[rgba(214,168,95,0.08)] last:border-0"
                  >
                    <td className="whitespace-nowrap px-4 py-3 align-top text-[#b8ab95]">
                      {formatDate(row.paid_at ?? row.created_at)}
                    </td>
                    <td className="px-4 py-3 align-top font-mono text-[0.8rem] text-[#e8dcc4]">
                      {row.order_number}
                    </td>
                    <td className="max-w-[220px] px-4 py-3 align-top">
                      <div className="truncate text-[#f5eee3]" title={row.email}>
                        {row.email}
                      </div>
                      <div className="truncate text-xs text-[#7a7265]">
                        {row.full_name}
                        {row.user_id ? (
                          <span className="ml-1 text-[#5c7a5c]">(account)</span>
                        ) : (
                          <span className="ml-1 text-[#7a6b5c]">(guest)</span>
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 align-top uppercase tracking-wide text-[#d6a85f]">
                      {row.status}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 align-top text-right text-[#f5eee3]">
                      {formatMoney(row.total_amount)}
                    </td>
                    <td className="max-w-[200px] px-4 py-3 align-top text-xs leading-snug text-[#9a8f7a]">
                      {itemSummary}
                      {more}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-10 text-center text-sm text-[#7a7265]">
        <Link href="/" className="underline-offset-4 hover:underline">
          Back to site
        </Link>
      </p>
    </div>
  );
}
