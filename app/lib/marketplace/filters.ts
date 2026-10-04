import type { ListingFilters } from "./types";

const NUM_KEYS = ["minPrice", "maxPrice", "bedrooms", "bathrooms", "lat", "lng", "radius", "page", "limit"] as const;
const STR_KEYS = ["search", "listingType", "lga", "state", "buildingType", "sortBy", "sortOrder", "listedBy", "furnishingStatus", "securityFeatures", "outdoorFeatures", "indoorFeatures", "nearbyPlaceTypes"] as const;

/** URL search params → ListingFilters (same names as GET /listings). */
export function parseFilters(params: URLSearchParams): ListingFilters {
  const f: Record<string, unknown> = {};
  for (const k of STR_KEYS) {
    const v = params.get(k);
    if (v) f[k] = v;
  }
  for (const k of NUM_KEYS) {
    const v = Number(params.get(k));
    if (params.has(k) && Number.isFinite(v)) f[k] = v;
  }
  if (params.get("featuredOnly") === "true") f.featuredOnly = true;
  return f as ListingFilters;
}

export function filtersToParams(f: ListingFilters): URLSearchParams {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(f)) {
    if (v === undefined || v === null || v === "" || v === false) continue;
    p.set(k, String(v));
  }
  p.sort();
  return p;
}

/** Filters counted on the "Filters" button badge (mirrors the app). */
export function activeFilterCount(f: ListingFilters) {
  return [f.listedBy, f.lga || f.state, f.lat, f.buildingType, f.minPrice || f.maxPrice, f.bedrooms, f.bathrooms, f.furnishingStatus, f.featuredOnly, f.securityFeatures, f.outdoorFeatures, f.nearbyPlaceTypes].filter(Boolean).length;
}
