import { PLACES } from "../places";
import type { ListingFilters, ListingType } from "./types";
import { formatCompactNaira, formatTextCase } from "./types";

/**
 * On-site interpreter for natural-language property searches. Used when the
 * Urbn AI endpoint (POST /listings/ai-search) isn't reachable or the visitor
 * isn't signed in. Turns "3 bedroom flat in Bodija, max 1.5 million per year,
 * needs parking" into ListingFilters the standard search understands.
 */
export function interpretQuery(raw: string): { filters: ListingFilters; understood: string[] } {
  const text = ` ${raw.toLowerCase().replace(/,/g, "").replace(/\s+/g, " ")} `;
  const f: ListingFilters = {};
  const understood: string[] = [];

  const beds = text.match(/(\d+)\s*-?\s*(bed|bedroom|bdr|br)s?\b/);
  if (beds) {
    f.bedrooms = Number(beds[1]);
    understood.push(`${f.bedrooms}+ bedrooms`);
  }
  const baths = text.match(/(\d+)\s*-?\s*(bath|bathroom|toilet)s?\b/);
  if (baths) {
    f.bathrooms = Number(baths[1]);
    understood.push(`${f.bathrooms}+ bathrooms`);
  }

  const types: [RegExp, string][] = [
    [/mini\s?-?flat/, "MiniFlat"],
    [/self[\s-]?con(tain)?|studio/, "Apartment"],
    [/semi[\s-]?detached/, "SemiDetached"],
    [/detached/, "Detached"],
    [/duplex/, "Duplex"],
    [/bungalow/, "Bungalow"],
    [/terrace/, "Terrace"],
    [/penthouse/, "Penthouse"],
    [/town\s?house/, "Townhouse"],
    [/\b(flat|apartment)s?\b/, "Apartment"],
  ];
  for (const [re, t] of types) {
    if (re.test(text)) {
      f.buildingType = t;
      understood.push(formatTextCase(t));
      break;
    }
  }

  const purposes: [RegExp, ListingType, string][] = [
    [/short[\s-]?(let|stay|term)|per night|a night|weekend|for a week/, "ShortTermRental", "Short term"],
    [/\blease\b/, "Lease", "Lease"],
    [/\b(buy|purchase|for sale|own)\b/, "Sale", "For sale"],
    [/\b(rent|to let|renting)\b/, "Rent", "For rent"],
  ];
  for (const [re, t, label] of purposes) {
    if (re.test(text)) {
      f.listingType = t;
      understood.push(label);
      break;
    }
  }

  const n = (num: string, unit?: string) => {
    const v = Number(num);
    if (!unit) return v < 1000 ? v * 1_000_000 : v; // "budget 2 to 4" ≈ millions
    if (unit.startsWith("k")) return v * 1_000;
    if (unit.startsWith("m")) return v * 1_000_000;
    if (unit.startsWith("b")) return v * 1_000_000_000;
    return v;
  };
  const unit = "(k|m|mil|million|b|billion)?";
  const range = text.match(new RegExp(`(?:between|from|budget)?\\s*(?:₦|n|ngn)?\\s*([\\d.]+)\\s*${unit}\\s*(?:to|-|and)\\s*(?:₦|n|ngn)?\\s*([\\d.]+)\\s*${unit}`));
  const max = text.match(new RegExp(`(?:under|below|max(?:imum)?|less than|within|up to|not more than|budget(?: of)?)\\s*(?:₦|n|ngn)?\\s*([\\d.]+)\\s*${unit}`));
  const min = text.match(new RegExp(`(?:above|over|min(?:imum)?|at least|more than)\\s*(?:₦|n|ngn)?\\s*([\\d.]+)\\s*${unit}`));
  if (range && !/bed|bath/.test(range[0])) {
    f.minPrice = n(range[1], range[2] ?? range[4]);
    f.maxPrice = n(range[3], range[4]);
    understood.push(`${formatCompactNaira(f.minPrice)}–${formatCompactNaira(f.maxPrice)}`);
  } else {
    if (max) {
      f.maxPrice = n(max[1], max[2]);
      understood.push(`Under ${formatCompactNaira(f.maxPrice)}`);
    }
    if (min) {
      f.minPrice = n(min[1], min[2]);
      understood.push(`Over ${formatCompactNaira(f.minPrice)}`);
    }
  }

  if (/\bfurnished\b/.test(text) && !/unfurnished/.test(text)) {
    f.furnishingStatus = /semi/.test(text) ? "SemiFurnished" : "Furnished";
    understood.push(formatTextCase(f.furnishingStatus));
  } else if (/unfurnished/.test(text)) {
    f.furnishingStatus = "Unfurnished";
    understood.push("Unfurnished");
  }

  const security: string[] = [];
  if (/24\s?(hr|hour)s?\s?security|security|guard/.test(text)) security.push("GuardHouse");
  if (/gated|estate/.test(text)) security.push("GatedEntry");
  if (/cctv|camera/.test(text)) security.push("SecurityCameras");
  if (security.length) {
    f.securityFeatures = [...new Set(security)].join(",");
    understood.push("Security");
  }
  if (/\bpool\b/.test(text)) {
    f.outdoorFeatures = "Pool";
    understood.push("Pool");
  }
  if (/\bpets?\b|\bdog\b|\bcat\b/.test(text)) understood.push("Pet friendly");

  // Location: neighbourhoods/LGAs we know, then any "in <place>" phrase.
  const place = [...PLACES]
    .sort((a, b) => b.name.length - a.name.length)
    .find((p) => [p.name, ...p.aliases].some((a) => new RegExp(`\\b${a.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(text)));
  if (place) {
    f.search = place.kind === "city" ? place.city : place.name;
    understood.push(place.kind === "city" ? place.name : `${place.name}, ${place.city}`);
  } else {
    const loc = raw.match(/\b(?:in|at|around|near)\s+([A-Z][\w-]*(?:\s+[A-Z][\w-]*)*)/);
    if (loc) {
      f.search = loc[1];
      understood.push(loc[1]);
    }
  }

  return { filters: f, understood };
}
