import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#06080c] px-4 text-[#f5eee3]">
      <div className="mystic-card max-w-xl p-8 text-center">
        <p className="text-[0.72rem] uppercase tracking-[0.28em] text-[#b8ab95]">
          404
        </p>
        <h1 className="mt-4 font-literata text-5xl tracking-[0.12em]">
          This ritual does not exist.
        </h1>
        <p className="mt-4 text-sm text-[#b8ab95]">
          The page you were looking for may have moved, or it was never part of
          the Mystique collection.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="mystic-button-primary inline-flex items-center justify-center px-6 py-3 text-xs uppercase tracking-[0.2em]"
          >
            Return home
          </Link>
          <Link
            href="/shop"
            className="mystic-button-secondary inline-flex items-center justify-center px-6 py-3 text-xs uppercase tracking-[0.2em]"
          >
            Browse shop
          </Link>
        </div>
      </div>
    </main>
  );
}
