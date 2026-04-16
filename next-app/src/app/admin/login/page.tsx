import type { Metadata } from "next";
import Link from "next/link";
import { loginAdminAction } from "../../actions/adminAuth";
import { isAdminConfigured } from "../../lib/adminSession";

export const metadata: Metadata = {
  title: "Admin sign-in",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;
  const next = params.next?.startsWith("/") ? params.next : "/admin/orders";
  const configured = isAdminConfigured();

  return (
    <div className="mx-auto w-full max-w-md">
      <p className="text-[0.75rem] uppercase tracking-[0.28em] text-[#b8ab95]">
        Mystique
      </p>
      <h1 className="mt-4 font-literata text-3xl tracking-[0.1em]">Order dashboard</h1>
      <p className="mt-3 text-sm leading-relaxed text-[#b8ab95]">
        Sign in to view recent orders. This area is not linked from the public storefront.
      </p>

      {!configured ? (
        <p className="mt-6 rounded-[14px] border border-[rgba(214,168,95,0.25)] bg-[rgba(255,255,255,0.03)] p-4 text-sm text-[#d6a85f]">
          Admin login is not configured. Set{" "}
          <code className="text-[#e8dcc4]">MYSTIQUE_ADMIN_PASSWORD</code> and{" "}
          <code className="text-[#e8dcc4]">MYSTIQUE_ADMIN_SECRET</code> in{" "}
          <code className="text-[#e8dcc4]">.env.local</code>, then restart the server.
        </p>
      ) : (
        <form action={loginAdminAction} className="mt-8 space-y-4">
          <input type="hidden" name="next" value={next} />
          <label className="block">
            <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-[#b8ab95]">
              Password
            </span>
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              className="mystic-input w-full text-sm"
            />
          </label>
          {params.error === "1" ? (
            <p className="text-sm text-[#d6a85f]" role="alert">
              That password didn&apos;t match. Try again.
            </p>
          ) : null}
          {params.error === "config" ? (
            <p className="text-sm text-[#d6a85f]" role="alert">
              Server configuration is incomplete. Check environment variables.
            </p>
          ) : null}
          <button
            type="submit"
            className="mystic-button-primary inline-flex w-full min-h-[48px] items-center justify-center px-6 py-3 text-xs uppercase tracking-[0.22em]"
          >
            Sign in
          </button>
        </form>
      )}

      <p className="mt-8 text-center text-sm text-[#7a7265]">
        <Link href="/" className="underline-offset-4 hover:underline">
          Back to site
        </Link>
      </p>
    </div>
  );
}
