import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { ReviewsGrid, Stars } from "@/components/site/Reviews";
import { CtaBanner } from "@/components/site/CtaBanner";
import { reviews } from "@/config/content";
import { pageMeta } from "@/lib/seo";
import redvelvet from "@/assets/cake-redvelvet.jpg";

export const Route = createFileRoute("/reviews")({
  head: () => ({
    meta: pageMeta(
      "Customer Reviews — Sweet Crumbs Bakery",
      "Read what our customers say about our birthday, wedding and custom cakes, freshness and on-time delivery.",
    ),
  }),
  component: ReviewsPage,
});

function ReviewsPage() {
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  return (
    <>
      <PageHero
        crumb="Reviews"
        eyebrow="Customer Reviews"
        title="Loved in every slice"
        description="Kind words from families, couples and celebrations we've baked for in Punnaikayal & Thoothukudi."
        image="https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?auto=format&fit=crop&w=1200&q=80"
      />
      <section className="section-y container-page">
        <div className="mx-auto mb-14 flex max-w-md flex-col items-center rounded-3xl border border-border bg-card p-8 text-center shadow-card">
          <p className="font-display text-6xl font-semibold text-primary">{avg.toFixed(1)}</p>
          <Stars rating={Math.round(avg)} className="mt-3 [&_svg]:h-6 [&_svg]:w-6" />
          <p className="mt-3 text-sm text-muted-foreground">Average rating from {reviews.length} customer reviews</p>
        </div>
        <ReviewsGrid items={reviews} />
      </section>
      <CtaBanner title="Ready to make your own sweet memory?" />
    </>
  );
}
