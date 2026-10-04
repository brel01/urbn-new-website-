import { aiSearch } from "~/lib/marketplace/source.server";
import type { Route } from "./+types/api.ai-search";

// POST /api/listings/ai-search { query } — Urbn AI search with an on-site
// interpreter fallback for signed-out visitors.
export async function action({ request }: Route.ActionArgs) {
  const body = request.headers.get("content-type")?.includes("application/json")
    ? await request.json().catch(() => ({}))
    : Object.fromEntries(await request.formData());
  const query = String(body?.query ?? "").slice(0, 500);
  const result = await aiSearch(query);
  return Response.json(result, { status: result.error ? 400 : 200 });
}

export function loader() {
  return new Response("Method not allowed", { status: 405, headers: { Allow: "POST" } });
}
