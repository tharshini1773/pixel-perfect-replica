/**
 * Cake menu — EDIT names, prices (in ₹), weights and descriptions here.
 * Images live in src/assets.
 */
import birthday from "@/assets/cake-birthday.jpg";
import wedding from "@/assets/cake-wedding.jpg";
import chocolate from "@/assets/cake-chocolate.jpg";
import blackforest from "@/assets/cake-blackforest.jpg";
import redvelvet from "@/assets/cake-redvelvet.jpg";
import cupcakes from "@/assets/cake-cupcakes.jpg";
import custom from "@/assets/cake-custom.jpg";
import photo from "@/assets/cake-photo.jpg";
import pineapple from "@/assets/cake-pineapple.jpg";
import strawberry from "@/assets/cake-strawberry.jpg";
import anniversary from "@/assets/cake-anniversary.jpg";
import butterscotch from "@/assets/cake-butterscotch.jpg";

export const categories = [
  { id: "birthday", name: "Birthday", blurb: "Bright, joyful & made to be shared", image: birthday },
  { id: "wedding", name: "Wedding", blurb: "Elegant tiers for your big day", image: wedding },
  { id: "chocolate", name: "Chocolate", blurb: "Rich, glossy, deeply indulgent", image: chocolate },
  { id: "black-forest", name: "Black Forest", blurb: "Cherries, cream & dark chocolate", image: blackforest },
  { id: "red-velvet", name: "Red Velvet", blurb: "Velvety layers, cream cheese frosting", image: redvelvet },
  { id: "customized", name: "Customized", blurb: "Your idea, beautifully baked", image: custom },
  { id: "cupcakes", name: "Cupcakes", blurb: "Little treats, big smiles", image: cupcakes },
  { id: "photo-cakes", name: "Photo Cakes", blurb: "Your favourite memory, edible", image: photo },
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
  {
    id: "sprinkle-birthday",
    name: "Sprinkle Party Cake",
    category: "birthday",
    description: "Vanilla sponge, strawberry buttercream and a shower of rainbow sprinkles.",
    weight: "1 kg",
    price: 650,
    image: birthday,
    tag: "Bestseller",
  },
  {
    id: "pearl-rose-wedding",
    name: "Pearl Rose Wedding Cake",
    category: "wedding",
    description: "Two elegant tiers with handmade sugar roses and delicate pearl detailing.",
    weight: "2 kg",
    price: 1200,
    image: wedding,
    tag: "Chef's Pick",
  },
  {
    id: "chocolate-truffle",
    name: "Chocolate Truffle",
    category: "chocolate",
    description: "Moist dark chocolate layers, silky ganache drip and chocolate curls.",
    weight: "1 kg",
    price: 750,
    image: chocolate,
    tag: "Bestseller",
  },
  {
    id: "classic-black-forest",
    name: "Classic Black Forest",
    category: "black-forest",
    description: "Chocolate sponge, fresh whipped cream, dark cherries and chocolate shavings.",
    weight: "1 kg",
    price: 600,
    image: blackforest,
  },
  {
    id: "red-velvet-dream",
    name: "Red Velvet Dream",
    category: "red-velvet",
    description: "Velvety cocoa-kissed layers with tangy cream cheese frosting.",
    weight: "1 kg",
    price: 850,
    image: redvelvet,
    tag: "Bestseller",
  },
  {
    id: "unicorn-fantasy",
    name: "Unicorn Fantasy Cake",
    category: "customized",
    description: "A dreamy pastel unicorn with a gold horn and buttercream flower mane.",
    weight: "1.5 kg",
    price: 1100,
    image: custom,
    tag: "New",
  },
  {
    id: "assorted-cupcakes",
    name: "Assorted Cupcake Box",
    category: "cupcakes",
    description: "Six cupcakes in strawberry, vanilla and chocolate with swirled frosting.",
    weight: "6 pieces",
    price: 480,
    image: cupcakes,
  },
  {
    id: "memories-photo-cake",
    name: "Memories Photo Cake",
    category: "photo-cakes",
    description: "Your favourite photo printed on an edible sheet, framed with rose piping.",
    weight: "1 kg",
    price: 900,
    image: photo,
  },
  {
    id: "pineapple-delight",
    name: "Pineapple Delight",
    category: "birthday",
    description: "Light pineapple sponge, whipped cream, fresh pineapple and cherries.",
    weight: "500 g",
    price: 450,
    image: pineapple,
  },
  {
    id: "strawberry-bliss",
    name: "Strawberry Bliss",
    category: "birthday",
    description: "Pink strawberry cream, fresh berries and a white chocolate drizzle.",
    weight: "1 kg",
    price: 700,
    image: strawberry,
    tag: "New",
  },
  {
    id: "heart-anniversary",
    name: "Heart Anniversary Cake",
    category: "customized",
    description: "Heart-shaped vintage ruffles in blush and cream, topped with rose petals.",
    weight: "1 kg",
    price: 950,
    image: anniversary,
    tag: "Chef's Pick",
  },
  {
    id: "butterscotch-crunch",
    name: "Butterscotch Crunch",
    category: "chocolate",
    description: "Butterscotch sponge, caramel drip, praline crunch and caramel chocolates.",
    weight: "1 kg",
    price: 550,
    image: butterscotch,
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
