/**
 * Business information — Real shop details for Sweet Crumbs Bakery.
 * Everything on the site (header, footer, contact page, WhatsApp/call buttons,
 * map) reads from this one file.
 */
export const business = {
  name: "Sweet Crumbs Bakery",
  shortName: "Sweet Crumbs",
  tagline: "Handcrafted cakes for every celebration",

  // Exact physical shop address
  address: "1/589F, 100 House, Punnaikayal, Thoothukudi, Tamil Nadu, India.",
  shortAddress: "1/589F, 100 House, Punnaikayal, Thoothukudi",
  area: "Punnaikayal, Thoothukudi, Tamil Nadu",

  // Phone number: clickable for mobile dialer
  phoneDisplay: "+91 75503 62608",
  phoneRaw: "7550362608",
  phoneDial: "tel:7550362608",

  // WhatsApp number: digits with country code
  whatsappNumber: "917550362608",
  whatsappDisplay: "+91 75503 62608",

  // Shop owner's email address
  email: "tharshini1773@gmail.com",

  // Opening hours shown on contact page, location section and footer
  hours: [
    { days: "Monday – Saturday", time: "9:00 AM – 9:30 PM" },
    { days: "Sunday", time: "9:00 AM – 10:00 PM" },
  ],

  // Exact Google Maps destination query
  mapQuery: "1/589F, 100 House, Punnaikayal, Thoothukudi, Tamil Nadu, India",

  social: {
    instagram: "https://instagram.com/sweetcrumbsbakery",
    facebook: "https://facebook.com/sweetcrumbsbakery",
    youtube: "https://youtube.com/@sweetcrumbsbakery",
  },
} as const;

export type Business = typeof business;
