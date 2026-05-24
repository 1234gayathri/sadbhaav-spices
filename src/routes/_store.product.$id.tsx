import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Minus, Plus, ShoppingBag, Heart, Star, Truck, ShieldCheck, Leaf } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/lib/cart";
import { ProductCard } from "@/components/client/ProductCard";
import type { Product } from "@/lib/products";

export const getClientProductFn = createServerFn({ method: "GET" })
  .inputValidator((id: string) => id)
  .handler(async ({ data: id }) => {
    const { getProducts } = await import("@/lib/db");
    const all = (await getProducts()) as Product[];
    const p = all.find((x: Product) => x.id === id);
    return { product: p || null, all };
  });

export const Route = createFileRoute("/_store/product/$id")({
  component: ProductDetail,
  loader: async ({ params }) => {
    const res = await getClientProductFn({ data: params.id });
    if (!res.product) throw notFound();
    return { product: res.product, all: res.all };
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-6 py-32 text-center">
      <h1 className="font-display text-3xl">Product not found</h1>
      <Link to="/shop" className="mt-4 inline-block text-primary underline">Back to shop</Link>
    </div>
  ),
  head: ({ loaderData }) => ({
    meta: [{ title: `${loaderData?.product.name} — Sadbhaav Spices` }],
  }),
});

function ProductDetail() {
  const { product: p, all } = Route.useLoaderData();
  const [qty, setQty] = useState(1);
  const { add, toggleWish, wishlist } = useCart();
  const nav = useNavigate();
  const wished = wishlist.includes(p.id);
  const related = (all as Product[]).filter((x: Product) => x.id !== p.id).slice(0, 3);

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <nav className="text-xs text-muted-foreground">
        <Link to="/" className="hover:text-foreground">Home</Link> /{" "}
        <Link to="/shop" className="hover:text-foreground">Shop</Link> /{" "}
        <span className="text-foreground">{p.name}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div className="grid gap-3">
          <div className="overflow-hidden rounded-3xl bg-card shadow-soft aspect-square">
            <img src={p.image} alt={p.name} width={1024} height={1024} className="h-full w-full object-cover" />
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[0,1,2,3].map((i) => (
              <div key={i} className="aspect-square overflow-hidden rounded-xl border bg-card">
                <img src={p.image} alt="" loading="lazy" className="h-full w-full object-cover opacity-80 hover:opacity-100 transition" />
              </div>
            ))}
          </div>
        </div>

        <div>
          {p.badge && <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-accent">{p.badge}</span>}
          <h1 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">{p.name}</h1>
          <p className="mt-2 text-muted-foreground">{p.tagline}</p>
          <div className="mt-3 flex items-center gap-2 text-sm">
            <Star className="h-4 w-4 fill-primary text-primary" />
            <span className="font-semibold">{p.rating}</span>
            <span className="text-muted-foreground">({p.reviews} reviews)</span>
          </div>
          <div className="mt-6 flex items-baseline gap-3">
            <span className="font-display text-4xl font-semibold">₹{p.price}</span>
            {p.oldPrice && <span className="text-lg text-muted-foreground line-through">₹{p.oldPrice}</span>}
            {p.oldPrice && <span className="rounded-full bg-secondary/15 px-2 py-0.5 text-xs font-bold text-secondary">
              {Math.round((1 - p.price / p.oldPrice) * 100)}% off
            </span>}
          </div>

          <p className="mt-6 text-base leading-relaxed text-muted-foreground">{p.description}</p>

          <div className="mt-8 flex items-center gap-4">
            <div className="inline-flex items-center rounded-full border bg-card">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-3 hover:bg-accent/10 rounded-l-full"><Minus className="h-4 w-4" /></button>
              <span className="px-4 font-semibold tabular-nums">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="p-3 hover:bg-accent/10 rounded-r-full"><Plus className="h-4 w-4" /></button>
            </div>
            <span className="text-xs text-muted-foreground">{p.stock} in stock</span>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => { add(p.id, qty); toast.success("Added to cart"); }}
              className="inline-flex items-center gap-2 rounded-full bg-foreground px-7 py-3.5 text-sm font-semibold text-background hover:opacity-90 transition"
            >
              <ShoppingBag className="h-4 w-4" /> Add to cart
            </button>
            <button
              onClick={() => { add(p.id, qty); nav({ to: "/checkout" }); }}
              className="inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 text-sm font-semibold text-accent-foreground hover:opacity-90 transition"
            >
              Buy now
            </button>
            <button onClick={() => toggleWish(p.id)} className="inline-flex h-12 w-12 items-center justify-center rounded-full border hover:bg-accent/5">
              <Heart className={`h-5 w-5 ${wished ? "fill-accent text-accent" : ""}`} />
            </button>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3 text-xs">
            <Feature icon={Truck} t="Free delivery" d="Over ₹499" />
            <Feature icon={ShieldCheck} t="Lab tested" d="FSSAI certified" />
            <Feature icon={Leaf} t="100% organic" d="Farm direct" />
          </div>

          <div className="mt-8 rounded-2xl border bg-card p-5">
            <div className="text-sm font-semibold">Ingredients</div>
            <ul className="mt-2 text-sm text-muted-foreground">
              {p.ingredients.map((i: string) => <li key={i}>· {i}</li>)}
            </ul>
          </div>
        </div>
      </div>

      <section className="mt-20">
        <h2 className="font-display text-3xl font-semibold">You might also love</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((r) => <ProductCard key={r.id} p={r} />)}
        </div>
      </section>
    </div>
  );
}

function Feature({ icon: Icon, t, d }: any) {
  return (
    <div className="flex items-center gap-2 rounded-xl border bg-card p-3">
      <Icon className="h-4 w-4 text-primary" />
      <div>
        <div className="font-semibold">{t}</div>
        <div className="text-muted-foreground">{d}</div>
      </div>
    </div>
  );
}
