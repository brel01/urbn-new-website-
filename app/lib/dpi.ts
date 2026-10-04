/**
 * Digital Property Identity (DPI) codes, mirroring the Urbn backend
 * (urbn-api-nest geo.service computeCheckChar/verifyCheckChar) and the
 * mobile app's dpi.helpers.ts:
 *
 *   IBADAN-NORTH - 0041 - Q          optional unit: /U01
 *   │              │      └ check character (mod-23, catches typos)
 *   │              └ property sequence number within the LGA
 *   └ Local Government Area the property is registered in
 *
 * Client-side validation is a UX shortcut only; the backend is authoritative.
 */

const CHECK_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ"; // no 0/O, 1/I/L

export function computeDpiCheckChar(base: string): string {
  const stripped = base.toUpperCase().replace(/[^A-Z0-9]/g, "");
  let sum = 0;
  for (let i = 0; i < stripped.length; i++) sum += stripped.charCodeAt(i) * (i + 1);
  return CHECK_ALPHABET[sum % 23];
}

export function isValidDpiFormat(dpi: string): boolean {
  const parts = dpi.toUpperCase().split("-");
  if (parts.length < 2) return false;
  const check = parts.pop()!;
  return computeDpiCheckChar(parts.join("-")) === check;
}

export const makeDpi = (lga: string, seq: number) => {
  const base = `${lga.toUpperCase().replace(/\s+/g, "-")}-${String(seq).padStart(4, "0")}`;
  return `${base}-${computeDpiCheckChar(base)}`;
};

export type ParsedDpi = { dpiCode: string; unitCode: string | null };

/**
 * Same contract as the app's parseDpiIdentifier: accepts "DPI", "DPI/UNIT",
 * "urbn://property/dpi/DPI[/UNIT]" or any URL with a "dpi" path segment.
 */
export function parseDpiIdentifier(raw: string): ParsedDpi | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  let pathish = trimmed;
  try {
    const url = new URL(trimmed);
    const segments = (url.host + url.pathname).split("/").filter(Boolean);
    const i = segments.indexOf("dpi");
    pathish = (i !== -1 ? segments.slice(i + 1) : segments.slice(-1)).join("/");
  } catch {
    /* bare code */
  }
  const parts = pathish.split("/").filter(Boolean).map(decodeURIComponent);
  if (parts.length === 1) return { dpiCode: parts[0].toUpperCase(), unitCode: null };
  if (parts.length === 2) return { dpiCode: parts[0].toUpperCase(), unitCode: parts[1].toUpperCase() };
  return null;
}

export const appDeepLink = (dpi: string, unit?: string | null) =>
  `urbn://property/dpi/${[dpi, unit].filter(Boolean).map((s) => encodeURIComponent(s!)).join("/")}`;

export const verifyPath = (dpi: string, unit?: string | null) =>
  `/verify/${[dpi, unit].filter(Boolean).map((s) => encodeURIComponent(s!)).join("/")}`;

// ---------------------------------------------------------------------------

/** Backend error codes from GET /public/dpi/:dpiCode (DpiErrorCode enum). */
export type DpiErrorCode =
  | "NOT_VERIFIED"
  | "ARCHIVED"
  | "NOT_TRACEABLE"
  | "PROPERTY_NOT_FOUND"
  | "INVALID_DPI_FORMAT"
  | "UNIT_NOT_FOUND";

export type DpiEvent = { date: string; label: string };

export type DpiRecord = {
  code: string;
  unitCode: string | null;
  name: string;
  houseNo: string | null;
  address: string;
  lga: string;
  city: string;
  state: string;
  image: string | null;
  unitType: string;
  registeredOn: string | null;
  ownership: string;
  /** website listing path, when the property has an active listing */
  listingPath?: string;
  listing?: { type: string; price: number; rentPeriod: string | null } | null;
  history: DpiEvent[];
};

export type DpiLookup =
  | { status: "verified"; code: string; unitCode: string | null; record: DpiRecord }
  | { status: "error"; code: string; unitCode: string | null; error: DpiErrorCode };

export const DPI_ERROR_COPY: Record<DpiErrorCode, { title: string; body: string }> = {
  INVALID_DPI_FORMAT: {
    title: "That code doesn't look right",
    body: "DPI codes look like IBADAN-NORTH-0041-U. The last character is a check letter, so a single typo will show up here.",
  },
  PROPERTY_NOT_FOUND: {
    title: "No match",
    body: "No match doesn't always mean something's wrong. It usually means the property hasn't been verified by Urbn yet.",
  },
  NOT_VERIFIED: {
    title: "Not verified yet",
    body: "This property is on Urbn but hasn't finished verification. Don't treat it as verified until it has.",
  },
  NOT_TRACEABLE: {
    title: "Record is private",
    body: "This property exists on Urbn, but its owner hasn't made the record publicly traceable.",
  },
  ARCHIVED: {
    title: "Record archived",
    body: "This DPI belongs to a record that has been archived. Ask whoever is showing you the property for an up-to-date code.",
  },
  UNIT_NOT_FOUND: {
    title: "Unit not found",
    body: "The property exists, but we couldn't find that unit code under it. Check the unit code on the plaque.",
  },
};

export const SAMPLE_DPI = makeDpi("IBADAN-NORTH", 41);
