// A shareable page for one Nearby place, with the same content as the app's
// ActivityDetailSheet (photos, name, type · category, location, About, Contact,
// Get Directions). On /nearby the same content opens as a sheet.
import { ChevronLeft } from "lucide-react";
import { motion } from "motion/react";
import { data, Link, redirect, useLocation } from "react-router";
import { CtaBanner } from "~/components/cta-banner";
import { EASE } from "~/components/motion";
import { NearbyDetail, NearbyListCard } from "~/components/nearby";
import { ACTIVITY_META, placeTitle } from "~/lib/nearby/categories";
import { HUB_TYPES, hubPath, placeJsonLd } from "~/lib/nearby/seo";
import { getNearbyPlace, searchNearby } from "~/lib/nearby/source.server";
import { areaFromAddress } from "~/lib/places";
import { activityPath, activitySlug } from "~/lib/nearby/types";
import { breadcrumbs, seo } from "~/lib/seo";
import type { Route } from "./+types/nearby-activity";

export async function loader({ params }: Route.LoaderArgs) {
  // Resolved by id; closed, private and missing records all 404, as in the app.
  const place = await getNearbyPlace(params.id);
  if (!place) throw data("Activity Unavailable", { status: 404 });
  // Compare route params, not request.url (data requests carry a .data suffix).
  if (params.slug !== activitySlug(place)) throw redirect(activityPath(place), 301);
  // Internal links: more of the same kind around this place, and its area/category pages.
  const area = areaFromAddress(place.property.address);
  const more =
    place.lat != null && place.lng != null
      ? (await searchNearby({ lat: place.lat, lng: place.lng, radius: 5, type: place.activityType, limit: 7 })).places.filter((p) => p.id !== place.id).slice(0, 6)
      : [];
  return { place, more, areaSlug: area?.slug ?? "ibadan", areaName: area?.name ?? place.property.city ?? "Ibadan" };
}

export function headers() {
  return { "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400" };
}

export const meta: Route.MetaFunction = ({ loaderData }) => {
  if (!loaderData) return [{ title: "Activity Unavailable | Urbn" }];
  const { place: p, areaSlug, areaName } = loaderData;
  const title = placeTitle(p);
  const kind = p.businessCategory || ACTIVITY_META[p.activityType].label;
  const city = p.property.city ?? "Ibadan";
  const where = areaName && areaName !== city ? `${areaName}, ${city}` : city;
  const hasHub = HUB_TYPES.includes(p.activityType);
  return seo({
    // "Kolapo Pharmacy: Pharmacy in Bodija, Ibadan" matches "pharmacy in bodija" searches.
    title: `${title}: ${kind} in ${where}`,
    description: (p.description
      ? `${title}, ${kind.toLowerCase()} at ${p.property.address}. ${p.description}`
      : `${title}, ${kind.toLowerCase()} at ${p.property.address}, ${where}. See contact details and get directions on Urbn Nearby.`
    ).slice(0, 158),
    path: activityPath(p),
    image: p.images[0] ?? p.imageUrl ?? undefined,
    imageAlt: `${title}, ${where}`,
    // Sample places stay out of search indexes.
    noindex: p.sample,
    jsonLd: [
      placeJsonLd(p),
      breadcrumbs([
        { name: "Home", path: "/" },
        { name: "Nearby", path: "/nearby" },
        { name: areaName, path: hubPath(areaSlug) },
        ...(hasHub ? [{ name: ACTIVITY_META[p.activityType].plural, path: hubPath(areaSlug, p.activityType) }] : []),
        { name: title, path: activityPath(p) },
      ]),
    ],
  });
};

export default function NearbyActivity({ loaderData }: Route.ComponentProps) {
  const { place, more, areaSlug, areaName } = loaderData;
  const m = ACTIVITY_META[place.activityType];
  const hasHub = HUB_TYPES.includes(place.activityType);
  const from = (useLocation().state as { from?: string } | null)?.from ?? "";
  return (
    <>
      <section className="bg-[#F9FAFB] pt-6 pb-16 sm:pt-10 sm:pb-24">
        <div className="container-x">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-sm text-neutral-500">
            <Link to={`/nearby${from}`} className="inline-flex items-center gap-1 hover:text-ink">
              <ChevronLeft className="size-4" /> Nearby
            </Link>
            <span aria-hidden>/</span>
            <Link to={hubPath(areaSlug)} className="hover:text-ink">{areaName}</Link>
            {hasHub && (
              <>
                <span aria-hidden>/</span>
                <Link to={hubPath(areaSlug, place.activityType)} className="hover:text-ink">{m.plural}</Link>
              </>
            )}
          </nav>
          <motion.div
            className="mx-auto mt-6 max-w-2xl rounded-[1.75rem] bg-white p-4 ring-1 ring-black/5 sm:p-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <NearbyDetail place={place} images={place.images} extras={place.extras} />
          </motion.div>
          {more.length > 0 && (
            <div className="mx-auto mt-12 max-w-5xl">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <h2 className="text-2xl sm:text-3xl">More {m.plural} Nearby</h2>
                {hasHub && (
                  <Link to={hubPath(areaSlug, place.activityType)} className="text-sm font-semibold text-urbn hover:underline">
                    All {m.plural} in {areaName} →
                  </Link>
                )}
              </div>
              <ul className="mt-5 grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {more.map((p) => (
                  <li key={p.id}><NearbyListCard place={p} to={activityPath(p)} /></li>
                ))}
              </ul>
            </div>
          )}
          <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-neutral-500">
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
