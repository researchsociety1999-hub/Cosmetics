import Link from "next/link";
import { redirect } from "next/navigation";

/**
 * Non-production route check only. Not linked from the live storefront.
 */
export default function TestPage() {
  if (process.env.NODE_ENV === "production") {
    redirect("/shop");
  }

  return (
    <main className="min-h-screen w-full bg-[#06080c] px-4 py-16 text-[#f5eee3] md:px-6 lg:px-10 xl:px-14">
      <div className="mx-auto max-w-3xl">
        <p className="text-[0.75rem] uppercase tracking-[0.28em] text-[#b8ab95]">
          Development
        </p>
        <h1 className="mt-4 font-literata text-4xl tracking-[0.12em]">
          Route check
        </h1>
        <p className="mt-4 text-sm text-[#b8ab95] md:text-base">
          This path is not used in production. Return to the shop to continue browsing
          Mystique.
        </p>
        <Link
          href="/shop"
          className="mystic-button-secondary mt-8 inline-flex items-center justify-center px-6 py-3 text-xs uppercase tracking-[0.2em]"
        >
          Shop skincare
        </Link>
      </div>
    </main>
  );
}
