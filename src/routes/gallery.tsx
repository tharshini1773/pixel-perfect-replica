import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { GalleryGrid } from "@/components/site/GalleryGrid";
import { CtaBanner } from "@/components/site/CtaBanner";
import { gallery } from "@/config/content";
import { pageMeta } from "@/lib/seo";
import wedding from "@/assets/cake-wedding.jpg";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: pageMeta(
      "Cake Gallery — Sweet Crumbs Bakery",
      "See our handcrafted birthday, wedding, anniversary and custom cakes. Get inspired for your next celebration.",
    ),
  }),
  component: GalleryPage,
});

function GalleryPage() {
  return (
    <>
      <PageHero
        crumb="Gallery"
        eyebrow="Gallery"
        title="A feast for the eyes"
        description="Every cake tells a story. Tap any photo to see it up close."
        image={wedding}
      />
      <section className="section-y container-page">
        <GalleryGrid images={gallery} />
      </section>
      <CtaBanner title="Saw something you love?" text="Send us the photo on WhatsApp and we'll make one just for you." />
    </>
  );
}
