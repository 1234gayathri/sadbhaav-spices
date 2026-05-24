import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { Mail, Phone, Search } from "lucide-react";

// ─── Server Functions ──────────────────────────────────────────────────────────

export const getCustomersFn = createServerFn({ method: "GET" }).handler(async () => {
  const { getCustomers } = await import("@/lib/db");
  return getCustomers();
});

// ─── Route ────────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/admin/customers")({
  component: Customers,
  loader: () => getCustomersFn(),
  head: () => ({ meta: [{ title: "Customers — Sadbhaav Admin" }] }),
});

// ─── Component ────────────────────────────────────────────────────────────────

function Customers() {
  const customers = Route.useLoaderData();
  const [q, setQ] = useState("");

  const list = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(q.toLowerCase()) ||
      c.email.toLowerCase().includes(q.toLowerCase())
  );

  const totalSpent = customers.reduce((s, c) => s + c.spent, 0);
  const totalOrders = customers.reduce((s, c) => s + c.orders, 0);

  return (
    <AdminShell title="Customers" subtitle="Your community of spice lovers.">
      {/* Summary cards */}
      <div className="mb-5 grid grid-cols-3 gap-4">
        {[
          { label: "Total Customers", value: customers.length },
          { label: "Total Orders", value: totalOrders },
          { label: "Total Revenue", value: `₹${totalSpent.toLocaleString("en-IN")}` },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border bg-card p-4 shadow-soft">
            <div className="text-xs text-muted-foreground">{s.label}</div>
            <div className="mt-1 font-display text-2xl font-semibold">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="mb-4 relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name or email…"
          className="w-full rounded-full border bg-card pl-9 pr-4 py-2 text-sm outline-none focus:border-primary"
        />
      </div>

      {/* Customer cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {list.map((c) => (
          <div key={c.email} className="rounded-2xl border bg-card p-5 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-warm font-display text-lg font-bold text-primary-foreground">
                {c.name.split(" ").map((x) => x[0]).join("")}
              </div>
              <div className="min-w-0">
                <div className="font-semibold truncate">{c.name}</div>
                <div className="text-xs text-muted-foreground truncate">{c.email}</div>
              </div>
            </div>

            <div className="mt-3 text-xs text-muted-foreground">{c.phone}</div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl bg-muted/40 p-3">
                <div className="text-muted-foreground">Orders</div>
                <div className="mt-1 font-display text-lg font-semibold">{c.orders}</div>
              </div>
              <div className="rounded-xl bg-muted/40 p-3">
                <div className="text-muted-foreground">Spent</div>
                <div className="mt-1 font-display text-lg font-semibold">
                  ₹{c.spent.toLocaleString("en-IN")}
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <a
                href={`mailto:${c.email}`}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full border py-2 text-xs font-semibold hover:bg-accent/5"
              >
                <Mail className="h-3.5 w-3.5" /> Email
              </a>
              <a
                href={`tel:${c.phone}`}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-full border py-2 text-xs font-semibold hover:bg-accent/5"
              >
                <Phone className="h-3.5 w-3.5" /> Call
              </a>
            </div>
          </div>
        ))}
        {list.length === 0 && (
          <p className="col-span-3 py-10 text-center text-muted-foreground">No customers found.</p>
        )}
      </div>
    </AdminShell>
  );
}
