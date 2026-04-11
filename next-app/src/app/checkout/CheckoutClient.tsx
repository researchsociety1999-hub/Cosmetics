"use client";

import { loadStripe } from "@stripe/stripe-js";
import Link from "next/link";
import { useMemo, useState } from "react";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

type CheckoutClientProps = {
  defaultEmail: string;
  stripeReady: boolean;
  isAuthenticated: boolean;
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
  if (status === 401) {
    return "Please sign in to your Mystique account before checking out.";
  }

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

  return "We couldn't start secure checkout. Please try again in a moment, or contact Mystique if this continues.";
}

export function CheckoutClient({
  defaultEmail,
  stripeReady,
  isAuthenticated,
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
    if (!isAuthenticated) {
      return "Sign in to checkout";
    }

    if (!stripeReady) {
      return "Payment unavailable";
    }

    return isLoading ? "Opening secure payment…" : "Continue to payment";
  }, [isAuthenticated, isLoading, stripeReady]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isAuthenticated) {
      setError("Please sign in to your Mystique account before checking out.");
      return;
    }

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
        "Something interrupted checkout. Check your connection and try again.",
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
        {!isAuthenticated
          ? "Sign in with your Mystique account to load your saved cart and continue to secure payment."
          : stripeReady
            ? "When you continue, you will leave Mystique for a moment to complete payment on Stripe’s secure checkout."
            : "Secure payment is not configured yet. Add Stripe keys to enable checkout in this environment."}
      </div>
      {isAuthenticated ? (
        <button
          type="submit"
          className="mystic-button-primary inline-flex min-h-[50px] items-center justify-center px-8 py-3 text-xs uppercase tracking-[0.22em] md:col-span-2 disabled:cursor-wait disabled:opacity-70"
          disabled={!stripeReady || isLoading}
          aria-busy={isLoading}
        >
          {buttonLabel}
        </button>
      ) : (
        <div className="grid gap-3 md:col-span-2 md:grid-cols-2">
          <Link
            href="/account/login?next=%2Fcheckout"
            className="mystic-button-primary inline-flex min-h-[50px] items-center justify-center px-8 py-3 text-center text-xs uppercase tracking-[0.22em]"
          >
            Sign in to checkout
          </Link>
          <Link
            href="/account/signup?next=%2Fcheckout"
            className="mystic-button-secondary inline-flex min-h-[50px] items-center justify-center px-8 py-3 text-center text-xs uppercase tracking-[0.22em]"
          >
            Create account
          </Link>
        </div>
      )}
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
