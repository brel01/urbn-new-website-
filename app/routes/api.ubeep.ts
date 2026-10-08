import { UBeepFailure, throttle, ubeep } from "~/lib/ubeep.server";
import type { Route } from "./+types/api.ubeep";

// The website's U-Beep endpoints (see lib/ubeep.server.ts):
//   GET  /api/ubeep/targets?dpi=      which units can be beeped
//   GET  /api/ubeep/:id/status        header X-Track-Token; reply status
//   POST /api/ubeep/otp/send          { phone }
//   POST /api/ubeep/otp/verify        { phone, otp }
//   POST /api/ubeep                   { dpiCode, unitCode?, reason, message, verificationToken, clientRequestId }

const NO_STORE = { "Cache-Control": "no-store" };
const ip = (req: Request) => req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "local";

async function respond(fn: () => Promise<unknown>) {
  try {
    return Response.json(await fn(), { headers: NO_STORE });
  } catch (e) {
    if (e instanceof UBeepFailure) return Response.json(e.body, { status: e.status, headers: NO_STORE });
    console.error("U-Beep proxy error", e);
    return Response.json({ error: "U-Beep is unavailable right now. Please try again shortly." }, { status: 502, headers: NO_STORE });
  }
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const path = params["*"] ?? "";
  const url = new URL(request.url);
  if (path === "targets") return respond(() => ubeep.targets(url.searchParams.get("dpi")?.toUpperCase() ?? ""));
  const m = path.match(/^([^/]+)\/status$/);
  if (m) return respond(() => ubeep.status(decodeURIComponent(m[1]), request.headers.get("x-track-token") ?? ""));
  return Response.json({ error: "Not found" }, { status: 404 });
}

export async function action({ request, params }: Route.ActionArgs) {
  if (request.method !== "POST") return Response.json({ error: "Method not allowed" }, { status: 405 });
  const path = params["*"] ?? "";
  const body = (await request.json().catch(() => ({}))) as Record<string, string>;
  const who = ip(request);
  if (path === "otp/send")
    return respond(async () => {
      throttle(`otp:${who}`, 5, 10 * 60_000);
      return ubeep.sendOtp(String(body.phone ?? ""));
    });
  if (path === "otp/verify")
    return respond(async () => {
      throttle(`verify:${who}`, 10, 10 * 60_000);
      return ubeep.verifyOtp(String(body.phone ?? ""), String(body.otp ?? "").trim());
    });
  if (path === "")
    return respond(async () => {
      throttle(`beep:${who}`, 10, 10 * 60_000);
      return ubeep.create(body as never);
    });
  return Response.json({ error: "Not found" }, { status: 404 });
}
