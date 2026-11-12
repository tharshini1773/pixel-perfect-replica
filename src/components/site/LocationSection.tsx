import { Clock, MapPin, Navigation, Phone, MessageCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { business } from "@/config/business";
import { directionsLink, generalOrderMessage, telLink, whatsappLink } from "@/lib/whatsapp";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

export function LocationSection({
  heading = true,
  className = "",
}: {
  heading?: boolean;
  className?: string;
}) {
  const mapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
    business.mapQuery,
  )}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  return (
    <section className={`section-y container-page ${className}`} id="location">
      {heading && (
        <SectionHeading
          eyebrow="Visit Our Bakery"
          title="Fresh Cakes, Right from Our Oven"
          description="Drop by our cake shop in Punnaikayal or order online for prompt delivery across Thoothukudi."
        />
      )}

      <div className="mt-12 grid gap-8 lg:grid-cols-[1.1fr_1.3fr] lg:items-stretch">
        {/* Address & Contact Cards */}
        <Reveal className="flex flex-col justify-between gap-6">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-secondary text-rose shadow-sm">
                <MapPin className="h-6 w-6" />
              </span>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-rose">
                  Physical Store Address
                </span>
                <h3 className="font-display text-xl font-medium text-primary">
                  {business.shortName}
                </h3>
              </div>
            </div>

            <p className="mt-4 text-base font-semibold leading-relaxed text-foreground sm:text-lg">
              {business.address}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Punnaikayal, Thoothukudi District, Tamil Nadu
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild variant="rose" size="lg" className="shadow-soft">
                <a
                  href={directionsLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Get directions to our shop on Google Maps"
                >
                  <Navigation className="h-4 w-4" /> Get Directions
                </a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a
                  href={directionsLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5"
                >
                  <ExternalLink className="h-4 w-4" /> Open in Maps
                </a>
              </Button>
            </div>
          </div>

          {/* Quick Contact & Working Hours */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Phone & WhatsApp Card */}
            <div className="flex flex-col justify-between rounded-3xl border border-border bg-card p-6 shadow-soft">
              <div>
                <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-rose">
                  <Phone className="h-4 w-4" /> Call or WhatsApp
                </div>
                <a
                  href={telLink()}
                  className="mt-3 block font-display text-lg font-semibold text-primary transition-colors hover:text-rose sm:text-xl"
                  aria-label={`Call ${business.phoneDisplay}`}
                >
                  {business.phoneDisplay}
                </a>
                <p className="mt-1 text-xs text-muted-foreground">
                  Tap to open mobile dialer
                </p>
              </div>

              <div className="mt-5 flex flex-col gap-2">
                <Button asChild size="sm" variant="default" className="w-full">
                  <a href={telLink()}>
                    <Phone className="h-3.5 w-3.5" /> Call Now
                  </a>
                </Button>
                <Button asChild size="sm" variant="whatsapp" className="w-full">
                  <a
                    href={whatsappLink(generalOrderMessage())}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="h-3.5 w-3.5" /> WhatsApp Us
                  </a>
                </Button>
              </div>
            </div>

            {/* Opening Hours Card */}
            <div className="flex flex-col justify-between rounded-3xl border border-border bg-card p-6 shadow-soft">
              <div>
                <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-rose">
                  <Clock className="h-4 w-4" /> Bakery Hours
                </div>
                <dl className="mt-3 space-y-2 text-sm">
                  {business.hours.map((h) => (
                    <div key={h.days} className="border-b border-border/50 pb-2">
                      <dt className="text-xs text-muted-foreground">{h.days}</dt>
                      <dd className="font-semibold text-primary">{h.time}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Fresh batches baked every morning!
              </p>
            </div>
          </div>
        </Reveal>

        {/* Interactive Google Map Embed */}
        <Reveal delay={120} className="h-full min-h-[360px] sm:min-h-[420px] lg:min-h-full">
          <div className="relative h-full w-full overflow-hidden rounded-3xl border border-border bg-muted shadow-card">
            <iframe
              title={`Google Maps showing ${business.name} at ${business.address}`}
              src={mapUrl}
              className="h-full min-h-[380px] w-full border-0 lg:min-h-[460px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
            <div className="pointer-events-none absolute bottom-4 left-4 right-4 hidden rounded-2xl bg-card/90 p-3 shadow-soft backdrop-blur-md sm:block">
              <div className="flex items-center justify-between text-xs text-primary">
                <span className="flex items-center gap-1.5 font-medium">
                  <MapPin className="h-3.5 w-3.5 text-rose" /> {business.address}
                </span>
                <span className="font-bold text-rose">Google Maps</span>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

