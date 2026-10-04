import { data } from "react-router";
import type { Route } from "./+types/api.waitlist";

// POST /api/waitlist: email capture for city launches.
export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 254) {
    return data({ ok: false as const, error: "Enter a valid email address." }, { status: 400 });
  }
  // TODO: persist to the waitlist provider (e.g. CRM / mailing list API).
  console.info("[waitlist] signup", email.replace(/(.).+@/, "$1***@"));
  return { ok: true as const };
}

export function loader() {
  return new Response("Method not allowed", { status: 405 });
}
