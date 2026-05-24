import { createFileRoute, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { User, ShoppingBag, CreditCard, Calendar, Truck, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

// ─── Server Function ──────────────────────────────────────────────────────────

export const getCustomerOrdersFn = createServerFn({ method: "POST" })
  .inputValidator((email: string) => email)
  .handler(async ({ data: email }) => {
    const { getOrders, getCustomers } = await import("@/lib/db");
    const emailLower = email.toLowerCase().trim();

    // Find customer stats
    const customer = getCustomers().find((c) => c.email.toLowerCase() === emailLower);

    // Find matching orders
    const orders = getOrders().filter((o) => (o.email || "").toLowerCase() === emailLower);

    return { customer: customer || null, orders };
  });

// ─── Route ────────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/client/account")({
  component: AccountPage,
  head: () => ({ meta: [{ title: "My Account — Sadbhaav Spices" }] }),
});

// ─── Component ────────────────────────────────────────────────────────────────

function AccountPage() {
  const [emailInput, setEmailInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<{ customer: any; orders: any[] } | null>(null);
  const [searched, setSearched] = useState(false);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    setIsLoading(true);
    try {
      const res = await getCustomerOrdersFn({ data: emailInput.trim() });
      setProfile(res);
      setSearched(true);
      toast.success("Account loaded successfully");
    } catch (err) {
      toast.error("Failed to retrieve profile");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setProfile(null);
    setSearched(false);
    setEmailInput("");
  };

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Customer Portal</p>
        <h1 className="font-display text-4xl font-semibold sm:text-5xl">My Profile</h1>
        <p className="text-muted-foreground">View order histories, delivery statuses, and stats.</p>
      </div>

      {!profile ? (
        <div className="mt-12 max-w-md mx-auto border rounded-3xl bg-card p-8 shadow-soft space-y-6">
          <div className="text-center space-y-2">
            <div className="h-12 w-12 bg-primary/15 text-primary rounded-full flex items-center justify-center mx-auto mb-3">
              <User className="h-6 w-6" />
            </div>
            <h2 className="font-display text-xl font-semibold">Access Your Orders</h2>
            <p className="text-xs text-muted-foreground">
              Enter the email address you used when placing your order to view your history.
            </p>
          </div>

          <form onSubmit={handleLookup} className="space-y-4">
            <label className="block">
              <span className="text-xs font-medium text-muted-foreground">Email Address</span>
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="your@email.com"
                className="mt-1.5 w-full rounded-xl border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary transition"
              />
            </label>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-6 py-3.5 text-sm font-semibold text-background hover:opacity-90 disabled:opacity-50 transition cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Retrieving...
                </>
              ) : (
                <>
                  Load Account <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>
      ) : (
        <div className="mt-12 space-y-8">
          {/* Header Dashboard Profile Banner */}
          <div className="flex flex-wrap items-center justify-between gap-4 border rounded-3xl bg-gradient-hero p-6 sm:p-8">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 bg-foreground text-background rounded-full flex items-center justify-center font-display text-2xl font-bold uppercase">
                {profile.customer?.name?.[0] || emailInput[0]}
              </div>
              <div>
                <h2 className="font-display text-2xl font-semibold">
                  {profile.customer?.name || "Customer Profile"}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">{emailInput}</p>
              </div>
            </div>

            <button
              onClick={logout}
              className="rounded-full border border-destructive/25 hover:border-destructive/50 bg-background/50 px-4 py-2 text-xs font-semibold text-destructive hover:bg-destructive/5 transition"
            >
              Switch Account
            </button>
          </div>

          {/* Stats overview cards */}
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            <div className="rounded-2xl border bg-card p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground font-semibold">Total Orders</div>
                <ShoppingBag className="h-4.5 w-4.5 text-primary" />
              </div>
              <div className="mt-2 font-display text-3xl font-semibold">
                {profile.customer?.orders || profile.orders.length}
              </div>
            </div>

            <div className="rounded-2xl border bg-card p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground font-semibold">Lifetime Spent</div>
                <CreditCard className="h-4.5 w-4.5 text-secondary" />
              </div>
              <div className="mt-2 font-display text-3xl font-semibold">
                ₹{(profile.customer?.spent || profile.orders.reduce((sum, o) => sum + o.total, 0)).toLocaleString()}
              </div>
            </div>

            <div className="rounded-2xl border bg-card p-5 shadow-soft sm:col-span-2 md:col-span-1">
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground font-semibold">Phone Number</div>
                <Truck className="h-4.5 w-4.5 text-accent" />
              </div>
              <div className="mt-2 text-sm font-semibold truncate">
                {profile.customer?.phone || profile.orders[0]?.phone || "Not provided"}
              </div>
            </div>
          </div>

          {/* Order history table */}
          <div className="rounded-3xl border bg-card overflow-hidden shadow-soft">
            <div className="px-6 py-4 border-b">
              <h3 className="font-display text-lg font-semibold">Previous Orders</h3>
            </div>

            {profile.orders.length === 0 ? (
              <div className="text-center py-16 px-6">
                <p className="text-muted-foreground text-sm">No orders recorded for this profile yet.</p>
                <Link to="/client/shop" className="mt-4 inline-flex items-center gap-1 text-primary text-sm font-semibold underline">
                  Start shopping now <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40 text-xs font-semibold uppercase text-muted-foreground">
                      <th className="px-6 py-3">Order ID</th>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Items</th>
                      <th className="px-6 py-3">Address</th>
                      <th className="px-6 py-3">Total</th>
                      <th className="px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {profile.orders.map((order) => (
                      <tr key={order.id} className="hover:bg-accent/5">
                        <td className="px-6 py-4 font-mono font-bold text-xs">{order.id}</td>
                        <td className="px-6 py-4 text-xs whitespace-nowrap">
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" /> {order.date}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold">{order.items} {order.items === 1 ? "item" : "items"}</td>
                        <td className="px-6 py-4 text-xs text-muted-foreground max-w-[200px] truncate" title={order.address}>
                          {order.address || "N/A"}
                        </td>
                        <td className="px-6 py-4 font-semibold text-foreground">₹{order.total}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              order.status === "Delivered"
                                ? "bg-emerald-100 text-emerald-800"
                                : order.status === "Cancelled"
                                ? "bg-red-100 text-red-800"
                                : order.status === "Processing" || order.status === "Shipped"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
