// U-Beep on the server: proxies the website's U-Beep calls to the Urbn API (so the
// API URL and service token never reach the browser), throttles the public ones,
// and runs a sample version when no API is connected so the flow can be tried.
import { api, lookupDpi, usingLiveApi } from "./marketplace/source.server";
import {
  type CreateUBeepPayload,
  type CreateUBeepResponse,
  SAMPLE_OTP,
  UBEEP_REASONS,
  UBEEP_WINDOW_MS,
  type UBeepError,
  type UBeepReason,
  type UBeepStatusResponse,
  type UBeepTargets,
  normalisePhone,
} from "./ubeep";

export class UBeepFailure extends Error {
  constructor(
    public status: number,
    public body: UBeepError,
  ) {
    super(body.error);
  }
}

// ---------------------------------------------------------------------------
// Throttle: a small per-IP window on the endpoints that send texts or alerts.
// The API has its own limits; this keeps one browser from hammering it.

const hits = new Map<string, number[]>();
export function throttle(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= max) throw new UBeepFailure(429, { error: "Too many attempts. Please wait a few minutes and try again.", errorCode: "RATE_LIMITED" });
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some((t) => now - t < windowMs)) hits.delete(k);
}

/** Wraps an API call, turning its error body into one the sheet can show. */
async function call<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (e: any) {
    if (e instanceof UBeepFailure) throw e;
    const status = typeof e?.status === "number" ? e.status : 502;
    const errorCode = e?.body?.errorCode as string | undefined;
    const message = (e?.body?.message as string | undefined) ?? (status >= 500 ? "U-Beep is unavailable right now. Please try again shortly." : "Something went wrong. Please try again.");
    throw new UBeepFailure(status, { error: Array.isArray(message) ? message.join(" ") : message, errorCode });
  }
}

// ---------------------------------------------------------------------------
// Sample mode

const SAMPLE_REPLY: Partial<Record<UBeepReason, string>> = { SECURITY: "On it", DELIVERY: "I'm coming" };
const sampleBeeps = new Map<string, { createdAt: number; reason: UBeepReason; trackToken: string }>();
const SAMPLE_REPLY_AFTER_MS = 12_000;

async function sampleTargets(dpiCode: string): Promise<UBeepTargets> {
  const r = await lookupDpi(dpiCode);
  if (r.status !== "verified") throw new UBeepFailure(404, { error: "We couldn't find that property. Please check the DPI and try again.", errorCode: r.error });
  const units = r.record.units ?? [];
  return units.length ? { mode: "SELECT_UNIT", units: units.map((unitCode) => ({ unitCode })) } : { mode: "DIRECT" };
}

// ---------------------------------------------------------------------------

export const ubeep = {
  live: usingLiveApi,

  targets(dpiCode: string) {
    if (!usingLiveApi) return sampleTargets(dpiCode);
    return call(() => api<UBeepTargets>("/u-beep/target-options", { query: { dpiCode } }));
  },

  async sendOtp(rawPhone: string) {
    const phone = normalisePhone(rawPhone);
    if (!phone) throw new UBeepFailure(400, { error: "Enter a valid phone number, e.g. 08012345678.", errorCode: "INVALID_PHONE" });
    if (!usingLiveApi) return { ok: true, phone };
    await call(() => api("/u-beep/otp/send", { method: "POST", body: JSON.stringify({ phone }) }));
    return { ok: true, phone };
  },

  async verifyOtp(rawPhone: string, otp: string) {
    const phone = normalisePhone(rawPhone);
    if (!phone || !/^\d{4,8}$/.test(otp)) throw new UBeepFailure(400, { error: "Enter the code we sent to your phone.", errorCode: "INVALID_OTP" });
    if (!usingLiveApi) {
      if (otp !== SAMPLE_OTP) throw new UBeepFailure(400, { error: "That code isn't right. Check it and try again.", errorCode: "INVALID_OTP" });
      return { verificationToken: `sample-${crypto.randomUUID()}` };
    }
    return call(() => api<{ verificationToken: string }>("/u-beep/otp/verify", { method: "POST", body: JSON.stringify({ phone, otp }) }));
  },

  async create(p: CreateUBeepPayload): Promise<CreateUBeepResponse> {
    if (!p.dpiCode || !UBEEP_REASONS.some((r) => r.id === p.reason) || !p.message?.trim() || !p.clientRequestId || !p.verificationToken)
      throw new UBeepFailure(400, { error: "Some details are missing. Please go back and try again.", errorCode: "INVALID_REQUEST" });
    const payload: CreateUBeepPayload = {
      dpiCode: p.dpiCode,
      ...(p.unitCode ? { unitCode: p.unitCode } : {}),
      reason: p.reason,
      message: p.message.trim().slice(0, 500),
      verificationToken: p.verificationToken,
      clientRequestId: p.clientRequestId,
    };
    if (!usingLiveApi) {
      if (!p.verificationToken.startsWith("sample-")) throw new UBeepFailure(401, { error: "Please verify your phone number again.", errorCode: "INVALID_VERIFICATION" });
      const targets = await sampleTargets(p.dpiCode);
      if (targets.mode === "SELECT_UNIT" && !p.unitCode) throw new UBeepFailure(409, { error: "Choose a unit.", errorCode: "UBEEP_UNIT_SELECTION_REQUIRED" });
      // Same clientRequestId → same beep, as the API does.
      const id = `sample-${p.clientRequestId}`;
      const existing = sampleBeeps.get(id) ?? { createdAt: Date.now(), reason: p.reason, trackToken: crypto.randomUUID() };
      sampleBeeps.set(id, existing);
      return { id, expiresAt: new Date(existing.createdAt + UBEEP_WINDOW_MS).toISOString(), trackToken: existing.trackToken };
    }
    return call(() => api<CreateUBeepResponse>("/u-beep", { method: "POST", body: JSON.stringify(payload) }));
  },

  async status(id: string, trackToken: string): Promise<UBeepStatusResponse> {
    if (!trackToken) throw new UBeepFailure(401, { error: "Missing tracking token.", errorCode: "UNAUTHORIZED" });
    if (!usingLiveApi) {
      const b = sampleBeeps.get(id);
      if (!b || b.trackToken !== trackToken) throw new UBeepFailure(404, { error: "We couldn't find this U-Beep.", errorCode: "NOT_FOUND" });
      const age = Date.now() - b.createdAt;
      if (age >= SAMPLE_REPLY_AFTER_MS)
        return { status: "RESPONDED", responseMessage: SAMPLE_REPLY[b.reason] ?? "I'm coming", respondedAt: new Date(b.createdAt + SAMPLE_REPLY_AFTER_MS).toISOString() };
      return { status: age >= UBEEP_WINDOW_MS ? "EXPIRED" : "PENDING", responseMessage: null, respondedAt: null };
    }
    // The track token stands in for a user session on this one endpoint.
    return call(() => api<UBeepStatusResponse>(`/u-beep/${encodeURIComponent(id)}/status`, { headers: { Authorization: `Bearer ${trackToken}` } }));
  },
};
