import type { Metadata } from "next";
import type { ReactNode } from "react";

/**
 * Enforce noindex/nofollow across the entire /admin subtree at the layout
 * level so a future admin page that forgets per-page `robots` metadata can
 * never leak into search engines. Individual pages may still set their own
 * title; this only guarantees the floor for indexing.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * Admin routes use a minimal shell (no main marketing chrome) to keep order tools focused.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#05070d] px-4 py-10 text-[#f5eee3] md:px-8">
      {children}
    </div>
  );
}
