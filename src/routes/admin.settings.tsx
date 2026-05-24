import { createFileRoute, useRouter } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { motion } from "framer-motion";
import { Store, Mail, Phone, MapPin, IndianRupee, Percent, Save, Check } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import type { StoreSettings } from "@/lib/db";

// ─── Server Functions ──────────────────────────────────────────────────────────

export const getSettingsFn = createServerFn({ method: "GET" }).handler(async () => {
  const { getSettings } = await import("@/lib/db");
  return await getSettings();
});

export const updateSettingsFn = createServerFn({ method: "POST" })
  .inputValidator((data: Partial<StoreSettings>) => data)
  .handler(async ({ data }) => {
    const { updateSettings } = await import("@/lib/db");
    return await updateSettings(data);
  });

// ─── Route ────────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/admin/settings")({
  component: SettingsPage,
  loader: () => getSettingsFn(),
  head: () => ({ meta: [{ title: "Settings — Sadbhaav Admin" }] }),
});

// ─── Component ────────────────────────────────────────────────────────────────

function SettingsPage() {
  const router = useRouter();
  const initialSettings = Route.useLoaderData();

  // Form states
  const [storeName, setStoreName] = useState(initialSettings.storeName);
  const [email, setEmail] = useState(initialSettings.email);
  const [phone, setPhone] = useState(initialSettings.phone);
  const [address, setAddress] = useState(initialSettings.address);
  const [shippingFee, setShippingFee] = useState(String(initialSettings.shippingFee));
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(String(initialSettings.freeShippingThreshold));
  const [taxRate, setTaxRate] = useState(String(initialSettings.taxRate));
  const [currency, setCurrency] = useState(initialSettings.currency);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await updateSettingsFn({
        data: {
          storeName,
          email,
          phone,
          address,
          shippingFee: Number(shippingFee),
          freeShippingThreshold: Number(freeShippingThreshold),
          taxRate: Number(taxRate),
          currency,
        },
      });
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("admin-data-update"));
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      await router.invalidate();
    } catch (err) {
      console.error("Failed to update settings", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminShell title="Store Settings" subtitle="Configure store identity, customer contact, and delivery financials.">
      <form onSubmit={handleSave} className="max-w-4xl space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* General Store Profile */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border bg-card p-6 shadow-soft space-y-4"
          >
            <h3 className="font-display text-lg font-semibold flex items-center gap-2 border-b pb-2">
              <Store className="h-5 w-5 text-primary" /> Store Profile
            </h3>
            
            <label className="block">
              <span className="text-xs font-medium text-muted-foreground">Store Name</span>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="mt-1 w-full rounded-xl border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary transition"
                placeholder="Sadbhaav Organic Spices"
              />
            </label>

            <label className="block">
              <span className="text-xs font-medium text-muted-foreground">Currency</span>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="mt-1 w-full rounded-xl border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary transition"
              >
                <option value="INR">Indian Rupee (₹)</option>
                <option value="USD">US Dollar ($)</option>
                <option value="EUR">Euro (€)</option>
                <option value="GBP">British Pound (£)</option>
              </select>
            </label>
          </motion.div>

          {/* Delivery & Financials */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-2xl border bg-card p-6 shadow-soft space-y-4"
          >
            <h3 className="font-display text-lg font-semibold flex items-center gap-2 border-b pb-2">
              <IndianRupee className="h-5 w-5 text-primary" /> Pricing & Delivery
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="text-xs font-medium text-muted-foreground">Standard Shipping (₹)</span>
                <input
                  type="number"
                  required
                  min="0"
                  value={shippingFee}
                  onChange={(e) => setShippingFee(e.target.value)}
                  className="mt-1 w-full rounded-xl border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary transition"
                />
              </label>

              <label className="block">
                <span className="text-xs font-medium text-muted-foreground">Free Above (₹)</span>
                <input
                  type="number"
                  required
                  min="0"
                  value={freeShippingThreshold}
                  onChange={(e) => setFreeShippingThreshold(e.target.value)}
                  className="mt-1 w-full rounded-xl border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary transition"
                />
              </label>
            </div>

            <label className="block">
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                Tax Rate <Percent className="h-3 w-3" />
              </span>
              <input
                type="number"
                required
                min="0"
                max="100"
                step="0.1"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                className="mt-1 w-full rounded-xl border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary transition"
              />
            </label>
          </motion.div>
        </div>

        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border bg-card p-6 shadow-soft space-y-4"
        >
          <h3 className="font-display text-lg font-semibold flex items-center gap-2 border-b pb-2">
            <Mail className="h-5 w-5 text-primary" /> Contact & Location
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-medium text-muted-foreground">Support Email Address</span>
              <div className="mt-1 relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border bg-background pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary transition"
                  placeholder="contact@sadbhaav.in"
                />
              </div>
            </label>

            <label className="block">
              <span className="text-xs font-medium text-muted-foreground">Store Contact Number</span>
              <div className="mt-1 relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border bg-background pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary transition"
                  placeholder="+91 98765 43210"
                />
              </div>
            </label>

            <label className="block sm:col-span-2">
              <span className="text-xs font-medium text-muted-foreground">Physical Store Address</span>
              <div className="mt-1 relative">
                <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                <textarea
                  required
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-xl border bg-background pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary transition"
                  placeholder="Erode, Tamil Nadu, India"
                />
              </div>
            </label>
          </div>
        </motion.div>

        {/* Action Button */}
        <div className="flex items-center gap-4 justify-end">
          {saveSuccess && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-sm font-semibold text-secondary flex items-center gap-1.5"
            >
              <Check className="h-4 w-4 stroke-[3px]" /> Settings saved successfully!
            </motion.div>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background hover:opacity-90 disabled:opacity-50 transition shadow-soft cursor-pointer"
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>
    </AdminShell>
  );
}
