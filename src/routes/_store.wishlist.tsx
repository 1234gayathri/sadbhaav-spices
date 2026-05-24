import { createFileRoute, Link } from "@tanstack/react-router";
import { getShopProductsFn } from "./_store.shop";
import { useCart } from "@/lib/cart";
import { ProductCard } from "@/components/client/ProductCard";
import { Heart } from "lucide-react";

export const Route = createFileRoute("/_store/wishlist")({
  component: WishlistPage,
  loader: () => getShopProductsFn(),
  head: () => ({ meta: [{ title: "My Wishlist — Sadbhaav Spices" }] }),
});

function WishlistPage() {
  const products = Route.useLoaderData();
  const { wishlist } = useCart();

  const favorited = products.filter((p) => wishlist.includes(p.id));

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Favourites</p>
        <h1 className="font-display text-4xl font-semibold sm:text-5xl">My Wishlist</h1>
        <p className="text-muted-foreground">Keep track of your favorite spices and blends.</p>
      </div>

      {favorited.length === 0 ? (
        <div className="mt-20 text-center max-w-md mx-auto py-12 border rounded-3xl bg-card/30 border-dashed flex flex-col items-center">
          <div className="h-16 w-16 bg-accent/10 text-accent rounded-full flex items-center justify-center mb-6">
            <Heart className="h-8 w-8" />
          </div>
          <h2 className="font-display text-2xl font-semibold">Your wishlist is empty</h2>
          <p className="mt-2 text-muted-foreground text-sm px-6">
            Explore our curated selection of farm-fresh spices and add your favorites here.
          </p>
          <Link
            to="/shop"
            className="mt-6 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background hover:opacity-90 transition"
          >
            Explore Spices
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {favorited.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      )}
    </div>
  );
}
