import type { ReactNode } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopNav } from "./AdminTopNav";

interface AdminShellProps {
  children: ReactNode;
  /** Optional page heading rendered above the main content. */
  pageTitle?: string;
  /** Optional eyebrow / muted descriptor above the title. */
  pageEyebrow?: string;
}

/**
 * Visual chrome for authed admin pages: brand bar + sidebar + main column.
 *
 * This component is intentionally auth-agnostic — each admin page is responsible
 * for calling `requireAdminSession` before rendering its content (matches the
 * existing per-page pattern in `admin/orders/page.tsx`). That keeps the login
 * page's centered layout untouched and avoids smuggling auth into chrome.
 */
export function AdminShell({ children, pageTitle, pageEyebrow }: AdminShellProps) {
  return (
    <div className="mx-auto w-full max-w-7xl">
      <AdminTopNav />
      <div className="mt-8 flex flex-col gap-8 md:flex-row">
        <AdminSidebar />
        <main className="min-w-0 flex-1">
          {pageEyebrow || pageTitle ? (
            <div className="mb-6">
              {pageEyebrow ? (
                <p className="text-[0.7rem] uppercase tracking-[0.28em] text-[#b8ab95]">
                  {pageEyebrow}
                </p>
              ) : null}
              {pageTitle ? (
                <h1 className="mt-2 font-literata text-3xl tracking-[0.08em] text-[#f5eee3]">
                  {pageTitle}
                </h1>
              ) : null}
            </div>
          ) : null}
          {children}
        </main>
      </div>
    </div>
  );
}
