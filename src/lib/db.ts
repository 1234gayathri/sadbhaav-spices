/**
 * db.ts — Server-only persistent database with Upstash Redis cloud backup
 *
 * Uses a local JSON file for fast in-session reads, with Upstash Redis
 * as persistent storage that survives Render free-tier restarts/redeploys.
 *
 * Setup: Add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN env vars.
 * Without these env vars, falls back to local-only file storage.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { Product } from "./products";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Order = {
  id: string;
  customer: string;
  email?: string;
  phone?: string;
  address?: string;
  items: number;
  total: number;
  status: string;
  date: string;
  paymentMethod?: string;
};

export type Customer = {
  name: string;
  email: string;
  phone: string;
  orders: number;
  spent: number;
};

export type Coupon = {
  code: string;
  description: string;
  maxUses: number;
  expiry?: string;
  uses: number;
  active: boolean;
};

export type Banner = {
  id: string;
  text: string;
  image: string;
};

export type Testimonial = {
  id: string;
  name: string;
  quote: string;
};

export type StoreSettings = {
  storeName: string;
  email: string;
  phone: string;
  address: string;
  shippingFee: number;
  freeShippingThreshold: number;
  taxRate: number;
  currency: string;
};

export type DbSchema = {
  products: Product[];
  orders: Order[];
  customers: Customer[];
  coupons: Coupon[];
  banners: Banner[];
  testimonials: Testimonial[];
  settings: StoreSettings;
};

// ─── Seed Data ────────────────────────────────────────────────────────────────

const SEED: DbSchema = {
  products: [],
  orders: [],
  customers: [],
  coupons: [],
  banners: [],
  testimonials: [],
  settings: {
    storeName: "Sadbhaav Organic Spices",
    email: "contact@sadbhaav.in",
    phone: "+91 98765 43210",
    address: "Erode, Tamil Nadu, India",
    shippingFee: 50,
    freeShippingThreshold: 499,
    taxRate: 5,
    currency: "INR",
  },
};

// ─── File Path ────────────────────────────────────────────────────────────────

const CURRENT_FILE_DIR = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(CURRENT_FILE_DIR, "../../data");
const DB_FILE = resolve(DATA_DIR, "db.json");

// ─── In-Memory Cache ──────────────────────────────────────────────────────────

let _cache: DbSchema | null = null;

// ─── Upstash Redis Helpers ────────────────────────────────────────────────────

const REDIS_KEY = "sadbhaav_db";

async function redisGet(): Promise<DbSchema | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  try {
    const res = await fetch(`${url}/get/${REDIS_KEY}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = (await res.json()) as { result?: string };
    if (json.result) return JSON.parse(json.result) as DbSchema;
  } catch (e) {
    console.error("[db] Redis GET error:", e);
  }
  return null;
}

function redisSet(data: DbSchema): void {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return;
  fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(["SET", REDIS_KEY, JSON.stringify(data)]),
  }).catch((e) => console.error("[db] Redis SET error:", e));
}

// ─── Read / Write ─────────────────────────────────────────────────────────────

function writeLocal(data: DbSchema): void {
  try {
    if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
    writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error("[db] Local file write error:", e);
  }
}

async function readDb(): Promise<DbSchema> {
  // 1. Return in-memory cache if available (fastest)
  if (_cache) return _cache;

  // 2. Try local JSON file (fast, works within same server session)
  try {
    if (existsSync(DB_FILE)) {
      const raw = readFileSync(DB_FILE, "utf-8");
      const db = JSON.parse(raw) as DbSchema;
      if (!db.settings) {
        db.settings = structuredClone(SEED.settings);
        writeLocal(db);
        redisSet(db);
      }
      _cache = db;
      return _cache;
    }
  } catch {}

  // 3. Fetch from Upstash Redis (survives restarts/redeploys)
  const fromRedis = await redisGet();
  if (fromRedis) {
    _cache = fromRedis;
    writeLocal(fromRedis);
    return _cache;
  }

  // 4. First-ever run — use seed data
  _cache = structuredClone(SEED);
  return _cache;
}

async function writeDb(data: DbSchema): Promise<void> {
  _cache = data;
  writeLocal(data);
  redisSet(data);
}

// ─── Public API ───────────────────────────────────────────────────────────────

// Products
export async function getProducts(): Promise<Product[]> {
  return (await readDb()).products;
}

export async function addProduct(product: Omit<Product, "id">): Promise<Product> {
  const db = await readDb();
  const newProduct: Product = { ...product, id: `prod-${Date.now()}` };
  db.products = [newProduct, ...db.products];
  await writeDb(db);
  return newProduct;
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
  const db = await readDb();
  const idx = db.products.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  db.products[idx] = { ...db.products[idx], ...updates };
  await writeDb(db);
  return db.products[idx];
}

export async function deleteProduct(id: string): Promise<boolean> {
  const db = await readDb();
  const before = db.products.length;
  db.products = db.products.filter((p) => p.id !== id);
  if (db.products.length === before) return false;
  await writeDb(db);
  return true;
}

// Orders
export async function getOrders(): Promise<Order[]> {
  return (await readDb()).orders;
}

export async function updateOrderStatus(id: string, status: string): Promise<Order | null> {
  const db = await readDb();
  const idx = db.orders.findIndex((o) => o.id === id);
  if (idx === -1) return null;
  db.orders[idx] = { ...db.orders[idx], status };
  await writeDb(db);
  return db.orders[idx];
}

// Customers
export async function getCustomers(): Promise<Customer[]> {
  return (await readDb()).customers;
}

// Coupons
export async function getCoupons(): Promise<Coupon[]> {
  const db = await readDb();
  const now = new Date();
  const before = db.coupons.length;
  // Auto-delete coupons whose expiry date has passed
  db.coupons = db.coupons.filter((c) => {
    if (!c.expiry) return true; // no expiry = keep forever
    const expDate = new Date(c.expiry);
    if (isNaN(expDate.getTime())) return true; // invalid date = keep
    return expDate >= now; // keep only if not yet expired
  });
  if (db.coupons.length !== before) {
    await writeDb(db); // only write if something was actually deleted
  }
  return db.coupons;
}

export async function addCoupon(coupon: Omit<Coupon, "uses" | "active">): Promise<Coupon> {
  const db = await readDb();
  const newCoupon: Coupon = { ...coupon, uses: 0, active: true };
  db.coupons = [newCoupon, ...db.coupons];
  await writeDb(db);
  return newCoupon;
}

export async function deleteCoupon(code: string): Promise<boolean> {
  const db = await readDb();
  const before = db.coupons.length;
  db.coupons = db.coupons.filter((c) => c.code !== code);
  if (db.coupons.length === before) return false;
  await writeDb(db);
  return true;
}

// Banners
export async function getBanners(): Promise<Banner[]> {
  return (await readDb()).banners;
}

export async function addBanner(banner: Omit<Banner, "id">): Promise<Banner> {
  const db = await readDb();
  const newBanner: Banner = { ...banner, id: `b-${Date.now()}` };
  db.banners = [...db.banners, newBanner];
  await writeDb(db);
  return newBanner;
}

export async function deleteBanner(id: string): Promise<boolean> {
  const db = await readDb();
  const before = db.banners.length;
  db.banners = db.banners.filter((b) => b.id !== id);
  if (db.banners.length === before) return false;
  await writeDb(db);
  return true;
}

// Testimonials
export async function getTestimonials(): Promise<Testimonial[]> {
  return (await readDb()).testimonials;
}

export async function addTestimonial(testimonial: Omit<Testimonial, "id">): Promise<Testimonial> {
  const db = await readDb();
  const newTestimonial: Testimonial = { ...testimonial, id: `t-${Date.now()}` };
  db.testimonials = [...db.testimonials, newTestimonial];
  await writeDb(db);
  return newTestimonial;
}

export async function deleteTestimonial(id: string): Promise<boolean> {
  const db = await readDb();
  const before = db.testimonials.length;
  db.testimonials = db.testimonials.filter((t) => t.id !== id);
  if (db.testimonials.length === before) return false;
  await writeDb(db);
  return true;
}

// Store Settings
export async function getSettings(): Promise<StoreSettings> {
  return (await readDb()).settings;
}

export async function updateSettings(updates: Partial<StoreSettings>): Promise<StoreSettings> {
  const db = await readDb();
  db.settings = { ...db.settings, ...updates };
  await writeDb(db);
  return db.settings;
}

// Dashboard stats and dynamic activity feed
export async function getDashboardStats() {
  const db = await readDb();
  const totalRevenue = db.orders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = db.orders.length;
  const totalCustomers = db.customers.length;
  const avgOrder = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  const recentOrders = db.orders.slice(0, 5);
  const topProducts = [...db.products]
    .sort((a, b) => b.reviews - a.reviews)
    .slice(0, 4);

  // Generate activities dynamically from actual data
  const activities: { t: string; w: string; c: "primary" | "accent" | "secondary" | "destructive" }[] = [];

  // 1. Live Orders (up to 3)
  db.orders.slice(0, 3).forEach((o, i) => {
    activities.push({
      t: `New order #${o.id} from ${o.customer}`,
      w: i === 0 ? "2 min ago" : i === 1 ? "1 hr ago" : "today",
      c: "primary",
    });
  });

  // 2. Low Stock warnings (up to 2)
  db.products.filter((p) => p.stock < 20).slice(0, 2).forEach((p) => {
    activities.push({
      t: `${p.name} stock low (${p.stock} left)`,
      w: "recently",
      c: "accent",
    });
  });

  // 3. Active Coupon usage (up to 2)
  db.coupons.filter((c) => c.active && c.uses > 0).slice(0, 2).forEach((c) => {
    activities.push({
      t: `Coupon ${c.code} used ${c.uses}×`,
      w: "today",
      c: "secondary",
    });
  });

  // Fallback if no activities exist
  if (activities.length === 0) {
    activities.push({
      t: "Store launched! Awaiting first order.",
      w: "now",
      c: "secondary",
    });
  }

  return { totalRevenue, totalOrders, totalCustomers, avgOrder, recentOrders, topProducts, activities };
}

export async function addOrder(
  order: Omit<Order, "id" | "date" | "status">,
  purchasedItems?: { id: string; qty: number }[]
): Promise<Order> {
  const db = await readDb();
  
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const now = new Date();
  const dateStr = `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
  
  const newOrder: Order = {
    ...order,
    id: `SB-${1000 + db.orders.length + 1}`,
    date: dateStr,
    status: "Pending",
  };
  
  db.orders = [newOrder, ...db.orders];

  // Decrement stock levels
  if (purchasedItems) {
    purchasedItems.forEach((item) => {
      const idx = db.products.findIndex((p) => p.id === item.id);
      if (idx !== -1) {
        db.products[idx].stock = Math.max(0, db.products[idx].stock - item.qty);
      }
    });
  }
  
  // Update or register Customer profile
  const custIdx = db.customers.findIndex((c) => c.email.toLowerCase() === (order.email || "").toLowerCase());
  if (custIdx !== -1) {
    db.customers[custIdx].orders += 1;
    db.customers[custIdx].spent += order.total;
  } else {
    db.customers.push({
      name: order.customer,
      email: order.email || "",
      phone: order.phone || "",
      orders: 1,
      spent: order.total,
    });
  }
  
  await writeDb(db);
  return newOrder;
}

export async function incrementCouponUses(code: string): Promise<boolean> {
  const db = await readDb();
  const idx = db.coupons.findIndex((c) => c.code.toUpperCase() === code.toUpperCase());
  if (idx === -1) return false;
  db.coupons[idx].uses += 1;
  await writeDb(db);
  return true;
}
