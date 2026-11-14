import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Mail, MapPin, MessageCircle, Navigation, Phone, Youtube } from "lucide-react";
import { business } from "@/config/business";
import { navLinks } from "@/config/navigation";
import { categories } from "@/config/products";
import { generalOrderMessage, mailLink, telLink, whatsappLink, directionsLink } from "@/lib/whatsapp";
import { Logo } from "./Logo";

export function Footer() {
  const socials = [
    { icon: Instagram, href: business.social.instagram, label: "Instagram" },
    { icon: Facebook, href: business.social.facebook, label: "Facebook" },
    { icon: Youtube, href: business.social.youtube, label: "YouTube" },
    { icon: MessageCircle, href: whatsappLink(generalOrderMessage()), label: "WhatsApp" },
  ];

  return (
    <footer className="bg-gradient-cocoa text-cocoa-foreground">
      {/* Quick Action Top Bar */}
      <div className="border-b border-cocoa-foreground/15 bg-black/15 py-6">
        <div className="container-page flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-rose text-white shadow-soft">
              <Phone className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs uppercase tracking-wider text-blush font-bold">Call for Fresh Cake Orders</p>
              <a
                href={telLink()}
                className="font-display text-lg font-bold text-white transition-colors hover:text-blush"
                aria-label={`Call ${business.phoneDisplay}`}
              >
                {business.phoneDisplay}
              </a>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <a
              href={telLink()}
              className="inline-flex items-center gap-2 rounded-full border border-blush/30 bg-card/10 px-4 py-2 text-xs font-semibold text-cocoa-foreground backdrop-blur-sm transition-all hover:bg-rose hover:text-white"
            >
              <Phone className="h-3.5 w-3.5" /> Call Now
            </a>
            <a
              href={whatsappLink(generalOrderMessage())}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-whatsapp px-4 py-2 text-xs font-semibold text-whatsapp-foreground shadow-soft transition-all hover:brightness-110"
            >
              <MessageCircle className="h-3.5 w-3.5" /> Chat on WhatsApp
            </a>
            <a
              href={directionsLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-cocoa-foreground/20 px-4 py-2 text-xs font-semibold text-cocoa-foreground transition-all hover:border-blush hover:text-blush"
            >
              <Navigation className="h-3.5 w-3.5 text-blush" /> Get Directions
            </a>
          </div>
        </div>
      </div>

      <div className="container-page grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.3fr_0.9fr_1.1fr_1.4fr]">
        {/* Brand Info */}
        <div>
          <Logo light />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-cocoa-foreground/75">
            {business.tagline}. Baked fresh with premium ingredients, real butter, and heartfelt care in Punnaikayal.
          </p>
          <div className="mt-6 flex gap-2">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="grid h-10 w-10 place-items-center rounded-full border border-cocoa-foreground/20 transition-all duration-300 hover:-translate-y-1 hover:border-rose hover:bg-rose hover:text-white"
              >
                <s.icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-display text-lg font-medium text-white">Quick links</h3>
          <ul className="mt-5 space-y-2.5 text-sm text-cocoa-foreground/75">
            {navLinks.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="transition-colors hover:text-blush">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/custom-cakes" className="transition-colors hover:text-blush">
                Custom Cakes
              </Link>
            </li>
            <li>
              <Link to="/brand" className="transition-colors hover:text-blush">
                Brand Identity & Logos
              </Link>
            </li>
            <li>
              <Link to="/admin/login" className="transition-colors hover:text-blush flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-rose inline-block" /> Admin Portal
              </Link>
            </li>
            <li>
              <a href="#location" className="transition-colors hover:text-blush">
                Bakery Location
              </a>
            </li>
          </ul>
        </div>

        {/* Cake Categories */}
        <div>
          <h3 className="font-display text-lg font-medium text-white">Cake categories</h3>
          <ul className="mt-5 space-y-2 text-sm text-cocoa-foreground/75">
            {categories.map((c) => (
              <li key={c.id}>
                <Link
                  to="/cakes"
                  search={{ category: c.id }}
                  className="transition-colors hover:text-blush"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Info & Opening Hours */}
        <div>
          <h3 className="font-display text-lg font-medium text-white">Contact & Visit</h3>
          <ul className="mt-5 space-y-4 text-sm text-cocoa-foreground/80">
            {/* Phone */}
            <li className="rounded-2xl border border-cocoa-foreground/15 bg-white/5 p-3.5 backdrop-blur-sm">
              <span className="block text-[0.68rem] font-bold uppercase tracking-wider text-blush">
                Phone Dialer (Click to Call)
              </span>
              <a
                href={telLink()}
                className="mt-1 flex items-center gap-2 font-display text-base font-bold text-white transition-colors hover:text-blush"
              >
                <Phone className="h-4 w-4 shrink-0 text-blush" /> {business.phoneDisplay}
              </a>
            </li>

            {/* WhatsApp */}
            <li>
              <a
                href={whatsappLink(generalOrderMessage())}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-whatsapp transition-colors hover:brightness-125 font-semibold"
              >
                <MessageCircle className="h-4 w-4 shrink-0" /> WhatsApp: {business.whatsappDisplay}
              </a>
            </li>

            {/* Address */}
            <li>
              <a
                href={directionsLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 transition-colors hover:text-blush"
              >
                <MapPin className="mt-1 h-4 w-4 shrink-0 text-blush" />
                <span>
                  <strong className="block text-white">Shop Address:</strong>
                  {business.address}
                </span>
              </a>
            </li>

            {/* Email */}
            <li>
              <a href={mailLink()} className="flex items-center gap-3 break-all transition-colors hover:text-blush">
                <Mail className="h-4 w-4 shrink-0 text-blush" /> {business.email}
              </a>
            </li>

            {/* Hours */}
            <li className="border-t border-cocoa-foreground/15 pt-3">
              <span className="block text-xs font-bold uppercase tracking-wider text-blush mb-1">
                Opening Hours:
              </span>
              {business.hours.map((h) => (
                <div key={h.days} className="text-xs text-cocoa-foreground/75 py-0.5">
                  <span className="text-white font-medium">{h.days}:</span> {h.time}
                </div>
              ))}
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-cocoa-foreground/10">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-6 text-xs text-cocoa-foreground/60 sm:flex-row">
          <p>© {new Date().getFullYear()} {business.name}. All rights reserved.</p>
          <p>
            {business.address} · Freshly baked with love 🍰
          </p>
        </div>
      </div>
    </footer>
  );
}
