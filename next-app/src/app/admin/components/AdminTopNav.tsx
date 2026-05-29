"use client";

import { usePathname } from "next/navigation";
import { logoutAdminAction } from "../../actions/adminAuth";

function getActiveSectionLabel(pathname: string | null): string {
  if (!pathname) return "Overview";
  if (pathname.startsWith("/admin/orders")) return "Orders";
  if (pathname.startsWith("/admin/customers")) return "Customers";
  if (pathname.startsWith("/admin/chatbot")) return "Chatbot";
  if (pathname.startsWith("/admin/settings")) return "Settings";
  return "Overview";
}

export function AdminTopNav() {
  const pathname = usePathname();
  const section = getActiveSectionLabel(pathname);

  return (
    <header className="flex flex-col gap-3 border-b border-[rgba(214,168,95,0.15)] pb-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-baseline gap-3">
        <span className="font-literata text-lg tracking-[0.18em] text-[#f5eee3]">
          Mystique Admin
        </span>
        <span
          aria-live="polite"
          className="text-[0.62rem] uppercase tracking-[0.28em] text-[#9a8f7a]"
        >
          / {section}
        </span>
      </div>
      <form action={logoutAdminAction}>
        <button
          type="submit"
          className="mystic-button-secondary inline-flex min-h-[40px] items-center justify-center px-4 py-1.5 text-[0.65rem] uppercase tracking-[0.22em]"
        >
          Logout
        </button>
      </form>
    </header>
  );
}
