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
      return "Stripe unavailable";
    }

    return isLoading ? "Redirecting..." : "Continue to payment";
  }, [isAuthenticated, isLoading, stripeReady]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isAuthenticated) {
      setError("Please sign in to your Mystique account before checking out.");
      return;
    }

    if (!stripeReady || !stripePromise) {
      setError("Stripe is not configured yet. Add your Stripe keys to continue.");
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
      const data = (await response.json()) as {
        error?: string;
        sessionId?: string;
      };

      if (!response.ok || !data.sessionId) {
        throw new Error(data.error ?? "Could not start Stripe checkout.");
      }

      const stripe = await stripePromise;

      if (!stripe) {
        throw new Error("Stripe.js failed to load.");
      }

      const result = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }
    } catch (checkoutError) {
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : "We could not start secure checkout right now.",
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
        value={form.fullName}
        onChange={(value) => updateField("fullName", value)}
      />
      <Input
        label="Email"
        type="email"
        value={form.email}
        onChange={(value) => updateField("email", value)}
      />
      <Input
        className="md:col-span-2"
        label="Address line 1"
        value={form.addressLine1}
        onChange={(value) => updateField("addressLine1", value)}
      />
      <Input
        className="md:col-span-2"
        label="Address line 2"
        required={false}
        value={form.addressLine2}
        onChange={(value) => updateField("addressLine2", value)}
      />
      <Input
        label="City"
        value={form.city}
        onChange={(value) => updateField("city", value)}
      />
      <Input
        label="State"
        value={form.state}
        onChange={(value) => updateField("state", value)}
      />
      <Input
        label="Postal code"
        value={form.postalCode}
        onChange={(value) => updateField("postalCode", value)}
      />
      <Input
        label="Country"
        value={form.country}
        onChange={(value) => updateField("country", value)}
      />
      <div className="rounded-[18px] border border-[rgba(214,168,95,0.16)] bg-[rgba(255,255,255,0.02)] p-4 text-sm text-[#b8ab95] md:col-span-2">
        {!isAuthenticated
          ? "Sign in with your Mystique account to load your saved cart and continue to secure payment."
          : stripeReady
            ? "After you submit, you'll be taken to secure Stripe Checkout to complete payment in test mode."
            : "Stripe checkout is not configured yet. Add your Stripe keys to enable secure payment."}
      </div>
      {isAuthenticated ? (
        <button
          type="submit"
          className="mystic-button-primary inline-flex min-h-[50px] items-center justify-center px-8 py-3 text-xs uppercase tracking-[0.22em] md:col-span-2"
          disabled={!stripeReady || isLoading}
        >
          {buttonLabel}
        </button>
      ) : (
        <div className="grid gap-3 md:col-span-2 md:grid-cols-2">
          <Link
            href="/account/login?next=%2Fcart"
            className="mystic-button-primary inline-flex min-h-[50px] items-center justify-center px-8 py-3 text-center text-xs uppercase tracking-[0.22em]"
          >
            Sign in to checkout
          </Link>
          <Link
            href="/account/signup?next=%2Fcart"
            className="mystic-button-secondary inline-flex min-h-[50px] items-center justify-center px-8 py-3 text-center text-xs uppercase tracking-[0.22em]"
          >
            Create account
          </Link>
        </div>
      )}
      {error ? (
        <p className="text-sm text-[#d6a85f] md:col-span-2">{error}</p>
      ) : null}
    </form>
  );
}

function Input({
  label,
  type = "text",
  className = "",
  required = true,
  value,
  onChange,
}: {
  label: string;
  type?: string;
  className?: string;
  required?: boolean;
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
      />
    </label>
  );
}
