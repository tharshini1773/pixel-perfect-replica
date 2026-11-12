import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, Phone, X, ShoppingBag, MessageCircle, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "./Logo";
import { navLinks } from "@/config/navigation";
import { business } from "@/config/business";
import { directionsLink, generalOrderMessage, telLink, whatsappLink } from "@/lib/whatsapp";
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
          ? "border-b border-border/70 bg-background/95 shadow-soft backdrop-blur-xl"
          : "bg-background/80 backdrop-blur-md",
      )}
    >
      <nav className="container-page flex h-20 items-center justify-between gap-4" aria-label="Main">
        <Logo />

        <ul className="hidden items-center gap-1.5 lg:flex">
          {navLinks.map((l) => (
            <li key={l.to}>
              <Link
                to={l.to}
                activeOptions={{ exact: l.to === "/" }}
                className="relative rounded-full px-4 py-2 text-sm font-medium transition-all duration-300"
                activeProps={{ className: "bg-secondary text-primary font-bold shadow-sm" }}
                inactiveProps={{ className: "text-foreground/75 hover:text-primary hover:bg-secondary/40" }}
              >
                {({ isActive }) => (
                  <span className="flex items-center gap-1.5">
                    {l.label}
                    {isActive && <span className="h-1.5 w-1.5 rounded-full bg-rose inline-block" />}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop actions: Phone, WhatsApp, Order */}
        <div className="hidden items-center gap-2.5 lg:flex">
          <Button asChild variant="ghost" size="sm" className="gap-2 text-xs font-semibold text-primary hover:text-rose">
            <a href={telLink()} title={`Call ${business.phoneDisplay}`}>
              <Phone className="h-4 w-4 text-rose" />
              <span>{business.phoneDisplay}</span>
            </a>
          </Button>
          <Button asChild variant="whatsapp" size="sm" className="gap-1.5 shadow-sm">
            <a href={whatsappLink(generalOrderMessage())} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
          </Button>
          <Button asChild variant="rose" size="sm" className="shadow-sm">
            <Link to="/cakes">
              <ShoppingBag className="h-4 w-4" /> Order Now
            </Link>
          </Button>
        </div>

        {/* Mobile action bar */}
        <div className="flex items-center gap-2 lg:hidden">
          <Button asChild variant="outline" size="sm" className="h-10 rounded-full px-3 text-xs font-semibold">
            <a href={telLink()} aria-label="Call bakery">
              <Phone className="h-4 w-4 text-rose" />
              <span className="hidden xs:inline">Call</span>
            </a>
          </Button>
          <Button asChild variant="whatsapp" size="sm" className="h-10 rounded-full px-3 text-xs font-semibold">
            <a href={whatsappLink(generalOrderMessage())} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
              <MessageCircle className="h-4 w-4" />
            </a>
          </Button>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="grid h-10 w-10 place-items-center rounded-full bg-secondary text-primary transition-colors hover:bg-accent"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      <div
        id="mobile-menu"
        className={cn(
          "overflow-hidden border-t border-border/60 bg-background transition-[max-height,opacity] duration-500 lg:hidden",
          open ? "max-h-[calc(100dvh-5rem)] opacity-100 overflow-y-auto" : "pointer-events-none max-h-0 opacity-0",
        )}
      >
        <div className="container-page flex flex-col gap-1 py-5">
          <ul className="flex flex-col gap-1">
            {navLinks.map((l, i) => (
              <li key={l.to} className={cn(open && "animate-fade-up")} style={{ animationDelay: `${i * 40}ms` }}>
                <Link
                  to={l.to}
                  activeOptions={{ exact: l.to === "/" }}
                  className="flex items-center justify-between rounded-2xl px-4 py-3 font-display text-xl transition-all duration-300"
                  activeProps={{ className: "bg-secondary text-primary font-bold shadow-soft border-l-4 border-rose pl-5" }}
                  inactiveProps={{ className: "text-foreground hover:bg-secondary/50" }}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Quick contact box inside mobile menu */}
          <div className="mt-4 rounded-2xl border border-border bg-card p-4 text-sm shadow-soft">
            <p className="text-xs font-bold uppercase tracking-wider text-rose">Direct Contact</p>
            <a
              href={telLink()}
              className="mt-2 flex items-center gap-2.5 font-display text-base font-semibold text-primary hover:text-rose"
            >
              <Phone className="h-4 w-4 text-rose" /> {business.phoneDisplay}
            </a>
            <a
              href={directionsLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex items-start gap-2 text-xs text-muted-foreground hover:text-primary"
            >
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose" /> {business.address}
            </a>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3 pb-4">
            <Button asChild variant="outline" size="lg" className="rounded-2xl">
              <a href={telLink()}>
                <Phone className="h-4 w-4 text-rose" /> Call Dialer
              </a>
            </Button>
            <Button asChild variant="whatsapp" size="lg" className="rounded-2xl">
              <a href={whatsappLink(generalOrderMessage())} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
