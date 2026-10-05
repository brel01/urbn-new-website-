/**
 * Marketplace data source. When URBN_API_URL is set (e.g. https://api.urbn.ng)
 * every call goes to the same endpoints the mobile app uses; otherwise the
 * seed data in seed.ts is served through an equivalent local query engine.
 */
import { type DpiLookup, type DpiErrorCode, isValidDpiFormat } from "../dpi";
import { PLACES } from "../places";
import { interpretQuery } from "./interpret";
import { SAMPLE_PROPERTIES } from "../nearby/seed";
import { SEED_LISTINGS } from "./seed";
import type { AiSearchResult, ListingCard, ListingDetail, ListingFilters, Paged } from "./types";
import { listingPath, roomCount } from "./types";

const API = process.env.URBN_API_URL?.replace(/\/$/, "");
const TOKEN = process.env.URBN_API_TOKEN; // optional service token for AI search
export const usingLiveApi = Boolean(API);

export async function api<T>(path: string, init?: RequestInit & { query?: Record<string, unknown> }): Promise<T> {
  const url = new URL(API + path);
  for (const [k, v] of Object.entries(init?.query ?? {})) if (v !== undefined && v !== "" && v !== null) url.searchParams.set(k, String(v));
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}), ...init?.headers },
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw Object.assign(new Error(`Urbn API ${res.status} ${path}`), { status: res.status, body: await res.json().catch(() => null) });
  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Local query engine over seed data (mirrors the API's filter semantics).

export const haversineKm = (a: [number, number], b: [number, number]) => {
  const R = 6371, toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]), dLng = toRad(b[1] - a[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

function matchesSearch(l: ListingDetail, q: string) {
  const t = q.toLowerCase().trim();
  if (!t) return true;
  const place = PLACES.find((p) => p.name.toLowerCase() === t || p.aliases.includes(t));
  const hay = [l.propertyTitle, l.propertyAddress, l.propertyCity, l.propertyState, l.lga ?? "", l.structureType ?? "", l.propertyBuildingType].join(" ").toLowerCase();
  if (place) {
    if (place.kind === "city") return l.propertyCity.toLowerCase() === place.city.toLowerCase();
    const word = (w: string) => new RegExp(`\\b${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(hay);
    return word(place.name.toLowerCase()) || place.aliases.some(word) || (!!place.lga && l.lga === place.lga);
  }
  return t.split(/\s+/).every((w) => hay.includes(w));
}

function queryLocal(f: ListingFilters): Paged<ListingCard> {
  const csv = (s?: string) => (s ? s.split(",").filter(Boolean) : []);
  let rows = SEED_LISTINGS.filter((l) => {
    if (f.search && !matchesSearch(l, f.search)) return false;
    if (f.listingType && l.listingType !== f.listingType) return false;
    if (f.state && l.propertyState.toLowerCase() !== f.state.toLowerCase()) return false;
    if (f.lga && l.lga !== f.lga) return false;
    if (f.buildingType && l.propertyBuildingType !== f.buildingType) return false;
    if (f.minPrice && l.price < f.minPrice) return false;
    if (f.maxPrice && l.price > f.maxPrice) return false;
    if (f.bedrooms && (roomCount(l, "Bedroom") ?? 0) < f.bedrooms) return false;
    if (f.bathrooms && (roomCount(l, "Bathroom") ?? 0) < f.bathrooms) return false;
    if (f.listedBy === "OWNER" && l.agent) return false;
    if (f.listedBy === "AGENT" && !l.agent) return false;
    if (f.furnishingStatus && l.furnishingStatus !== f.furnishingStatus) return false;
    if (f.featuredOnly && !l.isFeatured) return false;
    if (csv(f.securityFeatures).some((x) => !l.securityFeatures.includes(x))) return false;
    if (csv(f.outdoorFeatures).some((x) => !l.outdoorFeatures.includes(x))) return false;
    if (f.lat != null && f.lng != null && l.latitude != null && l.longitude != null) {
      if (haversineKm([f.lat, f.lng], [l.latitude, l.longitude]) > (f.radius ?? 10)) return false;
    }
    return true;
  });
  const dir = f.sortOrder === "asc" ? 1 : -1;
  rows = [...rows].sort((a, b) => {
    switch (f.sortBy) {
      case "price": return (a.price - b.price) * (f.sortOrder ? dir : 1);
      case "views": return (a.views - b.views) * dir;
      case "likeCount": return (a.likeCount - b.likeCount) * dir;
      case "createdAt": return a.createdAt.localeCompare(b.createdAt) * dir;
      default: return Number(b.isFeatured) - Number(a.isFeatured) || b.createdAt.localeCompare(a.createdAt);
    }
  });
  const limit = f.limit ?? 12, page = f.page ?? 1;
  return {
    data: rows.slice((page - 1) * limit, page * limit),
    meta: { total: rows.length, page, limit, totalPages: Math.max(1, Math.ceil(rows.length / limit)) },
  };
}

// ---------------------------------------------------------------------------

export async function searchListings(f: ListingFilters): Promise<Paged<ListingCard>> {
  if (!API) return queryLocal(f);
  const { data, meta } = await api<{ data: ListingCard[]; meta: Paged<ListingCard>["meta"] }>("/listings", { query: { limit: 12, ...f } });
  return { data, meta };
}

export async function featuredListings(limit = 6): Promise<ListingCard[]> {
  if (!API) return SEED_LISTINGS.filter((l) => l.isFeatured).slice(0, limit);
  return (await api<{ data: ListingCard[] }>("/listings/featured", { query: { limit } })).data;
}

type PublicProperty = {
  /** Present in PUBLIC mode only; TRACEABLE records don't expose it. */
  id: string;
  title: string; address: string; houseNumber: string | null; city: string; state: string; lga: string | null;
  dpi: string | null; isVerified: boolean; thumbnailUrl: string | null; description: string | null;
  mediaSections: { images: { fileUrl: string }[] }[]; securityFeatures: string[]; outdoorFeatures: string[];
  waterSources: string[]; electricitySources: string[];
};

export async function getListing(id: string): Promise<ListingDetail | null> {
  if (!API) return SEED_LISTINGS.find((l) => l.id === id) ?? null;
  try {
    const { data: d } = await api<{ data: ListingDetail }>(`/listings/${encodeURIComponent(id)}`);
    const { data: p } = await api<{ data: PublicProperty }>(`/public/properties/${encodeURIComponent(d.propertyId)}`).catch(() => ({ data: null as PublicProperty | null }));
    const images = p?.mediaSections.flatMap((s) => s.images.map((i) => i.fileUrl)) ?? [];
    return {
      ...d,
      propertyTitle: p?.title ?? d.propertyTitle ?? "Verified property",
      propertyAddress: p?.address ?? d.propertyAddress ?? "",
      propertyCity: p?.city ?? d.propertyCity ?? "",
      propertyState: p?.state ?? d.propertyState ?? "",
      dpi: p?.dpi ?? null,
      lga: p?.lga ?? null,
      isVerified: p?.isVerified ?? true,
      images: images.length ? images : [d.thumbnailUrl].filter(Boolean) as string[],
      description: d.description ?? p?.description ?? null,
      securityFeatures: p?.securityFeatures ?? [],
      outdoorFeatures: p?.outdoorFeatures ?? [],
      waterSources: p?.waterSources ?? [],
      electricitySources: p?.electricitySources ?? [],
    };
  } catch (e: any) {
    if (e?.status === 404) return null;
    throw e;
  }
}

export async function similarListings(id: string, limit = 3): Promise<ListingCard[]> {
  if (!API) {
    const l = SEED_LISTINGS.find((x) => x.id === id);
    if (!l) return [];
    return SEED_LISTINGS.filter((x) => x.id !== id)
      .sort((a, b) => Number(b.listingType === l.listingType) - Number(a.listingType === l.listingType) || Math.abs(a.price - l.price) - Math.abs(b.price - l.price))
      .slice(0, limit);
  }
  return (await api<{ data: ListingCard[] }>(`/listings/${encodeURIComponent(id)}/similar`, { query: { limit } })).data;
}

/** Every listing path, for pre-rendering and the sitemap. */
export async function allListingPaths(): Promise<{ path: string; lastmod: string; image: string | null }[]> {
  const rows = API ? (await searchListings({ limit: 500 })).data : SEED_LISTINGS;
  return rows.map((l) => ({ path: listingPath(l), lastmod: l.createdAt.slice(0, 10), image: l.thumbnailUrl }));
}

// ---------------------------------------------------------------------------

const AI_ERRORS: Record<number, string> = {
  429: "You've reached your daily AI search limit. Come back tomorrow.",
  422: "We couldn't parse that description. Try including a location, price range, or property type.",
};

export async function aiSearch(query: string): Promise<AiSearchResult> {
  const q = query.trim();
  if (q.length < 5) return { query: q, source: "local", understood: [], data: [], meta: { total: 0, page: 1, limit: 12, totalPages: 1 }, error: "Please enter at least 5 characters." };
  if (API) {
    try {
      const r = await api<Paged<ListingCard> & { quota?: AiSearchResult["quota"] }>("/listings/ai-search", { method: "POST", body: JSON.stringify({ query: q }) });
      return { query: q, source: "api", understood: interpretQuery(q).understood, data: r.data, meta: r.meta, quota: r.quota };
    } catch (e: any) {
      // 401 (signed-out visitors), 5xx or timeouts fall through to the
      // on-site interpreter so web search always answers.
      if (AI_ERRORS[e?.status]) return { query: q, source: "api", understood: [], data: [], meta: { total: 0, page: 1, limit: 12, totalPages: 1 }, error: AI_ERRORS[e.status] };
    }
  }
  const { filters, understood } = interpretQuery(q);
  const res = await searchListings({ ...filters, limit: 24 });
  return { query: q, source: "local", understood, ...res };
}

// ---------------------------------------------------------------------------

function seedLookup(code: string, unitCode: string | null): DpiLookup {
  const l = SEED_LISTINGS.find((x) => x.dpi === code);
  if (!l) return sampleActivityPropertyLookup(code, unitCode);
  if (unitCode && !/^U\d{2}$/.test(unitCode)) return { status: "error", code, unitCode, error: "UNIT_NOT_FOUND" };
  const registered = l.createdAt.slice(0, 10);
  const day = (offset: number) => new Date(Date.parse(registered) - offset * 864e5).toISOString().slice(0, 10);
  return {
    status: "verified",
    code,
    unitCode,
    record: {
      code,
      unitCode,
      propertyId: l.id,
      name: l.propertyTitle,
      houseNo: l.propertyAddress.match(/^\d+\w?/)?.[0] ?? null,
      address: l.propertyAddress,
      lga: l.lga ?? "",
      city: l.propertyCity,
      state: l.propertyState,
      image: l.thumbnailUrl,
      unitType: l.isMainUnit ? "Whole Property" : "Multi-Unit",
      registeredOn: registered,
      ownership: null,
      listingPath: listingPath(l),
      listing: { type: l.listingType, price: l.price, rentPeriod: l.rentPeriod },
      history: [
        { date: day(10), label: "Property submitted" },
        { date: day(7), label: "Identity check completed" },
        { date: day(3), label: "Documents reviewed" },
        { date: day(1), label: "Property checks completed" },
        { date: registered, label: "Verification complete" },
      ],
    },
  };
}

/** Sample properties that only carry Nearby activities (no listing). */
function sampleActivityPropertyLookup(code: string, unitCode: string | null): DpiLookup {
  const p = SAMPLE_PROPERTIES.find((x) => x.dpi === code);
  if (!p) return { status: "error", code, unitCode, error: "PROPERTY_NOT_FOUND" };
  if (unitCode && !p.units?.includes(unitCode)) return { status: "error", code, unitCode, error: "UNIT_NOT_FOUND" };
  return {
    status: "verified",
    code,
    unitCode,
    record: {
      propertyId: p.id,
      code,
      unitCode,
      name: p.name,
      houseNo: p.address.match(/^\d+\w?/)?.[0] ?? null,
      address: p.address,
      lga: p.lga,
      city: "Ibadan",
      state: "Oyo",
      image: null,
      unitType: unitCode ? `Unit ${unitCode}` : p.units ? "Multi-Unit" : "Whole Property",
      registeredOn: p.registeredOn,
      ownership: null,
      listing: null,
      history: [
        { date: "2026-06-05", label: "Property submitted" },
        { date: "2026-06-10", label: "Documents reviewed" },
        { date: p.registeredOn, label: "Verification complete" },
      ],
    },
  };
}

type PublicDpiResult = {
  dpi: string;
  mode: "TRACEABLE" | "PUBLIC";
  property: Partial<PublicProperty> & { name?: string | null; city?: string | null; state?: string | null; thumbnailUrl?: string | null };
  listing: { id: string; listingType: string; price: number; rentPeriod: string | null } | null;
};

export async function lookupDpi(rawCode: string, rawUnit: string | null = null): Promise<DpiLookup> {
  const code = rawCode.trim().toUpperCase();
  const unitCode = rawUnit?.trim().toUpperCase() || null;
  if (!isValidDpiFormat(code)) return { status: "error", code, unitCode, error: "INVALID_DPI_FORMAT" };
  if (!API) return seedLookup(code, unitCode);
  try {
    const path = `/public/dpi/${encodeURIComponent(code)}${unitCode ? `/${encodeURIComponent(unitCode)}` : ""}`;
    const r = await api<PublicDpiResult>(path, { query: { source: "SEARCH" } });
    const p = r.property;
    return {
      status: "verified",
      code,
      unitCode,
      record: {
        code,
        unitCode,
        propertyId: p.id,
        name: p.title ?? p.name ?? "Verified property",
        houseNo: p.houseNumber ?? null,
        address: p.address ?? [p.city, p.state].filter(Boolean).join(", "),
        lga: p.lga ?? "",
        city: p.city ?? "",
        state: p.state ?? "",
        image: p.thumbnailUrl ?? null,
        unitType: unitCode ? `Unit ${unitCode}` : "Whole Property",
        registeredOn: null,
        // Shown only once the API defines a public ownership field.
        ownership: null,
        listingPath: r.listing ? `/listings/${r.listing.id}` : undefined,
        listing: r.listing ? { type: r.listing.listingType, price: r.listing.price, rentPeriod: r.listing.rentPeriod } : null,
        history: [],
      },
    };
  } catch (e: any) {
    const KNOWN: DpiErrorCode[] = ["NOT_VERIFIED", "ARCHIVED", "NOT_TRACEABLE", "PROPERTY_NOT_FOUND", "INVALID_DPI_FORMAT", "UNIT_NOT_FOUND"];
    const err = e?.body?.errorCode as DpiErrorCode | undefined;
    if (err && KNOWN.includes(err)) return { status: "error", code, unitCode, error: err };
    if (e?.status === 404) return { status: "error", code, unitCode, error: "PROPERTY_NOT_FOUND" };
    throw e;
  }
}
