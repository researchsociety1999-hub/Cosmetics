import type { Metadata } from "next";
import { AdminShell } from "./components/AdminShell";
import { KpiCard } from "./components/KpiCard";
import { RecentOrdersMiniTable } from "./components/RecentOrdersMiniTable";
import { getAdminOverview } from "./lib/overviewData";
import { requireAdminSession } from "./lib/session";
import { formatMoney } from "../lib/format";

export const metadata: Metadata = {
  title: "Admin overview",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  await requireAdminSession("/admin");
  const { kpis, recentOrders } = await getAdminOverview();

  return (
    <AdminShell pageEyebrow="Mystique admin" pageTitle="Overview">
      <section
        aria-label="Key performance indicators"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <KpiCard
          label="Orders today"
          value={kpis.ordersToday.toLocaleString("en-US")}
          hint="Since 00:00 local time"
        />
        <KpiCard
          label="Revenue today"
          value={formatMoney(kpis.revenueTodayCents)}
          hint="Sum of order totals (cents)"
        />
        <KpiCard
          label="Products published"
          value={kpis.productsPublished.toLocaleString("en-US")}
          hint="is_published = true"
        />
        <KpiCard
          label="Low-stock alerts"
          value={kpis.lowStockAlerts.toLocaleString("en-US")}
          hint="stock < 5 and in_stock"
          emphasis={kpis.lowStockAlerts > 0 ? "alert" : "default"}
        />
      </section>

      <section aria-labelledby="recent-orders-heading" className="mt-10">
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <h2
            id="recent-orders-heading"
            className="text-[0.78rem] uppercase tracking-[0.24em] text-[#b8ab95]"
          >
            Recent orders
          </h2>
          <a
            href="/admin/orders"
            className="text-[0.7rem] uppercase tracking-[0.2em] text-[#d6a85f] underline-offset-4 hover:underline"
          >
            View all
          </a>
        </div>
        <RecentOrdersMiniTable rows={recentOrders} />
      </section>
    </AdminShell>
  );
}
