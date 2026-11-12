import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { GalleryGrid } from "@/components/site/GalleryGrid";
import { CakeImageSlider } from "@/components/site/CakeImageSlider";
import { CtaBanner } from "@/components/site/CtaBanner";
import { gallery } from "@/config/content";
import { pageMeta } from "@/lib/seo";
import { business } from "@/config/business";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: pageMeta(
      `Cake Gallery & Real Photographs — ${business.name}`,
      `Explore our photo gallery featuring realistic photographs of 10 cake categories: Birthday, Wedding, Chocolate, Black Forest, Red Velvet, Strawberry, Customised, Photo cakes, Cupcakes and Anniversary cakes.`,
    ),
  }),
  component: GalleryPage,
});

function GalleryPage() {
  return (
    <>
      <PageHero
        crumb="Gallery"
        eyebrow="Artisan gallery"
        title="A feast for the eyes"
        description="Every cake tells a story. Filter by category, slide through featured bakes, or tap any photo to zoom in."
        image="https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&w=1200&q=80"
      />

      {/* Featured Slide Reel */}
      <section className="pt-12 sm:pt-16 container-page">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose">
              <Sparkles className="h-3.5 w-3.5" /> Curated Showcase
            </span>
            <h2 className="font-display text-2xl font-semibold text-primary mt-1">
              Celebration Highlights Slider
            </h2>
          </div>
          <span className="text-xs text-muted-foreground hidden sm:inline">
            Slide to view realistic cake photography
          </span>
        </div>
        <CakeImageSlider />
      </section>

      {/* Category-Filtered Gallery Grid */}
      <section className="section-y container-page">
        <div className="text-center mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-rose">
            Browse All 10 Categories
          </span>
          <h2 className="font-display text-3xl font-semibold text-primary mt-1">
            Handcrafted Photo Collection
          </h2>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto mt-2">
            Select a category tab below to filter photos, or click any cake card to view up-close with zoom and direct WhatsApp ordering.
          </p>
        </div>
        <GalleryGrid images={gallery} showFilters={true} />
      </section>

      <CtaBanner
        title="Saw something you love in our gallery?"
        text="Send us the photo or name on WhatsApp and we'll bake one fresh just for your celebration."
      />
    </>
  );
}
