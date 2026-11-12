import { createFileRoute, Link } from "@tanstack/react-router";
import { Egg, Leaf, Milk, Wheat, Clock3, HeartHandshake, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/site/PageHero";
import { SectionHeading } from "@/components/site/SectionHeading";
import { WhyChooseUs } from "@/components/site/WhyChooseUs";
import { CtaBanner } from "@/components/site/CtaBanner";
import { Reveal } from "@/components/site/Reveal";
import { business } from "@/config/business";
import { pageMeta } from "@/lib/seo";
import baker from "@/assets/about-baker.jpg";
import display from "@/assets/gallery-display.jpg";
import strawberry from "@/assets/cake-strawberry.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: pageMeta(
      "About Us — Sweet Crumbs Bakery",
      "Meet Sweet Crumbs Bakery: small-batch cakes made with quality ingredients, baked fresh to order with care and creativity.",
    ),
  }),
  component: AboutPage,
});

const ingredients = [
  { icon: Milk, title: "Real butter & cream", text: "Rich dairy for melt-in-your-mouth sponge and silky frosting." },
  { icon: Wheat, title: "Fine flour", text: "Carefully sifted for light, airy, tender layers." },
  { icon: Leaf, title: "Fresh fruit", text: "Seasonal strawberries, pineapple and cherries — never artificial." },
  { icon: Egg, title: "Eggless options", text: "Most cakes can be made eggless on request without losing flavour." },
];

function AboutPage() {
  return (
    <>
      <PageHero
        crumb="About"
        eyebrow="About us"
        title="A little bakery with a big love for cake"
        description={`${business.name} began with a simple belief: every celebration deserves a cake that looks beautiful and tastes even better.`}
        image={display}
      />

      <section className="section-y container-page">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <Reveal className="relative">
            <img src={baker} alt="Our baker decorating a cake by hand" loading="lazy" width={1200} height={1408} className="aspect-[4/5] w-full rounded-[2.5rem] object-cover shadow-lift" />
            <img src={strawberry} alt="" loading="lazy" width={1024} height={1024} className="absolute -bottom-8 -right-4 hidden h-44 w-44 rounded-3xl border-8 border-background object-cover shadow-card sm:block md:-right-8" />
          </Reveal>
          <Reveal delay={100}>
            <SectionHeading align="left" eyebrow="Our story" title="Baked by hand, from the heart" />
            <div className="mt-6 space-y-4 text-lg leading-relaxed text-muted-foreground">
              <p>
                Every cake that leaves our kitchen is mixed, baked and decorated by hand. We bake in small batches so
                nothing sits on a shelf — your cake is made for you, close to your celebration.
              </p>
              <p>
                From a simple birthday sponge to a towering wedding cake, we bring the same care to every order: honest
                ingredients, thoughtful design and flavours that make people come back for another slice.
              </p>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-2xl bg-secondary p-5">
                <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-rose" />
                <div>
                  <p className="font-semibold text-primary">Fresh every day</p>
                  <p className="text-sm text-muted-foreground">Baked to order, never frozen.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-2xl bg-secondary p-5">
                <HeartHandshake className="mt-0.5 h-5 w-5 shrink-0 text-rose" />
                <div>
                  <p className="font-semibold text-primary">Made with care</p>
                  <p className="text-sm text-muted-foreground">Personal service for every order.</p>
                </div>
              </div>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="rose" size="lg">
                <Link to="/location">
                  Visit Bakery in Punnaikayal <MapPin className="h-4 w-4 ml-1" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/contact">
                  Contact Us
                </Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section-y bg-gradient-blush">
        <div className="container-page">
          <SectionHeading
            eyebrow="Quality ingredients"
            title="Good cake starts with good ingredients"
            description="We choose every ingredient for flavour and freshness — because you can taste the difference."
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {ingredients.map((it, i) => (
              <Reveal key={it.title} delay={i * 90}>
                <div className="h-full rounded-3xl bg-card p-7 text-center shadow-soft">
                  <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-secondary text-rose">
                    <it.icon className="h-7 w-7" />
                  </span>
                  <h3 className="mt-5 text-lg font-medium text-primary">{it.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{it.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-y container-page">
        <SectionHeading eyebrow="Why choose us" title="Four promises in every box" />
        <div className="mt-12">
          <WhyChooseUs />
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
