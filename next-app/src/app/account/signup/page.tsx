import Link from "next/link";
import { redirect } from "next/navigation";
import { requestMagicLinkAction } from "../../actions/auth";
import { Footer } from "../../components/Footer";
import { Navbar } from "../../components/Navbar";
import { getAuthenticatedUser } from "../../lib/supabaseServer";

type SearchParams = Promise<{ status?: string; email?: string; next?: string; message?: string }>;

export const dynamic = "force-dynamic";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const email = params.email ? decodeURIComponent(params.email) : "";
  const nextPath = params.next || "/account";
  const user = await getAuthenticatedUser();

  if (user) {
    redirect(nextPath);
  }

  return (
    <div className="min-h-screen bg-[#06080c] text-[#f5eee3]">
      <Navbar />
      <main className="mx-auto max-w-xl px-4 py-14 md:px-6">
        <p className="text-[0.75rem] uppercase tracking-[0.28em] text-[#b8ab95]">
          Account
        </p>
        <h1 className="mt-4 font-literata text-4xl tracking-[0.12em] text-[#f5eee3]">
          Create your Mystique account
        </h1>
        <div className="mystic-card mt-8 space-y-5 p-6">
          <p className="text-sm leading-relaxed text-[#b8ab95]">
            Enter your email and we&apos;ll send you a secure magic link. If this is your
            first time, Supabase will create your Mystique account automatically.
          </p>
          <form action={requestMagicLinkAction} className="space-y-4">
            <input type="hidden" name="next" value={nextPath} />
            <input type="hidden" name="mode" value="signup" />
            <label className="block">
              <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-[#b8ab95]">
                Email
              </span>
              <input
                type="email"
                name="email"
                defaultValue={email}
                required
                className="mystic-input w-full text-sm"
                placeholder="you@example.com"
              />
            </label>
            <button
              type="submit"
              className="mystic-button-primary inline-flex min-h-[48px] items-center justify-center px-8 py-3 text-xs uppercase tracking-[0.22em]"
            >
              Create account
            </button>
          </form>
          <SignupStatusMessage
            status={params.status}
            email={email}
            message={params.message}
          />
          <p className="text-sm leading-relaxed text-[#b8ab95]">
            Already have an account?
          </p>
          <Link
            href={`/account/login?next=${encodeURIComponent(nextPath)}`}
            className="mystic-button-secondary inline-flex items-center justify-center px-6 py-3 text-xs uppercase tracking-[0.2em]"
          >
            Go to sign in
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function SignupStatusMessage({
  status,
  email,
  message,
}: {
  status?: string;
  email: string;
  message?: string;
}) {
  if (status === "check-email") {
    return (
      <p className="text-sm text-[#d6a85f]">
        Check {email || "your inbox"} for your Mystique link. We&apos;ll create your
        account and sign you in from there.
      </p>
    );
  }

  if (status === "missing-email") {
    return (
      <p className="text-sm text-[#d6a85f]">
        Enter the email address you want to use for your Mystique account.
      </p>
    );
  }

  if (status === "not-configured") {
    return (
      <p className="text-sm text-[#d6a85f]">
        Supabase public auth keys are missing. Add them to `.env.local` before creating an account.
      </p>
    );
  }

  if (status === "error") {
    return (
      <p className="text-sm text-[#d6a85f]">
        We couldn&apos;t send the account link right now.
        {message ? ` ${message}` : " Check your Supabase auth settings and try again."}
      </p>
    );
  }

  return null;
}
