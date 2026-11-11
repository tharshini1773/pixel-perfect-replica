import { MessageCircle } from "lucide-react";
import { whatsappLink, generalOrderMessage } from "@/lib/whatsapp";

export function FloatingWhatsApp() {
  return (
    <a
      href={whatsappLink(generalOrderMessage())}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Order on WhatsApp"
      className="group fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-whatsapp p-4 text-whatsapp-foreground shadow-lift animate-pulse-ring transition-transform hover:scale-105 md:bottom-7 md:right-7"
    >
      <MessageCircle className="h-6 w-6" />
      <span className="hidden max-w-0 overflow-hidden whitespace-nowrap text-sm font-semibold transition-all duration-500 group-hover:max-w-40 group-hover:pr-1 md:inline">
        Order on WhatsApp
      </span>
    </a>
  );
}
