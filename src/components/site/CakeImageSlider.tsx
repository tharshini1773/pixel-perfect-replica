import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, MessageCircle, ShoppingBag, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { business } from "@/config/business";
import { formatINR } from "@/config/products";
import { generalOrderMessage, whatsappLink } from "@/lib/whatsapp";
import { Link } from "@tanstack/react-router";

export type SliderSlide = {
  id: string;
  title: string;
  category: string;
  description: string;
  price: number;
  weight: string;
  image: string;
  badge?: string;
};

const defaultSlides: SliderSlide[] = [
  {
    id: "slide-1",
    title: "Confetti Celebration Cake",
    category: "Birthday Cakes",
    description: "Vanilla bean sponge layered with strawberry compote and festive sprinkles.",
    price: 650,
    weight: "1 kg",
    image: "https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=1200&q=80",
    badge: "Bestseller",
  },
  {
    id: "slide-2",
    title: "Royal Pearl Wedding Cake",
    category: "Wedding Cakes",
    description: "Two majestic tiers with satin buttercream, handcrafted sugar roses and pearls.",
    price: 2400,
    weight: "3 kg",
    image: "https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&w=1200&q=80",
    badge: "Chef's Pick",
  },
  {
    id: "slide-3",
    title: "Belgian Chocolate Truffle",
    category: "Chocolate Cakes",
    description: "Rich dark chocolate ganache drip with fresh raspberries and cocoa curls.",
    price: 750,
    weight: "1 kg",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1200&q=80",
    badge: "Customer Favorite",
  },
  {
    id: "slide-4",
    title: "Classic Black Forest Gateau",
    category: "Black Forest Cakes",
    description: "Layers of cocoa sponge, wild dark cherries, Chantilly cream and shaved curls.",
    price: 650,
    weight: "1 kg",
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=1200&q=80",
    badge: "Classic",
  },
  {
    id: "slide-5",
    title: "Signature Red Velvet Dream",
    category: "Red Velvet Cakes",
    description: "Crimson cocoa sponge paired with rich whipped cream cheese frosting.",
    price: 850,
    weight: "1 kg",
    image: "https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?auto=format&fit=crop&w=1200&q=80",
    badge: "Bestseller",
  },
  {
    id: "slide-6",
    title: "Fresh Strawberry Shortcake",
    category: "Strawberry Cakes",
    description: "Feather-light genoise sponge, fresh whipped cream and ripe garden strawberries.",
    price: 750,
    weight: "1 kg",
    image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=1200&q=80",
    badge: "Fresh Fruits",
  },
  {
    id: "slide-7",
    title: "Artisanal Designer Cake",
    category: "Customised Cakes",
    description: "Handcrafted bespoke theme cake with custom painted edible fondant art.",
    price: 1250,
    weight: "1.5 kg",
    image: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=1200&q=80",
    badge: "Custom Made",
  },
  {
    id: "slide-8",
    title: "Keepsake Photo Memory Cake",
    category: "Photo Cakes",
    description: "High-definition edible sugar sheet portrait framed in elegant rosette piping.",
    price: 900,
    weight: "1 kg",
    image: "https://images.unsplash.com/photo-1579372786545-d24232daf58c?auto=format&fit=crop&w=1200&q=80",
    badge: "Photo Print",
  },
  {
    id: "slide-9",
    title: "Deluxe Swirl Cupcake Box",
    category: "Cupcakes",
    description: "Box of six gourmet cupcakes in chocolate, vanilla and strawberry swirls.",
    price: 480,
    weight: "6 pcs",
    image: "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?auto=format&fit=crop&w=1200&q=80",
    badge: "Party Box",
  },
  {
    id: "slide-10",
    title: "Vintage Lambeth Heart Cake",
    category: "Anniversary Cakes",
    description: "Romantic heart shape with intricate Victorian ruffles and sugar cherries.",
    price: 950,
    weight: "1 kg",
    image: "https://images.unsplash.com/photo-1518047601542-4505c4434222?auto=format&fit=crop&w=1200&q=80",
    badge: "Romance",
  },
];

export function CakeImageSlider({
  slides = defaultSlides,
  className = "",
}: {
  slides?: SliderSlide[];
  className?: string;
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "center", duration: 25 });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((i: number) => emblaApi && emblaApi.scrollTo(i), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    onSelect();

    // Auto-advance every 5 seconds
    const interval = setInterval(() => {
      emblaApi.scrollNext();
    }, 5000);

    return () => clearInterval(interval);
  }, [emblaApi, onSelect]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Slider Carousel Container */}
      <div className="overflow-hidden rounded-3xl" ref={emblaRef}>
        <div className="flex touch-pan-y">
          {slides.map((s, i) => (
            <div
              key={s.id || i}
              className="relative min-w-0 flex-[0_0_100%] sm:flex-[0_0_88%] md:flex-[0_0_78%] lg:flex-[0_0_70%] px-2 sm:px-4"
            >
              <div className="group relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden rounded-3xl border border-border/80 bg-muted shadow-card transition-all duration-500 hover:shadow-lift">
                <img
                  src={s.image}
                  alt={s.title}
                  loading={i === 0 ? "eager" : "lazy"}
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-cocoa/90 via-cocoa/30 to-transparent" />

                {/* Top badges */}
                <div className="absolute left-4 top-4 right-4 flex items-center justify-between">
                  {s.badge && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-rose/90 px-3.5 py-1 text-xs font-bold text-white shadow-soft backdrop-blur-sm">
                      <Sparkles className="h-3.5 w-3.5" /> {s.badge}
                    </span>
                  )}
                  <span className="rounded-full bg-cocoa/85 px-3.5 py-1 text-xs font-semibold text-cocoa-foreground backdrop-blur-sm">
                    {s.category}
                  </span>
                </div>

                {/* Bottom Content Card */}
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7 text-white">
                  <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                    <div className="max-w-lg">
                      <div className="flex items-center gap-2 text-xs text-blush font-semibold uppercase tracking-wider">
                        <span>{s.weight}</span>
                        <span>•</span>
                        <span>{formatINR(s.price)}</span>
                      </div>
                      <h3 className="mt-1 font-display text-2xl font-semibold sm:text-3xl text-white drop-shadow-sm">
                        {s.title}
                      </h3>
                      <p className="mt-1.5 line-clamp-2 text-xs sm:text-sm text-cocoa-foreground/90">
                        {s.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button asChild size="sm" variant="whatsapp" className="shadow-soft text-xs sm:text-sm">
                        <a
                          href={whatsappLink(
                            `Hello ${business.name}! I'd like to order "${s.title}" (${s.category}, ${s.weight}) for ${formatINR(
                              s.price,
                            )}. Could you confirm availability?`,
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <MessageCircle className="h-4 w-4" /> Order Now
                        </a>
                      </Button>
                      <Button asChild size="sm" variant="outline-light" className="text-xs sm:text-sm">
                        <Link to="/cakes">
                          <ShoppingBag className="h-3.5 w-3.5" /> Menu
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows: Left and Right */}
      <button
        type="button"
        onClick={scrollPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 grid h-12 w-12 place-items-center rounded-full bg-card/90 text-primary shadow-lift backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-rose hover:text-white"
        aria-label="Previous cake slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      <button
        type="button"
        onClick={scrollNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 grid h-12 w-12 place-items-center rounded-full bg-card/90 text-primary shadow-lift backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-rose hover:text-white"
        aria-label="Next cake slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Dots Indicator */}
      <div className="mt-6 flex items-center justify-center gap-2">
        {scrollSnaps.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => scrollTo(idx)}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              idx === selectedIndex ? "w-8 bg-rose" : "w-2.5 bg-border hover:bg-muted-foreground/50"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

