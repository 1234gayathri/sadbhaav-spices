import { Link } from "@tanstack/react-router";
import { Heart, Star, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { type Product } from "@/lib/products";
import { useCart } from "@/lib/cart";

export function ProductCard({ p }: { p: Product }) {
  const { add, toggleWish, wishlist } = useCart();
  const wished = wishlist.includes(p.id);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="group relative overflow-hidden rounded-2xl border bg-card shadow-soft transition hover:shadow-elegant"
    >
      <Link to="/client/product/$id" params={{ id: p.id }} className="block">
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img src={p.image} alt={p.name} loading="lazy" width={1024} height={1024}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
          {p.badge && (
            <span className="absolute left-3 top-3 rounded-full bg-accent px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-accent-foreground">
              {p.badge}
            </span>
          )}
          <button
            onClick={(e) => { e.preventDefault(); toggleWish(p.id); }}
            className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-card/90 backdrop-blur transition hover:scale-110"
            aria-label="Wishlist"
          >
            <Heart className={`h-4 w-4 ${wished ? "fill-accent text-accent" : ""}`} />
          </button>
        </div>
      </Link>
      <div className="p-4">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{p.category}</div>
        <Link to="/client/product/$id" params={{ id: p.id }}>
          <h3 className="mt-1 font-display text-base font-semibold leading-tight line-clamp-1">{p.name}</h3>
        </Link>
        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="h-3 w-3 fill-primary text-primary" />
          <span>{p.rating}</span>
          <span>·</span>
          <span>{p.reviews} reviews</span>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-lg font-semibold">₹{p.price}</span>
            {p.oldPrice && <span className="text-xs text-muted-foreground line-through">₹{p.oldPrice}</span>}
          </div>
          <button
            onClick={() => { add(p.id); toast.success(`${p.name} added to cart`); }}
            className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-3 py-1.5 text-xs font-semibold text-background transition hover:opacity-90"
          >
            <ShoppingBag className="h-3.5 w-3.5" /> Add
          </button>
        </div>
      </div>
    </motion.div>
  );
}
