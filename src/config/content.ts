/**
 * Sample site content — replace these sample reviews with real customer reviews.
 */
import hero from "@/assets/hero-cake.jpg";
import display from "@/assets/gallery-display.jpg";
import baker from "@/assets/about-baker.jpg";
import { products } from "./products";

export type Review = { name: string; occasion: string; rating: number; text: string };

export const reviews: Review[] = [
  {
    name: "Priya S.",
    occasion: "Daughter's birthday",
    rating: 5,
    text: "The unicorn cake was even prettier than the picture, and every child asked for seconds. Soft, fresh and not too sweet.",
  },
  {
    name: "Arjun & Meera",
    occasion: "Wedding",
    rating: 5,
    text: "Our wedding cake was the centrepiece of the evening. They understood our theme perfectly and delivered right on time.",
  },
  {
    name: "Karthik R.",
    occasion: "Office party",
    rating: 5,
    text: "Ordered the chocolate truffle over WhatsApp in minutes. Rich, moist and the ganache was perfect. Our team loved it.",
  },
  {
    name: "Ananya V.",
    occasion: "Anniversary",
    rating: 5,
    text: "The heart ruffle cake made our anniversary so special. Beautiful piping and the red velvet inside was divine.",
  },
  {
    name: "Rahul M.",
    occasion: "Mom's 60th",
    rating: 4,
    text: "Lovely photo cake — the print was sharp and the cake itself tasted homemade in the best way. Will order again.",
  },
  {
    name: "Sneha K.",
    occasion: "Baby shower",
    rating: 5,
    text: "The cupcake box was adorable and disappeared in minutes. Thoughtful packaging and very friendly service.",
  },
];

export type GalleryImage = { src: string; alt: string; wide?: boolean; tall?: boolean };

export const gallery: GalleryImage[] = [
  { src: hero, alt: "Three-tier blush pink cake with roses and gold leaf", wide: true, tall: true },
  { src: products[2].image, alt: "Chocolate truffle cake with ganache drip" },
  { src: products[5].image, alt: "Pastel unicorn celebration cake" },
  { src: display, alt: "Dessert table with cakes, macarons and cupcakes", wide: true },
  { src: products[1].image, alt: "Two-tier white wedding cake with sugar roses", tall: true },
  { src: products[4].image, alt: "Red velvet cake slice with cream cheese frosting" },
  { src: baker, alt: "Baker piping pink buttercream rosettes", tall: true },
  { src: products[10].image, alt: "Heart-shaped anniversary cake with ruffles" },
  { src: products[6].image, alt: "Box of assorted frosted cupcakes" },
  { src: products[9].image, alt: "Strawberry cream cake with white chocolate drizzle" },
  { src: products[3].image, alt: "Black forest cake with cherries" },
  { src: products[11].image, alt: "Butterscotch caramel drip cake" },
];
