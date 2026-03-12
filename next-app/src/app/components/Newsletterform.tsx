"use client";

import React, { useState } from "react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    console.log("Subscribed:", email);
  }

  return (
    <form
      className="flex w-full flex-col gap-3 md:max-w-md md:flex-row"
      onSubmit={handleSubmit}
    >
      <input
        type="email"
        required
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="mystic-input w-full text-sm"
      />
      <button
        type="submit"
        className="mystic-button-primary w-full px-6 py-2 text-[0.7rem] uppercase tracking-[0.22em] md:w-auto"
      >
        Subscribe
      </button>
    </form>
  );
}
