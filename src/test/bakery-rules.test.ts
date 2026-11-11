import { describe, expect, it } from "vitest";
import { products, filterProducts, categories } from "@/config/products";
import { buildOrderMessage, whatsappLink } from "@/lib/whatsapp";

describe("Cake menu rules", () => {
  it("lists exactly 12 cakes", () => {
    expect(products).toHaveLength(12);
  });

  it("keeps every price between ₹450 and ₹1,200", () => {
    for (const p of products) {
      expect(p.price).toBeGreaterThanOrEqual(450);
      expect(p.price).toBeLessThanOrEqual(1200);
    }
  });

  it("offers the 8 requested categories", () => {
    expect(categories.map((c) => c.name)).toEqual([
      "Birthday", "Wedding", "Chocolate", "Black Forest", "Red Velvet", "Customized", "Cupcakes", "Photo Cakes",
    ]);
  });

  it("filters the menu to the chosen category", () => {
    const red = filterProducts(products, "red-velvet");
    expect(red.length).toBeGreaterThan(0);
    expect(red.every((p) => p.category === "red-velvet")).toBe(true);
    expect(filterProducts(products, "all")).toHaveLength(12);
  });
});

describe("WhatsApp ordering", () => {
  it("pre-fills the cake, quantity and total in the message", () => {
    const cake = products.find((p) => p.id === "chocolate-truffle")!;
    const msg = buildOrderMessage(cake, { quantity: 2, cakeMessage: "Happy Birthday" });
    expect(msg).toContain("Chocolate Truffle (1 kg)");
    expect(msg).toContain("Quantity: 2");
    expect(msg).toContain("₹1,500");
    expect(msg).toContain('Message on cake: "Happy Birthday"');
  });

  it("builds a wa.me link with only digits and an encoded message", () => {
    expect(whatsappLink("Hi & hello", "+91 98765-43210")).toBe("https://wa.me/919876543210?text=Hi%20%26%20hello");
  });
});
