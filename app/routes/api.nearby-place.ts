import { getNearbyPlace } from "~/lib/nearby/source.server";
import type { Route } from "./+types/api.nearby-place";

// GET /api/nearby/:id — public detail (photos and full description), fetched when a place is opened.
// Closed, private and missing activities all 404, as in the app.
export async function loader({ params }: Route.LoaderArgs) {
  const place = await getNearbyPlace(params.id);
  if (!place) return Response.json({ error: "Activity Unavailable" }, { status: 404 });
  return Response.json(place, { headers: { "Cache-Control": "public, max-age=60" } });
}
