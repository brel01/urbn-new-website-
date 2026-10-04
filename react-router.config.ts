import type { Config } from "@react-router/dev/config";
import { SEED_LISTINGS } from "./app/lib/marketplace/seed";
import { listingPath } from "./app/lib/marketplace/types";
import { STORIES } from "./app/lib/stories";
import { PLACES } from "./app/lib/places";

export default {
  // SSR stays on for live routes (DPI lookups, filtered searches, APIs);
  // every marketing page, listing and story is pre-rendered to static HTML
  // at build time for instant loads and perfect crawlability.
  ssr: true,
  async prerender({ getStaticPaths }) {
    return [
      ...getStaticPaths().filter((p) => !p.startsWith("/api/")),
      // With a live API, listing pages render on demand (always fresh);
      // seed listings are pre-rendered for previews and offline builds.
      ...(process.env.URBN_API_URL ? [] : SEED_LISTINGS.map(listingPath)),
      ...STORIES.map((s) => `/blog/${s.slug}`),
      ...PLACES.map((p) => `/listings/in/${p.slug}`),
    ];
  },
} satisfies Config;
