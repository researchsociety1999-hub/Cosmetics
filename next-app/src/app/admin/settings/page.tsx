import type { Metadata } from "next";
import { AdminShell } from "../components/AdminShell";
import { requireAdminSession } from "../lib/session";

export const metadata: Metadata = {
  title: "Admin settings",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Stub for the Settings section so the sidebar link doesn't 404.
 * Real settings UI is intentionally out-of-scope for the v1 admin build.
 */
export default async function AdminSettingsPage() {
  await requireAdminSession("/admin/settings");

  return (
    <AdminShell pageEyebrow="Mystique admin" pageTitle="Settings">
      <div className="rounded-[16px] border border-[rgba(214,168,95,0.12)] bg-[rgba(255,255,255,0.02)] p-6 text-sm text-[#b8ab95]">
        <p className="text-[#d8c6aa]">Settings are coming soon.</p>
        <p className="mt-3 max-w-prose text-[#9a8f7a]">
          This page is a placeholder so the sidebar nav stays consistent. Real
          settings (admin password rotation, allow-list, webhook config) will
          land in a follow-up.
        </p>
      </div>
    </AdminShell>
  );
}
