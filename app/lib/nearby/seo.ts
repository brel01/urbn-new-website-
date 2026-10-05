// Search visibility for Nearby: category URL names, area/category hub paths and
// schema.org markup that tells Google exactly what kind of place each page is.
import { absoluteUrl } from "../site";
import { ACTIVITY_META, placeTitle } from "./categories";
import { type ActivityType, activityPath, type NearbyPlace } from "./types";

/** URL words for each category ("clinics", "places-of-worship"). */
export const CATEGORY_SLUG: Record<ActivityType, string> = Object.fromEntries(
  (Object.keys(ACTIVITY_META) as ActivityType[]).map((t) => [t, ACTIVITY_META[t].plural.toLowerCase().replace(/\s+/g, "-")]),
) as Record<ActivityType, string>;

export const typeFromSlug = (slug?: string) => (Object.keys(CATEGORY_SLUG) as ActivityType[]).find((t) => CATEGORY_SLUG[t] === slug);

/** Categories that make sense as public "X in Area" pages (homes, vacant plots and building sites don't). */
export const HUB_TYPES: ActivityType[] = ["BUSINESS", "RESTAURANT", "SCHOOL", "CLINIC", "RELIGIOUS", "COMMUNITY", "NGO", "GOVERNMENT", "WAREHOUSE", "INDUSTRIAL", "AGRICULTURAL"];

export const hubPath = (areaSlug: string, type?: ActivityType) => `/nearby/in/${areaSlug}${type ? `/${CATEGORY_SLUG[type]}` : ""}`;

/** Most specific schema.org type Google understands for each activity type. */
const SCHEMA_TYPE: Record<ActivityType, string> = {
  BUSINESS: "LocalBusiness",
  RESTAURANT: "Restaurant",
  SCHOOL: "School",
  CLINIC: "MedicalClinic",
  RELIGIOUS: "PlaceOfWorship",
  COMMUNITY: "CivicStructure",
  NGO: "NGO",
  GOVERNMENT: "GovernmentOffice",
  WAREHOUSE: "LocalBusiness",
  INDUSTRIAL: "LocalBusiness",
  AGRICULTURAL: "LocalBusiness",
  RESIDENCE: "Place",
  UNDER_CONSTRUCTION: "Place",
  VACANT: "Place",
  OTHER: "Place",
};

/** Business-category refinements ("Pharmacy" → Pharmacy, "Supermarket" → GroceryStore …). */
const CATEGORY_SCHEMA: [RegExp, string][] = [
  [/pharmac|chemist/i, "Pharmacy"],
  [/supermarket|grocer|mart\b/i, "GroceryStore"],
  [/salon|barb/i, "BeautySalon"],
  [/hotel|guest ?house/i, "Hotel"],
  [/bank/i, "BankOrCreditUnion"],
  [/fuel|petrol|filling/i, "GasStation"],
  [/gym|fitness/i, "ExerciseGym"],
  [/hospital/i, "Hospital"],
  [/dentist|dental/i, "Dentist"],
  [/eye|optic/i, "Optician"],
  [/co-?working/i, "LocalBusiness"],
  [/print|copy/i, "LocalBusiness"],
  [/bakery/i, "Bakery"],
  [/caf[eé]|coffee/i, "CafeOrCoffeeShop"],
  [/mosque/i, "Mosque"],
  [/church|chapel|cathedral/i, "Church"],
];

export function schemaTypeFor(p: Pick<NearbyPlace, "activityType" | "businessCategory" | "name">) {
  const hint = `${p.businessCategory ?? ""} ${p.name ?? ""}`;
  return CATEGORY_SCHEMA.find(([re]) => re.test(hint))?.[1] ?? SCHEMA_TYPE[p.activityType];
}

/** Structured data for one place page: type, address, map pin, phone, photos, profiles. */
export function placeJsonLd(p: NearbyPlace & { images?: string[] }) {
  const url = absoluteUrl(activityPath(p));
  const s = p.socialLinks ?? {};
  const sameAs = [s.instagram, s.facebook, s.twitter, s.tiktok, s.website].filter(Boolean).map((u) => (/^https?:/.test(u!) ? u : `https://${u}`));
  const images = [...(p.images ?? []), ...(p.imageUrl ? [p.imageUrl] : [])];
  return {
    "@context": "https://schema.org",
    "@type": schemaTypeFor(p),
    "@id": `${url}#place`,
    name: placeTitle(p),
    ...(p.description ? { description: p.description } : {}),
    url,
    ...(images.length ? { image: images } : {}),
    ...(p.contactPhone ? { telephone: p.contactPhone } : {}),
    address: {
      "@type": "PostalAddress",
      streetAddress: p.property.address,
      ...(p.property.area ? { addressLocality: `${p.property.area}, ${p.property.city ?? "Ibadan"}` } : { addressLocality: p.property.city ?? "Ibadan" }),
      addressRegion: "Oyo",
      addressCountry: "NG",
    },
    ...(p.lat != null && p.lng != null
      ? {
          geo: { "@type": "GeoCoordinates", latitude: p.lat, longitude: p.lng },
          hasMap: `https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}`,
        }
      : {}),
    ...(sameAs.length ? { sameAs } : {}),
    ...(p.businessCategory ? { keywords: `${p.businessCategory}, ${ACTIVITY_META[p.activityType].label}` } : {}),
  };
}
