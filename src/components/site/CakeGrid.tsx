import { useState } from "react";
import type { Product } from "@/config/products";
import { CakeCard } from "./CakeCard";
import { OrderDialog } from "./OrderDialog";
import { Reveal } from "./Reveal";

/** A grid of cake cards that each open the WhatsApp order dialog. */
export function CakeGrid({ items }: { items: Product[] }) {
  const [selected, setSelected] = useState<Product | null>(null);
  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-8">
        {items.map((p, i) => (
          <Reveal key={p.id} delay={(i % 3) * 90}>
            <CakeCard product={p} onOrder={setSelected} />
          </Reveal>
        ))}
      </div>
      <OrderDialog product={selected} onOpenChange={(o) => !o && setSelected(null)} />
    </>
  );
}
