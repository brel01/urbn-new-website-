import { allListingPaths } from "~/lib/marketplace/source.server";
import { PLACES } from "~/lib/places";
import { STORIES } from "~/lib/stories";
import { absoluteUrl } from "~/lib/site";

const STATIC: [string, string, number][] = [
  ["/", "weekly", 1.0],
  ["/dpi", "monthly", 0.9],
  ["/verify", "monthly", 0.9],
  ["/listings", "daily", 0.9],
  ["/features", "monthly", 0.8],
  ["/for-renters", "monthly", 0.7],
  ["/for-owners", "monthly", 0.7],
  ["/for-agents", "monthly", 0.7],
  ["/about", "monthly", 0.6],
  ["/faq", "monthly", 0.6],
  ["/blog", "weekly", 0.6],
  ["/download", "monthly", 0.6],
  ["/contact", "yearly", 0.4],
  ["/careers", "monthly", 0.4],
  ["/terms", "yearly", 0.2],
  ["/privacy", "yearly", 0.2],
];

type Url = { loc: string; changefreq: string; priority: number; lastmod?: string; image?: string | null };

export async function loader() {
  const listings = await allListingPaths();
  const urls: Url[] = [
    ...STATIC.map(([loc, changefreq, priority]) => ({ loc, changefreq, priority })),
    ...PLACES.map((p) => ({ loc: `/listings/in/${p.slug}`, changefreq: p.live ? "daily" : "monthly", priority: p.live ? 0.8 : 0.4 })),
    ...listings.map((l) => ({ loc: l.path, changefreq: "weekly", priority: 0.7, lastmod: l.lastmod, image: l.image })),
    ...STORIES.map((s) => ({ loc: `/blog/${s.slug}`, changefreq: "monthly", priority: 0.5, lastmod: s.date })),
  ];
  const esc = (s: string) => s.replace(/&/g, "&amp;");
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls
  .map(
    (u) => `  <url>
    <loc>${esc(absoluteUrl(u.loc))}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ""}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority.toFixed(1)}</priority>${u.image ? `\n    <image:image><image:loc>${esc(absoluteUrl(u.image))}</image:loc></image:image>` : ""}
  </url>`,
  )
  .join("\n")}
</urlset>`;
  return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
