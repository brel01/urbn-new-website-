import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("dpi", "routes/dpi.tsx"),
  route("verify", "routes/verify.tsx"),
  route("verify/:code/:unit?", "routes/verify-result.tsx"),
  route("p/dpi/:code/:unit?", "routes/verify-result.tsx", { id: "plaque-landing" }),
  route("features", "routes/features.tsx"),
  route("listings", "routes/listings.tsx"),
  route("listings/in/:place", "routes/listings-place.tsx"),
  route("listings/:id/:slug?", "routes/listing.tsx"),
  route("about", "routes/about.tsx"),
  route("faq", "routes/faq.tsx"),
  route("blog", "routes/blog.tsx"),
  route("blog/:slug", "routes/blog-post.tsx"),
  route("for-renters", "routes/audience.tsx", { id: "for-renters" }),
  route("for-owners", "routes/audience.tsx", { id: "for-owners" }),
  route("for-agents", "routes/audience.tsx", { id: "for-agents" }),
  route("download", "routes/download.tsx"),
  route("contact", "routes/contact.tsx"),
  route("careers", "routes/careers.tsx"),
  route("terms", "routes/legal.tsx", { id: "terms" }),
  route("privacy", "routes/legal.tsx", { id: "privacy" }),

  // resource routes
  route("api/listings", "routes/api.listings.ts"),
  route("api/listings/ai-search", "routes/api.ai-search.ts"),
  route("api/dpi/:code/:unit?", "routes/api.dpi.ts"),
  route("api/waitlist", "routes/api.waitlist.ts"),
  route("sitemap.xml", "routes/sitemap.xml.ts"),
  route("robots.txt", "routes/robots.txt.ts"),

  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;
