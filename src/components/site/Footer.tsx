import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Mail, MapPin, MessageCircle, Phone, Youtube } from "lucide-react";
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
      <div className="container-page grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr]">
        <div>
          <Logo light />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-cocoa-foreground/70">
            {business.tagline}. Baked fresh with premium ingredients and plenty of love.
          </p>
          <div className="mt-6 flex gap-2">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="grid h-10 w-10 place-items-center rounded-full border border-cocoa-foreground/20 transition-all duration-300 hover:-translate-y-0.5 hover:border-rose hover:bg-rose"
              >
                <s.icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-display text-lg">Quick links</h3>
          <ul className="mt-5 space-y-2.5 text-sm text-cocoa-foreground/70">
            {navLinks.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="transition-colors hover:text-blush">{l.label}</Link>
              </li>
            ))}
            <li>
              <Link to="/custom-cakes" className="transition-colors hover:text-blush">Custom Cakes</Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-display text-lg">Our cakes</h3>
          <ul className="mt-5 space-y-2.5 text-sm text-cocoa-foreground/70">
            {categories.slice(0, 7).map((c) => (
              <li key={c.id}>
                <Link to="/cakes" search={{ category: c.id }} className="transition-colors hover:text-blush">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-lg">Get in touch</h3>
          <ul className="mt-5 space-y-4 text-sm text-cocoa-foreground/70">
            <li>
              <a href={directionsLink()} target="_blank" rel="noopener noreferrer" className="flex gap-3 hover:text-blush">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-blush" /> {business.address}
              </a>
            </li>
            <li>
              <a href={telLink()} className="flex gap-3 hover:text-blush">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-blush" /> {business.phoneDisplay}
              </a>
            </li>
            <li>
              <a href={mailLink()} className="flex gap-3 break-all hover:text-blush">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-blush" /> {business.email}
              </a>
            </li>
            {business.hours.map((h) => (
              <li key={h.days} className="text-xs">
                <span className="text-cocoa-foreground/90">{h.days}:</span> {h.time}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-cocoa-foreground/10">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-6 text-xs text-cocoa-foreground/55 sm:flex-row">
          <p>© {new Date().getFullYear()} {business.name}. All rights reserved.</p>
          <p>Freshly baked with love 🍰</p>
        </div>
      </div>
    </footer>
  );
}
