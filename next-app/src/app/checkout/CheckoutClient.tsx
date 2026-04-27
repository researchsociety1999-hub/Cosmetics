"use client";

import { loadStripe } from "@stripe/stripe-js";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

type CheckoutClientProps = {
  defaultEmail: string;
  stripeReady: boolean;
};

type CheckoutFormState = {
  fullName: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

type CheckoutApiBody = {
  error?: string;
  code?: string;
  sessionId?: string;
};

function mapCheckoutStartError(status: number, body: CheckoutApiBody): string {
  if (status === 400 && body.error) {
    return body.error;
  }

  if (status === 503) {
    if (body.code === "stripe_unavailable") {
      return "Secure payment is not enabled on this storefront yet. Please try again later.";
    }
    return "Checkout is temporarily unavailable. Please try again in a few minutes.";
  }

  if (body.code === "order_create_failed") {
    return "We couldn't prepare your order for payment. Refresh the page and try again.";
  }

  if (body.code === "stripe_session_failed") {
    return "We couldn't open the secure payment window. Your bag is unchanged—please try again shortly.";
  }

  return "We couldn’t start secure checkout. Please try again in a moment, or contact Mystique if this continues.";
}

export function CheckoutClient({
  defaultEmail,
  stripeReady,
}: CheckoutClientProps) {
  const [form, setForm] = useState<CheckoutFormState>({
    fullName: "",
    email: defaultEmail,
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "United States",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buttonLabel = useMemo(() => {
    if (!stripeReady) {
      return "Payment unavailable";
    }

    return isLoading ? "Opening secure payment…" : "Continue to payment";
  }, [isLoading, stripeReady]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!stripeReady || !stripePromise) {
      setError(
        "Secure payment is not configured on this site yet. Please try again later.",
      );
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        // Be explicit: ensure guest cart cookies are always sent (some environments can be stricter).
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      let data: CheckoutApiBody = {};
      try {
        data = (await response.json()) as CheckoutApiBody;
      } catch {
        data = {};
      }

      if (!response.ok || !data.sessionId) {
        setError(mapCheckoutStartError(response.status, data));
        setIsLoading(false);
        return;
      }

      const stripe = await stripePromise;

      if (!stripe) {
        setError("The payment experience could not load. Please refresh and try again.");
        setIsLoading(false);
        return;
      }

      const result = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });

      if (result.error) {
        setError(
          "We couldn't send you to secure checkout. Please try again, or use another card.",
        );
        setIsLoading(false);
      }
    } catch {
      setError(
        "Something interrupted checkout. Check your connection, then try again.",
      );
      setIsLoading(false);
    }
  }

  function updateField<K extends keyof CheckoutFormState>(
    key: K,
    value: CheckoutFormState[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <form onSubmit={handleSubmit} className="mystic-card grid gap-5 p-6 md:grid-cols-2">
      {!stripeReady ? (
        <div className="md:col-span-2 overflow-hidden rounded-[22px] border border-[rgba(214,168,95,0.22)] bg-[linear-gradient(152deg,rgba(214,168,95,0.1),rgba(6,8,14,0.92))] p-6 shadow-[0_20px_48px_rgba(0,0,0,0.45)] md:p-8">
          <div className="flex flex-col items-center gap-5 text-center md:flex-row md:items-center md:gap-7 md:text-left">
            <div
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-[rgba(214,168,95,0.28)] bg-[rgba(0,0,0,0.4)] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
              aria-hidden
            >
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" className="text-[#e8c56e]">
                <path
                  d="M7 11V8.5a5 5 0 0 1 10 0V11"
                  stroke="currentColor"
                  strokeWidth="1.35"
                  strokeLinecap="round"
                  strokeOpacity="0.95"
                />
                <rect
                  x="5"
                  y="11"
                  width="14"
                  height="10"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="1.35"
                  strokeOpacity="0.95"
                />
                <circle cx="12" cy="15.5" r="1.15" fill="currentColor" fillOpacity="0.85" />
              </svg>
            </div>
            <div className="min-w-0 space-y-2">
              <p className="text-[0.65rem] uppercase tracking-[0.28em] text-[#d6a85f]">
                Secure payments
              </p>
              <p className="font-literata text-xl tracking-[0.08em] text-[#f5eee3] md:text-2xl">
                Encrypted checkout is being connected
              </p>
              <p className="text-sm leading-relaxed text-[#c9bcaa]">
                This is temporary—your bag is unchanged. Add your shipping details below;
                when Stripe is live, you&apos;ll continue to a secure payment window.
              </p>
            </div>
          </div>
        </div>
      ) : null}
      <h2 className="font-literata text-3xl tracking-[0.1em] md:col-span-2">
        Shipping address
      </h2>
      <Input
        label="Full name"
        autoComplete="name"
        value={form.fullName}
        onChange={(value) => updateField("fullName", value)}
      />
      <Input
        label="Email"
        type="email"
        autoComplete="email"
        value={form.email}
        onChange={(value) => updateField("email", value)}
      />
      <Input
        className="md:col-span-2"
        label="Address line 1"
        autoComplete="address-line1"
        value={form.addressLine1}
        onChange={(value) => updateField("addressLine1", value)}
      />
      <Input
        className="md:col-span-2"
        label="Address line 2"
        required={false}
        autoComplete="address-line2"
        value={form.addressLine2}
        onChange={(value) => updateField("addressLine2", value)}
      />
      <Input
        label="City"
        autoComplete="address-level2"
        value={form.city}
        onChange={(value) => updateField("city", value)}
      />
      <Input
        label="State"
        autoComplete="address-level1"
        value={form.state}
        onChange={(value) => updateField("state", value)}
      />
      <Input
        label="Postal code"
        autoComplete="postal-code"
        value={form.postalCode}
        onChange={(value) => updateField("postalCode", value)}
      />
      <Input
        label="Country"
        autoComplete="country-name"
        value={form.country}
        onChange={(value) => updateField("country", value)}
      />
      <div className="rounded-[18px] border border-[rgba(214,168,95,0.16)] bg-[rgba(255,255,255,0.02)] p-4 text-sm text-[#b8ab95] md:col-span-2">
        {stripeReady
          ? "When you continue, you will leave Mystique for a moment to complete payment on Stripe’s secure checkout."
          : "Payment stays disabled until Stripe is configured—use Contact if you need to arrange an order manually in the meantime."}
      </div>
      <button
        type="submit"
        className={`mystic-button-primary inline-flex min-h-[50px] items-center justify-center px-8 py-3 text-xs uppercase tracking-[0.22em] md:col-span-2 disabled:opacity-60 ${isLoading ? "cursor-wait" : "disabled:cursor-not-allowed"}`}
        disabled={!stripeReady || isLoading}
        aria-busy={isLoading}
      >
        {buttonLabel}
      </button>
      {error ? (
        <p className="text-sm leading-relaxed text-[#d6a85f] md:col-span-2" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}

function Input({
  label,
  type = "text",
  className = "",
  required = true,
  autoComplete,
  value,
  onChange,
}: {
  label: string;
  type?: string;
  className?: string;
  required?: boolean;
  autoComplete?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className={className}>
      <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-[#b8ab95]">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mystic-input w-full text-sm"
        required={required}
        autoComplete={autoComplete}
      />
    </label>
  );
}
