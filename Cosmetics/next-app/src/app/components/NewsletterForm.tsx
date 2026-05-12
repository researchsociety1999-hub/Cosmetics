"use client";

import type { FormEvent } from "react";
import { useState } from "react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "duplicate" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          source: "homepage",
        }),
      });

      let data: {
        success?: boolean;
        duplicate?: boolean;
        message?: string;
        error?: string;
      } = {};

      try {
        data = (await response.json()) as typeof data;
      } catch {
        data = {};
      }

      if (!response.ok || !data.success) {
        throw new Error(
          typeof data.error === "string" && data.error.trim()
            ? data.error
            : "We couldn’t save your signup right now. Please try again in a moment.",
        );
      }

      setStatus(data.duplicate ? "duplicate" : "success");
      setMessage(
        data.message ??
          "You’re in. Expect early access, ritual drops, and seasonal notes.",
      );
      setEmail("");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "We couldn’t save your signup right now. Please try again in a moment.",
      );
    }
  }

  return (
    <div className="w-full md:max-w-lg">
      <form className="flex w-full flex-col gap-3 md:flex-row" onSubmit={handleSubmit}>
        <label className="sr-only" htmlFor="newsletter-email">
          Email address
        </label>
        <div className="w-full">
          <input
            id="newsletter-email"
            name="email"
            type="email"
            inputMode="email"
            required
            placeholder="Email address"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mystic-input w-full text-sm"
            autoComplete="email"
            spellCheck={false}
            aria-busy={status === "loading"}
          />
          <p className="mt-1.5 text-[11px] text-[#8A7440]">
            By subscribing you agree to our{" "}
            <a
              href="/privacy"
              className="text-[#A89060] underline underline-offset-4"
            >
              Privacy Policy
            </a>
            . Unsubscribe anytime.
          </p>
        </div>
        <button
          type="submit"
          disabled={status === "loading"}
          className="mystic-button-primary min-h-[48px] w-full px-6 py-2 text-[0.7rem] uppercase tracking-[0.22em] md:w-auto"
        >
          {status === "loading" ? "Sending..." : "Subscribe"}
        </button>
      </form>
      <p className="mt-3 text-xs uppercase tracking-[0.18em] text-[#b8ab95]">
        Early access, restocks, and studio notes—never daily noise.
      </p>
      <div className="mt-4" aria-live="polite">
        <div
          className={`mystic-card overflow-hidden rounded-[18px] border border-[rgba(214,168,95,0.16)] bg-[rgba(4,5,10,0.55)] px-4 py-3 shadow-[0_12px_36px_rgba(0,0,0,0.35)] backdrop-blur-sm transition-all duration-300 ease-out motion-reduce:transition-none ${
            status === "success" || status === "duplicate"
              ? "translate-y-0 opacity-100"
              : "pointer-events-none -translate-y-1 opacity-0"
          }`}
        >
          <p className="text-[0.62rem] uppercase tracking-[0.28em] text-[#b8ab95]">
            Confirmed
          </p>
          <p className="mt-1 text-sm leading-relaxed text-[#d6a85f]">{message}</p>
        </div>
        {status === "error" ? (
          <p className="mt-2 text-sm text-[#d6a85f]" role="alert">
            {message}
          </p>
        ) : null}
      </div>
    </div>
  );
}
