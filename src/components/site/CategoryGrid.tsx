import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { categories } from "@/config/products";
import { Reveal } from "./Reveal";

export function CategoryGrid() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6 lg:grid-cols-5">
      {categories.map((c, i) => (
        <Reveal key={c.id} delay={(i % 5) * 60}>
          <Link
            to="/cakes"
            search={{ category: c.id }}
            className="group relative block aspect-[4/5] overflow-hidden rounded-3xl border border-border/60 bg-muted shadow-soft transition-all duration-500 hover:-translate-y-1.5 hover:shadow-lift"
          >
            <img
              src={c.image}
              alt={`${c.name} cakes`}
              loading="lazy"
              width={800}
              height={1000}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-cocoa/90 via-cocoa/30 to-transparent transition-opacity duration-300 group-hover:opacity-90" />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-4 md:p-5">
              <div>
                <h3 className="font-display text-base font-medium text-cocoa-foreground sm:text-lg md:text-xl">
                  {c.name}
                </h3>
                <p className="mt-1 line-clamp-2 hidden text-xs text-cocoa-foreground/75 sm:block">
                  {c.blurb}
                </p>
              </div>
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-cream text-cocoa shadow-sm transition-transform duration-300 group-hover:rotate-45 group-hover:bg-rose group-hover:text-rose-foreground">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </div>
          </Link>
        </Reveal>
      ))}
    </div>
  );
}
