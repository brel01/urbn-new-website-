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
  ownership: string | null;
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
    title: "Check the DPI code",
    body: "Enter the complete code exactly as it appears on the plaque or property record.",
  },
  PROPERTY_NOT_FOUND: {
    title: "No matching record",
    body: "We couldn't find a record for this code. Check it and try again, or ask the owner or manager for the current DPI.",
  },
  NOT_VERIFIED: {
    title: "Verification incomplete",
    body: "This property is registered on Urbn but has not completed the required verification checks.",
  },
  NOT_TRACEABLE: {
    title: "Record unavailable to view",
    body: "This record is not publicly accessible. Contact the owner or manager for the information you need.",
  },
  ARCHIVED: {
    title: "Record archived",
    body: "This property record is archived. Ask the owner or manager about its current status before proceeding.",
  },
  UNIT_NOT_FOUND: {
    title: "Unit not found",
    body: "We found the property, but not this unit. Check the full property and unit code, then try again.",
  },
};

export const SAMPLE_DPI = makeDpi("IBADAN-NORTH", 41);
