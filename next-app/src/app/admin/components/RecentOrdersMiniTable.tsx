import Link from "next/link";
import { formatMoney } from "../../lib/format";
import type { AdminOrderRow } from "../../lib/adminOrders";
import { StatusChip } from "./StatusChip";

interface RecentOrdersMiniTableProps {
  rows: AdminOrderRow[];
}

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) {
    return "—";
  }
  try {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function RecentOrdersMiniTable({ rows }: RecentOrdersMiniTableProps) {
  if (rows.length === 0) {
    return (
      <div className="rounded-[16px] border border-[rgba(214,168,95,0.1)] bg-[rgba(255,255,255,0.02)] p-6 text-sm text-[#9a8f7a]">
        No orders yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-[16px] border border-[rgba(214,168,95,0.12)] bg-[rgba(255,255,255,0.02)]">
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-[rgba(214,168,95,0.12)] text-[0.62rem] uppercase tracking-[0.2em] text-[#9a8f7a]">
            <th className="px-4 py-3 font-medium">Order</th>
            <th className="px-4 py-3 font-medium">Customer</th>
            <th className="px-4 py-3 font-medium text-right">Amount</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">When</th>
          </tr>
        </thead>
        <tbody className="text-[#d8c6aa]">
          {rows.map((row) => (
            <tr
              key={row.id}
              className="border-b border-[rgba(214,168,95,0.08)] last:border-0"
            >
              <td className="px-4 py-3 align-top font-mono text-[0.78rem] text-[#e8dcc4]">
                <Link
                  href={`/admin/orders/${row.id}`}
                  className="underline-offset-4 hover:underline"
                >
                  {row.order_number}
                </Link>
              </td>
              <td className="max-w-[220px] px-4 py-3 align-top">
                <div className="truncate text-[#f5eee3]" title={row.email}>
                  {row.email}
                </div>
                <div className="truncate text-xs text-[#7a7265]">
                  {row.full_name}
                </div>
              </td>
              <td className="whitespace-nowrap px-4 py-3 align-top text-right text-[#f5eee3]">
                {formatMoney(row.total_amount)}
              </td>
              <td className="whitespace-nowrap px-4 py-3 align-top">
                <StatusChip status={row.status} size="compact" />
              </td>
              <td className="whitespace-nowrap px-4 py-3 align-top text-[#b8ab95]">
                {formatDateTime(row.paid_at ?? row.created_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
