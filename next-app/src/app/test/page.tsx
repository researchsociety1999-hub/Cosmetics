import Link from "next/link";

export default function TestPage() {
  return (
    <main className="min-h-screen bg-[#06080c] px-4 py-16 text-[#f5eee3]">
      <div className="mx-auto max-w-3xl">
        <p className="text-[0.75rem] uppercase tracking-[0.28em] text-[#b8ab95]">
          Internal route
        </p>
        <h1 className="mt-4 font-literata text-4xl tracking-[0.12em]">
          Mystic test page
        </h1>
        <p className="mt-4 text-sm text-[#b8ab95] md:text-base">
          This route is now safe and no longer contains placeholder encoding
          artifacts.
        </p>
        <Link
          href="/shop"
          className="mystic-button-secondary mt-8 inline-flex items-center justify-center px-6 py-3 text-xs uppercase tracking-[0.2em]"
        >
          Go to shop
        </Link>
      </div>
    </main>
  );
}
