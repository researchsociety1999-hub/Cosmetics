"use client";

export default function RouteErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isDev = process.env.NODE_ENV === "development";
  const detail =
    isDev && error.message?.trim()
      ? error.message
      : "Something went wrong while loading this page. You can try again, or head back to the shop.";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#06080c] px-4 text-[#f5eee3]">
      <div className="mystic-card max-w-xl p-8 text-center" role="alert">
        <p className="text-[0.72rem] uppercase tracking-[0.28em] text-[#b8ab95]">
          Something slipped out of ritual
        </p>
        <h1 className="mt-4 font-literata text-4xl tracking-[0.12em]">
          We could not load this page.
        </h1>
        <p className="mt-4 text-sm text-[#b8ab95]">{detail}</p>
        {error.digest ? (
          <p className="mt-3 text-xs tracking-wide text-[#7a7265]">Reference: {error.digest}</p>
        ) : null}
        <button
          type="button"
          onClick={reset}
          className="mystic-button-primary mt-6 px-6 py-3 text-xs uppercase tracking-[0.2em]"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
