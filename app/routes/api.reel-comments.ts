import { reelComments } from "~/lib/marketplace/source.server";
import type { Route } from "./+types/api.reel-comments";

// GET /api/reels/:id/comments — a reel's public comments, read-only (posting is in the app).
export async function loader({ params, request }: Route.LoaderArgs) {
  const cursor = new URL(request.url).searchParams.get("cursor") ?? undefined;
  const comments = await reelComments(params.id, cursor);
  return Response.json(comments, { headers: { "Cache-Control": "public, max-age=30" } });
}
