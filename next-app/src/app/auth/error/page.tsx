import Link from "next/link";

type SearchParams = Promise<{ message?: string }>;

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const message = params.message
    ? decodeURIComponent(params.message)
    : "We couldn't verify that link. Request a fresh email and try again.";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#06080c] px-4 text-[#f5eee3]">
      <div className="mystic-card max-w-lg p-8 text-center">
        <p className="text-[0.72rem] uppercase tracking-[0.28em] text-[#d6a85f]">
          Auth error
        </p>
        <h1 className="mt-4 font-cormorant text-4xl tracking-[0.12em]">
          We couldn&apos;t complete sign-in.
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-[#b8ab95]">{message}</p>
        <div className="mt-8">
          <Link
            href="/account/login"
            className="mystic-button-primary inline-flex min-h-[48px] items-center justify-center px-8 py-3 text-xs uppercase tracking-[0.22em]"
          >
            Back to login
          </Link>
        </div>
      </div>
    </main>
  );
}
