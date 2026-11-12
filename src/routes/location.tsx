import { createFileRoute } from "@tanstack/react-router";
import { Clock, Compass, ExternalLink, Mail, MapPin, MessageCircle, Navigation, Phone, ShieldCheck, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/site/PageHero";
import { SectionHeading } from "@/components/site/SectionHeading";
import { CtaBanner } from "@/components/site/CtaBanner";
import { Reveal } from "@/components/site/Reveal";
import { business } from "@/config/business";
import { directionsLink, generalOrderMessage, mailLink, mapEmbedSrc, telLink, whatsappLink } from "@/lib/whatsapp";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/location")({
  head: () => ({
    meta: pageMeta(
      `Shop Location & Directions — ${business.name}`,
      `Find ${business.name} at ${business.address}. Get turn-by-turn Google Maps directions, bakery opening hours, and direct contact details.`,
    ),
  }),
  component: LocationPage,
});

function LocationPage() {
  return (
    <>
      <PageHero
        crumb="Location"
        eyebrow="Our physical bakery"
        title="Find Us in Punnaikayal"
        description={`Visit our cake shop at ${business.address}. Freshly baked everyday — stop by or order online for delivery.`}
        image="https://images.unsplash.com/photo-1517433670267-08bbd4be890f?auto=format&fit=crop&w=1200&q=80"
      />

      {/* Main Location Section */}
      <section className="section-y container-page">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1.3fr] lg:items-start">
          {/* Shop Information Column */}
          <Reveal className="space-y-6">
            {/* Primary Address Box */}
            <div className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-secondary text-rose shadow-sm">
                  <MapPin className="h-6 w-6" />
                </span>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-rose">
                    Verified Shop Address
                  </span>
                  <h2 className="font-display text-2xl font-semibold text-primary">
                    {business.name}
                  </h2>
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-secondary/60 p-4 border border-border/60">
                <p className="text-sm font-semibold uppercase tracking-wide text-rose mb-1">
                  Complete Physical Address:
                </p>
                <p className="font-display text-lg font-bold text-foreground leading-relaxed">
                  {business.address}
                </p>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild variant="rose" size="lg" className="shadow-soft">
                  <a href={directionsLink()} target="_blank" rel="noopener noreferrer">
                    <Navigation className="h-4 w-4" /> Get Directions
                  </a>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <a href={directionsLink()} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" /> Open in Google Maps
                  </a>
                </Button>
              </div>
            </div>

            {/* Quick Actions & Dialers */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Phone Dialer */}
              <div className="flex flex-col justify-between rounded-3xl border border-border bg-card p-6 shadow-soft">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose">
                    <Phone className="h-4 w-4" /> Phone Dialer
                  </div>
                  <a
                    href={telLink()}
                    className="mt-3 block font-display text-xl font-bold text-primary hover:text-rose transition-colors"
                  >
                    {business.phoneDisplay}
                  </a>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Click to open mobile dialer
                  </p>
                </div>
                <Button asChild size="sm" variant="default" className="mt-5 w-full">
                  <a href={telLink()}>
                    <Phone className="h-3.5 w-3.5" /> Call Now
                  </a>
                </Button>
              </div>

              {/* WhatsApp Contact */}
              <div className="flex flex-col justify-between rounded-3xl border border-border bg-card p-6 shadow-soft">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-whatsapp">
                    <MessageCircle className="h-4 w-4" /> WhatsApp Support
                  </div>
                  <p className="mt-3 font-display text-xl font-bold text-primary">
                    {business.whatsappDisplay}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Instant cake order & custom themes
                  </p>
                </div>
                <Button asChild size="sm" variant="whatsapp" className="mt-5 w-full">
                  <a href={whatsappLink(generalOrderMessage())} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-3.5 w-3.5" /> Chat on WhatsApp
                  </a>
                </Button>
              </div>
            </div>

            {/* Email & Hours */}
            <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-rose">
                  <Mail className="h-5 w-5" />
                </span>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Direct Email Support
                  </span>
                  <a
                    href={mailLink()}
                    className="block font-semibold text-primary hover:text-rose transition-colors break-all"
                  >
                    {business.email}
                  </a>
                </div>
              </div>

              <div className="mt-6 border-t border-border/80 pt-5">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose">
                  <Clock className="h-4 w-4" /> Bakery Timings
                </div>
                <dl className="mt-3 space-y-2 text-sm">
                  {business.hours.map((h) => (
                    <div key={h.days} className="flex justify-between border-b border-border/40 pb-2">
                      <dt className="text-muted-foreground">{h.days}</dt>
                      <dd className="font-semibold text-primary">{h.time}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </Reveal>

          {/* Interactive Google Map Box */}
          <Reveal delay={100} className="space-y-6">
            <div className="overflow-hidden rounded-3xl border border-border bg-muted shadow-card">
              <div className="border-b border-border bg-card p-4 sm:flex sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <Compass className="h-5 w-5 text-rose animate-spin [animation-duration:8s]" />
                  <span className="font-display font-semibold text-primary">Interactive Google Map</span>
                </div>
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  Interactive zoom, pan & directions
                </span>
              </div>
              <iframe
                title={`Google Map for ${business.name}`}
                src={mapEmbedSrc()}
                className="h-[460px] w-full border-0 md:h-[540px]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
              <div className="bg-card p-5 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-rose">
                    Destination Pin
                  </span>
                  <p className="font-semibold text-primary text-sm sm:text-base">
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

            {/* Delivery coverage highlights */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft">
                <Truck className="h-5 w-5 text-rose shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-primary text-sm">Doorstep Delivery</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Safe refrigerated delivery across Punnaikayal & Thoothukudi.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft">
                <ShieldCheck className="h-5 w-5 text-rose shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-primary text-sm">Fresh Guarantee</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Baked fresh to order on your celebration day.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <CtaBanner
        title="Ready to order your dream cake?"
        text="Call our bakery or send us your requirements on WhatsApp for instant confirmation."
      />
    </>
  );
}

