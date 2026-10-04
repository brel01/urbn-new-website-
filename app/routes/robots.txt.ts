import { absoluteUrl } from "~/lib/site";

export function loader() {
  const body = `User-agent: *
Allow: /
Disallow: /api/

Sitemap: ${absoluteUrl("/sitemap.xml")}
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=86400" } });
}
