import { createFileRoute, useRouter } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Search } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { StatusBadge } from "./admin.index";

// ─── Server Functions ──────────────────────────────────────────────────────────

export const getOrdersFn = createServerFn({ method: "GET" }).handler(async () => {
  const { getOrders } = await import("@/lib/db");
  return getOrders();
});

export const updateOrderStatusFn = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string; status: string }) => data)
  .handler(async ({ data }) => {
    const { updateOrderStatus } = await import("@/lib/db");
    return updateOrderStatus(data.id, data.status);
  });

// ─── Route ────────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/admin/orders")({
  component: Orders,
  loader: () => getOrdersFn(),
  head: () => ({ meta: [{ title: "Orders — Sadbhaav Admin" }] }),
});

const STATUS_TABS = ["All", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

// ─── Component ────────────────────────────────────────────────────────────────

function Orders() {
  const router = useRouter();
  const orders = Route.useLoaderData();
  const [tab, setTab] = useState("All");
  const [q, setQ] = useState("");

  const list = orders.filter((o) => {
    const matchTab = tab === "All" || o.status === tab;
    const matchQ =
      q === "" ||
      o.id.toLowerCase().includes(q.toLowerCase()) ||
      o.customer.toLowerCase().includes(q.toLowerCase());
    return matchTab && matchQ;
  });

  const handleStatusChange = async (id: string, status: string) => {
    await updateOrderStatusFn({ data: { id, status } });
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("admin-data-update"));
    }
    await router.invalidate();
  };

  return (
    <AdminShell title="Orders" subtitle="Track and fulfil customer orders.">
      {/* Status filter tabs */}
      <div className="mb-4 flex flex-wrap gap-2">
        {STATUS_TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
              tab === t
                ? "bg-foreground text-background border-foreground"
                : "hover:border-primary"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mb-4 relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search order or customer…"
          className="w-full rounded-full border bg-card pl-9 pr-4 py-2 text-sm outline-none focus:border-primary"
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border bg-card shadow-soft">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-5 py-3 text-left font-medium">Order</th>
              <th className="px-5 py-3 text-left font-medium">Customer</th>
              <th className="px-5 py-3 text-left font-medium">Date</th>
              <th className="px-5 py-3 text-left font-medium">Items</th>
              <th className="px-5 py-3 text-left font-medium">Status</th>
              <th className="px-5 py-3 text-right font-medium">Total</th>
              <th className="px-5 py-3 text-right font-medium">Update Status</th>
            </tr>
          </thead>
          <tbody>
            {list.map((o) => (
              <tr key={o.id} className="border-t hover:bg-muted/20 transition">
                <td className="px-5 py-3 font-semibold">#{o.id}</td>
                <td className="px-5 py-3">{o.customer}</td>
                <td className="px-5 py-3 text-muted-foreground">{o.date}</td>
                <td className="px-5 py-3">{o.items}</td>
                <td className="px-5 py-3"><StatusBadge s={o.status} /></td>
                <td className="px-5 py-3 text-right font-semibold">₹{o.total}</td>
                <td className="px-5 py-3 text-right">
                  <select
                    value={o.status}
                    onChange={(e) => handleStatusChange(o.id, e.target.value)}
                    className="rounded-full border bg-background px-3 py-1 text-xs outline-none focus:border-primary"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-muted-foreground">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Summary row */}
      <div className="mt-3 text-xs text-muted-foreground text-right">
        Showing {list.length} of {orders.length} orders
      </div>
    </AdminShell>
  );
}
