import { createFileRoute, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight, Quote, Sparkles, ChevronLeft, ChevronRight,
  Leaf, ShieldCheck, Heart, Truck, Star, BadgeCheck, FlameKindling, Package
} from "lucide-react";
import { ProductCard } from "@/components/client/ProductCard";
import heroImg from "@/assets/hero-spices.jpg";
import turmericImg from "@/assets/turmeric.jpg";
import chilliImg from "@/assets/chilli.jpg";
import cardamomImg from "@/assets/cardamom.jpg";

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

export const Route = createFileRoute("/client/")(({
  component: ClientHome,
  loader: () => getClientHomeFn(),
  head: () => ({ meta: [{ title: "Sadbhaav Spices — Store" }] }),
}));

// ─── Animation Variants ───────────────────────────────────────────────────────
const fadeUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.12 } } };

// ─── Stats ────────────────────────────────────────────────────────────────────
const STATS = [
  { value: "100%", label: "Organic Certified" },
  { value: "3,000+", label: "Happy Customers" },
  { value: "15+", label: "Years Heritage" },
  { value: "Zero", label: "Artificial Additives" },
];

// ─── Features ─────────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: Leaf,        title: "Farm Direct",         desc: "Sourced directly from certified organic family farms across India — no middlemen." },
  { icon: FlameKindling, title: "Cold Milled Weekly", desc: "Stone-ground in small batches preserving essential oils and intense flavour profiles." },
  { icon: BadgeCheck,  title: "Lab-Tested Purity",   desc: "Every batch independently tested for zero adulteration, zero artificial colouring." },
  { icon: Truck,       title: "Swift Delivery",       desc: "Express and standard shipping options to your doorstep, handled with care." },
  { icon: Heart,       title: "Traditional Recipes",  desc: "Formulations rooted in centuries-old Ayurvedic and culinary traditions of India." },
  { icon: ShieldCheck, title: "Secure Checkout",      desc: "Your orders and personal data are always encrypted and protected end-to-end." },
];

// ─── Spotlight spices ─────────────────────────────────────────────────────────
const SPOTLIGHT = [
  { name: "Turmeric", tagline: "The golden healer", img: turmericImg, href: "/client/shop" },
  { name: "Chilli",   tagline: "Fire in every bite", img: chilliImg,   href: "/client/shop" },
  { name: "Cardamom", tagline: "Aromatic perfection",img: cardamomImg, href: "/client/shop" },
];

// ─── Component ────────────────────────────────────────────────────────────────
function ClientHome() {
  const { products, testimonials, banners, coupons } = Route.useLoaderData();
  const [bannerIdx, setBannerIdx] = useState(0);
  const [tickerPos, setTickerPos] = useState(0);

  const prevBanner = () => setBannerIdx((i) => (i === 0 ? banners.length - 1 : i - 1));
  const nextBanner = () => setBannerIdx((i) => (i === banners.length - 1 ? 0 : i + 1));

  const activeBanner = banners[bannerIdx];
  const activeCoupon = coupons[0];

  // Auto-advance banner
  useEffect(() => {
    if (banners.length <= 1) return;
    const t = setInterval(() => nextBanner(), 5000);
    return () => clearInterval(t);
  }, [banners.length]);

  // Ticker animation
  useEffect(() => {
    const t = setInterval(() => setTickerPos((p) => p - 1), 30);
    return () => clearInterval(t);
  }, []);

  return (
    <>
      {/* ── Announcement ticker ── */}
      <div className="overflow-hidden bg-primary py-2 text-primary-foreground text-xs font-semibold tracking-widest uppercase select-none">
        <div
          className="flex gap-16 whitespace-nowrap"
          style={{ transform: `translateX(${tickerPos % 600}px)`, transition: "none" }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} className="flex items-center gap-3">
              <Sparkles className="h-3 w-3 inline" />
              Free shipping above ₹499 &nbsp;·&nbsp; Fresh harvest 2026 &nbsp;·&nbsp; 100% Organic &nbsp;·&nbsp; Lab tested purity
            </span>
          ))}
        </div>
      </div>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-hero min-h-[92vh] flex items-center">
        {/* Background blobs */}
        <div className="pointer-events-none absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="pointer-events-none absolute -right-40 bottom-0 h-[500px] w-[500px] rounded-full bg-accent/10 blur-[120px]" />

        <div className="relative mx-auto grid w-full max-w-7xl gap-12 px-6 py-20 lg:grid-cols-2 lg:items-center lg:py-28">
          {/* Left */}
          <motion.div variants={stagger} initial="hidden" animate="show">
            <motion.span variants={fadeUp} className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-4 py-1.5 text-xs font-bold text-accent uppercase tracking-widest">
              <Sparkles className="h-3 w-3" /> Fresh harvest 2026
            </motion.span>

            <motion.h1 variants={fadeUp} className="mt-6 font-display text-5xl font-bold tracking-tight sm:text-6xl xl:text-7xl text-balance leading-[1.05]">
              The taste of{" "}
              <span className="relative inline-block">
                <span className="text-primary">home,</span>
                <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 200 8" preserveAspectRatio="none">
                  <path d="M0 7 Q100 0 200 7" stroke="currentColor" strokeWidth="3" fill="none" className="text-primary/40" />
                </svg>
              </span>{" "}
              perfected.
            </motion.h1>

            <motion.p variants={fadeUp} className="mt-6 max-w-lg text-lg text-muted-foreground leading-relaxed">
              Stone-ground turmeric, sun-dried chillies and highland cardamom —
              delivered to your kitchen, fresh from our certified organic farms.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-4">
              <Link to="/client/shop" className="inline-flex items-center gap-2 rounded-full bg-foreground px-8 py-3.5 text-sm font-bold text-background hover:opacity-90 transition shadow-lg hover:shadow-xl">
                Shop the collection <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/client/shop" className="inline-flex items-center gap-2 rounded-full border-2 px-8 py-3.5 text-sm font-bold hover:bg-accent/8 transition">
                Our Story
              </Link>
            </motion.div>

            {/* Mini trust badges */}
            <motion.div variants={fadeUp} className="mt-10 flex flex-wrap gap-5">
              {["Certified Organic", "No Preservatives", "Free Shipping ₹499+"].map((b) => (
                <span key={b} className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                  <BadgeCheck className="h-4 w-4 text-primary" /> {b}
                </span>
              ))}
            </motion.div>
          </motion.div>

          {/* Right — hero image / banner carousel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.93 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative aspect-[5/4] overflow-hidden rounded-[2rem] shadow-[0_40px_100px_rgba(0,0,0,0.18)]"
          >
            <img
              src={activeBanner?.image || heroImg}
              alt={activeBanner?.text || "Sadbhaav spices"}
              width={1536}
              height={1024}
              className="h-full w-full object-cover transition-all duration-700"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

            {activeBanner?.text && (
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-white font-display text-xl font-bold drop-shadow-lg">{activeBanner.text}</p>
              </div>
            )}

            {/* Banner nav */}
            {banners.length > 1 && (
              <>
                <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
                  <button onClick={prevBanner} className="pointer-events-auto h-9 w-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-sm transition">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button onClick={nextBanner} className="pointer-events-auto h-9 w-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-sm transition">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                  {banners.map((_, i) => (
                    <button key={i} onClick={() => setBannerIdx(i)} className={`h-1.5 rounded-full transition-all ${i === bannerIdx ? "w-8 bg-white" : "w-2 bg-white/50"}`} />
                  ))}
                </div>
              </>
            )}

            {/* Floating badge */}
            <div className="absolute top-5 right-5 flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 shadow-lg backdrop-blur-sm">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-bold text-foreground">4.9 / 5 Rating</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="border-y bg-card/60 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <p className="font-display text-3xl font-bold text-primary">{s.value}</p>
                <p className="mt-1 text-xs text-muted-foreground font-medium uppercase tracking-wider">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Spotlight categories ── */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary uppercase tracking-widest">Our Spices</span>
            <h2 className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-5xl">Explore our collection</h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">Each spice hand-picked from its native origin for unmatched freshness and flavour.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {SPOTLIGHT.map((s, i) => (
              <motion.div
                key={s.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
              >
                <Link to={s.href} className="group relative block overflow-hidden rounded-3xl shadow-soft hover:shadow-elegant transition-shadow duration-500">
                  <div className="aspect-[4/5] overflow-hidden">
                    <img src={s.img} alt={s.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <p className="text-xs font-semibold text-white/70 uppercase tracking-widest">{s.tagline}</p>
                    <h3 className="mt-1 font-display text-2xl font-bold text-white">{s.name}</h3>
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-white/80 group-hover:text-white transition">
                      Shop now <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Category pills ── */}
      <div className="border-y bg-card/40 py-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-3 px-6">
          {["All", "Turmeric", "Chilli", "Cardamom", "Best Sellers", "New Arrivals"].map((c) => (
            <Link key={c} to="/client/shop" className="rounded-full border bg-background px-5 py-2 text-sm font-semibold hover:border-primary hover:text-primary hover:bg-primary/5 transition">
              {c}
            </Link>
          ))}
        </div>
      </div>

      {/* ── Products ── */}
      {products.length > 0 ? (
        <>
          <Section title="Best sellers" subtitle="Loved by thousands of happy kitchens">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.slice(0, 3).map((p) => <ProductCard key={p.id} p={p} />)}
            </div>
          </Section>

          {/* ── Coupon promo banner ── */}
          {activeCoupon && (
            <section className="mx-auto max-w-7xl px-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative overflow-hidden rounded-3xl bg-gradient-warm p-10 sm:p-16"
              >
                <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute -left-20 bottom-0 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
                <div className="relative max-w-xl text-primary-foreground">
                  <span className="text-xs font-black uppercase tracking-[0.25em] opacity-80">Limited offer</span>
                  <h2 className="mt-3 font-display text-4xl font-bold sm:text-5xl">{activeCoupon.description}</h2>
                  <p className="mt-3 opacity-80 text-sm">
                    Use code{" "}
                    <span className="font-mono font-black bg-white/20 px-2 py-0.5 rounded">{activeCoupon.code}</span>{" "}
                    at checkout.
                  </p>
                  <Link to="/client/shop" className="mt-8 inline-flex items-center gap-2 rounded-full bg-foreground px-7 py-3 text-sm font-bold text-background hover:opacity-90 transition shadow-lg">
                    Shop now <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </motion.div>
            </section>
          )}

          <Section title="Trending" subtitle="What's flying off our shelves">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.slice(3, 6).map((p) => <ProductCard key={p.id} p={p} />)}
            </div>
          </Section>
        </>
      ) : (
        <section className="py-28 text-center max-w-lg mx-auto px-6">
          <div className="rounded-3xl border border-dashed bg-card/30 p-12 flex flex-col items-center">
            <Package className="h-12 w-12 text-accent mb-4 animate-pulse" />
            <h2 className="font-display text-2xl font-bold">Coming Soon</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Our premium spice collection is being carefully curated. Check back soon!
            </p>
          </div>
        </section>
      )}

      {/* ── Why choose us ── */}
      <section className="py-24 bg-card/30">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-14 text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-4 py-1.5 text-xs font-bold text-accent uppercase tracking-widest">Why us</span>
            <h2 className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-5xl">Built on trust &amp; tradition</h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">Everything we do is driven by a commitment to quality you can taste and trust you can feel.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group rounded-2xl border bg-card p-7 shadow-soft hover:shadow-elegant transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/12 text-primary mb-5 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-lg font-bold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      {testimonials.length > 0 && (
        <section className="py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-14 text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary uppercase tracking-widest">Reviews</span>
              <h2 className="mt-4 font-display text-4xl font-bold tracking-tight">What our customers say</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {testimonials.map((t, i) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-2xl border bg-card p-7 shadow-soft"
                >
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star key={s} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <Quote className="h-5 w-5 text-primary/40 mb-3" />
                  <p className="text-sm leading-relaxed">{t.quote}</p>
                  <p className="mt-5 text-xs font-bold text-muted-foreground uppercase tracking-wide">{t.name}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── About section ── */}
      <section className="mx-auto max-w-7xl px-6 pb-28">
        <div className="relative overflow-hidden rounded-3xl border bg-card/50 p-10 sm:p-16 shadow-soft">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/8 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 bottom-0 h-48 w-48 rounded-full bg-accent/8 blur-3xl" />
          <div className="relative grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary uppercase tracking-widest">About Sadbhaav</span>
              <h2 className="mt-5 font-display text-4xl font-bold tracking-tight sm:text-5xl">
                Pure spices.<br />Authentic taste.
              </h2>
              <p className="mt-5 text-muted-foreground leading-relaxed">
                Founded with the vision to bridge the gap between traditional Indian spice farms and your kitchen,
                Sadbhaav Spices brings you pure, unadulterated seasonings directly from native origins.
                Every pinch carries the legacy of generations of farmers who know their land.
              </p>
              <Link to="/client/shop" className="mt-8 inline-flex items-center gap-2 rounded-full bg-foreground px-7 py-3 text-sm font-bold text-background hover:opacity-90 transition">
                Explore our spices <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Leaf,        color: "bg-primary/12 text-primary",   title: "Organic Sourcing",      desc: "Directly from certified farms" },
                { icon: FlameKindling, color: "bg-accent/12 text-accent",   title: "Weekly Fresh Batches",  desc: "Cold-milled every week" },
                { icon: BadgeCheck,  color: "bg-secondary/12 text-secondary", title: "Lab Tested",          desc: "Independent quality checks" },
                { icon: Truck,       color: "bg-primary/12 text-primary",   title: "Fast Delivery",         desc: "Express & standard shipping" },
              ].map((item) => (
                <div key={item.title} className="rounded-2xl border bg-background/60 p-5">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${item.color} mb-3`}>
                    <item.icon className="h-4 w-4" />
                  </div>
                  <h4 className="font-semibold text-sm">{item.title}</h4>
                  <p className="mt-1 text-xs text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA strip ── */}
      <section className="border-t bg-primary/5 py-16">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">Ready to taste the difference?</h2>
          <p className="mt-3 text-muted-foreground">Join thousands of happy kitchens that have switched to Sadbhaav.</p>
          <Link to="/client/shop" className="mt-8 inline-flex items-center gap-2 rounded-full bg-foreground px-9 py-4 text-sm font-bold text-background hover:opacity-90 transition shadow-lg hover:shadow-xl">
            Shop now <ArrowRight className="h-4 w-4" />
          </Link>
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
            <h2 className="font-display text-4xl font-bold tracking-tight">{title}</h2>
            {subtitle && <p className="mt-1 text-muted-foreground">{subtitle}</p>}
          </div>
          <Link to="/client/shop" className="text-sm font-semibold underline-offset-4 hover:underline">View all →</Link>
        </div>
        {children}
      </div>
    </section>
  );
}
