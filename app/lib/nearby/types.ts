// Nearby: public place discovery. Shapes mirror the Urbn API's public
// Property Activity surface (GET /activities/nearby, /activities/categories,
// /activities/:id, /public/properties/:id/activity) used by the app's Near Me.

export const ACTIVITY_TYPES = [
  "BUSINESS",
  "RESTAURANT",
  "SCHOOL",
  "CLINIC",
  "RELIGIOUS",
  "COMMUNITY",
  "NGO",
  "GOVERNMENT",
  "WAREHOUSE",
  "INDUSTRIAL",
  "AGRICULTURAL",
  "RESIDENCE",
  "UNDER_CONSTRUCTION",
  "VACANT",
  "OTHER",
] as const;
export type ActivityType = (typeof ACTIVITY_TYPES)[number];

/** A public discovery result: an activity recorded at a property or unit. */
export type NearbyPlace = {
  id: string;
  activityType: ActivityType;
  name: string | null;
  description: string | null;
  businessCategory: string | null;
  imageUrl: string | null;
  contactPhone: string | null;
  socialLinks: Partial<Record<"instagram" | "facebook" | "twitter" | "tiktok" | "whatsapp" | "website", string>> | null;
  property: { id: string; dpi: string; address: string; city: string | null; area: string | null };
  unit: { id: string; unitNumber: string } | null;
  /** km, straight line, from the search origin. Absent when there is no origin. */
  distance?: number;
  /** Publishable display coordinates (property-level), for the map. */
  lat?: number;
  lng?: number;
  /** Illustrative content shown until live public data is connected. */
  sample?: boolean;
};

export type NearbyPlaceDetail = NearbyPlace & { images: string[] };

export type CategoryCount = { value: ActivityType; count: number };

export type NearbySort = "NEAREST" | "NEWEST" | "ALPHABETICAL";

export type NearbyQuery = {
  /** Area slug from places.ts (manual choice, shareable). */
  area?: string;
  /** Device location: kept in request only, never in shareable URLs. */
  lat?: number;
  lng?: number;
  radius?: number;
  type?: ActivityType;
  q?: string;
  sort?: NearbySort;
  page?: number;
  limit?: number;
};

export type NearbyOrigin = {
  kind: "area" | "device" | "property";
  /** "Around Bodija", "Near your location", "Around this property" */
  label: string;
  /** For area origins: distances are measured from this centre. */
  note?: string;
};

export type NearbyResult = {
  places: NearbyPlace[];
  meta: { page: number; limit: number; total: number; totalPages: number };
  origin: NearbyOrigin | null;
  radius: number;
  source: "api" | "sample";
  error?: "UNAVAILABLE";
};

export const RADII = [1, 5, 10, 25] as const;
export const DEFAULT_RADIUS = 5;
export const MAX_RADIUS = 25;

export const activitySlug = (p: Pick<NearbyPlace, "name" | "activityType" | "property">) =>
  (p.name ?? `${p.activityType} ${p.property.area ?? p.property.city ?? ""}`)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);

export const activityPath = (p: Pick<NearbyPlace, "id" | "name" | "activityType" | "property">) =>
  `/nearby/activity/${encodeURIComponent(p.id)}/${activitySlug(p)}`;

/** Approximate straight-line distance, app-style: "350 m", "1.2 km". */
export const formatDistance = (km?: number) =>
  km == null || !Number.isFinite(km) ? null : km < 1 ? `${Math.max(50, Math.round((km * 1000) / 50) * 50)} m` : `${km < 10 ? km.toFixed(1) : Math.round(km)} km`;
