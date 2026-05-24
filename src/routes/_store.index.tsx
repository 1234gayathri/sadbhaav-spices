import { createFileRoute, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Quote, Sparkles, ChevronLeft, ChevronRight, Leaf, ShieldCheck, Heart } from "lucide-react";
import { ProductCard } from "@/components/client/ProductCard";
import heroImg from "@/assets/hero-spices.jpg";
import turmericImg from "@/assets/turmeric.jpg";
import chilliImg from "@/assets/chilli.jpg";
import cardamomImg from "@/assets/cardamom.jpg";

// Map category → bundled image (resolved at build time by Vite)
const CATEGORY_IMAGES: Record<string, string> = {
  Turmeric: turmericImg,
  Chilli: chilliImg,
  Cardamom: cardamomImg,
};

export const getClientHomeFn = createServerFn({ method: "GET" }).handler(async () => {
  const { getProducts, getTestimonials, getBanners, getCoupons } = await import("@/lib/db");
  const coupons = getCoupons().filter((c) => {
    if (!c.active) return false;
    if (c.uses >= c.maxUses) return false;
    const exp = new Date(c.expiry);
    if (!isNaN(exp.getTime()) && exp < new Date()) return false;
    return true;
  });
  return {
    products: getProducts(),
    testimonials: getTestimonials(),
    banners: getBanners(),
    coupons,
  };
});

export const Route = createFileRoute("/_store/")({
  component: ClientHome,
  loader: () => getClientHomeFn(),
  head: () => ({ meta: [{ title: "Sadbhaav Spices — Store" }] }),
});

function ClientHome() {
  const { products, testimonials, banners, coupons } = Route.useLoaderData();
  const [bannerIdx, setBannerIdx] = useState(0);

  const prevBanner = () => setBannerIdx((i) => (i === 0 ? banners.length - 1 : i - 1));
  const nextBanner = () => setBannerIdx((i) => (i === banners.length - 1 ? 0 : i + 1));

  const activeBanner = banners[bannerIdx];
  const activeCoupon = coupons[0]; // Show the first active coupon in the promo banner

  return (
    <>
      {/* Hero banner — uses admin-uploaded banner image if available */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-2 lg:items-center lg:py-24">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
              <Sparkles className="h-3 w-3" /> Fresh harvest 2026
            </span>
            <h1 className="mt-5 font-display text-5xl font-semibold tracking-tight sm:text-6xl text-balance">
              The taste of <span className="text-primary">home</span>, perfected.
            </h1>
            <p className="mt-5 max-w-lg text-lg text-muted-foreground">
              Stone-ground turmeric, sun-dried chillies and highland cardamom — delivered to your kitchen, fresh from ours.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/shop" className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background hover:opacity-90 transition">
                Shop the collection <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/shop" className="inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm font-semibold hover:bg-accent/5 transition">
                New arrivals
              </Link>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative aspect-[5/4] overflow-hidden rounded-3xl shadow-elegant"
          >
            <img
              src={heroImg}
              alt={activeBanner?.text || "Sadbhaav spices"}
              width={1536}
              height={1024}
              className="h-full w-full object-cover"
            />
            {activeBanner?.text && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                <p className="text-white font-display text-lg font-semibold">{activeBanner.text}</p>
              </div>
            )}
            {/* Banner navigation controls — only if admin added multiple banners */}
            {banners.length > 1 && (
              <div className="absolute inset-0 flex items-center justify-between px-3 pointer-events-none">
                <button
                  onClick={prevBanner}
                  className="pointer-events-auto h-8 w-8 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={nextBanner}
                  className="pointer-events-auto h-8 w-8 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
            {banners.length > 1 && (
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                {banners.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setBannerIdx(i)}
                    className={`h-1.5 rounded-full transition-all ${i === bannerIdx ? "w-6 bg-white" : "w-1.5 bg-white/50"}`}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Categories pills */}
      <section className="border-y bg-card/40 py-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-3 px-6">
          {["All", "Turmeric", "Chilli", "Cardamom", "Best Sellers", "New"].map((c) => (
            <Link key={c} to="/shop" className="rounded-full border bg-background px-5 py-2 text-sm font-medium hover:border-primary hover:text-primary transition">
              {c}
            </Link>
          ))}
        </div>
      </section>

      {products.length === 0 ? (
        <section className="py-20 text-center max-w-lg mx-auto px-6">
          <div className="rounded-3xl border border-dashed bg-card/30 p-10 flex flex-col items-center">
            <Sparkles className="h-10 w-10 text-accent mb-4 animate-pulse" />
            <h2 className="font-display text-2xl font-semibold">Something Exciting is Coming</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Our premium, organic farm-fresh spice collection is being carefully curated for you. 
              Check back soon — great flavours are on their way!
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent/10 px-5 py-2.5 text-sm font-semibold text-accent">
              <Leaf className="h-4 w-4" /> Launching soon
            </div>
          </div>
        </section>
      ) : (
        <>
          {/* Best sellers */}
          <Section title="Best sellers" subtitle="Loved by our customers">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.slice(0, 3).map((p) => (
                <ProductCard key={p.id} p={{ ...p, image: CATEGORY_IMAGES[p.category] || p.image }} />
              ))}
            </div>
          </Section>

          {/* Active coupon promo banner — rendered from admin's live coupon data */}
          {activeCoupon && (
            <section className="mx-auto max-w-7xl px-6">
              <div className="relative overflow-hidden rounded-3xl bg-gradient-warm p-10 sm:p-14">
                <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cream/20 blur-3xl" />
                <div className="relative max-w-xl text-primary-foreground">
                  <p className="text-xs font-bold uppercase tracking-[0.2em]">Special offer</p>
                  <h2 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">{activeCoupon.description}</h2>
                  <p className="mt-3 opacity-80">
                    Use code <span className="font-mono font-bold">{activeCoupon.code}</span> at checkout.
                  </p>
                  <Link
                    to="/shop"
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background hover:opacity-90 transition"
                  >
                    Shop now <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </section>
          )}

          {/* Trending */}
          <Section title="Trending" subtitle="What's flying off our shelves">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.slice(3, 6).map((p) => (
                <ProductCard key={p.id} p={{ ...p, image: CATEGORY_IMAGES[p.category] || p.image }} />
              ))}
            </div>
          </Section>
        </>
      )}

      {/* Testimonials — only rendered when admin has added some */}
      {testimonials.length > 0 && (
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-6">
            <h2 className="font-display text-4xl font-semibold tracking-tight text-center">What our customers say</h2>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {testimonials.map((t) => (
                <div key={t.id} className="rounded-2xl border bg-card p-6 shadow-soft">
                  <Quote className="h-6 w-6 text-primary" />
                  <p className="mt-4 text-sm leading-relaxed">{t.quote}</p>
                  <p className="mt-4 text-xs font-semibold text-muted-foreground">{t.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* About Section */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <hr className="mb-20 opacity-50" />
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary uppercase tracking-wider">
            About Sadbhaav Spices
          </span>
          <h2 className="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            Pure Spices. Authentic Taste.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
            Founded with the vision to bridge the gap between traditional Indian spice farms and your kitchen, 
            Sadbhaav Spices brings you pure, unadulterated seasonings directly from native origins.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border bg-card/50 p-8 shadow-soft transition hover:shadow-elegant">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary mb-6">
              <Leaf className="h-6 w-6" />
            </div>
            <h3 className="font-display text-xl font-semibold">100% Organic Sourcing</h3>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              We partner directly with certified organic family farms across India—sourcing Erode turmeric, 
              Kashmiri chillies, and green cardamom from Idukki hills without pesticides or synthetic chemicals.
            </p>
          </div>

          <div className="rounded-2xl border bg-card/50 p-8 shadow-soft transition hover:shadow-elegant">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/15 text-accent mb-6">
              <Heart className="h-6 w-6" />
            </div>
            <h3 className="font-display text-xl font-semibold">Traditional Cold Milling</h3>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Our products are stone-ground and cold-milled weekly in small batches. This traditional process 
              prevents heat buildup, preserving natural essential oils and intense flavor profiles.
            </p>
          </div>

          <div className="rounded-2xl border bg-card/50 p-8 shadow-soft transition hover:shadow-elegant">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/15 text-secondary mb-6">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="font-display text-xl font-semibold">Lab-Tested Purity</h3>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Every batch undergoes strict quality control and independent lab testing to guarantee 
              zero adulteration, zero artificial coloring, and maximum curcumin and oil content.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-4xl font-semibold tracking-tight">{title}</h2>
            {subtitle && <p className="mt-1 text-muted-foreground">{subtitle}</p>}
          </div>
          <Link to="/shop" className="text-sm font-medium underline-offset-4 hover:underline">View all →</Link>
        </div>
        {children}
      </div>
    </section>
  );
}
