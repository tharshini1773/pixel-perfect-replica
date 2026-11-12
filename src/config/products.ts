/**
 * Cake menu — Handcrafted cake categories and items.
 * Uses high-quality, realistic cake photography for each item.
 */

export const categories = [
  {
    id: "birthday",
    name: "Birthday Cakes",
    blurb: "Bright, joyful celebrations with candles & sprinkles",
    image: "https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "wedding",
    name: "Wedding Cakes",
    blurb: "Grand multi-tier masterpieces for your special day",
    image: "https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "chocolate",
    name: "Chocolate Cakes",
    blurb: "Rich Belgian ganache, fudge layers & silky glaze",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "black-forest",
    name: "Black Forest Cakes",
    blurb: "Authentic dark cherries, kirsch cream & chocolate curls",
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "red-velvet",
    name: "Red Velvet Cakes",
    blurb: "Crimson cocoa sponge with velvety cream cheese frosting",
    image: "https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "strawberry",
    name: "Strawberry Cakes",
    blurb: "Fresh garden strawberries, light sponge & berry cream",
    image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "customised",
    name: "Customised Cakes",
    blurb: "Themed designs, bespoke fondant art & sculpted tiers",
    image: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "photo-cakes",
    name: "Photo Cakes",
    blurb: "High-definition edible sugar sheet prints with rose piping",
    image: "https://images.unsplash.com/photo-1579372786545-d24232daf58c?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "cupcakes",
    name: "Cupcakes",
    blurb: "Artisan piped frosting, sprinkles, chocolates & fruit",
    image: "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "anniversary",
    name: "Anniversary Cakes",
    blurb: "Heart shapes, vintage Lambeth piping & romantic florals",
    image: "https://images.unsplash.com/photo-1518047601542-4505c4434222?auto=format&fit=crop&w=800&q=80",
  },
] as const;

export type CategoryId = (typeof categories)[number]["id"];

export const categoryIds = categories.map((c) => c.id) as CategoryId[];

export type Product = {
  id: string;
  name: string;
  category: CategoryId;
  description: string;
  weight: string;
  price: number;
  image: string;
  tag?: "Bestseller" | "New" | "Chef's Pick";
};

export const products: Product[] = [
  // 1. Birthday Cakes
  {
    id: "confetti-birthday",
    name: "Confetti Celebration Cake",
    category: "birthday",
    description: "Soft vanilla bean sponge layered with strawberry compote and festive sprinkles.",
    weight: "1 kg",
    price: 650,
    image: "https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=800&q=80",
    tag: "Bestseller",
  },
  {
    id: "golden-drip-birthday",
    name: "Golden Macaron Birthday Cake",
    category: "birthday",
    description: "Vanilla layers with silky blush buttercream, French macarons, rosettes and gold drips.",
    weight: "1 kg",
    price: 750,
    image: "https://images.unsplash.com/photo-1558301211-0d8c8ddee6ec?auto=format&fit=crop&w=800&q=80",
    tag: "Chef's Pick",
  },

  // 2. Wedding Cakes
  {
    id: "royal-pearl-wedding",
    name: "Royal Pearl Tiered Cake",
    category: "wedding",
    description: "Two majestic tiers covered in satin buttercream with handcrafted sugar roses and pearls.",
    weight: "3 kg",
    price: 2400,
    image: "https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&w=800&q=80",
    tag: "Chef's Pick",
  },
  {
    id: "botanical-elegance-wedding",
    name: "Botanical Grace Wedding Cake",
    category: "wedding",
    description: "Tiered vanilla bean cake adorned with delicate florals, white pearls and fine gold accents.",
    weight: "2 kg",
    price: 1800,
    image: "https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=800&q=80",
    tag: "New",
  },

  // 3. Chocolate Cakes
  {
    id: "belgian-chocolate-truffle",
    name: "Belgian Chocolate Truffle",
    category: "chocolate",
    description: "55% Belgian dark chocolate sponge drenched in silky ganache drip with fresh raspberries.",
    weight: "1 kg",
    price: 750,
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80",
    tag: "Bestseller",
  },
  {
    id: "triple-chocolate-fudge",
    name: "Triple Chocolate Fudge",
    category: "chocolate",
    description: "Rich dark cocoa layers frosted with dark fudge ganache and crisp chocolate curls.",
    weight: "1 kg",
    price: 800,
    image: "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=800&q=80",
  },

  // 4. Black Forest Cakes
  {
    id: "authentic-black-forest",
    name: "Classic Black Forest Gateau",
    category: "black-forest",
    description: "Cocoa sponge layered with dark cherry compote, fresh Chantilly cream and shaved chocolate.",
    weight: "1 kg",
    price: 650,
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80",
    tag: "Bestseller",
  },
  {
    id: "cherry-blossom-black-forest",
    name: "Gourmet Cherry Black Forest",
    category: "black-forest",
    description: "Moist chocolate sponge topped with whole glazed cherries and generous chocolate curls.",
    weight: "500 g",
    price: 480,
    image: "https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?auto=format&fit=crop&w=800&q=80",
  },

  // 5. Red Velvet Cakes
  {
    id: "signature-red-velvet",
    name: "Signature Red Velvet Dream",
    category: "red-velvet",
    description: "Ultra-tender crimson cocoa sponge paired with whipped Philadelphia cream cheese frosting.",
    weight: "1 kg",
    price: 850,
    image: "https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?auto=format&fit=crop&w=800&q=80",
    tag: "Bestseller",
  },
  {
    id: "red-velvet-rosette",
    name: "Red Velvet Rosette Cake",
    category: "red-velvet",
    description: "Velvety scarlet cake decorated with delicate piped swirls and soft red velvet crumb border.",
    weight: "1 kg",
    price: 900,
    image: "https://images.unsplash.com/photo-1586788680434-30d324b2d46f?auto=format&fit=crop&w=800&q=80",
    tag: "New",
  },

  // 6. Strawberry Cakes
  {
    id: "japanese-strawberry-shortcake",
    name: "Fresh Strawberry Shortcake",
    category: "strawberry",
    description: "Feather-light genoise sponge, fresh whipped cream and generous slices of ripe strawberries.",
    weight: "1 kg",
    price: 750,
    image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=80",
    tag: "New",
  },
  {
    id: "strawberry-rose-drip",
    name: "Strawberry Blossom Drip Cake",
    category: "strawberry",
    description: "Pink strawberry buttercream cake with berry glaze, fresh seasonal berries and mint leaves.",
    weight: "1 kg",
    price: 700,
    image: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=800&q=80",
  },

  // 7. Customised Cakes
  {
    id: "sculpted-fantasy-custom",
    name: "Artisanal Designer Cake",
    category: "customised",
    description: "Handcrafted bespoke theme cake with painted fondant details, custom toppers and macarons.",
    weight: "1.5 kg",
    price: 1250,
    image: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=800&q=80",
    tag: "Chef's Pick",
  },
  {
    id: "pastel-floral-custom",
    name: "Pastel Botanical Custom Cake",
    category: "customised",
    description: "Custom pastel hues with hand-sculpted sugar flowers and delicate edible gold flakes.",
    weight: "1.5 kg",
    price: 1150,
    image: "https://images.unsplash.com/photo-1534766555764-ce878a5e3a2b?auto=format&fit=crop&w=800&q=80",
  },

  // 8. Photo Cakes
  {
    id: "memories-photo-cake",
    name: "Keepsake Photo Memory Cake",
    category: "photo-cakes",
    description: "Your favourite portrait printed on edible sugar icing, framed with ruffled rosette piping.",
    weight: "1 kg",
    price: 900,
    image: "https://images.unsplash.com/photo-1579372786545-d24232daf58c?auto=format&fit=crop&w=800&q=80",
    tag: "Bestseller",
  },
  {
    id: "celebration-photo-cake",
    name: "Golden Framed Photo Cake",
    category: "photo-cakes",
    description: "Crisp high-resolution edible photo cake finished with golden sprinkles and vanilla cream.",
    weight: "1.5 kg",
    price: 1200,
    image: "https://images.unsplash.com/photo-1621303837174-89787a7d4729?auto=format&fit=crop&w=800&q=80",
  },

  // 9. Cupcakes
  {
    id: "deluxe-swirl-cupcakes",
    name: "Deluxe Swirl Cupcake Box",
    category: "cupcakes",
    description: "Six gourmet cupcakes in Belgian chocolate, Madagascan vanilla and strawberry swirls.",
    weight: "6 pieces",
    price: 480,
    image: "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?auto=format&fit=crop&w=800&q=80",
    tag: "Bestseller",
  },
  {
    id: "artisan-party-cupcakes",
    name: "Celebration Party Cupcakes",
    category: "cupcakes",
    description: "Twelve assorted mini cupcakes with piped rosettes, fresh berry toppings and crisp sprinkles.",
    weight: "12 pieces",
    price: 890,
    image: "https://images.unsplash.com/photo-1587668178277-295251f900ce?auto=format&fit=crop&w=800&q=80",
  },

  // 10. Anniversary Cakes
  {
    id: "vintage-lambeth-heart",
    name: "Vintage Lambeth Heart Cake",
    category: "anniversary",
    description: "Romantic heart-shaped cake featuring intricate Victorian ruffle piping and sugar cherries.",
    weight: "1 kg",
    price: 950,
    image: "https://images.unsplash.com/photo-1518047601542-4505c4434222?auto=format&fit=crop&w=800&q=80",
    tag: "Chef's Pick",
  },
  {
    id: "blushing-romance-cake",
    name: "Blushing Romance Velvet Cake",
    category: "anniversary",
    description: "Blush buttercream tiers finished with edible 24k gold leaf and fresh baby's breath blossoms.",
    weight: "1 kg",
    price: 880,
    image: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=800&q=80",
    tag: "New",
  },
];

export function filterProducts(list: Product[], category: CategoryId | "all"): Product[] {
  return category === "all" ? list : list.filter((p) => p.category === category);
}

export function getCategoryName(id: CategoryId): string {
  return categories.find((c) => c.id === id)?.name ?? id;
}

export const formatINR = (amount: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(
    amount,
  );
