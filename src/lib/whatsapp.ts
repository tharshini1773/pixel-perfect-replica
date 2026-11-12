import { business } from "@/config/business";
import { formatINR, type Product } from "@/config/products";

/** Builds a wa.me link with a pre-filled, URL-encoded message. */
export function whatsappLink(message: string, number: string = business.whatsappNumber): string {
  const digits = number.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export const telLink = (phone: string = business.phoneRaw || "7550362608") => `tel:${phone.replace(/[^\d+]/g, "")}`;

export const mailLink = (email: string = business.email) => `mailto:${email}`;

export const directionsLink = (query: string = business.mapQuery) =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`;

export const mapEmbedSrc = (query: string = business.mapQuery) =>
  `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

export type OrderDetails = {
  quantity: number;
  name?: string | undefined;
  date?: string | undefined;
  cakeMessage?: string | undefined;
  notes?: string | undefined;
};

/** The pre-filled WhatsApp message for ordering a cake from the menu. */
export function buildOrderMessage(product: Product, details: OrderDetails): string {
  const qty = Math.max(1, Math.floor(details.quantity || 1));
  const lines = [
    `Hello ${business.name}! I'd like to order:`,
    ``,
    `• ${product.name} (${product.weight})`,
    `Quantity: ${qty}`,
    `Price: ${formatINR(product.price)} each — Total ${formatINR(product.price * qty)}`,
  ];
  if (details.cakeMessage?.trim()) lines.push(`Message on cake: "${details.cakeMessage.trim()}"`);
  if (details.date?.trim()) lines.push(`Needed on: ${details.date.trim()}`);
  if (details.name?.trim()) lines.push(`Name: ${details.name.trim()}`);
  if (details.notes?.trim()) lines.push(`Notes: ${details.notes.trim()}`);
  lines.push(``, `Please confirm availability. Thank you!`);
  return lines.join("\n");
}

export const generalOrderMessage = () =>
  `Hello ${business.name}! I'd like to order a cake. Could you please share the options and availability?`;
