# Urbn website

The public website for **Urbn**, Nigeria's Digital Property Identity (DPI) platform. Visitors can verify any property by its DPI, search verified listings (including AI search, mirroring the mobile app's marketplace), and learn how DPI, plaques and Property Cards work.

- **Framework:** React Router v8 (framework mode) with SSR and build-time pre-rendering. No Next.js.
- **Data:** TanStack Query for the live marketplace (search, filters, AI search, infinite results), on top of React Router loaders that server-render the first page for SEO.
- **Styling:** Tailwind CSS v4 with tokens from the URBN Visual Identity Guide (URBN Blue `#253DE2`, black/white, action colours; Creato Display + Inter).
- **Motion:** `motion` (Framer Motion). Respects `prefers-reduced-motion`.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # client + server build, pre-renders ~40 pages, then runs the prerender check
npm start          # production server (server.js) on $PORT (default 3000)
npm run typecheck
```

## Connecting to the Urbn API

The marketplace and DPI lookups use the **same endpoints and payload shapes as `urbn-mobile`**. See `app/lib/marketplace/types.ts`, which mirrors `src/types/listing.types.ts`.

| Env var | Purpose |
| --- | --- |
| `URBN_API_URL` | e.g. `https://api.urbn.ng`. When set, all data is live. When unset, the site serves the seed data in `app/lib/marketplace/seed.ts`. |
| `SITE_URL` | Public origin for canonical URLs and link-preview images (e.g. `https://urbn.ng`). On Vercel it defaults to the project's production domain; otherwise `https://urbn.ng`. Set it when you move to the real domain. |
| `URBN_API_TOKEN` | Optional service token, sent as `Authorization: Bearer`. Lets the website call `POST /listings/ai-search` on behalf of signed-out visitors. |

Endpoints used (all server-side, in `app/lib/marketplace/source.server.ts`):

- `GET /listings`: search, using the app's `ListingsFilterParams` (`search`, `listingType`, `state`, `lga`, `lat/lng/radius`, `minPrice/maxPrice`, `buildingType`, `bedrooms`, `bathrooms`, `listedBy`, `furnishingStatus`, `featuredOnly`, feature CSVs, `sortBy/sortOrder`, `page/limit`)
- `GET /listings/featured`, `GET /listings/:id`, `GET /listings/:id/similar`, `GET /public/properties/:id`
- `POST /listings/ai-search`: if it returns 401 (signed-out), 5xx or times out, the site falls back to an on-site interpreter (`interpret.ts`) that turns the description into standard filters, so web search always answers. 429 and 422 responses show the app's own messages.
- `GET /public/dpi/:dpiCode[/:unitCode]?source=SEARCH`: DPI verification, with the backend's `errorCode`s (`NOT_VERIFIED`, `NOT_TRACEABLE`, `ARCHIVED`, `PROPERTY_NOT_FOUND`, `INVALID_DPI_FORMAT`, `UNIT_NOT_FOUND`).

The website also exposes thin proxies for the browser: `GET /api/listings`, `POST /api/listings/ai-search` and `GET /api/dpi/:code[/:unit]`.

## How the marketplace mirrors the app

| App (`src/components/marketplace`) | Website |
| --- | --- |
| `MarketplaceHeader` (Listings, AI toggle, list/map) | `routes/listings.tsx` header |
| `FilterBar`: "Search city, area, property...", type chips (All/Rent/Sale/Lease/Short Term), filter button with count, 500ms debounce | `AreaSearch` with neighbourhood and LGA suggestions, plus chips and Filters button |
| `ListingFilterPanel`: Listed By, Location (State, City/LGA, Near me + radius), Type, Price Range, Property Type, Bedrooms/Bathrooms, Furnishing, Features, Nearby Places | `components/marketplace/filter-panel.tsx` (side drawer on desktop, bottom sheet on mobile) |
| `AiSearchModeSelector` + `AiSearchInput` (Quick Search / AI Advisor, examples, "Getting the best results" tips, quota bar, error copy) | `components/marketplace/ai-search.tsx`. AI Advisor (chat) hands off to the app |
| `MarketplaceListHeader` featured carousel + "AI-matched results for:" banner | Featured row and AI banner with the understood-query chips |
| `MarketplaceListingCard` | `components/listing-card.tsx` (same layout, chips, owner/agency line and engagement counts) |
| `MarketplaceMapView` + `MapSelectedListingCard` | `components/marketplace/map-view.tsx` |
| `MarketplaceListEmptyState` | Same copy |
| `listing-detail-*` (hero, header, property strip, quick stats, text sections, costs, dates, location, CTA, similar) | `routes/listing.tsx` in the same order |

Listing URLs are `/listings/:id/:slug`. A wrong or missing slug 301-redirects to the canonical URL.

## Nearby (public place discovery)

`/nearby` mirrors the app's Near Me (`urbn-mobile/src/app/(public)/activities-nearby.tsx`):
- **Search centre:** the visitor's location (used automatically when they've already allowed it, otherwise on Use My Location), else central Ibadan or the area in `?area=`.
- **Finding places:** "Search nearby...", Sort by (Nearest, Newest, A–Z), Filter by type, and category chips that show only the types present, as "Label · count".
- **List mode (the default):** infinite scroll in pages of 20.
- **Map mode:** an interactive Leaflet map with one marker per activity and a results strip. Pan the map, then tap **Search this area**; the radius is half the visible latitude span × 111 km, capped at 25 km, as in the app. Map mode loads one page of 50.
- **Place detail:** opening a place shows the app's detail sheet content: photos (or the type tile), name, type · category, distance · city, address · unit, About, Contact (Call, WhatsApp, Instagram, Facebook, Twitter, Website) and Get Directions. `/nearby/activity/:id/:slug` is the shareable version.
- **No property records:** Nearby is about the place, so it doesn't show DPIs or property records, as in the app.
- **DPI records:** these show the app's compact "Activity Here" preview (up to three places, then "+N more").

With `URBN_API_URL` set, Nearby uses the app's public endpoints: `GET /activities/nearby`, `GET /activities/categories`, `GET /activities/:id` and `GET /public/properties/:id/activity`. Closed and private activities 404 there, so they never appear on the site. Without it, labelled sample places in `app/lib/nearby/seed.ts` are served through the same filters. Map tiles default to CARTO's light basemap with OpenStreetMap data. Set `VITE_MAP_TILE_URL` and `VITE_MAP_ATTRIBUTION` to use your own provider.

Privacy: device coordinates stay in browser state. They're never put in page URLs, and point searches are sent with `Cache-Control: no-store`.

## DPI codes

DPI codes follow the backend and app format: `LGA-NNNN-C` (e.g. `IBADAN-NORTH-0041-U`), optionally followed by `/UNIT` (e.g. `/U01`). `C` is the mod-23 check character from `geo.service`/`dpi.helpers.ts`, so typos are caught before a lookup. `app/lib/dpi.ts` ports `computeDpiCheckChar`, `isValidDpiFormat` and `parseDpiIdentifier` exactly (it passes the app's `AKINYELE-0004-S` fixture).

- `/verify/:code[/:unit]`: verification result (noindex).
- `/p/dpi/:code[/:unit]`: web landing for plaque QR codes and shared links, the `https://` form of the app's `urbn://property/dpi/:code[/:unit]` deep link. Before printing `https` QR codes, add `/.well-known/apple-app-site-association` and `assetlinks.json` so the links open the app when it's installed.

> The Figma frames use a placeholder code (`DPI-IBD-25-7X9K-1A2B`). The site uses the real format, and the DPI page's "DPI Code Explained" section explains it.

## SEO

- Every marketing page, story and seed listing is **pre-rendered** to static HTML. `server.js` serves those without trailing-slash redirects and falls back to SSR for queries and dynamic pages.
- Per-route `<title>`, description, canonical, Open Graph and Twitter tags (`app/lib/seo.ts`). Branded share image at `public/og/urbn-share.png` (bump `?v=` in `SITE.ogImage` when it changes, so WhatsApp refetches it).
- JSON-LD: `Organization`, `WebSite` + `SearchAction`, `FAQPage`, `HowTo` (getting a DPI), `RealEstateListing` (offers, address, geo, DPI identifier), `ItemList`, `BlogPosting`, `BreadcrumbList` and `MobileApplication`.
- `/sitemap.xml` (including live listings and images) and `/robots.txt` are generated.
- Area pages (`/listings/in/bodija`, `/listings/in/lagos`, …) target local searches. Cities without coverage show a launch-updates sign-up.
- `scripts/check-prerender.mjs` fails the build if any pre-rendered page is a redirect stub or is missing its `<h1>`.

## Brand assets

`scripts/build-assets.py` builds `public/images` from `figma/` and `design assets/`. It crops artwork and inpaints the baked-in headline and search UI out of the hero illustrations, so real HTML text sits on top.

The Creato Display web fonts in `public/fonts` were rebuilt from the subsets embedded in the Visual Identity Guide PDF (`scripts/build-font.py`, with the Bold weight synthesised from Medium). **Replace them with the licensed Creato Display font files when available.** `scripts/build-social.py` generates the icons, manifest and OG image.

## Content to confirm before launch

Placeholders are marked `TODO` in `app/lib/site.ts`.

- App Store / Google Play links, support email, social handles (only `@urbn_hq` appears in the brand assets), registered company name.
- Site copy follows the team's reviewed copy audit (`docs/urbn-copy-audit.xlsx`). Its "Website status" column lists the rows that still need a product decision: Property Card, Neighbourhood Community and live location availability, free DPI lookup, and AI Search limits.
- Blog stories come from Urbn's Medium (`@urbn_hq`). Run `npm run import:medium` to pull the latest posts and their images into the site (it writes `app/lib/medium-stories.generated.ts` and `public/images/blog/`), then commit both. Medium's feed carries the 10 most recent posts. You can also pass a saved copy of the feed: `npm run import:medium -- ./feed.xml`. Image descriptions (alt text) live in `scripts/medium-alt-text.json`; add an entry when a new post has images. Until posts are imported, the two drafts in `app/lib/stories.ts` show.
- Terms of Service and Privacy Policy are drafts (written with the NDPA 2023 in mind), shown with a "Draft pending approval" notice. Replace them with the approved texts.
- Some artwork still carries old copy baked into the image: the homepage hero ("Don't pay before you verify" billboard, "41A / Allen Avenue" plaque), the billboard and plaque-scene images. These need new design assets.
- Seed listings are illustrative. They disappear once `URBN_API_URL` is set.

## Deploying

The included `Dockerfile` builds and runs `server.js`. Any Node 22+ host works (Fly.io, Render, Railway, ECS, Cloud Run). Set `URBN_API_URL` at both build and run time: listing pages are pre-rendered only when it's unset, and are SSR'd fresh when it's set.
