import type { ReactNode } from "react";

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
