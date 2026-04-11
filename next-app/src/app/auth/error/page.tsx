import Link from "next/link";
import type { Metadata } from "next";
import { SiteChrome } from "../../components/SiteChrome";
import { getCustomerAuthFailureMessage } from "../../lib/authMessages";

export const metadata: Metadata = {
  title: "Sign-in help",
  description: "We could not complete sign-in with that link. Try a fresh magic link.",
};

type SearchParams = Promise<{ message?: string }>;

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const message = getCustomerAuthFailureMessage(params.message);

  return (
    <SiteChrome>
      <main className="flex min-h-[60vh] w-full items-center justify-center px-4 py-14 md:px-6 lg:px-10 xl:px-14">
        <div className="mystic-card max-w-lg p-8 text-center">
          <p className="text-[0.72rem] uppercase tracking-[0.28em] text-[#d6a85f]">
            Sign-in help
          </p>
          <h1 className="mt-4 font-literata text-4xl tracking-[0.12em] text-[#f5eee3]">
            We couldn&apos;t complete sign-in.
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-[#b8ab95]">{message}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/account/login"
              className="mystic-button-primary inline-flex min-h-[48px] items-center justify-center px-8 py-3 text-xs uppercase tracking-[0.22em]"
            >
              Request a new link
            </Link>
            <Link
              href="/"
              className="mystic-button-secondary inline-flex min-h-[48px] items-center justify-center px-8 py-3 text-xs uppercase tracking-[0.22em]"
            >
              Return home
            </Link>
          </div>
        </div>
      </main>
    </SiteChrome>
  );
}
