import type { Metadata } from "next";
import { AdminShell } from "../components/AdminShell";
import {
  getAdminConfigGroups,
  type ConfigItemStatus,
} from "../lib/getConfigStatus";
import { requireAdminSession } from "../lib/session";

export const metadata: Metadata = {
  title: "Admin settings",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function StatusDot({ status }: { status: ConfigItemStatus }) {
  const tone =
    status === "ok"
      ? "bg-emerald-400 ring-emerald-400/30"
      : status === "partial"
        ? "bg-amber-400 ring-amber-400/30"
        : "bg-rose-400 ring-rose-400/30";
  return (
    <span
      aria-hidden
      className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ring-4 ${tone}`}
    />
  );
}

function StatusBadge({ status }: { status: ConfigItemStatus }) {
  const cls =
    status === "ok"
      ? "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30"
      : status === "partial"
        ? "bg-amber-500/15 text-amber-200 ring-amber-500/30"
        : "bg-rose-500/15 text-rose-300 ring-rose-500/30";
  const label =
    status === "ok" ? "Configured" : status === "partial" ? "Partial" : "Missing";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.6rem] font-medium uppercase tracking-[0.18em] ring-1 ring-inset ${cls}`}
    >
      {label}
    </span>
  );
}

export default async function AdminSettingsPage() {
  await requireAdminSession("/admin/settings");
  const groups = getAdminConfigGroups();

  return (
    <AdminShell pageEyebrow="Mystique admin" pageTitle="Settings">
      <p className="mb-8 max-w-3xl text-sm text-[#b8ab95]">
        Operational setup status — read-only. Shows whether each subsystem is
        wired up via environment variables. <span className="text-[#d6a85f]">No secret values are ever displayed</span> here or sent to the
        browser; this page reports presence only.
      </p>

      <div className="space-y-8">
        {groups.map((group) => (
          <section
            key={group.label}
            aria-labelledby={`group-${group.label.replace(/\s+/g, "-").toLowerCase()}`}
            className="rounded-[16px] border border-[rgba(214,168,95,0.12)] bg-[rgba(255,255,255,0.02)]"
          >
            <h2
              id={`group-${group.label.replace(/\s+/g, "-").toLowerCase()}`}
              className="border-b border-[rgba(214,168,95,0.1)] px-5 py-4 text-[0.7rem] uppercase tracking-[0.24em] text-[#b8ab95]"
            >
              {group.label}
            </h2>
            <ul className="divide-y divide-[rgba(214,168,95,0.08)]">
              {group.items.map((item) => (
                <li
                  key={item.label}
                  className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="flex items-start gap-3">
                    <StatusDot status={item.status} />
                    <div className="min-w-0">
                      <p className="text-sm text-[#f5eee3]">{item.label}</p>
                      <p className="mt-1 text-xs leading-relaxed text-[#9a8f7a]">
                        {item.note}
                      </p>
                      <p className="mt-2 break-all font-mono text-[0.65rem] text-[#7a7265]">
                        {item.envVars.join(" · ")}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={item.status} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      {/* ── Future data-model notes ───────────────────────────── */}
      <section
        aria-labelledby="future-model-heading"
        className="mt-10 rounded-[16px] border border-dashed border-[rgba(214,168,95,0.22)] bg-[rgba(214,168,95,0.04)] p-6"
      >
        <h2
          id="future-model-heading"
          className="text-[0.7rem] uppercase tracking-[0.24em] text-[#d6a85f]"
        >
          Future data model — engineering notes
        </h2>
        <p className="mt-3 max-w-3xl text-sm text-[#d8c6aa]">
          The current admin reads orders from Supabase (populated by the Stripe
          webhook). Several tables that would make the admin substantially more
          useful are not yet modeled. When they exist, the v1 admin pages can
          consume them with minimal UI churn.
        </p>
        <ul className="mt-4 grid grid-cols-1 gap-3 text-sm text-[#d8c6aa] sm:grid-cols-2">
          <li className="rounded-[12px] border border-[rgba(214,168,95,0.18)] bg-[rgba(5,7,13,0.5)] p-4">
            <p className="text-[#f5eee3]">Products</p>
            <p className="mt-1 text-xs leading-relaxed text-[#9a8f7a]">
              Already in Supabase. A products admin (list / new / edit / publish
              toggle) is the next obvious build.
            </p>
          </li>
          <li className="rounded-[12px] border border-[rgba(214,168,95,0.18)] bg-[rgba(5,7,13,0.5)] p-4">
            <p className="text-[#f5eee3]">Variants &amp; inventory</p>
            <p className="mt-1 text-xs leading-relaxed text-[#9a8f7a]">
              <code className="text-[#b8ab95]">product_variants</code> exists with
              per-variant stock. Add an admin view for low-stock per variant.
            </p>
          </li>
          <li className="rounded-[12px] border border-[rgba(214,168,95,0.18)] bg-[rgba(5,7,13,0.5)] p-4">
            <p className="text-[#f5eee3]">Customers</p>
            <p className="mt-1 text-xs leading-relaxed text-[#9a8f7a]">
              Today derived from orders. A real{" "}
              <code className="text-[#b8ab95]">customers</code> table would let
              us track preferences, tags, and segment-level LTV.
            </p>
          </li>
          <li className="rounded-[12px] border border-[rgba(214,168,95,0.18)] bg-[rgba(5,7,13,0.5)] p-4">
            <p className="text-[#f5eee3]">Chatbot knowledge snippets</p>
            <p className="mt-1 text-xs leading-relaxed text-[#9a8f7a]">
              A small{" "}
              <code className="text-[#b8ab95]">chatbot_snippets</code> table
              (FAQs, brand tone, product guidance) would let ops edit prompt
              context without code deploys.
            </p>
          </li>
          <li className="rounded-[12px] border border-[rgba(214,168,95,0.18)] bg-[rgba(5,7,13,0.5)] p-4">
            <p className="text-[#f5eee3]">Promo codes</p>
            <p className="mt-1 text-xs leading-relaxed text-[#9a8f7a]">
              <code className="text-[#b8ab95]">promo_codes</code> /{" "}
              <code className="text-[#b8ab95]">promo_campaigns</code> exist in
              types. An admin promo manager unlocks campaign-level ops.
            </p>
          </li>
          <li className="rounded-[12px] border border-[rgba(214,168,95,0.18)] bg-[rgba(5,7,13,0.5)] p-4">
            <p className="text-[#f5eee3]">Refunds &amp; fulfillment</p>
            <p className="mt-1 text-xs leading-relaxed text-[#9a8f7a]">
              Stripe stores the source of truth; the orders table tracks status.
              A refund button + tracking-number editor would close the loop.
            </p>
          </li>
        </ul>
        <p className="mt-4 text-xs text-[#9a8f7a]">
          No migrations are introduced by this admin build — every page above
          consumes data that already exists or is trivially derived from it.
        </p>
      </section>
    </AdminShell>
  );
}
