import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requestMagicLinkAction } from "../../actions/auth";
import { MagicLinkSubmitButton } from "../../components/MagicLinkSubmitButton";
import { SiteChrome } from "../../components/SiteChrome";
import { getSafeNextPath } from "../../lib/authRedirect";
import { sanitizeClientAuthMessage } from "../../lib/authMessages";
import { getAuthenticatedUser } from "../../lib/supabaseServer";

type SearchParams = Promise<{ status?: string; email?: string; next?: string; message?: string }>;

export const metadata: Metadata = {
  title: "Sign in",
  description:
    "Sign in to your Mystique account with a secure magic link and return to checkout or saved orders.",
};

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const email = params.email ? decodeURIComponent(params.email) : "";
  const nextPath = getSafeNextPath(params.next, "/account");
  const user = await getAuthenticatedUser();

  if (user) {
    redirect(nextPath);
  }

  return (
    <SiteChrome>
      <main className="w-full px-4 py-14 md:px-6 lg:px-10 xl:px-14">
        <div className="mx-auto max-w-xl">
        <p className="text-[0.75rem] uppercase tracking-[0.28em] text-[#b8ab95]">
          Account
        </p>
        <h1 className="mt-4 font-literata text-4xl tracking-[0.12em] text-[#f5eee3]">
          Sign in to Mystique
        </h1>
        <div className="mystic-card mt-8 space-y-5 p-6">
          <p className="text-sm leading-relaxed text-[#b8ab95]">
            Use a secure magic link to sign in with your Mystique account. Once your
            session is active, we&apos;ll take you back to the right page and load your
            saved account experience.
          </p>
          <form action={requestMagicLinkAction} className="space-y-4">
            <input type="hidden" name="next" value={nextPath} />
            <input type="hidden" name="mode" value="login" />
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
            <MagicLinkSubmitButton
              idleLabel="Send magic link"
              pendingLabel="Sending…"
            />
          </form>
          <p className="text-sm leading-relaxed text-[#b8ab95]">
            New here? Use the same email flow to create your account in one step.
          </p>
          <Link
            href={`/account/signup?next=${encodeURIComponent(nextPath)}`}
            className="mystic-button-secondary inline-flex items-center justify-center px-6 py-3 text-xs uppercase tracking-[0.2em]"
          >
            Create an account
          </Link>
          <StatusMessage status={params.status} email={email} message={params.message} />
          <Link
            href="/"
            className="mystic-button-secondary inline-flex items-center justify-center px-6 py-2 text-xs uppercase tracking-[0.2em]"
          >
            Return home
          </Link>
        </div>
        </div>
      </main>
    </SiteChrome>
  );
}

function StatusMessage({
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
        Check {email || "your inbox"} for your Mystique email. Use the confirmation
        or sign-in link there to continue.
      </p>
    );
  }

  if (status === "confirmed") {
    return (
      <p className="text-sm text-[#d6a85f]">
        Your email is confirmed. You can now sign in to your Mystique account.
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

  if (status === "auth-error") {
    return (
      <p className="text-sm text-[#d6a85f]">
        We couldn&apos;t verify that sign-in link. Request a fresh magic link and try again.
      </p>
    );
  }

  if (status === "link-invalid") {
    return (
      <p className="text-sm text-[#d6a85f]">
        That email link is expired or was already used. Request a new magic link below—we
        will send you a fresh one.
      </p>
    );
  }

  if (status === "session-expired") {
    return (
      <p className="text-sm text-[#d6a85f]">
        For your security, your session ended. Sign in again to continue where you left
        off.
      </p>
    );
  }

  if (status === "not-configured") {
    return (
      <p className="text-sm text-[#d6a85f]">
        Sign-in isn&apos;t available on this site yet. Please check back later or contact
        support.
      </p>
    );
  }

  if (status === "error") {
    const detail = sanitizeClientAuthMessage(message);
    return (
      <p className="text-sm text-[#d6a85f]">
        We couldn&apos;t send the magic link right now.
        {detail
          ? ` ${detail}`
          : " Please try again in a moment, or contact support if this continues."}
      </p>
    );
  }

  return null;
}
