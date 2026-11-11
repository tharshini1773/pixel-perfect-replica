import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

type Props = { eyebrow: string; title: ReactNode; description?: ReactNode; image?: string; crumb: string };

export function PageHero({ eyebrow, title, description, image, crumb }: Props) {
  return (
    <section className="relative overflow-hidden bg-gradient-hero">
      <div className="absolute inset-0 dot-pattern opacity-60" aria-hidden />
      <div className="container-page relative grid items-center gap-10 py-14 md:grid-cols-[1.2fr_1fr] md:py-20">
        <div className="animate-fade-up">
          <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-primary">{crumb}</span>
          </nav>
          <span className="eyebrow">{eyebrow}</span>
          <h1 className="mt-3 text-balance text-4xl font-medium leading-[1.05] text-primary md:text-6xl">{title}</h1>
          {description && <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">{description}</p>}
        </div>
        {image && (
          <div className="relative hidden md:block">
            <div className="absolute -inset-4 rounded-[2.5rem] bg-blush rotate-3" aria-hidden />
            <img
              src={image}
              alt=""
              width={1024}
              height={1024}
              className="relative aspect-[4/3] w-full rounded-[2rem] object-cover shadow-lift"
            />
          </div>
        )}
      </div>
    </section>
  );
}
