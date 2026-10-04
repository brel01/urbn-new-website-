// Central site configuration. Anything marked TODO needs a real value
// from the URBN team before launch.

export const SITE = {
  name: "Urbn",
  legalName: "Urbn Technologies Ltd", // TODO: confirm registered company name
  url: "https://urbn.ng",
  tagline: "Nigeria's Digital Property Identity platform",
  description:
    "Urbn gives every property in Nigeria a permanent, verifiable Digital Property Identity (DPI). Verify any property in seconds, find verified homes, and rent or buy without blind trust.",
  email: "hello@urbn.ng", // TODO: confirm inbox
  locale: "en_NG",
  twitter: "@urbn_hq",
  themeColor: "#253DE2",
  ogImage: "/og/default.png",
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
  { label: "About us", to: "/about" },
  { label: "DPI", to: "/dpi" },
  { label: "Verify a Property", to: "/verify" },
  { label: "Listings", to: "/listings" },
  { label: "Features", to: "/features" },
  { label: "Blog", to: "/blog" },
  { label: "FAQ", to: "/faq" },
] as const;

export const FOOTER = [
  {
    title: "Company",
    links: [
      { label: "About", to: "/about" },
      { label: "Careers", to: "/careers" },
      { label: "FAQs", to: "/faq" },
      { label: "Blog & Press", to: "/blog" },
      { label: "Contact", to: "/contact" },
      { label: "Terms of Use", to: "/terms" },
      { label: "Privacy Policy", to: "/privacy" },
    ],
  },
  {
    title: "Product",
    links: [
      { label: "DPI", to: "/dpi" },
      { label: "Verify a Property", to: "/verify" },
      { label: "Verified Listings", to: "/listings" },
      { label: "Features", to: "/features" },
      { label: "For Renters", to: "/for-renters" },
      { label: "For Property Owners", to: "/for-owners" },
      { label: "For Agents & Property Managers", to: "/for-agents" },
    ],
  },
  {
    title: "Popular",
    links: [
      { label: "Ibadan", to: "/listings/in/ibadan" },
      { label: "Bodija", to: "/listings/in/bodija" },
      { label: "Akobo", to: "/listings/in/akobo" },
      { label: "Lagos", to: "/listings/in/lagos" },
      { label: "Abuja", to: "/listings/in/abuja" },
      { label: "Port Harcourt", to: "/listings/in/port-harcourt" },
      { label: "Lekki", to: "/listings/in/lekki" },
      { label: "Yaba", to: "/listings/in/yaba" },
    ],
  },
] as const;

export const absoluteUrl = (path = "/") => new URL(path, SITE.url).toString();
