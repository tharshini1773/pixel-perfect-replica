import { useState } from "react";
import { Sparkles, X } from "lucide-react";
import { useBakeryStore } from "@/context/BakeryStoreContext";

export function PromoBanner() {
  const { offers } = useBakeryStore();
  const [dismissed, setDismissed] = useState(false);

  const activeOffer = offers.find((o) => o.isActive);

  if (!activeOffer || dismissed) return null;

  return (
    <aside aria-label="Announcement" className="relative z-50 bg-gradient-to-r from-rose via-rose-light to-primary px-4 py-2 text-center text-xs font-medium text-white shadow-sm sm:text-sm">
      <div className="container-page flex items-center justify-center gap-2 pr-6">
        <Sparkles className="h-4 w-4 shrink-0 animate-pulse text-gold" />
        <span>{activeOffer.bannerText}</span>
      </div>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-white/80 transition-colors hover:bg-black/10 hover:text-white"
        aria-label="Dismiss banner"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </aside>
  );
}

