/**
 * Gallery & customer reviews with realistic, high-quality cake photography.
 * Every single cake has a distinct realistic photo.
 */

export type Review = { name: string; occasion: string; rating: number; text: string };

export const reviews: Review[] = [
  {
    name: "Priya S.",
    occasion: "Daughter's 5th Birthday",
    rating: 5,
    text: "The confetti birthday cake was even prettier in real life! Every child and parent loved it. Super moist, fresh cream, and not overly sweet. Delivered right to Punnaikayal on time.",
  },
  {
    name: "Arjun & Meera",
    occasion: "Wedding Reception",
    rating: 5,
    text: "Our two-tier pearl wedding cake was the centrepiece of our reception. The floral detailing and delicate piping were breathtaking, and the red velvet inside tasted divine.",
  },
  {
    name: "Karthik R.",
    occasion: "Office Anniversary Party",
    rating: 5,
    text: "Ordered the Belgian chocolate truffle over WhatsApp in just 2 minutes. Rich, glossy ganache and so decadent. The team finished it in minutes. Highly recommended!",
  },
  {
    name: "Ananya V.",
    occasion: "1st Wedding Anniversary",
    rating: 5,
    text: "The heart-shaped vintage Lambeth cake made our anniversary dinner unforgettable. Exquisite vintage ruffles, fresh cream cheese frosting, and lovely packaging.",
  },
  {
    name: "Rahul M.",
    occasion: "Mom's 60th Birthday",
    rating: 5,
    text: "Ordered a personalized photo cake. The edible sugar print was remarkably clear and vibrant, and the vanilla sponge was so soft. My mom was moved to tears.",
  },
  {
    name: "Sneha K.",
    occasion: "Baby Shower Celebration",
    rating: 5,
    text: "The gourmet cupcake box was adorable! Beautiful swirl frosting in strawberry and Belgian chocolate. Very polite staff and quick WhatsApp replies.",
  },
];

export type GalleryImage = {
  src: string;
  alt: string;
  title: string;
  category: string;
  wide?: boolean;
  tall?: boolean;
};

export const gallery: GalleryImage[] = [
  // 1. Birthday Cakes
  {
    src: "https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=1200&q=80",
    alt: "Handcrafted confetti celebration birthday cake with macarons and fresh floral blooms",
    title: "Confetti Celebration Cake",
    category: "Birthday Cakes",
    wide: true,
    tall: true,
  },
  {
    src: "https://images.unsplash.com/photo-1562440499-64c9a111f713?auto=format&fit=crop&w=800&q=80",
    alt: "Golden honey drip birthday cake topped with seasonal berries and candles",
    title: "Golden Berry Birthday Cake",
    category: "Birthday Cakes",
  },

  // 2. Wedding Cakes
  {
    src: "https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&w=800&q=80",
    alt: "Two-tier luxury white wedding cake adorned with delicate fresh garden roses",
    title: "Royal Pearl Wedding Cake",
    category: "Wedding Cakes",
    tall: true,
  },
  {
    src: "https://images.unsplash.com/photo-1522767131594-6b7e00847f0a?auto=format&fit=crop&w=1200&q=80",
    alt: "Majestic botanical tiered wedding cake with gold foil accents",
    title: "Botanical Grace Tier",
    category: "Wedding Cakes",
    wide: true,
  },

  // 3. Chocolate Cakes
  {
    src: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80",
    alt: "Belgian chocolate truffle drip cake topped with raspberries and dark ganache",
    title: "Belgian Truffle Indulgence",
    category: "Chocolate Cakes",
  },
  {
    src: "https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=800&q=80",
    alt: "Dark chocolate hazelnut ganache artisan cake with crisp cocoa shards",
    title: "Dark Chocolate Hazelnut Cake",
    category: "Chocolate Cakes",
    tall: true,
  },

  // 4. Black Forest Cakes
  {
    src: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80",
    alt: "Traditional German Black Forest gateau with cherries and chocolate curls",
    title: "Classic Black Forest Gateau",
    category: "Black Forest Cakes",
  },
  {
    src: "https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?auto=format&fit=crop&w=800&q=80",
    alt: "Cherry blossom chocolate gateau with Chantilly cream rosettes",
    title: "Cherry Blossom Black Forest",
    category: "Black Forest Cakes",
  },

  // 5. Red Velvet Cakes
  {
    src: "https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?auto=format&fit=crop&w=800&q=80",
    alt: "Crimson red velvet cake with whipped cream cheese rosettes and velvet crumbs",
    title: "Signature Red Velvet Dream",
    category: "Red Velvet Cakes",
  },
  {
    src: "https://images.unsplash.com/photo-1586788680434-30d324b2d46f?auto=format&fit=crop&w=800&q=80",
    alt: "Scarlet velvet layer cake with powdered crumb garnish",
    title: "Scarlet Velvet Rosette",
    category: "Red Velvet Cakes",
  },

  // 6. Strawberry Cakes
  {
    src: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=1000&q=80",
    alt: "Fresh Japanese strawberry shortcake with sweet sliced garden strawberries and Chantilly cream",
    title: "Fresh Strawberry Shortcake",
    category: "Strawberry Cakes",
    wide: true,
  },
  {
    src: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=800&q=80",
    alt: "Pink strawberry bloom celebration cake decorated with ripe summer berries",
    title: "Strawberry Blossom Drip",
    category: "Strawberry Cakes",
  },

  // 7. Customised Cakes
  {
    src: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=800&q=80",
    alt: "Bespoke hand-sculpted designer cake with custom fondant motifs and delicate florals",
    title: "Artisanal Designer Cake",
    category: "Customised Cakes",
  },
  {
    src: "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&w=800&q=80",
    alt: "Modern textured artistic cake in pastel watercolor with edible gold brushstrokes",
    title: "Abstract Watercolor Art Cake",
    category: "Customised Cakes",
    tall: true,
  },

  // 8. Photo Cakes
  {
    src: "https://images.unsplash.com/photo-1579372786545-d24232daf58c?auto=format&fit=crop&w=800&q=80",
    alt: "Personalized edible sugar sheet photo cake with intricate buttercream border",
    title: "Keepsake Photo Memory Cake",
    category: "Photo Cakes",
  },
  {
    src: "https://images.unsplash.com/photo-1621303837174-89787a7d4729?auto=format&fit=crop&w=1200&q=80",
    alt: "Golden framed photo portrait celebration cake with rosette border",
    title: "Golden Framed Photo Cake",
    category: "Photo Cakes",
    wide: true,
  },

  // 9. Cupcakes
  {
    src: "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?auto=format&fit=crop&w=800&q=80",
    alt: "Box of assorted gourmet cupcakes piped with chocolate, vanilla and strawberry buttercream",
    title: "Deluxe Swirl Cupcake Box",
    category: "Cupcakes",
  },
  {
    src: "https://images.unsplash.com/photo-1599785209707-a456fc1337bb?auto=format&fit=crop&w=800&q=80",
    alt: "Pink vanilla buttercream party cupcakes with delicate swirl piping and sprinkles",
    title: "Celebration Party Cupcakes",
    category: "Cupcakes",
  },

  // 10. Anniversary Cakes
  {
    src: "https://images.unsplash.com/photo-1518047601542-4505c4434222?auto=format&fit=crop&w=1200&q=80",
    alt: "Vintage heart-shaped Lambeth piped anniversary cake with delicate ruffles",
    title: "Vintage Lambeth Heart Cake",
    category: "Anniversary Cakes",
    wide: true,
  },
  {
    src: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=800&q=80",
    alt: "Romantic blush anniversary cake adorned with 24k gold leaf and fresh baby's breath",
    title: "Blushing Romance Velvet Cake",
    category: "Anniversary Cakes",
    tall: true,
  },
];
