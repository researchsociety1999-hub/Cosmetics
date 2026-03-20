"use client";

import { useState } from "react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    setEmail("");
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
        />
        <button
          type="submit"
          className="mystic-button-primary min-h-[48px] w-full px-6 py-2 text-[0.7rem] uppercase tracking-[0.22em] md:w-auto"
        >
          Join the list
        </button>
      </form>
      <p className="mt-3 text-xs uppercase tracking-[0.18em] text-[#b8ab95]">
        Early access to rituals and seasonal drops.
      </p>
      {submitted ? (
        <p className="mt-2 text-sm text-[#d6a85f]">
          Thanks for subscribing. [REPLACE LATER: connect to your email platform]
        </p>
      ) : null}
    </div>
  );
}
