import { Clock, Mail, MapPin, MessageCircle, Navigation, Phone, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { business } from "@/config/business";
import { directionsLink, generalOrderMessage, mailLink, mapEmbedSrc, telLink, whatsappLink } from "@/lib/whatsapp";

export function ContactDetails() {
  const items = [
    {
      icon: Phone,
      label: "Phone Dialer",
      sublabel: "Click to call on mobile",
      value: business.phoneDisplay,
      href: telLink(),
      highlight: true,
    },
    {
      icon: MessageCircle,
      label: "WhatsApp Chat",
      sublabel: "Instant order & inquiries",
      value: business.whatsappDisplay,
      href: whatsappLink(generalOrderMessage()),
      external: true,
      whatsapp: true,
    },
    {
      icon: MapPin,
      label: "Physical Bakery Address",
      sublabel: "Click for Google Maps directions",
      value: business.address,
      href: directionsLink(),
      external: true,
    },
    {
      icon: Mail,
      label: "Email Support",
      sublabel: "For large orders & feedback",
      value: business.email,
      href: mailLink(),
    },
  ];

  return (
    <div className="space-y-4">
      {items.map((it) => (
        <a
          key={it.label}
          href={it.href}
          {...(it.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className="group relative flex items-start gap-4 rounded-3xl border border-border bg-card p-5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-rose/50 hover:shadow-card"
        >
          <span
            className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl transition-all duration-300 ${
              it.whatsapp
                ? "bg-whatsapp/15 text-whatsapp group-hover:bg-whatsapp group-hover:text-whatsapp-foreground"
                : "bg-secondary text-rose group-hover:bg-gradient-rose group-hover:text-rose-foreground"
            }`}
          >
            <it.icon className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                {it.label}
              </span>
              <span className="text-[0.7rem] text-rose font-medium hidden sm:inline">
                {it.sublabel}
              </span>
            </span>
            <span className="mt-1 block break-words text-base font-semibold text-primary sm:text-lg">
              {it.value}
            </span>
          </span>
          <span className="self-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </span>
        </a>
      ))}

      <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-secondary text-rose">
            <Clock className="h-5 w-5" />
          </span>
          <div>
            <span className="block text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Bakery Hours
            </span>
            <span className="text-sm font-semibold text-primary">Open 7 Days a Week</span>
          </div>
        </div>
        <dl className="mt-4 divide-y divide-border">
          {business.hours.map((h) => (
            <div key={h.days} className="flex flex-wrap justify-between gap-2 py-3 text-sm">
              <dt className="text-muted-foreground">{h.days}</dt>
              <dd className="font-semibold text-primary">{h.time}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

export function ContactActions({ className }: { className?: string }) {
  return (
    <div className={className ?? "flex flex-wrap gap-3"}>
      <Button asChild size="lg" className="shadow-soft">
        <a href={telLink()}>
          <Phone className="h-4 w-4" /> Call: {business.phoneDisplay}
        </a>
      </Button>
      <Button asChild variant="whatsapp" size="lg" className="shadow-soft">
        <a href={whatsappLink(generalOrderMessage())} target="_blank" rel="noopener noreferrer">
          <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
        </a>
      </Button>
      <Button asChild variant="outline" size="lg" className="shadow-soft">
        <a href={directionsLink()} target="_blank" rel="noopener noreferrer">
          <Navigation className="h-4 w-4 text-rose" /> Get Directions
        </a>
      </Button>
    </div>
  );
}

export function MapEmbed({ className }: { className?: string }) {
  return (
    <div className={className ?? "overflow-hidden rounded-3xl border border-border shadow-card"}>
      <div className="relative">
        <iframe
          title={`Map showing ${business.name} at ${business.address}`}
          src={mapEmbedSrc()}
          className="h-[400px] w-full md:h-[480px]"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
        <div className="flex flex-col gap-3 bg-card p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5 border-t border-border">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-rose">
              Shop Location
            </span>
            <p className="font-display text-base font-semibold text-primary sm:text-lg">
              {business.address}
            </p>
          </div>
          <Button asChild variant="rose" size="lg" className="shrink-0 shadow-soft">
            <a href={directionsLink()} target="_blank" rel="noopener noreferrer">
              <Navigation className="h-4 w-4" /> Get Directions
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
