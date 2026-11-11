import type { ReactNode } from "react";
import { CircleCheck } from "lucide-react";

export function FormSuccess({ title, children, actions }: { title: string; children: ReactNode; actions: ReactNode }) {
  return (
    <div role="status" className="flex flex-col items-center rounded-3xl border border-border bg-card px-6 py-12 text-center shadow-card animate-fade-up">
      <span className="grid h-16 w-16 place-items-center rounded-full bg-gradient-rose text-rose-foreground shadow-soft">
        <CircleCheck className="h-8 w-8" />
      </span>
      <h3 className="mt-6 text-2xl font-medium text-primary">{title}</h3>
      <div className="mt-3 max-w-md text-muted-foreground">{children}</div>
      <div className="mt-8 flex flex-wrap justify-center gap-3">{actions}</div>
    </div>
  );
}
