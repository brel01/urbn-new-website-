/**
 * U-Beep: a digital doorbell for a property. Someone at the gate picks a reason,
 * adds a message and the people at that property or unit get an alert they can
 * answer within 30 minutes. Mirrors urbn-mobile's sender flow
 * (src/app/(public)/u-beep/[dpiCode].tsx, src/lib/api/u-beep/*). On the web the
 * sender is always anonymous, so they confirm their phone number with a code.
 */

export type UBeepReason = "DELIVERY" | "VISITOR" | "SERVICE" | "PICKUP" | "PROPERTY_ISSUE" | "SECURITY" | "OTHER";
export type UBeepStatus = "PENDING" | "RESPONDED" | "EXPIRED";

export const UBEEP_REASONS: { id: UBeepReason; label: string }[] = [
  { id: "DELIVERY", label: "Delivery" },
  { id: "VISITOR", label: "Visitor" },
  { id: "SERVICE", label: "Service" },
  { id: "PICKUP", label: "Pickup" },
  { id: "PROPERTY_ISSUE", label: "Property Issue" },
  { id: "SECURITY", label: "Security" },
  { id: "OTHER", label: "Other" },
];

/** Same presets as the app (components/u-beep/message-presets.ts). */
export const UBEEP_PRESETS: Partial<Record<UBeepReason, string[]>> = {
  DELIVERY: ["I'm here with your delivery.", "Your package has arrived."],
  VISITOR: ["I'm at the gate.", "I'm here to see you."],
  SERVICE: ["I'm here for the scheduled service."],
  PICKUP: ["I'm here for a pickup."],
  PROPERTY_ISSUE: ["There's an issue at the property you should know about."],
  SECURITY: ["This is a security concern at the property."],
};

/** Reply window; the server's expiresAt wins when present. */
export const UBEEP_WINDOW_MS = 30 * 60 * 1000;

export type UBeepTargets = { mode: "DIRECT" } | { mode: "SELECT_UNIT"; units: { unitCode: string }[] };

export type CreateUBeepPayload = {
  dpiCode: string;
  unitCode?: string;
  reason: UBeepReason;
  message: string;
  verificationToken?: string;
  clientRequestId: string;
};
export type CreateUBeepResponse = { id: string; expiresAt: string; trackToken?: string };
export type UBeepStatusResponse = { status: UBeepStatus; responseMessage: string | null; respondedAt: string | null };

/** What the web proxy returns on failure. */
export type UBeepError = { error: string; errorCode?: string };

/** Accepts Nigerian numbers as typed (0801…, 234801…, +234 801…). */
export const normalisePhone = (raw: string) => {
  const d = raw.replace(/[^\d+]/g, "");
  if (/^0\d{10}$/.test(d)) return `+234${d.slice(1)}`;
  if (/^234\d{10}$/.test(d)) return `+${d}`;
  if (/^\+\d{10,15}$/.test(d)) return d;
  return null;
};

export const SAMPLE_OTP = "123456";
