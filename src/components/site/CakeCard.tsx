import { ShoppingBag, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatINR, getCategoryName, type Product } from "@/config/products";

export function CakeCard({ product, onOrder }: { product: Product; onOrder: (p: Product) => void }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border/70 bg-card shadow-soft transition-all duration-500 hover:-translate-y-1.5 hover:shadow-lift">
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          width={1024}
          height={1024}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {product.tag && (
          <span className="absolute left-4 top-4 rounded-full bg-card/95 px-3 py-1 text-xs font-bold text-rose shadow-soft backdrop-blur">
            {product.tag}
          </span>
        )}
        <span className="absolute bottom-4 right-4 rounded-full bg-cocoa px-4 py-1.5 font-display text-lg font-semibold text-cocoa-foreground shadow-card">
          {formatINR(product.price)}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-center justify-between gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <span className="text-rose">{getCategoryName(product.category)}</span>
          <span className="inline-flex items-center gap-1">
            <Scale className="h-3.5 w-3.5" /> {product.weight}
          </span>
        </div>
        <h3 className="mt-2 text-xl font-medium text-primary">{product.name}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{product.description}</p>
        <Button onClick={() => onOrder(product)} className="mt-5 w-full" aria-label={`Order ${product.name}`}>
          <ShoppingBag /> Order Now
        </Button>
      </div>
    </article>
  );
}
