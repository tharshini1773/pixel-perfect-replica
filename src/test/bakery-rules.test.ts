import { describe, expect, it } from "vitest";
import { products, filterProducts, categories } from "@/config/products";
import { buildOrderMessage, whatsappLink } from "@/lib/whatsapp";

describe("Cake menu rules", () => {
  it("offers all 10 requested categories", () => {
    expect(categories.map((c) => c.name)).toEqual([
      "Birthday Cakes",
      "Wedding Cakes",
      "Chocolate Cakes",
      "Black Forest Cakes",
      "Red Velvet Cakes",
      "Strawberry Cakes",
      "Customised Cakes",
      "Photo Cakes",
      "Cupcakes",
      "Anniversary Cakes",
    ]);
  });

  it("ensures every cake has a distinct, non-repeating photograph", () => {
    const images = products.map((p) => p.image);
    const uniqueImages = new Set(images);
    expect(uniqueImages.size).toBe(products.length);
  });

  it("keeps every price realistic and positive", () => {
    for (const p of products) {
      expect(p.price).toBeGreaterThanOrEqual(450);
      expect(p.price).toBeLessThanOrEqual(3000);
      expect(p.name.length).toBeGreaterThan(0);
      expect(p.description.length).toBeGreaterThan(0);
      expect(p.weight.length).toBeGreaterThan(0);
    }
  });

  it("filters the menu correctly to the chosen category", () => {
    const red = filterProducts(products, "red-velvet");
    expect(red.length).toBeGreaterThan(0);
    expect(red.every((p) => p.category === "red-velvet")).toBe(true);
    expect(filterProducts(products, "all")).toHaveLength(products.length);
  });
});

describe("WhatsApp ordering", () => {
  it("pre-fills the cake, quantity and total in the message", () => {
    const cake = products[0]; // first cake
    const msg = buildOrderMessage(cake, { quantity: 2, cakeMessage: "Happy Birthday" });
    expect(msg).toContain(cake.name);
    expect(msg).toContain(cake.weight);
    expect(msg).toContain("Quantity: 2");
    expect(msg).toContain('Message on cake: "Happy Birthday"');
  });

  it("builds a wa.me link with only digits and an encoded message", () => {
    expect(whatsappLink("Hi & hello", "+91 98765-43210")).toBe("https://wa.me/919876543210?text=Hi%20%26%20hello");
  });
});
