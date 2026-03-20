import type { Metadata } from "next";
import { SiteChrome } from "../components/SiteChrome";
import { getCartSummary } from "../lib/cart";
import { formatMoney } from "../lib/format";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Enter shipping details and review your Mystique order summary.",
};

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const cart = await getCartSummary();

  return (
    <SiteChrome>
      <main className="mx-auto max-w-7xl px-4 py-14 md:px-6">
        <header className="mb-10 space-y-4">
          <p className="text-[0.75rem] uppercase tracking-[0.28em] text-[#b8ab95]">
            Checkout
          </p>
          <h1 className="font-cormorant text-4xl tracking-[0.12em] md:text-5xl">
            Shipping and payment
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-[#b8ab95]">
            Guest checkout is available now. Stripe test mode and `payments`
            table persistence are marked for the next implementation step.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <form className="mystic-card grid gap-5 p-6 md:grid-cols-2">
            <h2 className="md:col-span-2 font-cormorant text-3xl tracking-[0.1em]">
              Shipping address
            </h2>
            <Input label="Full name" name="full_name" />
            <Input label="Email" name="email" type="email" />
            <Input label="Address line 1" name="address_line1" className="md:col-span-2" />
            <Input label="Address line 2" name="address_line2" className="md:col-span-2" />
            <Input label="City" name="city" />
            <Input label="State" name="state" />
            <Input label="Postal code" name="postal_code" />
            <Input label="Country" name="country" defaultValue="United States" />
            <div className="md:col-span-2 rounded-[18px] border border-[rgba(214,168,95,0.16)] bg-[rgba(255,255,255,0.02)] p-4 text-sm text-[#b8ab95]">
              Stripe test mode integration is the next step here. [REPLACE LATER]
              Create a checkout session, persist `payments`, and generate an
              `orders` record after confirmation.
            </div>
            <button
              type="submit"
              className="mystic-button-primary md:col-span-2 inline-flex min-h-[50px] items-center justify-center px-8 py-3 text-xs uppercase tracking-[0.22em]"
            >
              Continue to payment
            </button>
          </form>

          <aside className="mystic-card h-fit p-6">
            <h2 className="font-cormorant text-3xl tracking-[0.1em] text-[#f5eee3]">
              Order summary
            </h2>
            <div className="mt-5 space-y-4">
              {cart.lines.map((line) => (
                <div key={line.product.id} className="flex justify-between gap-4 text-sm text-[#b8ab95]">
                  <span>
                    {line.product.name} x {line.quantity}
                  </span>
                  <span>{formatMoney(line.lineTotalCents)}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 border-t border-[rgba(214,168,95,0.12)] pt-4 text-sm text-[#b8ab95]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatMoney(cart.subtotalCents)}</span>
              </div>
              <div className="mt-3 flex justify-between">
                <span>Estimated shipping</span>
                <span>[REPLACE LATER]</span>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </SiteChrome>
  );
}

function Input({
  label,
  name,
  type = "text",
  className = "",
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  className?: string;
  defaultValue?: string;
}) {
  return (
    <label className={className}>
      <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-[#b8ab95]">
        {label}
      </span>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        className="mystic-input w-full text-sm"
      />
    </label>
  );
}
