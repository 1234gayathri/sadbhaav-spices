import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Heart, Search, ShoppingCart, User, Menu, X, Package } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useCart } from "@/lib/cart";

const links = [
  { to: "/", label: "Home", exact: true },
  { to: "/shop", label: "Shop" },
  { to: "/shop", label: "Turmeric", search: { cat: "Turmeric" } },
  { to: "/shop", label: "Chilli", search: { cat: "Chilli" } },
  { to: "/shop", label: "Cardamom", search: { cat: "Cardamom" } },
];

export function ClientNav() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate({ to: "/shop", search: { q: searchVal.trim() } });
      setShowSearch(false);
      setSearchVal("");
      setOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-3.5">
        <Logo to="/" />
        <nav className="ml-6 hidden lg:flex items-center gap-1">
          {links.slice(0, 2).map((l) => (
            <Link
              key={l.label}
              to={l.to}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition hover:bg-accent/10 ${
                path === l.to ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {l.label}
            </Link>
          ))}
          {links.slice(2).map((l) => (
            <Link key={l.label} to={l.to} search={l.search as any}
              className="rounded-full px-3.5 py-1.5 text-sm font-medium text-muted-foreground transition hover:bg-accent/10">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1">
          {showSearch ? (
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <input
                type="text"
                autoFocus
                placeholder="Search spices..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="h-9 w-40 sm:w-56 rounded-full border bg-background pl-4 pr-8 py-1.5 text-xs outline-none focus:border-primary transition-all duration-300"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 inline-flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground transition"
              >
                <Search className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => { setShowSearch(false); setSearchVal(""); }}
                className="ml-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition px-1"
              >
                Cancel
              </button>
            </form>
          ) : (
            <button
              onClick={() => setShowSearch(true)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-accent/10 transition"
              aria-label="Search"
            >
              <Search className="h-4.5 w-4.5" />
            </button>
          )}
          <ThemeToggle />
          <Link to="/track" className="hidden md:inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-accent/10 transition" aria-label="Track Order">
            <Package className="h-4.5 w-4.5" />
          </Link>
          <Link to="/account" className="hidden md:inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-accent/10 transition" aria-label="Account">
            <User className="h-4.5 w-4.5" />
          </Link>
          <Link to="/wishlist" className="hidden md:inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-accent/10 transition" aria-label="Wishlist">
            <Heart className="h-4.5 w-4.5" />
          </Link>
          <Link to="/checkout" className="relative inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-accent/10 transition" aria-label="Cart">
            <ShoppingCart className="h-4.5 w-4.5" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">
                {count}
              </span>
            )}
          </Link>
          <button onClick={() => setOpen((v) => !v)} className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-accent/10 transition" aria-label="Menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="lg:hidden border-t bg-background px-6 py-4 space-y-4">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search spices..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full rounded-full border bg-background pl-9 pr-4 py-2 text-xs outline-none focus:border-primary"
            />
          </form>
          <div className="space-y-1">
            {links.map((l) => (
              <Link key={l.label} to={l.to} search={l.search as any} onClick={() => setOpen(false)}
                className="block py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition">
                {l.label}
              </Link>
            ))}
            <Link to="/track" onClick={() => setOpen(false)} className="block py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition">Track Order</Link>
            <Link to="/account" onClick={() => setOpen(false)} className="block py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition">Account</Link>
            <Link to="/wishlist" onClick={() => setOpen(false)} className="block py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition">Wishlist</Link>
          </div>
        </div>
      )}
    </header>
  );
}

export function ClientFooter() {
  return (
    <footer className="mt-16 border-t bg-card/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo to="/" />
          <p className="mt-4 text-sm text-muted-foreground max-w-xs">
            Pure spices. Authentic taste. Sourced direct from Indian farms with love and care.
          </p>
        </div>
        <FooterCol title="Shop" links={[["All Products","/shop"],["Turmeric","/shop"],["Chilli","/shop"],["Cardamom","/shop"]]} />
        <FooterCol title="Company" links={[["About","/"],["Contact","/"],["Sustainability","/"],["Blog","/"]]} />
        <FooterCol title="Help" links={[["Track Order","/track"],["Returns","/"],["FAQs","/"]]} />
      </div>
      <div className="border-t py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Sadbhaav Spices Co. · Crafted in India
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{title}</div>
      <ul className="mt-4 space-y-2">
        {links.map(([l, h]) => (
          <li key={l}><Link to={h} className="text-sm hover:text-primary transition">{l}</Link></li>
        ))}
      </ul>
    </div>
  );
}
