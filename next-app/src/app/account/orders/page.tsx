import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteChrome } from "../../components/SiteChrome";
import { formatMoney } from "../../lib/format";
import { getUserOrders } from "../../lib/queries";
import { getAuthenticatedUser } from "../../lib/supabaseServer";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/account/login");
  }

  const orders = await getUserOrders(user.id);

  return (
    <SiteChrome>
      <main className="w-full px-4 py-14 md:px-6 lg:px-10 xl:px-14">
        <p className="text-[0.75rem] uppercase tracking-[0.28em] text-[#b8ab95]">
          Orders
        </p>
        <h1 className="mt-4 font-literata text-4xl tracking-[0.12em] text-[#f5eee3] md:text-5xl">
          Your Mystique account
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#b8ab95] md:text-base">
          Signed in as {user.email ?? "your account email"}.
        </p>

        {orders.length ? (
          <div className="mt-8 space-y-4">
            {orders.map((order) => (
              <article key={order.id} className="mystic-card p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-[0.68rem] uppercase tracking-[0.24em] text-[#d6a85f]">
                      {order.order_number}
                    </p>
                    <h2 className="mt-2 font-literata text-2xl tracking-[0.08em] text-[#f5eee3]">
                      {order.status}
                    </h2>
                    <p className="mt-2 text-sm text-[#b8ab95]">
                      Placed {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-col items-start gap-3 md:items-end">
                    <p className="text-sm uppercase tracking-[0.22em] text-[#f0d19a]">
                      {formatMoney(order.total_cents)}
                    </p>
                    <Link
                      href={`/account/orders/${order.id}`}
                      className="text-xs uppercase tracking-[0.2em] text-[#d6a85f]"
                    >
                      View details
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mystic-card mt-8 p-6 md:p-8">
            <p className="text-[0.68rem] uppercase tracking-[0.24em] text-[#d6a85f]">
              No orders yet
            </p>
            <h2 className="mt-3 font-literata text-3xl tracking-[0.1em] text-[#f5eee3]">
              Your ritual history will appear here.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#b8ab95]">
              Once you complete checkout while signed in, your orders will show up
              here automatically.
            </p>
            <Link
              href="/shop"
              className="mystic-button-primary mt-6 inline-flex min-h-[48px] items-center justify-center px-6 py-3 text-xs uppercase tracking-[0.22em]"
            >
              Start shopping
            </Link>
          </div>
        )}
      </main>
    </SiteChrome>
  );
}
