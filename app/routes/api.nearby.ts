import { nearbyCategories, parseNearbyQuery, searchNearby } from "~/lib/nearby/source.server";
import type { Route } from "./+types/api.nearby";

// GET /api/nearby — public place discovery (area or point, radius, type, q, sort, page).
// Point searches aren't cached by shared caches so device coordinates stay private.
export async function loader({ request }: Route.LoaderArgs) {
  const sp = new URL(request.url).searchParams;
  const q = parseNearbyQuery(sp);
  const [result, categories] = await Promise.all([searchNearby(q), sp.get("categories") === "1" ? nearbyCategories(q) : undefined]);
  const point = q.lat != null;
  return Response.json(
    { ...result, categories },
    { headers: { "Cache-Control": point ? "private, no-store" : "public, max-age=60, stale-while-revalidate=300" } },
  );
}
