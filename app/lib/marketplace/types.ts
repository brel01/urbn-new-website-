// Mirrors urbn-mobile src/types/listing.types.ts + src/enums/listing.enum.ts
// so the website and app speak the same contract as the Urbn API.

export type ListingType = "Sale" | "Rent" | "Lease" | "ShortTermRental" | "JointVenture" | "Auction";
export type RentPeriod = "Daily" | "Weekly" | "Monthly" | "Quarterly" | "Yearly";
export type InspectionType = "PHYSICAL" | "VIRTUAL" | "BOTH";
export type SortBy = "price" | "views" | "createdAt" | "likeCount";
export type SortOrder = "asc" | "desc";
export type Furnishing = "Furnished" | "SemiFurnished" | "Unfurnished";

export type ListingAgent = {
  id: string;
  displayName: string;
  agencyName: string | null;
  profileImageUrl: string | null;
  rating: number | null;
  reviewCount: number;
};

export type RoomSummaryItem = { roomType: string; count: number };

/** Flat card shape from GET /listings, /listings/featured, /listings/ai-search. */
export type ListingCard = {
  id: string;
  status: "ACTIVE" | "SUSPENDED" | "EXPIRED" | "CLOSED" | "DRAFT";
  listingType: ListingType;
  price: number;
  rentPeriod: RentPeriod | null;
  isFeatured: boolean;
  views: number;
  likeCount: number;
  saveCount: number;
  isAcceptingInspections: boolean;
  expiresAt: string | null;
  createdAt: string;
  unitId: string;
  propertyId: string;
  isMainUnit: boolean;
  squareFootage: number | null;
  propertyTitle: string;
  propertyAddress: string;
  propertyCity: string;
  propertyState: string;
  propertyBuildingType: string;
  thumbnailUrl: string | null;
  latitude: number | null;
  longitude: number | null;
  agent: ListingAgent | null;
  propertyVideoUrl: string | null;
  propertyVideoPosterUrl: string | null;
  listingVideoUrl: string | null;
  listingVideoPosterUrl: string | null;
  structureType: string | null;
  roomCount: number | null;
  roomSummary: RoomSummaryItem[] | null;
  unitCount: number | null;
  commentCount: number;
  furnishingStatus?: Furnishing | null;
  inventoryCount?: number | null;
};

/** Extra fields from GET /listings/:id (+ /public/properties/:id). */
export type ListingDetail = ListingCard & {
  description: string | null;
  isNegotiable?: boolean;
  deposit?: number;
  serviceCharge?: number;
  legalFee?: number;
  allowPets?: boolean;
  immediateAvailability?: boolean;
  availableFrom?: string;
  minLeaseTerm?: number;
  maxLeaseTerm?: number;
  keyFeatures?: string;
  requirements?: string[];
  inspectionType?: InspectionType;
  inspectionFeeKobo?: number | null;
  inspectionDurationMins?: number;
  publishedAt: string | null;
  // from the public property record
  dpi: string | null;
  lga: string | null;
  isVerified: boolean;
  images: string[];
  rooms: { id: string; roomType: string; roomTitle: string }[] | null;
  securityFeatures: string[];
  outdoorFeatures: string[];
  waterSources: string[];
  electricitySources: string[];
};

/** Query params accepted by GET /listings (ListingsFilterParams). */
export type ListingFilters = {
  search?: string;
  listingType?: ListingType;
  lga?: string;
  state?: string;
  buildingType?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: SortBy;
  sortOrder?: SortOrder;
  lat?: number;
  lng?: number;
  radius?: number;
  listedBy?: "OWNER" | "AGENT";
  bedrooms?: number;
  bathrooms?: number;
  furnishingStatus?: Furnishing;
  featuredOnly?: boolean;
  securityFeatures?: string;
  outdoorFeatures?: string;
  indoorFeatures?: string;
  nearbyPlaceTypes?: string;
  page?: number;
  limit?: number;
};

export type Paged<T> = { data: T[]; meta: { total: number; page: number; limit: number; totalPages: number } };

export type AiQuota = { used: number; remaining: number; limit: number; resetsAt: string };

export type AiSearchResult = Paged<ListingCard> & {
  query: string;
  /** "api" = Urbn AI; "local" = on-site interpreter fallback */
  source: "api" | "local";
  understood: string[];
  quota?: AiQuota;
  error?: string;
};

// ---- presentation helpers (match the app's card formatting) ---------------

export const LISTING_TYPE_CHIPS: { label: string; value: ListingType | undefined }[] = [
  { label: "All", value: undefined },
  { label: "Rent", value: "Rent" },
  { label: "Sale", value: "Sale" },
  { label: "Lease", value: "Lease" },
  { label: "Short Term", value: "ShortTermRental" },
];

// Mirrors the app filter (residential, then OfficeBuilding/Warehouse/Shop), plus the residential types seed data uses.
export const BUILDING_TYPES = ["Apartment", "Duplex", "Terrace", "Bungalow", "MiniFlat", "Penthouse", "Detached", "SemiDetached", "BlockOfFlats", "Townhouse", "OfficeBuilding", "Warehouse", "Shop"];
export const SECURITY_FEATURES = ["AlarmSystem", "GatedEntry", "SecurityCameras", "MotionLights", "GuardHouse"];
export const OUTDOOR_FEATURES = ["Pool", "Deck", "Patio", "Porch", "Gazebo", "Shed"];
export const NEARBY_PLACES = ["school", "hospital", "gas_station", "police", "restaurant", "bank", "place_of_worship", "shopping_mall", "bus_station", "pharmacy"];

/** "SemiDetached" → "Semi Detached", "gas_station" → "Gas Station" (app's formatTextCase). */
export const formatTextCase = (s: string) =>
  s
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase());

const PERIOD_SHORT: Partial<Record<RentPeriod, string>> = { Yearly: "yr", Monthly: "mo", Weekly: "wk", Daily: "day" };
const PERIOD_LONG: Partial<Record<RentPeriod, string>> = { Yearly: "year", Monthly: "month", Weekly: "week", Daily: "night", Quarterly: "quarter" };

export const formatPrice = (price: number, rentPeriod: RentPeriod | null, long = false) => {
  const base = `₦${price.toLocaleString("en-NG")}`;
  if (!rentPeriod) return base;
  const label = (long ? PERIOD_LONG : PERIOD_SHORT)[rentPeriod];
  return label ? (long ? `${base} / ${label}` : `${base}/${label}`) : base;
};

export const formatCompactNaira = (n: number) =>
  n >= 1_000_000 ? `₦${+(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `₦${Math.round(n / 1_000)}k` : `₦${n}`;

export const formatCount = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n));

export const listingTypeLabel = (t: ListingType) =>
  t === "Rent" ? "For Rent" : t === "Sale" ? "For Sale" : t === "ShortTermRental" ? "Short Term" : formatTextCase(t);

export const roomCount = (l: Pick<ListingCard, "roomSummary">, type: "Bedroom" | "Bathroom") =>
  l.roomSummary?.find((r) => r.roomType.toLowerCase() === type.toLowerCase())?.count ?? null;

export const listedByLabel = (l: Pick<ListingCard, "agent">) =>
  l.agent ? (l.agent.agencyName ?? l.agent.displayName) : "Owner Listed";

export const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 70);

export const listingPath = (l: Pick<ListingCard, "id" | "propertyTitle" | "propertyCity">) =>
  `/listings/${encodeURIComponent(l.id)}/${slugify(`${l.propertyTitle} ${l.propertyCity}`)}`;
