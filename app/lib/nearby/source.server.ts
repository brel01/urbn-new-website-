/**
 * Nearby data source. With URBN_API_URL set, every call goes to the same
 * public endpoints the app's Near Me uses (GET /activities/nearby,
 * /activities/categories, /activities/:id, /public/properties/:id/activity).
 * Otherwise labelled sample places are served through an equivalent local
 * engine: server-side geo filtering, nearest first, stable id tie-break.
 */
import { api, haversineKm, usingLiveApi } from "../marketplace/source.server";
import { getPlace } from "../places";
import { SAMPLE_PLACES, SAMPLE_PROPERTIES } from "./seed";
import {
  ACTIVITY_TYPES,
  type ActivityType,
  type CategoryCount,
  DEFAULT_RADIUS,
  MAX_RADIUS,
  type NearbyOrigin,
  type NearbyPlace,
  type NearbyPlaceDetail,
  type NearbyQuery,
  type NearbyResult,
  type NearbySort,
} from "./types";

export const nearbyUsesLiveData = usingLiveApi;

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
const isType = (t?: string | null): t is ActivityType => !!t && (ACTIVITY_TYPES as readonly string[]).includes(t);

/** Validates raw query params (from URLs or API calls) into a safe NearbyQuery. */
export function parseNearbyQuery(sp: URLSearchParams): NearbyQuery {
  const num = (k: string) => {
    const v = sp.get(k);
    return v == null || v === "" ? undefined : Number(v);
  };
  const lat = num("lat"), lng = num("lng");
  const validPoint = lat != null && lng != null && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
  const sort = sp.get("sort");
  return {
    area: sp.get("area") ?? undefined,
    lat: validPoint ? lat : undefined,
    lng: validPoint ? lng : undefined,
    radius: num("radius"),
    type: isType(sp.get("type")) ? (sp.get("type") as ActivityType) : undefined,
    q: sp.get("q")?.slice(0, 100) || undefined,
    sort: sort === "NEWEST" || sort === "ALPHABETICAL" ? (sort as NearbySort) : "NEAREST",
    page: clamp(num("page") ?? 1, 1, 500),
    limit: clamp(num("limit") ?? 12, 1, 50),
  };
}

type Resolved = { lat: number; lng: number; origin: NearbyOrigin; radius: number } | null;

/** Turns an area or device point into a search origin. Area-wide (city) searches use a wide radius from the centre. */
export function resolveOrigin(q: NearbyQuery): Resolved {
  const radius = clamp(q.radius ?? DEFAULT_RADIUS, 1, MAX_RADIUS);
  if (q.lat != null && q.lng != null) return { lat: q.lat, lng: q.lng, radius, origin: { kind: "device", label: "Near your location" } };
  const place = getPlace(q.area ?? "ibadan");
  if (!place?.live || !place.center) return null;
  if (place.kind === "city") {
    return { lat: place.center[0], lng: place.center[1], radius: q.radius ? radius : MAX_RADIUS, origin: { kind: "area", label: `In ${place.name}`, note: `Distances from central ${place.name}` } };
  }
  return { lat: place.center[0], lng: place.center[1], radius, origin: { kind: "area", label: `Around ${place.name}`, note: `Distances from the centre of ${place.name}` } };
}

// --- live API mapping ----------------------------------------------------------

type ApiActivity = {
  id: string;
  activityType: ActivityType;
  name: string | null;
  description: string | null;
  businessCategory?: string | null;
  contactPhone?: string | null;
  socialLinks?: NearbyPlace["socialLinks"];
  profilePictureUrl?: string | null;
};
type ApiProperty = { id: string; dpi: string; address: string; city: string | null; latitude: number | string; longitude: number | string };
type ApiNearbyResult = { activity: ApiActivity; property: ApiProperty; unit: { id: string; unitNumber: string } | null; distance?: number | string };

const fromApi = (r: { activity: ApiActivity; property: ApiProperty; unit: ApiNearbyResult["unit"]; distance?: number | string }): NearbyPlace => {
  // The API can serialise coordinates and distance as strings; coerce at the boundary (same as the app).
  const lat = Number(r.property.latitude), lng = Number(r.property.longitude), d = Number(r.distance);
  return {
    id: r.activity.id,
    activityType: isType(r.activity.activityType) ? r.activity.activityType : "OTHER",
    name: r.activity.name,
    description: r.activity.description,
    businessCategory: r.activity.businessCategory ?? null,
    imageUrl: r.activity.profilePictureUrl ?? null,
    contactPhone: r.activity.contactPhone ?? null,
    socialLinks: r.activity.socialLinks ?? null,
    property: { id: r.property.id, dpi: r.property.dpi, address: r.property.address, city: r.property.city, area: null },
    unit: r.unit,
    distance: Number.isFinite(d) ? d : undefined,
    lat: Number.isFinite(lat) ? lat : undefined,
    lng: Number.isFinite(lng) ? lng : undefined,
  };
};

// --- search ----------------------------------------------------------------------

export async function searchNearby(q: NearbyQuery): Promise<NearbyResult> {
  const page = q.page ?? 1, limit = q.limit ?? 12;
  const o = resolveOrigin(q);
  const empty = (extra?: Partial<NearbyResult>): NearbyResult => ({
    places: [],
    meta: { page, limit, total: 0, totalPages: 0 },
    origin: o?.origin ?? null,
    radius: o?.radius ?? DEFAULT_RADIUS,
    source: usingLiveApi ? "api" : "sample",
    ...extra,
  });
  if (!o) return empty();

  if (usingLiveApi) {
    try {
      const r = await api<{ data: { activities: ApiNearbyResult[]; meta?: Record<string, number | string> } }>("/activities/nearby", {
        query: { lat: o.lat, lng: o.lng, radius: o.radius, q: q.q, activityType: q.type, sort: q.sort, page, limit },
      });
      const m = r.data.meta;
      const meta = m
        ? { page: Number(m.page), limit: Number(m.limit), total: Number(m.total), totalPages: Number(m.totalPages) }
        : { page, limit, total: r.data.activities.length, totalPages: page };
      // Deduplicate by activity id so a property- and unit-linked record never shows twice.
      const seen = new Set<string>();
      const places = r.data.activities.map(fromApi).filter((p) => !seen.has(p.id) && seen.add(p.id));
      return { places, meta, origin: o.origin, radius: o.radius, source: "api" };
    } catch {
      return empty({ error: "UNAVAILABLE" });
    }
  }

  const text = q.q?.toLowerCase().trim();
  let rows = SAMPLE_PLACES.map((p) => ({ ...p, distance: haversineKm([o.lat, o.lng], [p.lat!, p.lng!]) }))
    .filter((p) => p.distance <= o.radius)
    .filter((p) => !q.type || p.activityType === q.type)
    .filter((p) => !text || [p.name, p.description, p.businessCategory].join(" ").toLowerCase().includes(text));
  rows =
    q.sort === "ALPHABETICAL"
      ? rows.sort((a, b) => (a.name ?? "").localeCompare(b.name ?? "") || a.id.localeCompare(b.id))
      : q.sort === "NEWEST"
        ? rows.sort((a, b) => b.id.localeCompare(a.id))
        : rows.sort((a, b) => a.distance - b.distance || a.id.localeCompare(b.id));
  const total = rows.length;
  return {
    places: rows.slice((page - 1) * limit, page * limit),
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    origin: o.origin,
    radius: o.radius,
    source: "sample",
  };
}

/** Per-category counts for the same origin and radius (GET /activities/categories). `q` is deliberately not applied, so chips stay stable while typing. */
export async function nearbyCategories(q: NearbyQuery): Promise<CategoryCount[]> {
  const o = resolveOrigin(q);
  if (!o) return [];
  if (usingLiveApi) {
    try {
      const r = await api<{ data: { categories: { value: string; count: number | string }[] } }>("/activities/categories", {
        query: { lat: o.lat, lng: o.lng, radius: o.radius },
      });
      return r.data.categories.filter((c) => isType(c.value) && Number(c.count) > 0).map((c) => ({ value: c.value as ActivityType, count: Number(c.count) }));
    } catch {
      return [];
    }
  }
  const counts = new Map<ActivityType, number>();
  for (const p of SAMPLE_PLACES) if (haversineKm([o.lat, o.lng], [p.lat!, p.lng!]) <= o.radius) counts.set(p.activityType, (counts.get(p.activityType) ?? 0) + 1);
  return [...counts].map(([value, count]) => ({ value, count })).sort((a, b) => b.count - a.count);
}

// --- detail and property context ----------------------------------------------------

/** Public detail (GET /activities/:id). Nonexistent, closed and private records all resolve to null. */
export async function getNearbyPlace(id: string): Promise<NearbyPlaceDetail | null> {
  if (usingLiveApi) {
    try {
      const r = await api<{ data: { activity: ApiActivity; property: ApiProperty; unit: ApiNearbyResult["unit"]; images?: { fileUrl: string; displayOrder: number }[] } }>(
        `/activities/${encodeURIComponent(id)}`,
      );
      const d = r.data;
      return { ...fromApi(d), images: (d.images ?? []).sort((a, b) => a.displayOrder - b.displayOrder).map((i) => i.fileUrl) };
    } catch {
      return null;
    }
  }
  const p = SAMPLE_PLACES.find((x) => x.id === id);
  return p ? { ...p, images: [] } : null;
}

/** Places around a point that isn't sent to the browser (a listing's location), excluding activities at that same property. */
export async function placesAround(point: { lat: number; lng: number }, excludeDpi: string | null, limit = 4): Promise<NearbyResult> {
  const res = await searchNearby({ lat: point.lat, lng: point.lng, radius: DEFAULT_RADIUS, limit: limit + 4 });
  const places = res.places.filter((p) => p.property.dpi !== excludeDpi).slice(0, limit);
  return { ...res, places, origin: { kind: "property", label: "Around this property" } };
}

/** Publicly eligible activities recorded at one property (GET /public/properties/:id/activity). */
export async function placesAtProperty(ref: { propertyId?: string | null; dpi: string }): Promise<NearbyPlace[]> {
  if (usingLiveApi) {
    if (!ref.propertyId) return [];
    try {
      const r = await api<{ data: ApiActivity[] | { activities: ApiActivity[] } }>(`/public/properties/${encodeURIComponent(ref.propertyId)}/activity`);
      const list = Array.isArray(r.data) ? r.data : r.data.activities;
      return list.map((a) => fromApi({ activity: a, property: { id: ref.propertyId!, dpi: ref.dpi, address: "", city: null, latitude: NaN, longitude: NaN }, unit: null }));
    } catch {
      return [];
    }
  }
  return SAMPLE_PLACES.filter((p) => p.property.dpi === ref.dpi);
}

export const sampleProperty = (dpi: string) => SAMPLE_PROPERTIES.find((p) => p.dpi === dpi);
