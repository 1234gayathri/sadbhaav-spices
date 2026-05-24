import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { createServerFn } from "@tanstack/react-start";
import { products, type Product } from "./products";

// ─── Server Functions ──────────────────────────────────────────────────────────

export const getDbProductsFn = createServerFn({ method: "GET" }).handler(async () => {
  const { getProducts } = await import("./db");
  return getProducts();
});

// ─── Types ────────────────────────────────────────────────────────────────────

export type CartItem = { product: Product; qty: number };

type CartCtx = {
  items: CartItem[];
  wishlist: string[];
  add: (id: string, qty?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  toggleWish: (id: string) => void;
  count: number;
  subtotal: number;
};

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<{ id: string; qty: number }[]>([]);
  const [wishlist, setWish] = useState<string[]>([]);
  const [dbProducts, setDbProducts] = useState<Product[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // 1. Load from localStorage safely on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem("sb_cart");
      if (raw) setItems(JSON.parse(raw));
      const w = localStorage.getItem("sb_wish");
      if (w) setWish(JSON.parse(w));
    } catch {}
    setIsMounted(true);
  }, []);

  // 2. Fetch live database products on mount and whenever items change
  useEffect(() => {
    getDbProductsFn()
      .then((res) => {
        setDbProducts(res);
      })
      .catch((err) => {
        console.error("Failed to load db products for cart", err);
      });
  }, [items]);

  // 3. Persist changes to localStorage only after mounting has completed
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("sb_cart", JSON.stringify(items));
    }
  }, [items, isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("sb_wish", JSON.stringify(wishlist));
    }
  }, [wishlist, isMounted]);

  const value = useMemo<CartCtx>(() => {
    const resolved: CartItem[] = items
      .map((i) => {
        // Resolve using live database products if loaded, fallback to static seed list
        const p = dbProducts.find((x) => x.id === i.id) || products.find((x) => x.id === i.id);
        return p ? { product: p, qty: i.qty } : null;
      })
      .filter(Boolean) as CartItem[];

    return {
      items: resolved,
      wishlist,
      add: (id, qty = 1) =>
        setItems((cur) => {
          const f = cur.find((c) => c.id === id);
          if (f) return cur.map((c) => (c.id === id ? { ...c, qty: c.qty + qty } : c));
          return [...cur, { id, qty }];
        }),
      remove: (id) => setItems((cur) => cur.filter((c) => c.id !== id)),
      setQty: (id, qty) =>
        setItems((cur) =>
          qty <= 0 ? cur.filter((c) => c.id !== id) : cur.map((c) => (c.id === id ? { ...c, qty } : c))
        ),
      clear: () => setItems([]),
      toggleWish: (id) =>
        setWish((w) => (w.includes(id) ? w.filter((x) => x !== id) : [...w, id])),
      count: resolved.reduce((s, i) => s + i.qty, 0),
      subtotal: resolved.reduce((s, i) => s + i.qty * i.product.price, 0),
    };
  }, [items, wishlist, dbProducts]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useCart = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("CartProvider missing");
  return c;
};
