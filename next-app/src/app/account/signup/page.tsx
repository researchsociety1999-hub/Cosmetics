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
  title: "Create account",
  description:
    "Create a Mystique account with your email—one magic link completes signup and sign-in.",
};

export const dynamic = "force-dynamic";

export default async function SignupPage({
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
          Create your Mystique account
        </h1>
        <div className="mystic-card mt-8 space-y-5 p-6">
          <p className="text-sm leading-relaxed text-[#b8ab95]">
            Enter your email and we&apos;ll send you a secure magic link. If this is your
            first time, we&apos;ll create your Mystique account when you use the link.
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
            <MagicLinkSubmitButton
              idleLabel="Create account"
              pendingLabel="Sending…"
            />
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
        </div>
      </main>
    </SiteChrome>
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

  if (status === "auth-error" || status === "link-invalid") {
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
        For your security, your session ended. Continue below to sign in or create an
        account.
      </p>
    );
  }

  if (status === "not-configured") {
    return (
      <p className="text-sm text-[#d6a85f]">
        Account sign-up isn&apos;t available on this site yet. Please check back later or
        contact support.
      </p>
    );
  }

  if (status === "error") {
    const detail = sanitizeClientAuthMessage(message);
    return (
      <p className="text-sm text-[#d6a85f]">
        We couldn&apos;t send the account link right now.
        {detail
          ? ` ${detail}`
          : " Please try again in a moment, or contact support if this continues."}
      </p>
    );
  }

  return null;
}
