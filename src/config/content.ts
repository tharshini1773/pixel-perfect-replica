/**
 * Sample site content — replace these sample reviews with real customer reviews.
 */
import hero from "@/assets/hero-cake.jpg";
import display from "@/assets/gallery-display.jpg";
import baker from "@/assets/about-baker.jpg";
import chocolate from "@/assets/cake-chocolate.jpg";
import unicorn from "@/assets/cake-custom.jpg";
import wedding from "@/assets/cake-wedding.jpg";
import redvelvet from "@/assets/cake-redvelvet.jpg";
import anniversary from "@/assets/cake-anniversary.jpg";
import cupcakes from "@/assets/cake-cupcakes.jpg";
import strawberry from "@/assets/cake-strawberry.jpg";
import blackforest from "@/assets/cake-blackforest.jpg";
import butterscotch from "@/assets/cake-butterscotch.jpg";

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
  { src: chocolate, alt: "Chocolate truffle cake with ganache drip" },
  { src: unicorn, alt: "Pastel unicorn celebration cake" },
  { src: display, alt: "Dessert table with cakes, macarons and cupcakes", wide: true },
  { src: wedding, alt: "Two-tier white wedding cake with sugar roses", tall: true },
  { src: redvelvet, alt: "Red velvet cake slice with cream cheese frosting" },
  { src: baker, alt: "Baker piping pink buttercream rosettes", tall: true },
  { src: anniversary, alt: "Heart-shaped anniversary cake with ruffles" },
  { src: cupcakes, alt: "Box of assorted frosted cupcakes" },
  { src: strawberry, alt: "Strawberry cream cake with white chocolate drizzle" },
  { src: blackforest, alt: "Black forest cake with cherries" },
  { src: butterscotch, alt: "Butterscotch caramel drip cake" },
];
