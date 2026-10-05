// A shareable page for one Nearby place, with the same content as the app's
// ActivityDetailSheet (photos, name, type · category, location, About, Contact,
// Get Directions). On /nearby the same content opens as a sheet.
import { ChevronLeft } from "lucide-react";
import { motion } from "motion/react";
import { data, Link, redirect, useLocation } from "react-router";
import { CtaBanner } from "~/components/cta-banner";
import { EASE } from "~/components/motion";
import { NearbyDetail } from "~/components/nearby";
import { ACTIVITY_META, placeTitle } from "~/lib/nearby/categories";
import { getNearbyPlace } from "~/lib/nearby/source.server";
import { activityPath, activitySlug } from "~/lib/nearby/types";
import { breadcrumbs, seo } from "~/lib/seo";
import { absoluteUrl } from "~/lib/site";
import type { Route } from "./+types/nearby-activity";

export async function loader({ params }: Route.LoaderArgs) {
  // Resolved by id; closed, private and missing records all 404, as in the app.
  const place = await getNearbyPlace(params.id);
  if (!place) throw data("Activity Unavailable", { status: 404 });
  // Compare route params, not request.url (data requests carry a .data suffix).
  if (params.slug !== activitySlug(place)) throw redirect(activityPath(place), 301);
  return { place };
}

export const meta: Route.MetaFunction = ({ loaderData }) => {
  if (!loaderData) return [{ title: "Activity Unavailable | Urbn" }];
  const p = loaderData.place;
  const title = placeTitle(p);
  const kind = p.businessCategory || ACTIVITY_META[p.activityType].label;
  const where = p.property.city ?? "Ibadan";
  return seo({
    title: `${title}: ${kind} in ${where}`,
    description: (p.description ?? `${title}, ${kind.toLowerCase()} at ${p.property.address}. Get directions with Urbn Nearby.`).slice(0, 155),
    path: activityPath(p),
    image: p.imageUrl ?? undefined,
    // Sample places stay out of search indexes.
    noindex: p.sample,
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "Place",
        name: title,
        description: p.description ?? undefined,
        address: { "@type": "PostalAddress", streetAddress: p.property.address, addressLocality: where, addressCountry: "NG" },
        ...(p.lat != null && p.lng != null ? { geo: { "@type": "GeoCoordinates", latitude: p.lat, longitude: p.lng } } : {}),
        url: absoluteUrl(activityPath(p)),
      },
      breadcrumbs([
        { name: "Home", path: "/" },
        { name: "Nearby", path: "/nearby" },
        { name: title, path: activityPath(p) },
      ]),
    ],
  });
};

export default function NearbyActivity({ loaderData }: Route.ComponentProps) {
  const { place } = loaderData;
  const from = (useLocation().state as { from?: string } | null)?.from ?? "";
  return (
    <>
      <section className="bg-[#F9FAFB] pt-6 pb-16 sm:pt-10 sm:pb-24">
        <div className="container-x">
          <Link to={`/nearby${from}`} className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-ink">
            <ChevronLeft className="size-4" /> Nearby
          </Link>
          <motion.div
            className="mx-auto mt-6 max-w-2xl rounded-[1.75rem] bg-white p-4 ring-1 ring-black/5 sm:p-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <NearbyDetail place={place} images={place.images} />
          </motion.div>
          <p className="mx-auto mt-6 max-w-2xl text-center text-sm text-neutral-500">
            Looking for something else?{" "}
            <Link to="/nearby" className="font-semibold text-urbn hover:underline">
              Explore Nearby →
            </Link>
          </p>
        </div>
      </section>
      <CtaBanner />
    </>
  );
}
