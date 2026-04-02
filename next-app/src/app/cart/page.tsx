import type { Metadata } from "next";
import Link from "next/link";
import { removeFromCartAction, updateCartQuantityAction } from "../actions/cart";
import { SiteChrome } from "../components/SiteChrome";
import { getCartSummary } from "../lib/cart";
import { formatMoney } from "../lib/format";

export const metadata: Metadata = {
  title: "Cart",
  description: "Review your Mystique ritual cart and proceed to checkout.",
};

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const cart = await getCartSummary();

  return (
    <SiteChrome>
      <main className="mx-auto max-w-7xl px-4 py-14 md:px-6">
        <header className="mb-10 space-y-4">
          <p className="text-[0.75rem] uppercase tracking-[0.28em] text-[#b8ab95]">
            Cart
          </p>
          <h1 className="font-cormorant text-4xl tracking-[0.12em] md:text-5xl">
            Your ritual bag
          </h1>
        </header>

        {cart.lines.length === 0 ? (
          <div className="mystic-card p-8">
            <p className="text-sm text-[#b8ab95]">
              Your cart is empty. Begin with the newest Mystique rituals.
            </p>
            <Link
              href="/shop"
              className="mystic-button-secondary mt-6 inline-flex items-center justify-center px-6 py-3 text-xs uppercase tracking-[0.2em]"
            >
              Continue shopping
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            <section className="space-y-4">
              {cart.lines.map((line) => (
                <article key={line.product.id} className="mystic-card p-5">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h2 className="font-cormorant text-3xl tracking-[0.08em] text-[#f5eee3]">
                        {line.product.name}
                      </h2>
                      <p className="mt-2 text-sm text-[#b8ab95]">
                        {line.product.routine_step ?? "Ritual"} • {formatMoney(line.unitPriceCents)} each
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <form action={updateCartQuantityAction} className="flex items-center gap-2">
                        <input type="hidden" name="productId" value={line.product.id} />
                        <input type="hidden" name="variantId" value={line.variantId ?? ""} />
                        <label className="sr-only" htmlFor={`qty-${line.product.id}`}>
                          Quantity
                        </label>
                        <input
                          id={`qty-${line.product.id}`}
                          name="quantity"
                          type="number"
                          min="0"
                          defaultValue={line.quantity}
                          className="mystic-input w-20 text-sm"
                        />
                        <button
                          type="submit"
                          className="rounded-full border border-[rgba(214,168,95,0.3)] px-4 py-2 text-xs uppercase tracking-[0.18em] text-[#f5eee3]"
                        >
                          Update
                        </button>
                      </form>
                      <form action={removeFromCartAction}>
                        <input type="hidden" name="productId" value={line.product.id} />
                        <input type="hidden" name="variantId" value={line.variantId ?? ""} />
                        <button
                          type="submit"
                          className="rounded-full border border-[rgba(214,168,95,0.2)] px-4 py-2 text-xs uppercase tracking-[0.18em] text-[#b8ab95]"
                        >
                          Remove
                        </button>
                      </form>
                    </div>
                  </div>
                  <div className="mt-4 border-t border-[rgba(214,168,95,0.12)] pt-4 text-sm text-[#d6a85f]">
                    Line total: {formatMoney(line.lineTotalCents)}
                  </div>
                </article>
              ))}
            </section>

            <aside className="mystic-card h-fit p-6">
              <h2 className="font-cormorant text-3xl tracking-[0.1em] text-[#f5eee3]">
                Summary
              </h2>
              <div className="mt-5 space-y-3 text-sm text-[#b8ab95]">
                <div className="flex justify-between">
                  <span>Items</span>
                  <span>{cart.itemCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatMoney(cart.subtotalCents)}</span>
                </div>
              </div>
              <label className="mt-6 block text-xs uppercase tracking-[0.2em] text-[#b8ab95]">
                Promo code
              </label>
              <input
                placeholder="MYSTIQUE10"
                className="mystic-input mt-2 w-full text-sm"
              />
              <Link
                href="/checkout"
                className="mystic-button-primary mt-6 inline-flex w-full items-center justify-center px-6 py-3 text-xs uppercase tracking-[0.2em]"
              >
                Checkout
              </Link>
            </aside>
          </div>
        )}
      </main>
    </SiteChrome>
  );
}
