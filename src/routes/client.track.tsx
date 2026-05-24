import { createFileRoute, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Search, Package, MapPin, Calendar, Clock, CheckCircle2, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

// ─── Server Function ──────────────────────────────────────────────────────────

export const trackOrderFn = createServerFn({ method: "POST" })
  .inputValidator((orderId: string) => orderId)
  .handler(async ({ data: orderId }) => {
    const { getOrders } = await import("@/lib/db");
    const idClean = orderId.toUpperCase().trim();
    const order = getOrders().find((o) => o.id === idClean);
    return order || null;
  });

// ─── Route ────────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/client/track")({
  component: TrackPage,
  head: () => ({ meta: [{ title: "Track My Order — Sadbhaav Spices" }] }),
});

// ─── Component ────────────────────────────────────────────────────────────────

function TrackPage() {
  const [orderIdInput, setOrderIdInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [searched, setSearched] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderIdInput.trim()) return;

    setIsLoading(true);
    setSearched(false);
    try {
      const res = await trackOrderFn({ data: orderIdInput.trim() });
      setOrder(res);
      setSearched(true);
      if (res) {
        toast.success("Order details retrieved!");
      } else {
        toast.error("Order ID not found");
      }
    } catch (err) {
      toast.error("Failed to retrieve order tracking");
    } finally {
      setIsLoading(false);
    }
  };

  const getStepIndex = (status: string) => {
    const s = status.toLowerCase();
    if (s === "pending") return 0;
    if (s === "processing") return 1;
    if (s === "shipped") return 2;
    if (s === "delivered") return 3;
    return -1; // Cancelled
  };

  const stepIndex = order ? getStepIndex(order.status) : -1;

  const steps = [
    { label: "Order Placed", desc: "Successfully received" },
    { label: "Processing", desc: "Fresh milling & packaging" },
    { label: "Shipped", desc: "Dispatched from warehouse" },
    { label: "Delivered", desc: "Handed over to you" },
  ];

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="flex flex-col gap-2 text-center max-w-xl mx-auto mb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Order Tracking</p>
        <h1 className="font-display text-4xl font-semibold sm:text-5xl">Track Your Spice Trail</h1>
        <p className="text-muted-foreground">
          Enter your unique Order ID (e.g. <span className="font-mono font-semibold">SB-1042</span>) to see its live shipping status.
        </p>
      </div>

      {/* Tracker search input box */}
      <div className="max-w-md mx-auto border rounded-3xl bg-card p-6 shadow-soft mb-8">
        <form onSubmit={handleTrack} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              required
              placeholder="e.g. SB-1042"
              value={orderIdInput}
              onChange={(e) => setOrderIdInput(e.target.value)}
              className="w-full rounded-full border bg-background pl-9 pr-4 py-2.5 text-sm outline-none focus:border-primary uppercase font-mono font-bold tracking-wider"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !orderIdInput.trim()}
            className="inline-flex items-center justify-center rounded-full bg-foreground px-6 text-sm font-semibold text-background hover:opacity-90 disabled:opacity-50 transition cursor-pointer"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Track"}
          </button>
        </form>
      </div>

      {/* Track Result details */}
      {searched && !order && (
        <div className="mt-8 text-center max-w-md mx-auto py-10 border rounded-3xl bg-card border-dashed flex flex-col items-center">
          <div className="h-12 w-12 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h2 className="font-display text-xl font-semibold">Order Not Found</h2>
          <p className="mt-2 text-muted-foreground text-xs px-6">
            We couldn't find an order matching <span className="font-mono font-semibold">{orderIdInput.toUpperCase()}</span>. Please verify your receipt or search in your profile.
          </p>
          <Link
            to="/client/account"
            className="mt-5 text-xs text-primary underline font-semibold flex items-center gap-1"
          >
            Go to Profile Lookup <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      )}

      {order && (
        <div className="space-y-8 animate-fadeIn">
          {/* Timeline Tracking Flow */}
          <div className="rounded-3xl border bg-card p-6 sm:p-8 shadow-soft">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4 mb-6">
              <div>
                <span className="text-xs text-muted-foreground">Order Reference</span>
                <h3 className="font-mono text-xl font-bold text-foreground mt-0.5">{order.id}</h3>
              </div>
              <div className="text-right">
                <span className="text-xs text-muted-foreground">Status</span>
                <div className="mt-0.5">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-0.5 text-xs font-semibold ${
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
                </div>
              </div>
            </div>

            {order.status === "Cancelled" ? (
              <div className="rounded-2xl bg-destructive/5 border border-destructive/20 p-4 flex gap-3 items-start">
                <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-destructive">This order was cancelled</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    If this is a mistake or you have questions, please reach out to our customer support.
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative mt-8">
                {/* Horizontal line for desktop, vertical line in mobile */}
                <div className="absolute left-[15px] sm:left-0 sm:right-0 top-0 sm:top-4 bottom-0 sm:bottom-auto h-full sm:h-0.5 w-0.5 sm:w-auto bg-muted -z-10" />
                <div className="grid gap-6 sm:grid-cols-4 relative">
                  {steps.map((s, idx) => {
                    const isCompleted = idx <= stepIndex;
                    const isCurrent = idx === stepIndex;

                    return (
                      <div key={s.label} className="flex sm:flex-col items-start sm:items-center gap-4 sm:gap-2 text-left sm:text-center">
                        <div
                          className={`h-8 w-8 rounded-full border-2 flex items-center justify-center font-bold text-xs bg-background transition duration-300 ${
                            isCompleted
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-muted text-muted-foreground"
                          } ${isCurrent ? "ring-4 ring-primary/10 scale-110" : ""}`}
                        >
                          {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
                        </div>
                        <div>
                          <h4 className={`text-sm font-semibold ${isCompleted ? "text-foreground" : "text-muted-foreground"}`}>
                            {s.label}
                          </h4>
                          <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">{s.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Delivery & Order summary details */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Delivery address & meta info */}
            <div className="rounded-3xl border bg-card p-6 shadow-soft space-y-4">
              <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" /> Shipping details
              </h3>
              <div className="grid gap-3 text-xs leading-relaxed">
                <div>
                  <span className="text-muted-foreground block">Customer Name</span>
                  <span className="font-semibold text-foreground">{order.customer}</span>
                </div>
                {order.phone && (
                  <div>
                    <span className="text-muted-foreground block">Contact Number</span>
                    <span className="font-semibold text-foreground">{order.phone}</span>
                  </div>
                )}
                {order.address && (
                  <div>
                    <span className="text-muted-foreground block flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" /> Delivery Address
                    </span>
                    <span className="font-semibold text-foreground block mt-0.5">{order.address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Price metadata info */}
            <div className="rounded-3xl border bg-card p-6 shadow-soft space-y-4">
              <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                <Clock className="h-5 w-5 text-secondary" /> Fulfillment Summary
              </h3>
              <div className="grid gap-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" /> Date Placed
                  </span>
                  <span className="font-semibold text-foreground">{order.date}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Purchased Items</span>
                  <span className="font-semibold text-foreground">
                    {order.items} {order.items === 1 ? "item" : "items"}
                  </span>
                </div>
                {order.paymentMethod && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Payment Method</span>
                    <span className="font-semibold text-foreground uppercase">{order.paymentMethod}</span>
                  </div>
                )}
                <hr className="my-1" />
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-foreground">Amount Paid</span>
                  <span className="font-display font-bold text-lg text-primary">₹{order.total}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
