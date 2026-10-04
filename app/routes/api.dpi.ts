import { lookupDpi } from "~/lib/marketplace/source.server";
import type { Route } from "./+types/api.dpi";

// GET /api/dpi/:code[/:unit]: public verification lookup.
export async function loader({ params }: Route.LoaderArgs) {
  const result = await lookupDpi(params.code, params.unit ?? null);
  const status = result.status === "verified" ? 200 : result.error === "INVALID_DPI_FORMAT" ? 400 : 404;
  return Response.json(result, { status, headers: { "Cache-Control": "public, max-age=300" } });
}
