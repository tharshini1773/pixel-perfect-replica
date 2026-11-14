import { useMemo } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Palette, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/site/PageHero";
import { CategoryFilter } from "@/components/site/CategoryFilter";
import { CakeGrid } from "@/components/site/CakeGrid";
import { CakeImageSlider } from "@/components/site/CakeImageSlider";
import { CtaBanner } from "@/components/site/CtaBanner";
import { categories, categoryIds, filterProducts, getCategoryName, products as staticProducts, type CategoryId, type Product } from "@/config/products";
import { useBakeryStore } from "@/context/BakeryStoreContext";
import { pageMeta } from "@/lib/seo";
import { business } from "@/config/business";

type CakesSearch = { category?: CategoryId };

export const Route = createFileRoute("/cakes")({
  validateSearch: (search: Record<string, unknown>): CakesSearch => {
    const c = search["category"];
    return typeof c === "string" && (categoryIds as string[]).includes(c) ? { category: c as CategoryId } : {};
  },
  head: () => ({
    meta: pageMeta(
      `Cake Menu & Handcrafted Prices — ${business.name}`,
      `Explore 20 handcrafted cakes across 10 categories: Birthday, Wedding, Chocolate, Black Forest, Red Velvet, Strawberry, Customised, Photo cakes, Cupcakes and Anniversary cakes from ₹450 to ₹2,400.`,
    ),
  }),
  component: CakesPage,
});

function CakesPage() {
  const { products: storeProducts, categories: storeCategories } = useBakeryStore();
  const { category } = Route.useSearch();
  const navigate = useNavigate({ from: "/cakes" });
  const active = category ?? "all";

  // Active products in store (falls back to static products if loading)
  const activeProducts: Product[] = (storeProducts.length ? storeProducts : staticProducts)
    .filter((p) => p.isAvailable !== false)
    .map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category as any,
      description: p.description,
      weight: p.weight,
      price: p.price,
      image: p.image,
      tag: p.tag as any,
    }));

  const activeCategories = storeCategories.length ? storeCategories : categories;

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: activeProducts.length };
    activeCategories.forEach((cat) => (c[cat.id] = activeProducts.filter((p) => p.category === cat.id).length));
    return c;
  }, [activeProducts, activeCategories]);

  const items = filterProducts(activeProducts, active);

  return (
    <>
      <PageHero
        crumb="Cakes"
        eyebrow="Our artisan menu"
        title="Handcrafted cakes, baked fresh to order"
        description="Choose your favourite, tap Order Now to send your order on WhatsApp or call our shop directly."
        image="https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1200&q=80"
      />

      {/* Featured Spotlight Slider */}
      <section className="pt-12 sm:pt-16 container-page">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose">
              <Sparkles className="h-3.5 w-3.5" /> Featured Spotlight
            </span>
            <h2 className="font-display text-2xl font-semibold text-primary mt-1">
              Top Trending Cakes
            </h2>
          </div>
          <span className="text-xs text-muted-foreground hidden sm:inline">
            Slide with arrows to explore designs
          </span>
        </div>
        <CakeImageSlider />
      </section>

      <section className="section-y container-page">
        <CategoryFilter
          active={active}
          counts={counts}
          onChange={(id) =>
            navigate({ search: id === "all" ? {} : { category: id }, replace: true, resetScroll: false })
          }
        />
        <p className="mt-8 text-center text-sm text-muted-foreground" aria-live="polite">
          Showing <span className="font-semibold text-primary">{items.length}</span>{" "}
          {active === "all" ? "cakes" : `${getCategoryName(active)} ${items.length === 1 ? "cake" : "cakes"}`}
        </p>

        <div className="mt-10">
          {items.length > 0 ? (
            <CakeGrid key={active} items={items} />
          ) : (
            <div className="mx-auto max-w-md rounded-3xl border border-dashed border-border bg-card p-10 text-center">
              <p className="text-muted-foreground">No cakes in this category yet — ask us for a custom one!</p>
            </div>
          )}
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-6 rounded-3xl border border-border bg-gradient-blush p-8 text-center md:flex-row md:p-10 md:text-left">
          <div className="flex flex-col items-center gap-4 md:flex-row">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-rose text-rose-foreground">
              <Palette className="h-6 w-6" />
            </span>
            <div>
              <h2 className="text-2xl font-medium text-primary">Can't find exactly what you want?</h2>
              <p className="mt-1 text-muted-foreground">Tell us your idea and we'll design a cake just for you.</p>
            </div>
          </div>
          <Button asChild variant="rose" size="lg">
            <Link to="/custom-cakes">
              Custom cake inquiry <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
