import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { formatMoney } from "../lib/format";
import type { CartSummary, Order } from "../lib/types";

export function AccountDashboard({
  user,
  orders,
  cart,
}: {
  user: User;
  orders: Order[];
  cart: CartSummary;
}) {
  const created = user.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <main className="w-full px-4 py-14 md:px-6 lg:px-10 xl:px-14">
      <header className="max-w-3xl">
        <p className="text-[0.75rem] uppercase tracking-[0.28em] text-[#b8ab95]">
          Account
        </p>
        <h1 className="mt-4 font-literata text-4xl tracking-[0.12em] text-[#f5eee3] md:text-5xl">
          Your Mystique space
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-[#b8ab95] md:text-base">
          Profile, order history, and your bag—everything for your ritual in one
          place.
        </p>
      </header>

      <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start">
        <div className="space-y-8">
          <section
            id="profile"
            className="mystic-card scroll-mt-28 p-6 md:p-8"
            aria-labelledby="profile-heading"
          >
            <p className="text-[0.68rem] uppercase tracking-[0.24em] text-[#d6a85f]">
              Your details
            </p>
            <h2
              id="profile-heading"
              className="mt-3 font-literata text-2xl tracking-[0.1em] text-[#f5eee3]"
            >
              Profile
            </h2>
            <dl className="mt-6 space-y-4 text-sm">
              <div>
                <dt className="text-[0.65rem] uppercase tracking-[0.2em] text-[#8f8576]">
                  Email
                </dt>
                <dd className="mt-1 text-[#e8dcc4]">{user.email ?? "—"}</dd>
              </div>
              {created ? (
                <div>
                  <dt className="text-[0.65rem] uppercase tracking-[0.2em] text-[#8f8576]">
                    Member since
                  </dt>
                  <dd className="mt-1 text-[#e8dcc4]">{created}</dd>
                </div>
              ) : null}
              <div>
                <dt className="text-[0.65rem] uppercase tracking-[0.2em] text-[#8f8576]">
                  Account ID
                </dt>
                <dd className="mt-1 break-all font-mono text-xs text-[#b8ab95]">
                  {user.id}
                </dd>
              </div>
            </dl>
          </section>

          <section
            id="order-history"
            className="scroll-mt-28"
            aria-labelledby="orders-heading"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[0.68rem] uppercase tracking-[0.24em] text-[#d6a85f]">
                  History
                </p>
                <h2
                  id="orders-heading"
                  className="mt-2 font-literata text-3xl tracking-[0.1em] text-[#f5eee3]"
                >
                  Order history
                </h2>
              </div>
            </div>

            {orders.length ? (
              <div className="mt-6 space-y-4">
                {orders.map((order) => (
                  <article key={order.id} className="mystic-card p-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-[0.68rem] uppercase tracking-[0.24em] text-[#d6a85f]">
                          {order.order_number}
                        </p>
                        <h3 className="mt-2 font-literata text-2xl tracking-[0.08em] text-[#f5eee3]">
                          {order.status}
                        </h3>
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
                          className="text-xs uppercase tracking-[0.2em] text-[#d6a85f] transition hover:text-[#f0d19a]"
                        >
                          View details
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mystic-card mt-6 p-6 md:p-8">
                <p className="text-[0.68rem] uppercase tracking-[0.24em] text-[#d6a85f]">
                  No orders yet
                </p>
                <h3 className="mt-3 font-literata text-2xl tracking-[0.1em] text-[#f5eee3]">
                  Your ritual history will appear here.
                </h3>
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#b8ab95]">
                  Complete checkout while signed in and your orders will show here.
                </p>
                <Link
                  href="/shop"
                  className="mystic-button-primary mt-6 inline-flex min-h-[48px] items-center justify-center px-6 py-3 text-xs uppercase tracking-[0.22em]"
                >
                  Start shopping
                </Link>
              </div>
            )}
          </section>
        </div>

        <aside
          id="bag"
          className="mystic-card scroll-mt-28 p-6 md:p-8"
          aria-labelledby="bag-heading"
        >
          <p className="text-[0.68rem] uppercase tracking-[0.24em] text-[#d6a85f]">
            Bag
          </p>
          <h2
            id="bag-heading"
            className="mt-3 font-literata text-2xl tracking-[0.1em] text-[#f5eee3]"
          >
            Your cart
          </h2>
          <p className="mt-3 text-sm text-[#b8ab95]">
            {cart.itemCount === 0
              ? "Your bag is empty."
              : `${cart.itemCount} item${cart.itemCount === 1 ? "" : "s"} · ${formatMoney(cart.subtotalCents)}`}
          </p>

          {cart.lines.length ? (
            <ul className="mt-6 space-y-3 border-t border-[rgba(214,168,95,0.1)] pt-6">
              {cart.lines.slice(0, 5).map((line) => {
                const slug = line.product.slug?.trim();
                const href = slug ? `/products/${slug}` : "/shop";
                const key = line.cartItemId ?? `${line.product.id}-${line.variantId ?? "x"}`;
                return (
                  <li key={key}>
                    <Link
                      href={href}
                      className="block rounded-lg py-1 transition hover:text-[#f0d19a]"
                    >
                      <span className="block text-sm text-[#e8dcc4]">{line.product.name}</span>
                      <span className="mt-0.5 block text-xs text-[#8f8576]">
                        Qty {line.quantity} · {formatMoney(line.lineTotalCents)}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : null}

          {cart.lines.length > 5 ? (
            <p className="mt-4 text-xs text-[#8f8576]">
              +{cart.lines.length - 5} more in your bag
            </p>
          ) : null}

          <Link
            href="/cart"
            className="mystic-button-secondary mt-8 inline-flex w-full min-h-[48px] items-center justify-center px-6 py-3 text-xs uppercase tracking-[0.22em]"
          >
            {cart.lines.length ? "View full bag" : "Browse shop"}
          </Link>
        </aside>
      </div>
    </main>
  );
}
