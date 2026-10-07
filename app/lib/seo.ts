import type { MetaDescriptor } from "react-router";
import { SITE, absoluteUrl } from "./site";

type SeoInput = {
  title: string;
  description: string;
  path: string;
  image?: string;
  imageAlt?: string;
  type?: "website" | "article" | "product";
  noindex?: boolean;
  /** A playable video for the share preview (WhatsApp, X, Facebook): og:video tags. */
  video?: { url: string; type?: string };
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
};

/**
 * Builds the full meta set for a route: title, description, canonical,
 * Open Graph, Twitter card and optional JSON-LD structured data.
 */
export function seo({
  title,
  description,
  path,
  image = SITE.ogImage,
  imageAlt = "Urbn: The digital infrastructure for housing",
  type = "website",
  noindex = false,
  video,
  jsonLd,
}: SeoInput): MetaDescriptor[] {
  const fullTitle = title.includes("Urbn") ? title : `${title} | Urbn`;
  const url = absoluteUrl(path);
  const img = absoluteUrl(image);
  const tags: MetaDescriptor[] = [
    { title: fullTitle },
    { name: "description", content: description },
    { tagName: "link", rel: "canonical", href: url },
    { property: "og:site_name", content: SITE.name },
    { property: "og:locale", content: SITE.locale },
    { property: "og:type", content: video ? "video.other" : type === "product" ? "website" : type },
    ...(video
      ? [
          { property: "og:video", content: absoluteUrl(video.url) },
          { property: "og:video:secure_url", content: absoluteUrl(video.url) },
          { property: "og:video:type", content: video.type ?? "video/mp4" },
        ]
      : []),
    { property: "og:title", content: fullTitle },
    { property: "og:description", content: description },
    { property: "og:url", content: url },
    { property: "og:image", content: img },
    { property: "og:image:secure_url", content: img },
    ...(image === SITE.ogImage
      ? [
          { property: "og:image:type", content: "image/png" },
          { property: "og:image:width", content: "1200" },
          { property: "og:image:height", content: "630" },
        ]
      : []),
    { property: "og:image:alt", content: imageAlt },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:site", content: SITE.twitter },
    { name: "twitter:title", content: fullTitle },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: img },
  ];
  if (noindex) tags.push({ name: "robots", content: "noindex, follow" });
  const blocks = Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : [];
  for (const block of blocks) tags.push({ "script:ld+json": block });
  return tags;
}

export const breadcrumbs = (items: { name: string; path: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: item.name,
    item: absoluteUrl(item.path),
  })),
});

export const faqJsonLd = (faqs: { q: string; a: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
});

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE.url}/#organization`,
  name: SITE.name,
  legalName: SITE.legalName,
  url: SITE.url,
  logo: absoluteUrl("/icons/icon-512.png"),
  description: SITE.description,
  email: SITE.email,
  areaServed: { "@type": "Country", name: "Nigeria" },
  sameAs: [SITE.socials.x, SITE.socials.instagram, SITE.socials.facebook, SITE.socials.linkedin],
};

export const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE.url}/#website`,
  name: SITE.name,
  url: SITE.url,
  publisher: { "@id": `${SITE.url}/#organization` },
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: `${SITE.url}/listings?q={search_term_string}` },
    "query-input": "required name=search_term_string",
  },
};
