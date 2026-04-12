import Link from "next/link";
import { formatMoney } from "../lib/format";
import type { CartSummary } from "../lib/types";
import { AccountPageFooterStrip } from "./AccountPageFooterStrip";

export function AccountGuestHub({ cart }: { cart: CartSummary }) {
  const hasGuestLines = cart.lines.length > 0 && cart.source === "cookie";

  return (
    <main className="w-full px-4 py-14 md:px-6 lg:px-10 xl:px-14">
      <header className="max-w-2xl">
        <p className="text-[0.75rem] uppercase tracking-[0.28em] text-[#b8ab95]">
          Account
        </p>
        <h1 className="mt-4 font-literata text-4xl tracking-[0.12em] text-[#f5eee3] md:text-5xl">
          Sign in to your Mystique account
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-[#b8ab95] md:text-base">
          View your profile, order history, and saved bag. New here? Create an account
          in one step with a secure magic link.
        </p>
      </header>

      <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
        <Link
          href="/account/login?next=%2Faccount"
          className="mystic-button-primary inline-flex min-h-[48px] min-w-[11rem] items-center justify-center px-8 py-3 text-xs uppercase tracking-[0.22em]"
        >
          Sign in
        </Link>
        <Link
          href="/account/signup?next=%2Faccount"
          className="mystic-button-secondary inline-flex min-h-[48px] min-w-[11rem] items-center justify-center px-8 py-3 text-xs uppercase tracking-[0.22em]"
        >
          Create account
        </Link>
      </div>

      {hasGuestLines ? (
        <section
          className="mystic-card mt-14 max-w-lg p-6 md:p-8"
          aria-labelledby="guest-bag-heading"
        >
          <p className="text-[0.68rem] uppercase tracking-[0.24em] text-[#d6a85f]">
            Your bag
          </p>
          <h2
            id="guest-bag-heading"
            className="mt-3 font-literata text-2xl tracking-[0.1em] text-[#f5eee3]"
          >
            Items in this browser
          </h2>
          <p className="mt-3 text-sm text-[#b8ab95]">
            {cart.itemCount} item{cart.itemCount === 1 ? "" : "s"} ·{" "}
            {formatMoney(cart.subtotalCents)}. Sign in to sync this bag to your account
            for checkout.
          </p>
          <ul className="mt-5 space-y-2 border-t border-[rgba(214,168,95,0.1)] pt-5 text-sm text-[#e8dcc4]">
            {cart.lines.slice(0, 4).map((line) => (
              <li key={`${line.product.id}-${line.variantId ?? "x"}`}>
                {line.product.name}{" "}
                <span className="text-[#8f8576]">
                  ×{line.quantity} · {formatMoney(line.lineTotalCents)}
                </span>
              </li>
            ))}
          </ul>
          <Link
            href="/cart"
            className="mystic-button-secondary mt-6 inline-flex min-h-[44px] items-center justify-center px-6 py-2.5 text-[0.62rem] uppercase tracking-[0.2em]"
          >
            Open full bag
          </Link>
        </section>
      ) : null}

      <AccountPageFooterStrip />
    </main>
  );
}
