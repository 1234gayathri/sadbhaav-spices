import { Link } from "@tanstack/react-router";

export function Logo({ to = "/" }: { to?: string }) {
  return (
    <Link to={to} className="flex items-center gap-2 group">
      <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-warm shadow-soft">
        <span className="absolute inset-0.5 rounded-full bg-background/15" />
        <span className="relative font-display text-lg font-bold text-primary-foreground">S</span>
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-display text-lg font-semibold tracking-tight">Sadbhaav</span>
        <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Spices Co.</span>
      </span>
    </Link>
  );
}
