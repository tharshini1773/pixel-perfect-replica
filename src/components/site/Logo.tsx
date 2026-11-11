import { Link } from "@tanstack/react-router";
import { CakeSlice } from "lucide-react";
import { business } from "@/config/business";
import { cn } from "@/lib/utils";

export function Logo({ light = false, className }: { light?: boolean; className?: string }) {
  return (
    <Link to="/" className={cn("group flex items-center gap-2.5", className)} aria-label={`${business.name} home`}>
      <span className="grid h-11 w-11 place-items-center rounded-full bg-gradient-rose text-rose-foreground shadow-soft transition-transform duration-500 group-hover:rotate-12">
        <CakeSlice className="h-5 w-5" />
      </span>
      <span className="flex flex-col leading-none">
        <span className={cn("font-display text-xl font-semibold italic", light ? "text-cocoa-foreground" : "text-primary")}>
          {business.shortName}
        </span>
        <span className={cn("mt-1 text-[0.62rem] font-bold uppercase tracking-[0.35em]", light ? "text-blush" : "text-rose")}>
          Bakery
        </span>
      </span>
    </Link>
  );
}
