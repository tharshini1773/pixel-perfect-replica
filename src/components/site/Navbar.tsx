import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, Phone, X, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "./Logo";
import { navLinks } from "@/config/navigation";
import { business } from "@/config/business";
import { telLink } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled || open
          ? "border-b border-border/70 bg-background/90 shadow-soft backdrop-blur-xl"
          : "bg-background/60 backdrop-blur-md",
      )}
    >
      <nav className="container-page flex h-20 items-center justify-between gap-4" aria-label="Main">
        <Logo />

        <ul className="hidden items-center gap-1 lg:flex">
          {navLinks.map((l) => (
            <li key={l.to}>
              <Link
                to={l.to}
                activeOptions={{ exact: l.to === "/" }}
                className="relative rounded-full px-4 py-2 text-sm font-medium text-foreground/75 transition-colors hover:text-primary"
                activeProps={{ className: "text-primary" }}
              >
                {({ isActive }) => (
                  <>
                    {l.label}
                    <span
                      className={cn(
                        "absolute inset-x-4 -bottom-0.5 h-0.5 origin-left rounded-full bg-rose transition-transform duration-300",
                        isActive ? "scale-x-100" : "scale-x-0",
                      )}
                    />
                  </>
                )}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-2 lg:flex">
          <Button asChild variant="ghost" size="icon" aria-label={`Call ${business.phoneDisplay}`}>
            <a href={telLink()}>
              <Phone />
            </a>
          </Button>
          <Button asChild variant="rose">
            <Link to="/cakes">
              <ShoppingBag /> Order Now
            </Link>
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="grid h-11 w-11 place-items-center rounded-full bg-secondary text-primary transition-colors hover:bg-accent lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      <div
        id="mobile-menu"
        className={cn(
          "overflow-hidden border-t border-border/60 bg-background transition-[max-height,opacity] duration-500 lg:hidden",
          open ? "max-h-[calc(100dvh-5rem)] opacity-100" : "pointer-events-none max-h-0 opacity-0",
        )}
      >
        <ul className="container-page flex flex-col gap-1 py-5">
          {navLinks.map((l, i) => (
            <li key={l.to} className={cn(open && "animate-fade-up")} style={{ animationDelay: `${i * 50}ms` }}>
              <Link
                to={l.to}
                activeOptions={{ exact: l.to === "/" }}
                className="flex items-center justify-between rounded-2xl px-4 py-3.5 font-display text-2xl text-foreground transition-colors hover:bg-secondary"
                activeProps={{ className: "bg-secondary text-primary" }}
              >
                {l.label}
              </Link>
            </li>
          ))}
          <li className="mt-4 grid grid-cols-2 gap-3">
            <Button asChild variant="outline" size="lg">
              <a href={telLink()}>
                <Phone /> Call Now
              </a>
            </Button>
            <Button asChild variant="rose" size="lg">
              <Link to="/cakes">
                <ShoppingBag /> Order Now
              </Link>
            </Button>
          </li>
        </ul>
      </div>
    </header>
  );
}
