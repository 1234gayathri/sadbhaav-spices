/**
 * db.ts — Server-only persistent database backed by data/db.json
 *
 * Uses Node.js `fs` which is available in TanStack Start / Vite SSR dev mode.
 * All mutations are synchronous-safe because server functions are serialized per request.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import type { Product } from "./products";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Order = {
  id: string;
  customer: string;
  email?: string;
  phone?: string;
  address?: string;
  paymentMethod?: string;
  date: string;
  items: number;
  total: number;
  status: string;
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
  uses: number;
  maxUses: number;
  expiry: string;
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
  products: [
    {
      id: "turmeric-classic",
      name: "Organic Turmeric Powder",
      tagline: "Sun-dried Erode roots",
      category: "Turmeric",
      price: 249,
      oldPrice: 299,
      rating: 4.9,
      reviews: 1284,
      image: "/assets/turmeric.jpg",
      badge: "Bestseller",
      description: "Stone-ground from sun-dried Erode turmeric roots, our golden powder carries 4.2% curcumin.",
      ingredients: ["100% Organic Turmeric (Curcuma longa)"],
      stock: 124,
    },
    {
      id: "chilli-kashmiri",
      name: "Kashmiri Chilli Powder",
      tagline: "Mild heat, vivid colour",
      category: "Chilli",
      price: 279,
      oldPrice: 329,
      rating: 4.8,
      reviews: 942,
      image: "/assets/chilli.jpg",
      badge: "New",
      description: "Hand-picked Kashmiri chillies, slow sun-dried and finely milled. Deep crimson colour, gentle heat.",
      ingredients: ["100% Organic Kashmiri Chillies"],
      stock: 86,
    },
    {
      id: "cardamom-green",
      name: "Green Cardamom Pods",
      tagline: "Idukki highland harvest",
      category: "Cardamom",
      price: 549,
      oldPrice: 649,
      rating: 4.95,
      reviews: 612,
      image: "/assets/cardamom.jpg",
      badge: "Premium",
      description: "Bold 8mm pods from the misty hills of Idukki — intensely aromatic with sweet, floral notes.",
      ingredients: ["100% Organic Green Cardamom (Elettaria cardamomum)"],
      stock: 58,
    },
    {
      id: "turmeric-raw",
      name: "Raw Turmeric Fingers",
      tagline: "Whole dried rhizomes",
      category: "Turmeric",
      price: 329,
      rating: 4.7,
      reviews: 318,
      image: "/assets/turmeric.jpg",
      description: "Whole sun-dried turmeric fingers. Grind fresh at home for unmatched aroma.",
      ingredients: ["100% Organic Turmeric Rhizome"],
      stock: 47,
    },
    {
      id: "chilli-guntur",
      name: "Guntur Chilli Powder",
      tagline: "Bold Andhra heat",
      category: "Chilli",
      price: 229,
      rating: 4.6,
      reviews: 456,
      image: "/assets/chilli.jpg",
      description: "Fiery, smoky Guntur Sannam chillies — the soul of Andhra cuisine.",
      ingredients: ["100% Organic Guntur Chillies"],
      stock: 92,
    },
    {
      id: "cardamom-powder",
      name: "Ground Cardamom",
      tagline: "Fresh-milled, aromatic",
      category: "Cardamom",
      price: 649,
      rating: 4.85,
      reviews: 204,
      image: "/assets/cardamom.jpg",
      description: "Freshly milled green cardamom powder — perfect for chai, desserts, and bakes.",
      ingredients: ["100% Organic Green Cardamom"],
      stock: 31,
    },
  ],
  orders: [
    { id: "SB-1042", customer: "Priya Sharma", date: "May 22, 2026", items: 3, total: 798, status: "Delivered" },
    { id: "SB-1041", customer: "Rohan Patel", date: "May 22, 2026", items: 1, total: 549, status: "Shipped" },
    { id: "SB-1040", customer: "Anita Reddy", date: "May 21, 2026", items: 4, total: 1027, status: "Processing" },
    { id: "SB-1039", customer: "Karan Gupta", date: "May 21, 2026", items: 1, total: 329, status: "Delivered" },
    { id: "SB-1038", customer: "Meera Iyer", date: "May 20, 2026", items: 2, total: 229, status: "Cancelled" },
    { id: "SB-1037", customer: "Vikram Singh", date: "May 20, 2026", items: 5, total: 1599, status: "Pending" },
  ],
  customers: [
    { name: "Priya Sharma", email: "priya@example.com", phone: "+91 98765 22100", orders: 12, spent: 4290 },
    { name: "Rohan Patel", email: "rohan@example.com", phone: "+91 98765 54210", orders: 8, spent: 2840 },
    { name: "Anita Reddy", email: "anita@example.com", phone: "+91 98765 98700", orders: 5, spent: 1750 },
    { name: "Karan Gupta", email: "karan@example.com", phone: "+91 98765 33440", orders: 14, spent: 6120 },
    { name: "Meera Iyer", email: "meera@example.com", phone: "+91 98765 12120", orders: 3, spent: 990 },
  ],
  coupons: [
    { code: "PURE20", description: "20% off first order", uses: 248, maxUses: 1000, expiry: "Jun 30, 2026", active: true },
    { code: "HARVEST10", description: "₹100 off above ₹999", uses: 89, maxUses: 500, expiry: "Jul 15, 2026", active: true },
    { code: "DIWALI25", description: "25% off entire store", uses: 612, maxUses: 612, expiry: "Nov 12, 2025", active: false },
  ],
  banners: [
    { id: "b1", text: "Festival sale 20% off", image: "/assets/hero-spices.jpg" },
    { id: "b2", text: "New harvest cardamom", image: "/assets/hero-spices.jpg" },
    { id: "b3", text: "Free delivery above ₹499", image: "/assets/hero-spices.jpg" },
  ],
  testimonials: [
    { id: "t1", name: "Priya · Bengaluru", quote: "The turmeric is unlike anything from the supermarket…" },
    { id: "t2", name: "Arjun · Mumbai", quote: "Guntur chillies brought the perfect heat to my curries!" },
    { id: "t3", name: "Meera · Delhi", quote: "Cardamom pods are so fragrant, absolutely premium quality." },
  ],
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

const DATA_DIR = resolve(process.cwd(), "data");
const DB_FILE = resolve(DATA_DIR, "db.json");

// ─── Read / Write ─────────────────────────────────────────────────────────────

function readDb(): DbSchema {
  try {
    if (!existsSync(DB_FILE)) return structuredClone(SEED);
    const raw = readFileSync(DB_FILE, "utf-8");
    const db = JSON.parse(raw) as DbSchema;
    // Auto-migrate if settings are missing
    if (!db.settings) {
      db.settings = structuredClone(SEED.settings);
      writeDb(db);
    }
    return db;
  } catch {
    return structuredClone(SEED);
  }
}

function writeDb(data: DbSchema): void {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
}

// ─── Public API ───────────────────────────────────────────────────────────────

// Products
export function getProducts(): Product[] {
  return readDb().products;
}

export function addProduct(product: Omit<Product, "id">): Product {
  const db = readDb();
  const newProduct: Product = { ...product, id: `prod-${Date.now()}` };
  db.products = [newProduct, ...db.products];
  writeDb(db);
  return newProduct;
}

export function updateProduct(id: string, updates: Partial<Product>): Product | null {
  const db = readDb();
  const idx = db.products.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  db.products[idx] = { ...db.products[idx], ...updates };
  writeDb(db);
  return db.products[idx];
}

export function deleteProduct(id: string): boolean {
  const db = readDb();
  const before = db.products.length;
  db.products = db.products.filter((p) => p.id !== id);
  if (db.products.length === before) return false;
  writeDb(db);
  return true;
}

// Orders
export function getOrders(): Order[] {
  return readDb().orders;
}

export function updateOrderStatus(id: string, status: string): Order | null {
  const db = readDb();
  const idx = db.orders.findIndex((o) => o.id === id);
  if (idx === -1) return null;
  db.orders[idx] = { ...db.orders[idx], status };
  writeDb(db);
  return db.orders[idx];
}

// Customers
export function getCustomers(): Customer[] {
  return readDb().customers;
}

// Coupons
export function getCoupons(): Coupon[] {
  const db = readDb();
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
    writeDb(db); // only write if something was actually deleted
  }
  return db.coupons;
}

export function addCoupon(coupon: Omit<Coupon, "uses" | "active">): Coupon {
  const db = readDb();
  const newCoupon: Coupon = { ...coupon, uses: 0, active: true };
  db.coupons = [newCoupon, ...db.coupons];
  writeDb(db);
  return newCoupon;
}

export function deleteCoupon(code: string): boolean {
  const db = readDb();
  const before = db.coupons.length;
  db.coupons = db.coupons.filter((c) => c.code !== code);
  if (db.coupons.length === before) return false;
  writeDb(db);
  return true;
}

// Banners
export function getBanners(): Banner[] {
  return readDb().banners;
}

export function addBanner(banner: Omit<Banner, "id">): Banner {
  const db = readDb();
  const newBanner: Banner = { ...banner, id: `b-${Date.now()}` };
  db.banners = [...db.banners, newBanner];
  writeDb(db);
  return newBanner;
}

export function deleteBanner(id: string): boolean {
  const db = readDb();
  const before = db.banners.length;
  db.banners = db.banners.filter((b) => b.id !== id);
  if (db.banners.length === before) return false;
  writeDb(db);
  return true;
}

// Testimonials
export function getTestimonials(): Testimonial[] {
  return readDb().testimonials;
}

export function addTestimonial(testimonial: Omit<Testimonial, "id">): Testimonial {
  const db = readDb();
  const newTestimonial: Testimonial = { ...testimonial, id: `t-${Date.now()}` };
  db.testimonials = [...db.testimonials, newTestimonial];
  writeDb(db);
  return newTestimonial;
}

export function deleteTestimonial(id: string): boolean {
  const db = readDb();
  const before = db.testimonials.length;
  db.testimonials = db.testimonials.filter((t) => t.id !== id);
  if (db.testimonials.length === before) return false;
  writeDb(db);
  return true;
}

// Store Settings
export function getSettings(): StoreSettings {
  return readDb().settings;
}

export function updateSettings(updates: Partial<StoreSettings>): StoreSettings {
  const db = readDb();
  db.settings = { ...db.settings, ...updates };
  writeDb(db);
  return db.settings;
}

// Dashboard stats and dynamic activity feed
export function getDashboardStats() {
  const db = readDb();
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

export function addOrder(
  order: Omit<Order, "id" | "date" | "status">,
  purchasedItems?: { id: string; qty: number }[]
): Order {
  const db = readDb();
  
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
  
  writeDb(db);
  return newOrder;
}

export function incrementCouponUses(code: string): boolean {
  const db = readDb();
  const idx = db.coupons.findIndex((c) => c.code.toUpperCase() === code.toUpperCase());
  if (idx === -1) return false;
  db.coupons[idx].uses += 1;
  writeDb(db);
  return true;
}
