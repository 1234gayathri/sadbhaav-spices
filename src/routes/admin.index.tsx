import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import { TrendingUp, ShoppingCart, Users, IndianRupee, ArrowUp, ArrowDown } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";

// ─── Server Functions ──────────────────────────────────────────────────────────

export const getDashboardFn = createServerFn({ method: "GET" }).handler(async () => {
  const { getDashboardStats } = await import("@/lib/db");
  return await getDashboardStats();
});

// ─── Route ────────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/admin/")({
  component: Dashboard,
  loader: () => getDashboardFn(),
  head: () => ({ meta: [{ title: "Dashboard — Sadbhaav Admin" }] }),
});

// ─── Component ────────────────────────────────────────────────────────────────

const chart = [42, 55, 48, 61, 58, 72, 68, 80, 76, 88, 82, 95];
const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const max = Math.max(...chart);

function Dashboard() {
  const data = Route.useLoaderData();

  const stats = [
    { label: "Revenue", value: `₹${data.totalRevenue.toLocaleString("en-IN")}`, delta: "+12.4%", up: true, icon: IndianRupee, color: "primary" },
    { label: "Orders", value: String(data.totalOrders), delta: "+8.1%", up: true, icon: ShoppingCart, color: "accent" },
    { label: "Customers", value: String(data.totalCustomers), delta: "+4.6%", up: true, icon: Users, color: "secondary" },
    { label: "Avg. Order", value: `₹${data.avgOrder}`, delta: "-1.2%", up: false, icon: TrendingUp, color: "primary" },
  ];

  return (
    <AdminShell title="Dashboard" subtitle="Welcome back. Here's what's happening today.">
      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="rounded-2xl border bg-card p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${
                s.color === "primary" ? "bg-primary/15 text-primary" :
                s.color === "accent" ? "bg-accent/15 text-accent" : "bg-secondary/15 text-secondary"
              }`}>
                <s.icon className="h-5 w-5" />
              </div>
              <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold ${
                s.up ? "bg-secondary/15 text-secondary" : "bg-destructive/15 text-destructive"
              }`}>
                {s.up ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                {s.delta}
              </span>
            </div>
            <div className="mt-4 font-display text-2xl font-semibold">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 rounded-2xl border bg-card p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-xl font-semibold">Revenue overview</h3>
              <p className="text-xs text-muted-foreground">Last 12 months</p>
            </div>
            <select className="rounded-full border bg-background px-3 py-1 text-xs">
              <option>2026</option><option>2025</option>
            </select>
          </div>
          <div className="mt-8 flex h-56 items-end gap-2">
            {chart.map((v, i) => (
              <div key={i} className="group relative flex flex-1 flex-col items-center gap-2">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(v / max) * 100}%` }}
                  transition={{ duration: 0.8, delay: i * 0.04, ease: "easeOut" }}
                  className="w-full rounded-t-lg bg-gradient-to-t from-primary to-accent opacity-80 hover:opacity-100 transition"
                />
                <span className="text-[10px] text-muted-foreground">{months[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products — from DB */}
        <div className="rounded-2xl border bg-card p-6 shadow-soft">
          <h3 className="font-display text-xl font-semibold">Top products</h3>
          <div className="mt-5 space-y-4">
            {data.topProducts.map((p: any, i: number) => (
              <div key={p.id} className="flex items-center gap-3">
                <div className="text-xs font-bold text-muted-foreground w-4">{i + 1}</div>
                <img
                  src={p.image}
                  alt=""
                  className="h-10 w-10 rounded-lg object-cover"
                  onError={(e: any) => { e.target.src = "https://via.placeholder.com/40"; }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{p.reviews} sold</div>
                </div>
                <div className="text-sm font-semibold">₹{p.price}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Recent Orders — from DB */}
        <div className="lg:col-span-2 rounded-2xl border bg-card p-6 shadow-soft">
          <h3 className="font-display text-xl font-semibold">Recent orders</h3>
          <table className="mt-4 w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="pb-3 font-medium">Order</th>
                <th className="pb-3 font-medium">Customer</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {data.recentOrders.map((o: any) => (
                <tr key={o.id} className="border-t">
                  <td className="py-3 font-semibold">#{o.id}</td>
                  <td className="py-3 text-muted-foreground">{o.customer}</td>
                  <td className="py-3"><StatusBadge s={o.status} /></td>
                  <td className="py-3 text-right font-semibold">₹{o.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Activity feed */}
        <div className="rounded-2xl border bg-card p-6 shadow-soft">
          <h3 className="font-display text-xl font-semibold">Activity</h3>
          <ol className="mt-5 space-y-4 text-sm">
            {data.activities.map((a: any, i: number) => (
              <li key={i} className="flex gap-3">
                <span className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0 ${
                  a.c === "primary" ? "bg-primary" :
                  a.c === "accent" ? "bg-accent" :
                  a.c === "destructive" ? "bg-destructive" : "bg-secondary"
                }`} />
                <div>
                  <div className="font-medium">{a.t}</div>
                  <div className="text-xs text-muted-foreground">{a.w}</div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </AdminShell>
  );
}

export function StatusBadge({ s }: { s: string }) {
  const map: Record<string, string> = {
    Delivered: "bg-secondary/15 text-secondary",
    Shipped: "bg-primary/15 text-primary",
    Processing: "bg-accent/15 text-accent",
    Pending: "bg-muted text-muted-foreground",
    Cancelled: "bg-destructive/15 text-destructive",
  };
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${map[s] ?? "bg-muted"}`}>{s}</span>;
}
