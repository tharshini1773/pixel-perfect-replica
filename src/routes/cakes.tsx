import { useMemo } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/site/PageHero";
import { CategoryFilter } from "@/components/site/CategoryFilter";
import { CakeGrid } from "@/components/site/CakeGrid";
import { CtaBanner } from "@/components/site/CtaBanner";
import { categories, categoryIds, filterProducts, getCategoryName, products, type CategoryId } from "@/config/products";
import { pageMeta } from "@/lib/seo";
import chocolate from "@/assets/cake-chocolate.jpg";

type CakesSearch = { category?: CategoryId };

export const Route = createFileRoute("/cakes")({
  validateSearch: (search: Record<string, unknown>): CakesSearch => {
    const c = search["category"];
    return typeof c === "string" && (categoryIds as string[]).includes(c) ? { category: c as CategoryId } : {};
  },
  head: () => ({
    meta: pageMeta(
      "Cake Menu & Prices — Sweet Crumbs Bakery",
      "Browse 12 handcrafted cakes from ₹450 to ₹1,200: birthday, wedding, chocolate, black forest, red velvet, cupcakes and photo cakes.",
    ),
  }),
  component: CakesPage,
});

function CakesPage() {
  const { category } = Route.useSearch();
  const navigate = useNavigate({ from: "/cakes" });
  const active = category ?? "all";

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: products.length };
    categories.forEach((cat) => (c[cat.id] = products.filter((p) => p.category === cat.id).length));
    return c;
  }, []);

  const items = filterProducts(products, active);

  return (
    <>
      <PageHero
        crumb="Cakes"
        eyebrow="Our menu"
        title="Handcrafted cakes, baked fresh to order"
        description="Choose your favourite, tap Order Now and send your order to us on WhatsApp in seconds."
        image={chocolate}
      />

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
