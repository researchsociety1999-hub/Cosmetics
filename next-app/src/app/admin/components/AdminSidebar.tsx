"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
  /** Path prefix that marks this link active (use exact-match for the root). */
  matchPrefix: string;
}

const NAV_ITEMS: ReadonlyArray<NavItem> = [
  { label: "Overview", href: "/admin", matchPrefix: "/admin" },
  { label: "Orders", href: "/admin/orders", matchPrefix: "/admin/orders" },
  { label: "Customers", href: "/admin/customers", matchPrefix: "/admin/customers" },
  { label: "Chatbot", href: "/admin/chatbot", matchPrefix: "/admin/chatbot" },
  { label: "Settings", href: "/admin/settings", matchPrefix: "/admin/settings" },
];

function isActive(pathname: string | null, item: NavItem): boolean {
  if (!pathname) return false;
  // Overview is special — every admin path starts with /admin, so only an exact
  // match should highlight it. All other links use prefix-match.
  if (item.matchPrefix === "/admin") {
    return pathname === "/admin";
  }
  return (
    pathname === item.matchPrefix || pathname.startsWith(`${item.matchPrefix}/`)
  );
}

export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Admin sections"
      className="flex w-full shrink-0 flex-row gap-1 overflow-x-auto md:w-56 md:flex-col md:overflow-visible"
    >
      {NAV_ITEMS.map((item) => {
        const active = isActive(pathname, item);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`block whitespace-nowrap rounded-[10px] px-3 py-2 text-xs uppercase tracking-[0.22em] transition-colors duration-200 ${
              active
                ? "bg-[rgba(214,168,95,0.12)] text-[#f5eee3] ring-1 ring-inset ring-[rgba(214,168,95,0.28)]"
                : "text-[#9a8f7a] hover:bg-[rgba(255,255,255,0.03)] hover:text-[#d8c6aa]"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
