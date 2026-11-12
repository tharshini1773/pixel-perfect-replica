import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, MessageCircle, X, ZoomIn } from "lucide-react";
import type { GalleryImage } from "@/config/content";
import { business } from "@/config/business";
import { whatsappLink } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";

export function GalleryGrid({
  images,
  showFilters = true,
}: {
  images: GalleryImage[];
  showFilters?: boolean;
}) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [index, setIndex] = useState<number | null>(null);

  const categories = useMemo(() => {
    const set = new Set<string>();
    images.forEach((img) => {
      if (img.category) set.add(img.category);
    });
    return ["All", ...Array.from(set)];
  }, [images]);

  const filteredImages = useMemo(() => {
    if (selectedCategory === "All") return images;
    return images.filter((img) => img.category === selectedCategory);
  }, [images, selectedCategory]);

  const close = useCallback(() => setIndex(null), []);
  const step = useCallback(
    (d: number) =>
      setIndex((i) => (i === null ? i : (i + d + filteredImages.length) % filteredImages.length)),
    [filteredImages.length],
  );

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [index, close, step]);

  const current = index === null ? undefined : filteredImages[index];

  return (
    <>
      {showFilters && categories.length > 1 && (
        <div className="mb-10 flex flex-wrap items-center justify-center gap-2">
          {categories.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat);
                  setIndex(null);
                }}
                className={cn(
                  "rounded-full px-4 py-2 text-xs font-semibold tracking-wide transition-all duration-300 md:text-sm",
                  active
                    ? "bg-rose text-rose-foreground shadow-soft scale-105"
                    : "border border-border bg-card text-muted-foreground hover:border-rose/40 hover:text-primary",
                )}
              >
                {cat}
              </button>
            );
          })}
        </div>
      )}

      <div className="grid grid-flow-dense auto-rows-[180px] grid-cols-2 gap-3 sm:auto-rows-[220px] md:grid-cols-4 md:gap-5 lg:auto-rows-[260px]">
        {filteredImages.map((img, i) => (
          <Reveal
            key={img.src + i}
            delay={(i % 4) * 60}
            className={cn(img.wide && "col-span-2", img.tall && "row-span-2")}
          >
            <button
              type="button"
              onClick={() => setIndex(i)}
              className="group relative block h-full w-full overflow-hidden rounded-3xl border border-border/60 bg-muted shadow-soft transition-all duration-500 hover:-translate-y-1 hover:shadow-lift"
              aria-label={`View larger: ${img.title || img.alt}`}
            >
              <img
                src={img.src}
                alt={img.alt}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-cocoa/80 via-cocoa/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              
              <div className="absolute inset-x-0 bottom-0 flex flex-col items-start p-4 text-left opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 translate-y-2">
                {img.category && (
                  <span className="mb-1 rounded-full bg-rose/90 px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-white shadow-sm">
                    {img.category}
                  </span>
                )}
                <span className="line-clamp-1 font-display text-sm font-semibold text-cocoa-foreground md:text-base">
                  {img.title || img.alt}
                </span>
              </div>

              <span className="absolute right-3 top-3 grid h-9 w-9 scale-75 place-items-center rounded-full bg-cream/90 text-cocoa opacity-0 shadow-sm transition-all duration-300 group-hover:scale-100 group-hover:opacity-100">
                <ZoomIn className="h-4 w-4" />
              </span>
            </button>
          </Reveal>
        ))}
      </div>

      {current && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={current.title || current.alt}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-cocoa/90 p-4 backdrop-blur-md animate-in fade-in duration-300"
          onClick={close}
        >
          <button
            onClick={close}
            className="absolute right-4 top-4 z-10 grid h-11 w-11 place-items-center rounded-full bg-cream text-cocoa shadow-card transition-transform hover:scale-105"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              step(-1);
            }}
            className="absolute left-3 z-10 grid h-11 w-11 place-items-center rounded-full bg-cream/90 text-cocoa shadow-card transition-transform hover:scale-110 md:left-8"
            aria-label="Previous photo"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <figure
            className="relative flex max-h-[90dvh] max-w-4xl flex-col items-center rounded-3xl bg-card p-4 shadow-lift md:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative max-h-[68dvh] overflow-hidden rounded-2xl bg-muted">
              <img
                src={current.src}
                alt={current.alt}
                className="max-h-[68dvh] w-auto rounded-2xl object-contain"
              />
            </div>
            <figcaption className="mt-4 flex w-full flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
              <div>
                {current.category && (
                  <span className="inline-block rounded-full bg-rose/15 px-3 py-1 text-xs font-semibold text-rose">
                    {current.category}
                  </span>
                )}
                <h3 className="mt-1 font-display text-lg font-medium text-primary md:text-xl">
                  {current.title || current.alt}
                </h3>
                <p className="text-xs text-muted-foreground">{current.alt}</p>
              </div>
              <a
                href={whatsappLink(
                  `Hello ${business.name}! I loved this cake from your gallery: "${current.title || current.alt}". Could you let me know the price and ordering details?`,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center gap-2 rounded-full bg-whatsapp px-5 py-2.5 text-xs font-semibold text-whatsapp-foreground shadow-soft transition-all duration-300 hover:scale-105 hover:shadow-card md:text-sm"
              >
                <MessageCircle className="h-4 w-4" /> Order This on WhatsApp
              </a>
            </figcaption>
          </figure>

          <button
            onClick={(e) => {
              e.stopPropagation();
              step(1);
            }}
            className="absolute right-3 z-10 grid h-11 w-11 place-items-center rounded-full bg-cream/90 text-cocoa shadow-card transition-transform hover:scale-110 md:right-8"
            aria-label="Next photo"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </>
  );
}
