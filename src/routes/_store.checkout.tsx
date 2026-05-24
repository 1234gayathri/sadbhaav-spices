import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { CheckCircle2, CreditCard, MapPin, Truck } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/lib/cart";

// ─── Server Functions ──────────────────────────────────────────────────────────

export const getCheckoutSettingsFn = createServerFn({ method: "GET" }).handler(async () => {
  const { getSettings } = await import("@/lib/db");
  return await getSettings();
});

export const validateCouponFn = createServerFn({ method: "POST" })
  .inputValidator((code: string) => code)
  .handler(async ({ data }: { data: string }) => {
    const code = data;
    const { getCoupons } = await import("@/lib/db");
    const coupons = await getCoupons();
    const found = coupons.find((c) => c.code.toUpperCase() === code.toUpperCase());
    if (!found) {
      return { valid: false, message: "Invalid coupon code" };
    }
    if (!found.active) {
      return { valid: false, message: "Coupon is inactive" };
    }
    if (found.uses >= found.maxUses) {
      return { valid: false, message: "Coupon limit reached" };
    }
    const expiryDate = new Date(found.expiry);
    if (!isNaN(expiryDate.getTime()) && expiryDate < new Date()) {
      return { valid: false, message: "Coupon has expired" };
    }
    return { valid: true, coupon: found };
  });

export type PlaceOrderInput = {
  order: {
    customer: string;
    email: string;
    phone: string;
    address: string;
    paymentMethod: string;
    items: number;
    total: number;
  };
  items: { id: string; qty: number }[];
  couponCode?: string;
};

export const placeOrderFn = createServerFn({ method: "POST" })
  .inputValidator((data: PlaceOrderInput) => data)
  .handler(async ({ data }: { data: PlaceOrderInput }) => {
    const { addOrder, incrementCouponUses } = await import("@/lib/db");
    const order = await addOrder(data.order, data.items);
    if (data.couponCode) {
      await incrementCouponUses(data.couponCode);
    }
    return order;
  });

// ─── Helper Functions ──────────────────────────────────────────────────────────

function getCouponDiscount(
  coupon: { code: string; description: string },
  subtotal: number
): { discount: number; error?: string } {
  const desc = coupon.description.toLowerCase();

  if (desc.includes("above")) {
    const thresholdMatch = desc.match(/above\s*[^\d]*(\d+)/);
    if (thresholdMatch) {
      const threshold = parseFloat(thresholdMatch[1]);
      if (subtotal < threshold) {
        return { discount: 0, error: `Coupon requires minimum purchase of ₹${threshold}` };
      }
    }
  }

  if (desc.includes("%")) {
    const match = desc.match(/(\d+)\s*%/);
    if (match) {
      const pct = parseFloat(match[1]);
      return { discount: Math.round(subtotal * (pct / 100)) };
    }
  }

  // Look for flat discount
  const offMatch = desc.match(/(?:₹|rs\.?|off)\s*(\d+)|(\d+)\s*(?:off|rs|₹)/i);
  if (offMatch) {
    const amt = parseFloat(offMatch[1] || offMatch[2]);
    return { discount: Math.min(subtotal, amt) };
  }

  return { discount: 0 };
}

// ─── Route ────────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/_store/checkout")({
  component: Checkout,
  loader: () => getCheckoutSettingsFn(),
  head: () => ({ meta: [{ title: "Checkout — Sadbhaav Spices" }] }),
});

// ─── Component ────────────────────────────────────────────────────────────────

function Checkout() {
  const settings = Route.useLoaderData();
  const { items, subtotal, clear, setQty, remove } = useCart();
  const [pay, setPay] = useState("upi");
  const [done, setDone] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState("standard");

  // Input states
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [pinCode, setPinCode] = useState("");

  // Payment states
  const [cardNo, setCardNo] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [upiId, setUpiId] = useState("");

  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponMessage, setCouponMessage] = useState("");
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState("");

  const isPersonalDetailsValid =
    fullName.trim() !== "" &&
    phone.trim() !== "" &&
    email.trim() !== "" &&
    address.trim() !== "" &&
    city.trim() !== "" &&
    pinCode.trim() !== "";

  const isPaymentValid =
    pay === "cod" ||
    (pay === "upi" && upiId.trim() !== "");

  const isFormValid = isPersonalDetailsValid && isPaymentValid && items.length > 0;

  let discount = 0;
  let couponError = "";
  if (appliedCoupon) {
    const res = getCouponDiscount(appliedCoupon, subtotal);
    discount = res.discount;
    if (res.error) {
      couponError = res.error;
    }
  }

  const effectiveError = couponError || (appliedCoupon && discount === 0 ? "Coupon criteria not met" : "");

  const shipping =
    deliveryMethod === "express"
      ? 99
      : subtotal >= settings.freeShippingThreshold
      ? 0
      : settings.shippingFee;

  const total = Math.max(0, subtotal - discount + shipping);

  const applyCoupon = async () => {
    if (!couponInput.trim()) return;
    setIsValidatingCoupon(true);
    setCouponMessage("");
    try {
      const res = await validateCouponFn({ data: couponInput.trim() });
      if (res.valid && res.coupon) {
        const discRes = getCouponDiscount(res.coupon, subtotal);
        if (discRes.error) {
          setCouponMessage(discRes.error);
        } else {
          setAppliedCoupon(res.coupon);
          setCouponMessage(`Coupon "${res.coupon.code}" applied: ${res.coupon.description}`);
        }
      } else {
        setCouponMessage(res.message || "Invalid coupon code");
      }
    } catch (err) {
      setCouponMessage("Failed to validate coupon");
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponMessage("");
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setIsSubmitting(true);
    try {
      const fd = new FormData(e.currentTarget);
      const name = fd.get("fullName") as string;
      const phone = fd.get("phone") as string;
      const email = fd.get("email") as string;
      const addressVal = fd.get("address") as string;
      const city = fd.get("city") as string;
      const pinCode = fd.get("pinCode") as string;

      const fullAddress = `${addressVal}, ${city} - ${pinCode}`;

      const orderPayload = {
        order: {
          customer: name,
          email,
          phone,
          address: fullAddress,
          paymentMethod: pay.toUpperCase(),
          items: items.reduce((sum, item) => sum + item.qty, 0),
          total: total,
        },
        items: items.map((item) => ({ id: item.product.id, qty: item.qty })),
        couponCode: (appliedCoupon && discount > 0) ? appliedCoupon.code : undefined,
      };

      const result = await placeOrderFn({ data: orderPayload });
      setPlacedOrderId(result.id);
      clear();
      setDone(true);
      toast.success("Order placed successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <CheckCircle2 className="mx-auto h-16 w-16 text-secondary" />
        <h1 className="mt-6 font-display text-3xl font-semibold">Order placed!</h1>
        {placedOrderId && (
          <p className="mt-2 text-sm font-mono bg-accent/10 text-accent px-4 py-1 rounded-full w-fit mx-auto font-bold">
            Order ID: {placedOrderId}
          </p>
        )}
        <p className="mt-4 text-muted-foreground">We'll send a confirmation to your email shortly.</p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background hover:opacity-90"
        >
          Back to store
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="font-display text-4xl font-semibold">Checkout</h1>
      <form onSubmit={onSubmit} className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Section icon={MapPin} title="Delivery address">
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="Full name"
                name="fullName"
                value={fullName}
                onChange={(e: any) => setFullName(e.target.value)}
                required
              />
              <Input
                label="Phone"
                name="phone"
                type="tel"
                value={phone}
                onChange={(e: any) => setPhone(e.target.value)}
                required
              />
              <Input
                label="Email"
                name="email"
                type="email"
                className="sm:col-span-2"
                value={email}
                onChange={(e: any) => setEmail(e.target.value)}
                required
              />
              <Input
                label="Address line"
                name="address"
                className="sm:col-span-2"
                value={address}
                onChange={(e: any) => setAddress(e.target.value)}
                required
              />
              <Input
                label="City"
                name="city"
                value={city}
                onChange={(e: any) => setCity(e.target.value)}
                required
              />
              <Input
                label="PIN code"
                name="pinCode"
                value={pinCode}
                onChange={(e: any) => setPinCode(e.target.value)}
                required
              />
            </div>
          </Section>

          <Section icon={Truck} title="Delivery method">
            <div className="grid gap-3 sm:grid-cols-2">
              <Radio
                name="delivery"
                checked={deliveryMethod === "standard"}
                onChange={() => setDeliveryMethod("standard")}
                label="Standard · 3–5 days"
                desc={
                  subtotal >= settings.freeShippingThreshold
                    ? "Free (Threshold met)"
                    : `₹${settings.shippingFee} (Free above ₹${settings.freeShippingThreshold})`
                }
              />
              <Radio
                name="delivery"
                checked={deliveryMethod === "express"}
                onChange={() => setDeliveryMethod("express")}
                label="Express · 1–2 days"
                desc="₹99"
              />
            </div>
          </Section>

          <Section icon={CreditCard} title="Payment">
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { id: "upi", l: "UPI" },
                { id: "cod", l: "Cash on delivery" },
              ].map((o) => (
                <button
                  type="button"
                  key={o.id}
                  onClick={() => setPay(o.id)}
                  className={`rounded-xl border p-4 text-sm font-semibold transition ${
                    pay === o.id
                      ? "border-primary bg-primary/5 text-primary"
                      : "hover:border-primary/50"
                  }`}
                >
                  {o.l}
                </button>
              ))}
            </div>
            {pay === "upi" && (
              <div className="mt-4">
                <Input
                  label="UPI ID"
                  placeholder="yourname@upi"
                  value={upiId}
                  onChange={(e: any) => setUpiId(e.target.value)}
                />
              </div>
            )}
          </Section>
        </div>

        <aside className="space-y-3 rounded-2xl border bg-card p-6 shadow-soft h-fit lg:sticky lg:top-24">
          <div className="font-display text-xl font-semibold">Order summary</div>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {items.map(({ product: p, qty }) => (
              <div key={p.id} className="flex items-center gap-3 text-sm">
                <img src={p.image} alt="" className="h-12 w-12 rounded-lg object-cover" />
                <div className="flex-1">
                  <div className="font-medium line-clamp-1">{p.name}</div>
                  <div className="mt-1 flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setQty(p.id, Math.max(0, qty - 1))}
                      className="inline-flex h-5 w-5 items-center justify-center rounded-md border bg-background hover:bg-accent/10 transition text-xs font-bold"
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="text-xs font-semibold tabular-nums px-1">{qty}</span>
                    <button
                      type="button"
                      onClick={() => setQty(p.id, qty + 1)}
                      className="inline-flex h-5 w-5 items-center justify-center rounded-md border bg-background hover:bg-accent/10 transition text-xs font-bold"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">₹{p.price * qty}</div>
                  <button
                    type="button"
                    onClick={() => remove(p.id)}
                    className="text-[10px] text-destructive hover:underline mt-1 block ml-auto font-medium"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          <hr />

          {/* Coupon Code Input */}
          <div className="space-y-1.5 pb-2">
            <span className="text-xs font-semibold text-muted-foreground">Promo / Coupon Code</span>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. PURE20"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                disabled={!!appliedCoupon}
                className="flex-1 min-w-0 rounded-xl border bg-background px-3 py-2 text-xs outline-none focus:border-primary uppercase disabled:opacity-50"
              />
              {appliedCoupon ? (
                <button
                  type="button"
                  onClick={removeCoupon}
                  className="rounded-xl border border-destructive bg-destructive/5 px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10 transition"
                >
                  Remove
                </button>
              ) : (
                <button
                  type="button"
                  onClick={applyCoupon}
                  disabled={!couponInput.trim() || isValidatingCoupon}
                  className="rounded-xl bg-foreground px-3 py-2 text-xs font-semibold text-background hover:opacity-90 disabled:opacity-50 transition"
                >
                  {isValidatingCoupon ? "..." : "Apply"}
                </button>
              )}
            </div>
            {couponMessage && (
              <p
                className={`text-[11px] leading-tight ${
                  appliedCoupon && !effectiveError ? "text-emerald-600 font-semibold" : "text-destructive"
                }`}
              >
                {effectiveError || couponMessage}
              </p>
            )}
          </div>

          <hr />
          <Row k="Subtotal" v={`₹${subtotal}`} />
          {discount > 0 && <Row k="Discount" v={`-₹${discount}`} />}
          <Row k="Shipping" v={shipping === 0 ? "Free" : `₹${shipping}`} />
          <hr />
          <Row k="Total" v={`₹${total}`} bold />
          <button
            type="submit"
            disabled={isSubmitting || !isFormValid}
            className="mt-2 w-full rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
          >
            {isSubmitting ? "Placing order..." : "Place order"}
          </button>
        </aside>
      </form>
    </div>
  );
}

function Section({ icon: Icon, title, children }: any) {
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-soft">
      <div className="mb-4 flex items-center gap-2">
        <Icon className="h-5 w-5 text-primary" />
        <h2 className="font-display text-xl font-semibold">{title}</h2>
      </div>
      {children}
    </div>
  );
}
function Input({ label, className = "", ...p }: any) {
  return (
    <label className={`block ${className}`}>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <input
        {...p}
        className="mt-1 w-full rounded-xl border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
      />
    </label>
  );
}
function Radio({ label, desc, ...p }: any) {
  return (
    <label className="cursor-pointer rounded-xl border p-4 has-[:checked]:border-primary has-[:checked]:bg-primary/5 transition">
      <input type="radio" className="sr-only" {...p} />
      <div className="text-sm font-semibold">{label}</div>
      <div className="text-xs text-muted-foreground">{desc}</div>
    </label>
  );
}
function Row({ k, v, bold }: any) {
  return (
    <div
      className={`flex items-center justify-between text-sm ${
        bold ? "font-semibold text-base" : "text-muted-foreground"
      }`}
    >
      <span>{k}</span>
      <span className={bold ? "font-display text-lg text-foreground" : ""}>{v}</span>
    </div>
  );
}
