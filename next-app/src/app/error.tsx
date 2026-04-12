"use client";

import Link from "next/link";

export default function RouteErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#06080c] px-4 text-[#f5eee3]">
      <div className="mystic-card max-w-xl p-8 text-center" role="alert">
        <p className="text-[0.72rem] uppercase tracking-[0.28em] text-[#b8ab95]">
          Mystique
        </p>
        <h1 className="mt-4 font-literata text-4xl tracking-[0.12em]">
          Something went wrong
        </h1>
        <p className="mt-4 text-sm text-[#b8ab95]">
          This page did not load as expected. Try again, or return to the shop—our team
          can help if the issue continues.
        </p>
        {error.digest ? (
          <p className="mt-3 text-xs tracking-wide text-[#7a7265]">
            Reference for support: {error.digest}
          </p>
        ) : null}
        {process.env.NODE_ENV === "development" && error.message ? (
          <p className="mt-4 max-h-40 overflow-y-auto rounded-lg border border-[rgba(214,168,95,0.15)] bg-black/40 p-3 text-left font-mono text-[0.7rem] leading-relaxed text-[#c4b8a4]">
            {error.message}
          </p>
        ) : null}
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="mystic-button-primary px-6 py-3 text-xs uppercase tracking-[0.2em]"
          >
            Try again
          </button>
          <Link
            href="/shop"
            className="mystic-button-secondary inline-flex items-center justify-center px-6 py-3 text-xs uppercase tracking-[0.2em]"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    </main>
  );
}
