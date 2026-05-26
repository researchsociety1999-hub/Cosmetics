import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  getAdminCookieName,
  isAdminConfigured,
  verifyAdminSessionToken,
} from "../../lib/adminSession";

/**
 * Server-side auth gate for /admin/* pages.
 *
 * Mirrors the inline pattern from `admin/orders/page.tsx` so every authed
 * admin page enforces the same redirect contract:
 *   - missing env config        → /admin/login?error=config
 *   - missing or expired token  → /admin/login?next=<encoded-path>
 *
 * Call this at the top of any server component under /admin (except /admin/login).
 * Pass the page's own pathname so the post-login redirect lands the user back.
 */
export async function requireAdminSession(nextPath: string): Promise<void> {
  if (!isAdminConfigured()) {
    redirect("/admin/login?error=config");
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(getAdminCookieName())?.value;
  if (!verifyAdminSessionToken(token)) {
    redirect(`/admin/login?next=${encodeURIComponent(nextPath)}`);
  }
}
