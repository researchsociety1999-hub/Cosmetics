import type { Metadata } from "next";
import Link from "next/link";
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
  const { kpis, recentOrders, inventory } = await getAdminOverview();

  return (
    <AdminShell pageEyebrow="Mystique admin" pageTitle="Overview">
      <section
        aria-label="Key performance indicators"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5"
      >
        <KpiCard
          label="Total orders"
          value={kpis.totalOrders.toLocaleString("en-US")}
          hint="Lifetime"
        />
        <KpiCard
          label="Total revenue"
          value={formatMoney(kpis.totalRevenueCents)}
          hint="Lifetime gross"
        />
        <KpiCard
          label="Orders today"
          value={kpis.ordersToday.toLocaleString("en-US")}
          hint="Since 00:00 local"
        />
        <KpiCard
          label="Revenue today"
          value={formatMoney(kpis.revenueTodayCents)}
          hint="Since 00:00 local"
        />
        <KpiCard
          label="Avg order value"
          value={formatMoney(kpis.averageOrderValueCents)}
          hint="Lifetime mean"
        />
      </section>

      <section aria-labelledby="inventory-pulse-heading" className="mt-10">
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <h2
            id="inventory-pulse-heading"
            className="text-[0.78rem] uppercase tracking-[0.24em] text-[#b8ab95]"
          >
            Inventory pulse
          </h2>
          <Link
            href="/admin/products"
            className="text-[0.7rem] uppercase tracking-[0.2em] text-[#d6a85f] underline-offset-4 hover:underline"
          >
            View products
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="Active products"
            value={inventory.activeProducts.toLocaleString("en-US")}
            hint={`${inventory.totalProducts.toLocaleString("en-US")} total in catalog`}
          />
          <KpiCard
            label="Low stock"
            value={inventory.lowStockActive.toLocaleString("en-US")}
            hint="Active SKUs ≤ 10 units"
            emphasis={inventory.lowStockActive > 0 ? "alert" : "default"}
          />
          <KpiCard
            label="Out of stock"
            value={inventory.outOfStockActive.toLocaleString("en-US")}
            hint="Active SKUs at zero"
            emphasis={inventory.outOfStockActive > 0 ? "alert" : "default"}
          />
          <KpiCard
            label="Updated this week"
            value={inventory.recentlyUpdated.toLocaleString("en-US")}
            hint="Last 7 days"
          />
        </div>
      </section>

      <section aria-labelledby="recent-orders-heading" className="mt-10">
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <h2
            id="recent-orders-heading"
            className="text-[0.78rem] uppercase tracking-[0.24em] text-[#b8ab95]"
          >
            Recent orders
          </h2>
          <Link
            href="/admin/orders"
            className="text-[0.7rem] uppercase tracking-[0.2em] text-[#d6a85f] underline-offset-4 hover:underline"
          >
            View all
          </Link>
        </div>
        <RecentOrdersMiniTable rows={recentOrders} />
      </section>
    </AdminShell>
  );
}
