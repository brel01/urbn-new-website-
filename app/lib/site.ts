// Central site configuration. Anything marked TODO needs a real value
// from the URBN team before launch.

export const SITE = {
  name: "Urbn",
  legalName: "Urbn Technologies Ltd", // TODO: confirm registered company name
  url: import.meta.env.VITE_SITE_URL ?? "https://urbn.ng",
  tagline: "The digital infrastructure for housing",
  description:
    "Urbn connects property records, listings and housing activities in one app. Find a home, check its identity and manage your property.",
  email: "hello@urbn.ng", // TODO: confirm inbox
  locale: "en_NG",
  twitter: "@urbn_hq",
  themeColor: "#253DE2",
  // Bump ?v= whenever the share card changes so WhatsApp/Facebook refetch it.
  ogImage: "/og/urbn-share.png?v=3",
  apps: {
    // TODO: replace with live store links at launch
    ios: "/download",
    android: "/download",
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
  { label: "Features", to: "/features" },
  { label: "Blog", to: "/blog" },
  { label: "FAQs", to: "/faq" },
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
      { label: "New Cities: Get Launch Updates", to: "/download#launch-updates" },
    ],
  },
] as const;

export const absoluteUrl = (path = "/") => new URL(path, SITE.url).toString();
