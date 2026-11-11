import { categories, type CategoryId } from "@/config/products";
import { cn } from "@/lib/utils";

type Props = {
  active: CategoryId | "all";
  onChange: (id: CategoryId | "all") => void;
  counts: Record<string, number>;
};

export function CategoryFilter({ active, onChange, counts }: Props) {
  const options = [{ id: "all" as const, name: "All Cakes" }, ...categories];
  return (
    <div role="tablist" aria-label="Filter cakes by category" className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-2 md:mx-0 md:flex-wrap md:justify-center md:px-0">
      {options.map((c) => {
        const isActive = active === c.id;
        return (
          <button
            key={c.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(c.id)}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition-all duration-300",
              isActive
                ? "border-primary bg-primary text-primary-foreground shadow-card"
                : "border-border bg-card text-foreground/75 hover:border-rose hover:text-primary",
            )}
          >
            {c.name}
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[0.7rem]",
                isActive ? "bg-primary-foreground/20" : "bg-secondary text-rose",
              )}
            >
              {counts[c.id] ?? 0}
            </span>
          </button>
        );
      })}
    </div>
  );
}
