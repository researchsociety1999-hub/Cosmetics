import type { Metadata } from "next";
import { submitOrderAction } from "../actions/order";
import { SiteChrome } from "../components/SiteChrome";
import { getCartSummary } from "../lib/cart";
import { formatMoney } from "../lib/format";
import { isStripeConfigured } from "../lib/stripe";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Enter shipping details and review your Mystique order summary.",
};

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ status?: string; order?: string }>;

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const cart = await getCartSummary();
  const params = await searchParams;
  const stripeReady = isStripeConfigured();

  return (
    <SiteChrome>
      <main className="mx-auto max-w-7xl px-4 py-14 md:px-6">
        <header className="mb-10 space-y-4">
          <p className="text-[0.75rem] uppercase tracking-[0.28em] text-[#b8ab95]">
            Checkout
          </p>
          <h1 className="font-cormorant text-4xl tracking-[0.12em] md:text-5xl">Checkout</h1>
          <p className="max-w-2xl text-sm leading-relaxed text-[#b8ab95]">
            Complete your shipping details and review your order before the next
            step.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <form action={submitOrderAction} className="mystic-card grid gap-5 p-6 md:grid-cols-2">
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
              {stripeReady
                ? "After you submit, you will be taken to secure payment to complete your order."
                : "After you submit, our team will review your request and follow up by email with the next steps."}
            </div>
            <button
              type="submit"
              className="mystic-button-primary md:col-span-2 inline-flex min-h-[50px] items-center justify-center px-8 py-3 text-xs uppercase tracking-[0.22em]"
            >
              {stripeReady ? "Continue to payment" : "Submit order request"}
            </button>
            {params.status === "placed" ? (
              <div className="md:col-span-2 rounded-[20px] border border-[rgba(214,168,95,0.2)] bg-[rgba(214,168,95,0.06)] p-5">
                <p className="text-[0.72rem] uppercase tracking-[0.24em] text-[#d6a85f]">
                  Order received
                </p>
                <h3 className="mt-2 font-cormorant text-2xl tracking-[0.08em] text-[#f5eee3]">
                  Your order request is in.
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[#d8c6aa]">
                  We have sent a confirmation email and shared your order with
                  the Mystique team. You will hear from us soon with the next
                  step for payment and fulfillment.
                </p>
                {params.order ? (
                  <p className="mt-4 text-sm uppercase tracking-[0.18em] text-[#f5eee3]">
                    Order reference: {params.order}
                  </p>
                ) : null}
                <div className="mt-5 grid gap-3 text-sm text-[#b8ab95] md:grid-cols-3">
                  <div className="rounded-[16px] border border-[rgba(214,168,95,0.12)] bg-[rgba(255,255,255,0.02)] p-4">
                    <p className="text-[0.68rem] uppercase tracking-[0.2em] text-[#d6a85f]">
                      Confirmation
                    </p>
                    <p className="mt-2">A confirmation email has been sent to the address entered at checkout.</p>
                  </div>
                  <div className="rounded-[16px] border border-[rgba(214,168,95,0.12)] bg-[rgba(255,255,255,0.02)] p-4">
                    <p className="text-[0.68rem] uppercase tracking-[0.2em] text-[#d6a85f]">
                      Next update
                    </p>
                    <p className="mt-2">Expect a follow-up from the team within 1-2 business days.</p>
                  </div>
                  <div className="rounded-[16px] border border-[rgba(214,168,95,0.12)] bg-[rgba(255,255,255,0.02)] p-4">
                    <p className="text-[0.68rem] uppercase tracking-[0.2em] text-[#d6a85f]">
                      Need help
                    </p>
                    <p className="mt-2">Questions about your order can be sent through the contact page anytime.</p>
                  </div>
                </div>
              </div>
            ) : null}
            {params.status === "cancelled" ? (
              <p className="md:col-span-2 text-sm text-[#d6a85f]">
                Stripe checkout was cancelled. Your cart is still here, and you
                can try again whenever you are ready.
              </p>
            ) : null}
            {params.status === "missing" ? (
              <p className="md:col-span-2 text-sm text-[#d6a85f]">
                Please complete all required shipping fields before placing the
                order.
              </p>
            ) : null}
            {params.status === "empty" ? (
              <p className="md:col-span-2 text-sm text-[#d6a85f]">
                Your cart is empty. Add products before placing an order.
              </p>
            ) : null}
            {params.status === "email-error" ? (
              <p className="md:col-span-2 text-sm text-[#d6a85f]">
                We could not submit your order right now. Please try again in a
                moment.
              </p>
            ) : null}
            {params.status === "stripe-error" ? (
              <p className="md:col-span-2 text-sm text-[#d6a85f]">
                We could not start secure checkout right now. Please try again
                in a moment.
              </p>
            ) : null}
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
                <span>Calculated at next step</span>
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
