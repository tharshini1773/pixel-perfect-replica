import { Clock, Mail, MapPin, MessageCircle, Navigation, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { business } from "@/config/business";
import { directionsLink, generalOrderMessage, mailLink, mapEmbedSrc, telLink, whatsappLink } from "@/lib/whatsapp";

export function ContactDetails() {
  const items = [
    { icon: MapPin, label: "Visit us", value: business.address, href: directionsLink(), external: true },
    { icon: Phone, label: "Call us", value: business.phoneDisplay, href: telLink() },
    { icon: MessageCircle, label: "WhatsApp", value: business.whatsappDisplay, href: whatsappLink(generalOrderMessage()), external: true },
    { icon: Mail, label: "Email", value: business.email, href: mailLink() },
  ];
  return (
    <div className="space-y-4">
      {items.map((it) => (
        <a
          key={it.label}
          href={it.href}
          {...(it.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:border-rose/50 hover:shadow-card"
        >
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-secondary text-rose transition-colors group-hover:bg-gradient-rose group-hover:text-rose-foreground">
            <it.icon className="h-5 w-5" />
          </span>
          <span className="min-w-0">
            <span className="block text-xs font-bold uppercase tracking-widest text-muted-foreground">{it.label}</span>
            <span className="mt-1 block break-words font-medium text-primary">{it.value}</span>
          </span>
        </a>
      ))}

      <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-secondary text-rose">
            <Clock className="h-5 w-5" />
          </span>
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Opening hours</span>
        </div>
        <dl className="mt-4 divide-y divide-border">
          {business.hours.map((h) => (
            <div key={h.days} className="flex flex-wrap justify-between gap-2 py-2.5 text-sm">
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
      <Button asChild size="lg">
        <a href={telLink()}>
          <Phone /> Call Now
        </a>
      </Button>
      <Button asChild variant="whatsapp" size="lg">
        <a href={whatsappLink(generalOrderMessage())} target="_blank" rel="noopener noreferrer">
          <MessageCircle /> WhatsApp
        </a>
      </Button>
      <Button asChild variant="outline" size="lg">
        <a href={directionsLink()} target="_blank" rel="noopener noreferrer">
          <Navigation /> Get Directions
        </a>
      </Button>
    </div>
  );
}

export function MapEmbed({ className }: { className?: string }) {
  return (
    <div className={className ?? "overflow-hidden rounded-3xl border border-border shadow-card"}>
      <iframe
        title={`Map showing ${business.name}`}
        src={mapEmbedSrc()}
        className="h-[380px] w-full md:h-[460px]"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    </div>
  );
}
