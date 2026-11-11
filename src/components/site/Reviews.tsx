import { Quote, Star } from "lucide-react";
import type { Review } from "@/config/content";
import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";

export function Stars({ rating, className }: { rating: number; className?: string }) {
  return (
    <div className={cn("flex gap-0.5", className)} role="img" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={cn("h-4 w-4", i < rating ? "fill-gold text-gold" : "text-border")} />
      ))}
    </div>
  );
}

export function ReviewCard({ review }: { review: Review }) {
  const initials = review.name
    .split(/\s|&/)
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join("");
  return (
    <figure className="relative flex h-full flex-col rounded-3xl border border-border bg-card p-7 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card">
      <Quote className="absolute right-6 top-6 h-10 w-10 text-blush" aria-hidden />
      <Stars rating={review.rating} />
      <blockquote className="mt-5 flex-1 font-display text-lg leading-relaxed text-primary">“{review.text}”</blockquote>
      <figcaption className="mt-6 flex items-center gap-3 border-t border-border pt-5">
        <span className="grid h-11 w-11 place-items-center rounded-full bg-secondary font-display font-semibold text-rose">
          {initials}
        </span>
        <span>
          <span className="block font-semibold text-primary">{review.name}</span>
          <span className="block text-xs text-muted-foreground">{review.occasion}</span>
        </span>
      </figcaption>
    </figure>
  );
}

export function ReviewsGrid({ items }: { items: Review[] }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {items.map((r, i) => (
        <Reveal key={r.name} delay={(i % 3) * 90}>
          <ReviewCard review={r} />
        </Reveal>
      ))}
    </div>
  );
}
