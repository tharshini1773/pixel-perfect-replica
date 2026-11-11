/**
 * Business information — EDIT THESE PLACEHOLDERS with your real shop details.
 * Everything on the site (header, footer, contact page, WhatsApp/call buttons,
 * map) reads from this one file.
 */
export const business = {
  name: "Sweet Crumbs Bakery",
  shortName: "Sweet Crumbs",
  tagline: "Handcrafted cakes for every celebration",

  // Full shop address shown on the site.
  address: "[Shop No.], [Street Name], [Area], [City] – [PIN Code]",

  // Phone number as shown to visitors, and the dialable version (with country code, no spaces).
  phoneDisplay: "+91 00000 00000",
  phoneDial: "+910000000000",

  // WhatsApp number: digits only, with country code, no "+" or spaces (e.g. 919876543210).
  whatsappNumber: "910000000000",
  whatsappDisplay: "+91 00000 00000",

  email: "hello@yourbakery.com",

  // Opening hours shown on the contact page and footer.
  hours: [
    { days: "Monday – Friday", time: "[Opening time] – [Closing time]" },
    { days: "Saturday – Sunday", time: "[Opening time] – [Closing time]" },
  ],

  // Text used to place the map pin and the "Get Directions" link.
  // Replace with your shop's name + full address, or its exact Google Maps name.
  mapQuery: "India",

  social: {
    instagram: "https://instagram.com/",
    facebook: "https://facebook.com/",
    youtube: "https://youtube.com/",
  },
} as const;

export type Business = typeof business;
