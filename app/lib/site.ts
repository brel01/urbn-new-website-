// Central site configuration. Anything marked TODO needs a real value
// from the URBN team before launch.

export const SITE = {
  name: "Urbn",
  legalName: "Urbn Technologies Ltd", // TODO: confirm registered company name
  url: import.meta.env.VITE_SITE_URL ?? "https://urbn.ng",
  tagline: "The digital infrastructure for housing",
  description:
    "Urbn connects property records, listings and everyday property activities in one app. Find a property, check its identity, discover what's nearby and manage what you own.",
  email: "hello@urbn.ng", // TODO: confirm inbox
  locale: "en_NG",
  twitter: "@urbn_hq",
  themeColor: "#253DE2",
  // Bump ?v= whenever the share card changes so WhatsApp/Facebook refetch it.
  ogImage: "/og/urbn-share.png?v=3",
  apps: {
    // Store links go live via VITE_APP_STORE_URL / VITE_PLAY_STORE_URL; until then, the download page.
    ios: import.meta.env.VITE_APP_STORE_URL || "/download",
    android: import.meta.env.VITE_PLAY_STORE_URL || "/download",
  },
  socials: {
    whatsapp: "https://wa.me/", // TODO
    x: "https://x.com/urbn_hq",
    instagram: "https://instagram.com/urbn_hq", // TODO: confirm handle
    facebook: "https://facebook.com/urbn_hq", // TODO: confirm handle
    linkedin: "https://linkedin.com/company/urbn-hq", // TODO: confirm handle
  },
} as const;

export const NAV = [
  { label: "About Urbn", to: "/about" },
  { label: "Property Identity", to: "/dpi" },
  { label: "Verify a Property", to: "/verify" },
  { label: "Listings", to: "/listings" },
  { label: "Nearby", to: "/nearby" },
  { label: "Features", to: "/features" },
] as const;

/** Secondary links grouped under "More" in the desktop header (still in the footer). */
export const NAV_MORE = [
  { label: "Reels", to: "/reels" },
  { label: "Blog", to: "/blog" },
  { label: "FAQs", to: "/faq" },
  { label: "Contact", to: "/contact" },
] as const;

export const FOOTER = [
  {
    title: "Company",
    links: [
      { label: "About Urbn", to: "/about" },
      { label: "Careers", to: "/careers" },
      { label: "FAQs", to: "/faq" },
      { label: "Blog & Press", to: "/blog" },
      { label: "Contact", to: "/contact" },
      { label: "Terms of Service", to: "/terms" },
      { label: "Privacy Policy", to: "/privacy" },
    ],
  },
  {
    title: "Product",
    links: [
      { label: "Property Identity", to: "/dpi" },
      { label: "Verify a Property", to: "/verify" },
      { label: "Browse Listings", to: "/listings" },
      { label: "Property Reels", to: "/reels" },
      { label: "Nearby", to: "/nearby" },
      { label: "Features", to: "/features" },
      { label: "For Renters", to: "/for-renters" },
      { label: "For Owners", to: "/for-owners" },
      { label: "For Agents & Managers", to: "/for-agents" },
    ],
  },
  {
    title: "Explore Areas",
    // Only areas with active coverage. Future cities are reached through launch updates.
    links: [
      { label: "Ibadan", to: "/listings/in/ibadan" },
      { label: "Bodija", to: "/listings/in/bodija" },
      { label: "Akobo", to: "/listings/in/akobo" },
      { label: "Places Nearby in Ibadan", to: "/nearby/in/ibadan" },
      { label: "New Cities: Get Launch Updates", to: "/download#launch-updates" },
    ],
  },
] as const;

export const absoluteUrl = (path = "/") => new URL(path, SITE.url).toString();
