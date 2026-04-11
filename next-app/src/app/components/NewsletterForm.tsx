"use client";

import { useState } from "react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "duplicate" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
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
            : "We couldn't save your signup right now. Please try again in a moment.",
        );
      }

      setStatus(data.duplicate ? "duplicate" : "success");
      setMessage(
        data.message ??
          "You're on the list. Expect early access, ritual drops, and seasonal notes.",
      );
      setEmail("");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "We couldn't save your signup right now. Please try again in a moment.",
      );
    }
  }

  return (
    <div className="w-full md:max-w-lg">
      <form className="flex w-full flex-col gap-3 md:flex-row" onSubmit={handleSubmit}>
        <label className="sr-only" htmlFor="newsletter-email">
          Email address
        </label>
        <input
          id="newsletter-email"
          type="email"
          required
          placeholder="Enter your email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mystic-input w-full text-sm"
          autoComplete="email"
          aria-busy={status === "loading"}
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="mystic-button-primary min-h-[48px] w-full px-6 py-2 text-[0.7rem] uppercase tracking-[0.22em] md:w-auto"
        >
          {status === "loading" ? "Joining..." : "Join the list"}
        </button>
      </form>
      <p className="mt-3 text-xs uppercase tracking-[0.18em] text-[#b8ab95]">
        Early access to rituals and seasonal drops.
      </p>
      <div className="mt-2 min-h-[1.5rem]" aria-live="polite">
        {status === "success" || status === "duplicate" ? (
          <p className="text-sm text-[#d6a85f]">{message}</p>
        ) : null}
        {status === "error" ? (
          <p className="text-sm text-[#d6a85f]" role="alert">
            {message}
          </p>
        ) : null}
      </div>
    </div>
  );
}
