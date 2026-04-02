import Link from "next/link";
import { redirect } from "next/navigation";
import { requestMagicLinkAction } from "../../actions/auth";
import { SiteChrome } from "../../components/SiteChrome";
import {
  hasInvalidSupabasePublicKey,
  hasSupabasePublicEnv,
} from "../../lib/supabaseClient";
import { getAuthenticatedUser } from "../../lib/supabaseServer";

type LoginPageProps = {
  searchParams: Promise<{
    status?: string;
    email?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const user = await getAuthenticatedUser();
  const params = await searchParams;

  if (user) {
    redirect("/account/orders");
  }

  const status = params.status;
  const email = params.email;

  return (
    <SiteChrome>
      <main className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,167,58,0.12),transparent_16%),radial-gradient(circle_at_82%_30%,rgba(214,168,95,0.08),transparent_18%),linear-gradient(180deg,rgba(3,4,6,0.18),rgba(3,4,6,0.82))]" />
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-[0.9fr_1.1fr] md:px-6 md:py-18">
          <section className="relative space-y-6">
            <p className="text-[0.75rem] uppercase tracking-[0.3em] text-[#b8ab95]">
              Account
            </p>
            <div className="space-y-4">
              <h1 className="font-cormorant text-4xl tracking-[0.12em] text-[#f5eee3] md:text-5xl">
                Enter your ritual,
                <br />
                one email away.
              </h1>
              <p className="max-w-xl text-sm leading-relaxed text-[#b8ab95] md:text-base">
                Sign in with a secure magic link to access your saved orders and
                authenticated checkout. No password needed.
              </p>
            </div>
            <div className="grid gap-4 text-sm text-[#d8c6aa] sm:grid-cols-2">
              <div className="rounded-[20px] border border-[rgba(214,168,95,0.12)] bg-[rgba(255,255,255,0.02)] p-4">
                <p className="text-[0.68rem] uppercase tracking-[0.24em] text-[#d6a85f]">
                  Faster checkout
                </p>
                <p className="mt-2 text-sm text-[#b8ab95]">
                  Keep your account cart attached to your email session.
                </p>
              </div>
              <div className="rounded-[20px] border border-[rgba(214,168,95,0.12)] bg-[rgba(255,255,255,0.02)] p-4">
                <p className="text-[0.68rem] uppercase tracking-[0.24em] text-[#d6a85f]">
                  Order access
                </p>
                <p className="mt-2 text-sm text-[#b8ab95]">
                  Review purchases and account activity from one place.
                </p>
              </div>
            </div>
          </section>

          <section className="relative">
            <div className="mystic-card relative overflow-hidden p-6 md:p-8">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,170,70,0.12),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))]" />
              <div className="relative space-y-6">
                <div className="space-y-2">
                  <p className="text-[0.68rem] uppercase tracking-[0.26em] text-[#d6a85f]">
                    Sign in
                  </p>
                  <h2 className="font-cormorant text-3xl tracking-[0.1em] text-[#f5eee3]">
                    Send a magic link
                  </h2>
                  <p className="text-sm leading-relaxed text-[#b8ab95]">
                    Enter the email address you want to use for Mystique. We&apos;ll
                    send a secure sign-in link.
                  </p>
                </div>

                {status === "check-email" ? (
                  <StatusBanner tone="success">
                    Check {email ?? "your inbox"} for your secure login link.
                  </StatusBanner>
                ) : null}
                {status === "missing-email" ? (
                  <StatusBanner tone="warning">
                    Enter an email address before requesting a magic link.
                  </StatusBanner>
                ) : null}
                {status === "error" ? (
                  <StatusBanner tone="warning">
                    We couldn&apos;t send the sign-in email just now. Please try again.
                  </StatusBanner>
                ) : null}
                {status === "auth-error" ? (
                  <StatusBanner tone="warning">
                    The sign-in link was invalid or expired. Request a fresh one.
                  </StatusBanner>
                ) : null}
                {hasInvalidSupabasePublicKey ? (
                  <StatusBanner tone="warning">
                    Your public Supabase key is misconfigured. Replace the
                    `sb_secret_...` value in `.env.local` with your project&apos;s
                    publishable or anon key.
                  </StatusBanner>
                ) : null}
                {!hasSupabasePublicEnv || status === "not-configured" ? (
                  <StatusBanner tone="warning">
                    Supabase auth isn&apos;t configured yet. Add your public Supabase URL
                    and publishable key in `.env.local` to enable sign-in.
                  </StatusBanner>
                ) : null}

                <form action={requestMagicLinkAction} className="space-y-4">
                  <input type="hidden" name="next" value="/account/orders" />
                  <label className="block space-y-2">
                    <span className="text-[0.68rem] uppercase tracking-[0.24em] text-[#d8c6aa]">
                      Email address
                    </span>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="you@example.com"
                      className="mystic-input w-full"
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={!hasSupabasePublicEnv}
                    className="mystic-button-primary inline-flex min-h-[52px] w-full items-center justify-center px-6 py-3 text-xs uppercase tracking-[0.22em] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Email me a sign-in link
                  </button>
                </form>

                <div className="flex flex-wrap gap-3 pt-2">
                  <Link
                    href="/"
                    className="mystic-button-secondary inline-flex min-h-[46px] items-center justify-center px-6 py-3 text-xs uppercase tracking-[0.22em]"
                  >
                    Return home
                  </Link>
                  <Link
                    href="/checkout"
                    className="inline-flex min-h-[46px] items-center justify-center px-4 py-3 text-xs uppercase tracking-[0.22em] text-[#b8ab95] hover:text-[#f0d19a]"
                  >
                    Back to checkout
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </SiteChrome>
  );
}

function StatusBanner({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "success" | "warning";
}) {
  const classes =
    tone === "success"
      ? "border-[rgba(120,190,140,0.26)] bg-[rgba(120,190,140,0.08)] text-[#d8f0dd]"
      : "border-[rgba(214,168,95,0.22)] bg-[rgba(214,168,95,0.08)] text-[#f0d19a]";

  return (
    <div className={`rounded-[18px] border px-4 py-3 text-sm leading-relaxed ${classes}`}>
      {children}
    </div>
  );
}
