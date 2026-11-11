import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { categories } from "@/config/products";
import { Reveal } from "./Reveal";

export function CategoryGrid() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
      {categories.map((c, i) => (
        <Reveal key={c.id} delay={(i % 4) * 80}>
          <Link
            to="/cakes"
            search={{ category: c.id }}
            className="group relative block aspect-[4/5] overflow-hidden rounded-3xl shadow-soft"
          >
            <img
              src={c.image}
              alt={`${c.name} cakes`}
              loading="lazy"
              width={1024}
              height={1024}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-cocoa/85 via-cocoa/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-4 md:p-5">
              <div>
                <h3 className="text-lg font-medium text-cocoa-foreground md:text-2xl">{c.name}</h3>
                <p className="mt-1 hidden text-xs text-cocoa-foreground/80 sm:block md:text-sm">{c.blurb}</p>
              </div>
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-cream text-cocoa transition-transform duration-300 group-hover:rotate-45">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </div>
          </Link>
        </Reveal>
      ))}
    </div>
  );
}
