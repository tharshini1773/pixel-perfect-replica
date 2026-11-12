import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CalendarHeart, Gift, Heart, Leaf, Palette, Sparkles, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Hero } from "@/components/site/Hero";
import { SectionHeading } from "@/components/site/SectionHeading";
import { CategoryGrid } from "@/components/site/CategoryGrid";
import { CakeGrid } from "@/components/site/CakeGrid";
import { CakeImageSlider } from "@/components/site/CakeImageSlider";
import { LocationSection } from "@/components/site/LocationSection";
import { CakeEnquiryForm } from "@/components/site/CakeEnquiryForm";
import { WhyChooseUs } from "@/components/site/WhyChooseUs";
import { GalleryGrid } from "@/components/site/GalleryGrid";
import { ReviewsGrid } from "@/components/site/Reviews";
import { CtaBanner } from "@/components/site/CtaBanner";
import { Reveal } from "@/components/site/Reveal";
import { products } from "@/config/products";
import { gallery, reviews } from "@/config/content";
import { business } from "@/config/business";
import { pageMeta } from "@/lib/seo";
import customCake from "@/assets/cake-custom.jpg";
import anniversary from "@/assets/cake-anniversary.jpg";
import baker from "@/assets/about-baker.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: pageMeta(
      `${business.name} — Every Celebration Deserves a Beautiful Cake`,
      `Handcrafted birthday, wedding, chocolate, red velvet, photo and custom cakes from ₹450. Baked fresh in Punnaikayal, Thoothukudi. Easy WhatsApp & email enquiries to ${business.email}.`,
    ),
  }),
  component: Index,
});

const featured = products.filter((p) => p.tag).slice(0, 6);

function Index() {
  return (
    <>
      <Hero />

      {/* Featured Cake Image Slider with Prev/Next Controls */}
      <section className="section-y bg-gradient-blush">
        <div className="container-page">
          <SectionHeading
            eyebrow="Trending Bakes"
            title={
              <>
                Signature Creations <em className="text-rose font-medium">Fresh from Our Oven</em>
              </>
            }
            description="Swipe through our most celebrated cake designs — baked to order with premium ingredients."
          />
          <div className="mt-12">
            <CakeImageSlider />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section-y container-page">
        <SectionHeading
          eyebrow="10 Cake Categories"
          title={<>Something sweet for <em className="text-rose font-medium">every</em> occasion</>}
          description="From birthday sprinkles and wedding tiers to rich chocolate, red velvet and photo cakes — explore our 10 handcrafted collections."
        />
        <div className="mt-14">
          <CategoryGrid />
        </div>
      </section>

      {/* Featured menu */}
      <section className="section-y bg-gradient-blush">
        <div className="container-page">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading
              align="left"
              eyebrow="Customer favourites"
              title="Our signature cakes"
              description="Tap Order Now to send your order straight to us on WhatsApp or call our bakery."
            />
            <Button asChild variant="outline" size="lg">
              <Link to="/cakes">
                View full menu <ArrowRight />
              </Link>
            </Button>
          </div>
          <div className="mt-12">
            <CakeGrid items={featured} />
          </div>
        </div>
      </section>

      {/* Custom cakes teaser */}
      <section className="section-y container-page">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <Reveal className="relative order-2 lg:order-1">
            <div className="grid grid-cols-2 gap-4">
              <img src={customCake} alt="Custom unicorn cake" loading="lazy" width={1024} height={1024} className="aspect-[3/4] w-full rounded-[2rem] object-cover shadow-card" />
              <img src={anniversary} alt="Heart-shaped anniversary cake" loading="lazy" width={1024} height={1024} className="mt-12 aspect-[3/4] w-full rounded-[2rem] object-cover shadow-card" />
            </div>
            <div className="absolute -bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-cocoa px-5 py-3 text-sm font-semibold text-cocoa-foreground shadow-lift">
              <Palette className="h-4 w-4 text-blush" /> Designed just for you
            </div>
          </Reveal>
          <Reveal className="order-1 lg:order-2" delay={100}>
            <SectionHeading
              align="left"
              eyebrow="Customized cakes"
              title="Dream it. We'll bake it."
              description="Share your theme, colours or a photo, and our bakers will craft a one-of-a-kind cake for your celebration."
            />
            <ul className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                { icon: Gift, label: "Birthday" },
                { icon: Heart, label: "Wedding" },
                { icon: CalendarHeart, label: "Anniversary" },
              ].map((o) => (
                <li key={o.label} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-rose">
                    <o.icon className="h-5 w-5" />
                  </span>
                  <span className="font-semibold text-primary">{o.label}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="rose" size="lg">
                <Link to="/custom-cakes">
                  Start a custom order <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="#enquiry">
                  <Mail className="h-4 w-4" /> Email Enquiry
                </a>
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Online Cake Enquiry Section */}
      <section id="enquiry" className="section-y bg-gradient-blush">
        <div className="container-page">
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <Reveal>
              <SectionHeading
                align="left"
                eyebrow="Direct Email Booking"
                title="Send a Cake Enquiry"
                description={`Got a special request or event date in mind? Send an enquiry directly to our email (${business.email}). We reply promptly with design options and pricing.`}
              />
              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-3.5 rounded-2xl bg-card p-4 shadow-soft border border-border">
                  <Sparkles className="h-5 w-5 text-rose shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-primary text-sm">Personalized Service</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Eggless, sugar-free, multi-tier and custom flavours available on request.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3.5 rounded-2xl bg-card p-4 shadow-soft border border-border">
                  <Mail className="h-5 w-5 text-rose shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-primary text-sm">Owner's Inbox</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      All enquiries delivered to <strong>{business.email}</strong>.
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <CakeEnquiryForm />
            </Reveal>
          </div>
        </div>
      </section>

      {/* About snippet + why choose us */}
      <section className="section-y bg-gradient-cocoa">
        <div className="container-page">
          <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.1fr]">
            <Reveal>
              <img src={baker} alt="Baker piping buttercream roses on a cake" loading="lazy" width={1200} height={1408} className="aspect-[4/3] w-full rounded-[2rem] object-cover shadow-lift lg:aspect-[5/4]" />
            </Reveal>
            <Reveal delay={100}>
              <SectionHeading
                light
                align="left"
                eyebrow="Our story"
                title="Baked with love, served with joy"
                description="At Sweet Crumbs, every cake begins with real butter, fresh cream and fine chocolate. We bake in small batches in Punnaikayal so each order is fresh, beautiful and full of flavour."
              />
              <div className="mt-8 flex items-center gap-3 text-sm text-cocoa-foreground/80">
                <Leaf className="h-5 w-5 text-blush" /> Quality ingredients · No shortcuts · Baked to order
              </div>
              <Button asChild variant="outline-light" size="lg" className="mt-8">
                <Link to="/about">
                  Read our story <ArrowRight />
                </Link>
              </Button>
            </Reveal>
          </div>
          <div className="mt-20">
            <WhyChooseUs light />
          </div>
        </div>
      </section>

      {/* Gallery preview */}
      <section className="section-y container-page">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading align="left" eyebrow="Gallery" title="Fresh from our oven" description="A peek at some of the celebrations we've been part of." />
          <Button asChild variant="outline" size="lg">
            <Link to="/gallery">
              See full gallery <ArrowRight />
            </Link>
          </Button>
        </div>
        <div className="mt-12">
          <GalleryGrid images={gallery.slice(0, 8)} showFilters={false} />
        </div>
      </section>

      {/* Actual Shop Location Section with Google Maps */}
      <LocationSection />

      {/* Reviews preview */}
      <section className="section-y bg-gradient-blush">
        <div className="container-page">
          <SectionHeading eyebrow="Reviews" title="Sweet words from our customers" />
          <div className="mt-12">
            <ReviewsGrid items={reviews.slice(0, 3)} />
          </div>
          <div className="mt-10 text-center">
            <Button asChild variant="outline" size="lg">
              <Link to="/reviews">
                Read all reviews <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="pt-20 md:pt-28">
        <CtaBanner />
      </div>
    </>
  );
}
