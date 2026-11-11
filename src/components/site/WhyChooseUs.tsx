import { Wheat, BadgeCheck, Palette, Truck } from "lucide-react";
import { Reveal } from "./Reveal";

const reasons = [
  { icon: Wheat, title: "Freshly Baked", text: "Every cake is baked to order, never frozen, so it reaches you soft and fresh." },
  { icon: BadgeCheck, title: "Premium Quality", text: "Real butter, fine chocolate, fresh fruit and cream — no shortcuts, ever." },
  { icon: Palette, title: "Custom Designs", text: "From themes to photo prints, we turn your idea into a cake you'll remember." },
  { icon: Truck, title: "Timely Delivery", text: "Carefully packed and delivered on time, so your celebration starts right." },
];

export function WhyChooseUs({ light = false }: { light?: boolean }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {reasons.map((r, i) => (
        <Reveal key={r.title} delay={i * 90}>
          <div
            className={
              light
                ? "group h-full rounded-3xl border border-cocoa-foreground/10 bg-cocoa-foreground/5 p-7 transition-colors duration-300 hover:bg-cocoa-foreground/10"
                : "group h-full rounded-3xl border border-border bg-card p-7 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card"
            }
          >
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-rose text-rose-foreground shadow-soft transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110">
              <r.icon className="h-6 w-6" />
            </span>
            <h3 className={light ? "mt-6 text-xl font-medium text-cocoa-foreground" : "mt-6 text-xl font-medium text-primary"}>
              {r.title}
            </h3>
            <p className={light ? "mt-2 text-sm leading-relaxed text-cocoa-foreground/70" : "mt-2 text-sm leading-relaxed text-muted-foreground"}>
              {r.text}
            </p>
          </div>
        </Reveal>
      ))}
    </div>
  );
}
