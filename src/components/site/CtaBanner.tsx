import { Link } from "@tanstack/react-router";
import { MessageCircle, ShoppingBag, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { whatsappLink, generalOrderMessage, telLink } from "@/lib/whatsapp";
import { business } from "@/config/business";
import { Reveal } from "./Reveal";

export function CtaBanner({
  title = "Let's bake something beautiful for your celebration",
  text = "Pick a favourite from our menu or tell us your dream design — we'll take care of the rest.",
}: { title?: string; text?: string }) {
  return (
    <section className="container-page pb-20 md:pb-28">
      <Reveal>
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-cocoa px-6 py-14 text-center shadow-lift md:px-16 md:py-20">
          <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-rose/25 blur-3xl" aria-hidden />
          <div className="absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-gold/20 blur-3xl" aria-hidden />
          <div className="relative mx-auto max-w-2xl">
            <span className="eyebrow justify-center text-blush">Order today</span>
            <h2 className="mt-4 text-balance text-3xl font-medium leading-tight text-cocoa-foreground md:text-5xl">{title}</h2>
            <p className="mt-5 text-cocoa-foreground/75 md:text-lg">{text}</p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Button asChild variant="cream" size="xl">
                <Link to="/cakes">
                  <ShoppingBag /> Browse Cakes
                </Link>
              </Button>
              <Button asChild variant="whatsapp" size="xl">
                <a href={whatsappLink(generalOrderMessage())} target="_blank" rel="noopener noreferrer">
                  <MessageCircle /> WhatsApp Us
                </a>
              </Button>
              <Button asChild variant="outline-light" size="xl">
                <a href={telLink()}>
                  <Phone className="h-4 w-4" /> Call: {business.phoneDisplay}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
