import { reelsFeed } from "~/lib/marketplace/source.server";
import type { Route } from "./+types/api.reels";

// GET /api/reels?page= — the next page of the Reels feed (GET /listings/reels).
export async function loader({ request }: Route.LoaderArgs) {
  const page = Number(new URL(request.url).searchParams.get("page")) || 1;
  const feed = await reelsFeed({ page });
  return Response.json(feed, { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } });
}
