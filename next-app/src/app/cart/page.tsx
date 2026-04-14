import type { Metadata } from "next";
import Link from "next/link";
import { applyPromoCodeAction, removePromoCodeAction } from "../actions/promo";
import { removeFromCartAction } from "../actions/cart";
import { CartQuantityUpdateForm } from "./CartQuantityUpdateForm";
import { SiteChrome } from "../components/SiteChrome";
import { getCartSummary } from "../lib/cart";
import { getOrderTotals } from "../lib/checkout";
import { PurchaseTrustFootnote } from "../components/PurchaseTrustFootnote";
import { ThemedImageFrame } from "../components/ThemedImageFrame";
import { formatMoney, getProductPrimaryImageUrl } from "../lib/format";
import { getAppliedPromoFromStoredCode } from "../lib/promo";

export const metadata: Metadata = {
  title: "Bag",
  description: "Review your Mystique ritual bag and proceed to checkout.",
};

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ "promo-status"?: string; "promo-code"?: string }>;

export default async function CartPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const cart = await getCartSummary();
  const params = await searchParams;
  const { appliedPromo, invalidMessage } = await getAppliedPromoFromStoredCode(
    cart.subtotalCents,
  );
  const totals = getOrderTotals(cart, appliedPromo?.discountCents ?? 0);
  const promoMessage = getPromoStatusMessage({
    status: params["promo-status"],
    code: params["promo-code"],
    invalidMessage,
  });

  return (
    <SiteChrome>
      <main className="w-full px-4 py-14 md:px-6 lg:px-10 xl:px-14">
        <header className="mb-10 space-y-4">
          <p className="text-[0.75rem] uppercase tracking-[0.28em] text-[#b8ab95]">
            Bag
          </p>
          <h1 className="font-literata text-4xl tracking-[0.12em] md:text-5xl">
            Your ritual bag
          </h1>
        </header>

        {cart.lines.length === 0 ? (
          <div className="mystic-card p-8">
            <p className="text-sm text-[#b8ab95]">
              Your bag is empty. Begin with the newest Mystique rituals.
            </p>
            {promoMessage ? (
              <p className="mt-4 text-sm text-[#d6a85f]">{promoMessage}</p>
            ) : null}
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
                    <div className="flex min-w-0 flex-1 gap-4">
                      <Link
                        href={
                          line.product.slug?.trim()
                            ? `/products/${line.product.slug.trim()}`
                            : "/shop"
                        }
                        className="relative h-28 w-[5.5rem] shrink-0 overflow-hidden rounded-[16px] border border-[rgba(214,168,95,0.12)]"
                        aria-label={`View ${line.product.name}`}
                      >
                        <ThemedImageFrame
                          src={getProductPrimaryImageUrl(line.product)}
                          displayTitle={line.product.name}
                          alt={`${line.product.name} — Mystique`}
                          fill
                          sizes="112px"
                          variant="thumb"
                          className="h-full w-full"
                          frameClassName="rounded-[16px]"
                          imageClassName="object-cover"
                        />
                      </Link>
                      <div className="min-w-0">
                        <h2 className="font-literata text-2xl tracking-[0.08em] text-[#f5eee3] md:text-3xl">
                          {line.product.name}
                        </h2>
                        <p className="mt-2 text-sm text-[#b8ab95]">
                          {line.product.routine_step ?? "Ritual"} • {formatMoney(line.unitPriceCents)} each
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <CartQuantityUpdateForm
                        key={`${line.product.id}-${line.quantity}-${line.variantId ?? "null"}`}
                        productId={line.product.id}
                        variantId={line.variantId}
                        initialQuantity={line.quantity}
                      />
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
              <h2 className="font-literata text-3xl tracking-[0.1em] text-[#f5eee3]">
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
                {appliedPromo ? (
                  <div className="flex justify-between text-[#d6a85f]">
                    <span>Promo ({appliedPromo.promo.code})</span>
                    <span>-{formatMoney(appliedPromo.discountCents)}</span>
                  </div>
                ) : null}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>
                    {totals.shippingAmount === 0 ? "Free" : formatMoney(totals.shippingAmount)}
                  </span>
                </div>
                <div className="flex justify-between font-semibold text-[#f5eee3]">
                  <span>Total</span>
                  <span>{formatMoney(totals.totalAmount)}</span>
                </div>
              </div>
              <label className="mt-6 block text-xs uppercase tracking-[0.2em] text-[#b8ab95]">
                Promo code
              </label>
              <form action={applyPromoCodeAction} className="mt-2 space-y-3">
                <input
                  name="promoCode"
                  placeholder="MYSTIQUE10"
                  defaultValue={appliedPromo?.promo.code ?? params["promo-code"] ?? ""}
                  className="mystic-input w-full text-sm"
                />
                <button
                  type="submit"
                  className="w-full rounded-full border border-[rgba(214,168,95,0.3)] px-4 py-3 text-xs uppercase tracking-[0.18em] text-[#f5eee3]"
                >
                  Apply code
                </button>
              </form>
              {appliedPromo ? (
                <form action={removePromoCodeAction} className="mt-3">
                  <button
                    type="submit"
                    className="w-full rounded-full border border-[rgba(214,168,95,0.2)] px-4 py-3 text-xs uppercase tracking-[0.18em] text-[#b8ab95]"
                  >
                    Remove promo
                  </button>
                </form>
              ) : null}
              {promoMessage ? (
                <p className="mt-3 text-sm text-[#d6a85f]">{promoMessage}</p>
              ) : null}
              <div className="mt-6">
                <PurchaseTrustFootnote dense />
              </div>
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

function getPromoStatusMessage({
  status,
  code,
  invalidMessage,
}: {
  status?: string;
  code?: string;
  invalidMessage: string | null;
}) {
  if (status === "applied" && code) {
    return `${code} has been applied to your bag.`;
  }

  if (status === "removed") {
    return "Promo code removed from your bag.";
  }

  if (status === "missing") {
    return "Enter a promo code before applying it.";
  }

  if (status === "empty") {
    return "Add products to your cart before applying a promo code.";
  }

  if (invalidMessage) {
    return invalidMessage;
  }

  if (status === "not-found") {
    return "We couldn't find that promo code.";
  }

  if (status === "inactive") {
    return "That promo code is not active right now.";
  }

  if (status === "not-started") {
    return "That promo code is not available yet.";
  }

  if (status === "expired") {
    return "That promo code has expired.";
  }

  if (status === "minimum-subtotal") {
    return "That promo code needs a higher bag subtotal before it can be applied.";
  }

  if (status === "unavailable") {
    return "Promo codes are not configured right now. Please try again later.";
  }

  return null;
}
