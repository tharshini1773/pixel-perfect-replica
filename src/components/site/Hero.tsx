import { Link } from "@tanstack/react-router";
import { MessageCircle, ShoppingBag, Star, Sparkles, Truck, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroCake from "@/assets/hero-cake.jpg";
import cupcakes from "@/assets/cake-cupcakes.jpg";
import { whatsappLink, generalOrderMessage, telLink } from "@/lib/whatsapp";
import { business } from "@/config/business";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-hero">
      <div className="absolute inset-0 dot-pattern opacity-50" aria-hidden />
      <div className="absolute -right-32 top-10 h-96 w-96 rounded-full bg-blush blur-3xl" aria-hidden />
      <div className="container-page relative grid items-center gap-12 pb-20 pt-10 md:pt-16 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:pb-28">
        <div className="animate-fade-up">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-rose/30 bg-card/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-rose backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" /> Handcrafted · Baked fresh daily
            </span>
            <Link
              to="/location"
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-3.5 py-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors backdrop-blur"
            >
              <MapPin className="h-3.5 w-3.5 text-rose" /> Punnaikayal, Thoothukudi
            </Link>
          </div>

          <h1 className="mt-6 text-balance text-5xl font-medium leading-[1.02] text-primary sm:text-6xl xl:text-7xl">
            Every Celebration Deserves a{" "}
            <em className="relative whitespace-nowrap font-medium text-rose">
              Beautiful Cake
              <svg className="absolute -bottom-2 left-0 w-full text-rose/40" viewBox="0 0 200 12" fill="none" aria-hidden>
                <path d="M2 9c40-6 120-8 196-2" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </em>
          </h1>
          <p className="mt-7 max-w-lg text-lg leading-relaxed text-muted-foreground">
            Handcrafted birthday, wedding, chocolate, photo and custom cakes made with real butter and pure chocolate. Baked to order in Punnaikayal with doorstep delivery across Thoothukudi.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Button asChild variant="rose" size="xl" className="shadow-soft">
              <Link to="/cakes">
                <ShoppingBag /> Order Now
              </Link>
            </Button>
            <Button asChild variant="whatsapp" size="xl" className="shadow-soft">
              <a href={whatsappLink(generalOrderMessage())} target="_blank" rel="noopener noreferrer">
                <MessageCircle /> WhatsApp Order
              </a>
            </Button>
            <Button asChild variant="outline" size="xl">
              <a href={telLink()}>
                <Phone className="h-4 w-4 text-rose" /> Call Us
              </a>
            </Button>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <span className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-gold text-gold" />
                ))}
              </span>
              Loved by happy customers
            </span>
            <span className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-rose" /> On-time delivery in Thoothukudi
            </span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-xl animate-fade-up [animation-delay:150ms]">
          <div className="absolute -inset-3 rotate-3 rounded-[3rem] bg-gradient-rose opacity-25" aria-hidden />
          <img
            src={heroCake}
            alt="Three-tier blush pink celebration cake decorated with roses, macarons and gold leaf"
            width={1600}
            height={1200}
            fetchPriority="high"
            className="relative aspect-[4/5] w-full rounded-[2.5rem] object-cover shadow-lift sm:aspect-[5/5]"
          />
          <div className="absolute -bottom-6 -left-4 flex items-center gap-3 rounded-2xl bg-card p-3 pr-5 shadow-lift animate-float sm:-left-10">
            <img src={cupcakes} alt="" width={1024} height={1024} className="h-14 w-14 rounded-xl object-cover" />
            <div>
              <p className="font-display text-base font-semibold text-primary">Cakes from ₹450</p>
              <p className="text-xs text-muted-foreground">Cupcakes, tiers & custom designs</p>
            </div>
          </div>
          <div className="absolute -right-2 top-8 rounded-2xl bg-cocoa px-4 py-3 text-center text-cocoa-foreground shadow-lift [animation-delay:1.5s] animate-float sm:-right-4 lg:right-3">
            <p className="font-display text-2xl font-semibold">100%</p>
            <p className="text-[0.65rem] font-bold uppercase tracking-widest text-blush">Fresh baked</p>
          </div>
        </div>
      </div>
    </section>
  );
}
