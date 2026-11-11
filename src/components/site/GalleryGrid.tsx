import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import type { GalleryImage } from "@/config/content";
import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";

export function GalleryGrid({ images }: { images: GalleryImage[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const close = useCallback(() => setIndex(null), []);
  const step = useCallback(
    (d: number) => setIndex((i) => (i === null ? i : (i + d + images.length) % images.length)),
    [images.length],
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

  return (
    <>
      <div className="grid grid-flow-dense auto-rows-[160px] grid-cols-2 gap-3 sm:auto-rows-[200px] md:grid-cols-4 md:gap-4 lg:auto-rows-[230px]">
        {images.map((img, i) => (
          <Reveal
            key={img.src + i}
            delay={(i % 4) * 70}
            className={cn(img.wide && "col-span-2", img.tall && "row-span-2")}
          >
            <button
              type="button"
              onClick={() => setIndex(i)}
              className="group relative block h-full w-full overflow-hidden rounded-3xl bg-muted shadow-soft"
              aria-label={`View larger: ${img.alt}`}
            >
              <img
                src={img.src}
                alt={img.alt}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <span className="absolute inset-0 grid place-items-center bg-cocoa/0 transition-colors duration-300 group-hover:bg-cocoa/35">
                <span className="grid h-12 w-12 scale-75 place-items-center rounded-full bg-cream text-cocoa opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100">
                  <ZoomIn className="h-5 w-5" />
                </span>
              </span>
            </button>
          </Reveal>
        ))}
      </div>

      {index !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={images[index].alt}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-cocoa/90 p-4 backdrop-blur-sm animate-in fade-in"
          onClick={close}
        >
          <button onClick={close} className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-cream text-cocoa" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              step(-1);
            }}
            className="absolute left-3 grid h-11 w-11 place-items-center rounded-full bg-cream/90 text-cocoa md:left-8"
            aria-label="Previous photo"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <figure className="max-h-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <img src={images[index].src} alt={images[index].alt} className="max-h-[80dvh] w-auto rounded-3xl object-contain shadow-lift" />
            <figcaption className="mt-4 text-center text-sm text-cocoa-foreground/85">{images[index].alt}</figcaption>
          </figure>
          <button
            onClick={(e) => {
              e.stopPropagation();
              step(1);
            }}
            className="absolute right-3 grid h-11 w-11 place-items-center rounded-full bg-cream/90 text-cocoa md:right-8"
            aria-label="Next photo"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </>
  );
}
