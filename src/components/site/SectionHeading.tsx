import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "center" | "left";
  light?: boolean;
  className?: string;
};

export function SectionHeading({ eyebrow, title, description, align = "center", light, className }: Props) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      <span className={cn("eyebrow", align === "center" && "justify-center")}>
        <span className="h-px w-6 bg-current" /> {eyebrow}
        {align === "center" && <span className="h-px w-6 bg-current" />}
      </span>
      <h2
        className={cn(
          "mt-4 text-balance text-4xl font-medium leading-[1.1] md:text-5xl",
          light ? "text-cocoa-foreground" : "text-primary",
        )}
      >
        {title}
      </h2>
      {description && (
        <p className={cn("mt-5 text-base leading-relaxed md:text-lg", light ? "text-cocoa-foreground/75" : "text-muted-foreground")}>
          {description}
        </p>
      )}
    </div>
  );
}
