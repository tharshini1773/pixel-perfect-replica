import { createFileRoute } from "@tanstack/react-router";
import { CalendarHeart, Gift, Heart, MessageSquareText, PencilRuler, CakeSlice, Truck } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { SectionHeading } from "@/components/site/SectionHeading";
import { CustomCakeForm } from "@/components/site/CustomCakeForm";
import { ContactActions } from "@/components/site/ContactDetails";
import { Reveal } from "@/components/site/Reveal";
import { pageMeta } from "@/lib/seo";
import customCake from "@/assets/cake-custom.jpg";
import birthday from "@/assets/cake-birthday.jpg";
import wedding from "@/assets/cake-wedding.jpg";
import anniversary from "@/assets/cake-anniversary.jpg";

export const Route = createFileRoute("/custom-cakes")({
  head: () => ({
    meta: pageMeta(
      "Custom Birthday, Wedding & Anniversary Cakes — Sweet Crumbs Bakery",
      "Design your own cake: themed birthday cakes, elegant wedding tiers and romantic anniversary cakes. Send us your idea today.",
    ),
  }),
  component: CustomCakesPage,
});

const types = [
  { icon: Gift, title: "Custom Birthday Cakes", text: "Cartoon characters, hobbies, unicorns, number cakes — any theme for any age.", image: birthday },
  { icon: Heart, title: "Custom Wedding Cakes", text: "Elegant tiers with sugar flowers, pearls and gold details to match your décor.", image: wedding },
  { icon: CalendarHeart, title: "Anniversary Cakes", text: "Heart shapes, vintage ruffles and photo prints to celebrate your love story.", image: anniversary },
];

const steps = [
  { icon: MessageSquareText, title: "Share your idea", text: "Fill in the form or WhatsApp us your theme, photos and date." },
  { icon: PencilRuler, title: "We design & quote", text: "We suggest the design, size and flavour, and confirm the price." },
  { icon: CakeSlice, title: "Freshly baked", text: "Your cake is baked and decorated by hand, close to your date." },
  { icon: Truck, title: "Delivered on time", text: "Packed with care and delivered or ready for pick-up on time." },
];

function CustomCakesPage() {
  return (
    <>
      <PageHero
        crumb="Custom Cakes"
        eyebrow="Customized cakes"
        title="A cake as unique as your celebration"
        description="Tell us your theme, colours and flavours — we'll design and bake a one-of-a-kind cake just for you."
        image={customCake}
      />

      <section className="section-y container-page">
        <SectionHeading eyebrow="What we create" title="Made-to-order for life's big moments" />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {types.map((t, i) => (
            <Reveal key={t.title} delay={i * 90}>
              <article className="group h-full overflow-hidden rounded-3xl border border-border bg-card shadow-soft transition-all duration-500 hover:-translate-y-1 hover:shadow-lift">
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={t.image} alt={t.title} loading="lazy" width={1024} height={1024} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                </div>
                <div className="p-6">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-secondary text-rose">
                    <t.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-xl font-medium text-primary">{t.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t.text}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section-y bg-gradient-blush">
        <div className="container-page">
          <SectionHeading eyebrow="How it works" title="From idea to cake in four easy steps" />
          <ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <Reveal as="li" key={s.title} delay={i * 90}>
                <div className="relative h-full rounded-3xl border border-border bg-card p-7 shadow-soft">
                  <span className="absolute right-6 top-5 font-display text-5xl font-semibold text-blush">0{i + 1}</span>
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-rose text-rose-foreground">
                    <s.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 text-lg font-medium text-primary">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section id="inquiry" className="section-y container-page">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <SectionHeading
              align="left"
              eyebrow="Cake inquiry"
              title="Tell us about your dream cake"
              description="Share a few details and we'll get back to you with design ideas and a quote. Prefer to chat? Call or WhatsApp us directly."
            />
            <ContactActions className="mt-8 flex flex-wrap gap-3" />
            <p className="mt-8 rounded-2xl bg-secondary p-5 text-sm text-secondary-foreground">
              <strong>Tip:</strong> For custom designs, please reach out at least 2–3 days before your date. Wedding cakes
              usually need a little more time.
            </p>
          </div>
          <CustomCakeForm />
        </div>
      </section>
    </>
  );
}
