import { parseFilters } from "~/lib/marketplace/filters";
import { searchListings } from "~/lib/marketplace/source.server";
import type { Route } from "./+types/api.listings";

// GET /api/listings — same query params as the Urbn API's GET /listings.
export async function loader({ request }: Route.LoaderArgs) {
  const result = await searchListings(parseFilters(new URL(request.url).searchParams));
  return Response.json(result, { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } });
}
