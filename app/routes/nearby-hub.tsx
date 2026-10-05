// Crawlable "Places in Bodija" and "Clinics in Bodija, Ibadan" pages. They match how
// people search, list every place with a real link to its page, and cross-link
// areas and categories so search engines can reach every activity page.
import { MapPin } from "lucide-react";
import { data, Link } from "react-router";
import { CtaBanner } from "~/components/cta-banner";
import { Reveal } from "~/components/motion";
import { NearbyListCard, SampleBadge } from "~/components/nearby";
import { ButtonLink } from "~/components/ui";
import { ACTIVITY_META, placeTitle } from "~/lib/nearby/categories";
import { HUB_TYPES, hubPath, typeFromSlug } from "~/lib/nearby/seo";
import { nearbyCategories, searchNearby } from "~/lib/nearby/source.server";
import { activityPath, MAX_RADIUS } from "~/lib/nearby/types";
import { getPlace, LIVE_AREAS, PLACES } from "~/lib/places";
import { breadcrumbs, seo } from "~/lib/seo";
import { absoluteUrl } from "~/lib/site";
import type { Route } from "./+types/nearby-hub";

const HUB_AREAS = [PLACES[0], ...LIVE_AREAS];

export async function loader({ params }: Route.LoaderArgs) {
  const area = getPlace(params.area);
  if (!area?.live || !area.center) throw data("Not found", { status: 404 });
  const type = params.category ? typeFromSlug(params.category) : undefined;
  if (params.category && !type) throw data("Not found", { status: 404 });
  // Area pages cover the neighbourhood; the city page covers the whole city.
  const radius = area.kind === "city" ? MAX_RADIUS : 3;
  const q = { area: area.slug, radius, type, limit: 50 };
  const [result, categories] = await Promise.all([searchNearby(q), nearbyCategories({ area: area.slug, radius })]);
  return { area: { slug: area.slug, name: area.name, city: area.city, kind: area.kind }, type: type ?? null, result, categories };
}

export function headers() {
  return { "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400" };
}

const heading = (type: string | null, area: { name: string; city: string; kind: string }) => {
  const where = area.kind === "city" ? area.name : `${area.name}, ${area.city}`;
  return type ? `${ACTIVITY_META[type as keyof typeof ACTIVITY_META].plural} in ${where}` : `Places Nearby in ${where}`;
};

export const meta: Route.MetaFunction = ({ loaderData }) => {
  if (!loaderData) return [{ title: "Not found | Urbn" }];
  const { area, type, result } = loaderData;
  const title = heading(type, area);
  const n = result.meta.total;
  const what = type ? ACTIVITY_META[type].plural.toLowerCase() : "businesses, schools, clinics, restaurants and other places";
  const path = hubPath(area.slug, type ?? undefined);
  return seo({
    title,
    description: `${n > 0 ? `${n} ` : ""}${what} in ${area.kind === "city" ? area.name : `${area.name}, ${area.city}`}, recorded on Urbn. See addresses, contact details and directions.`.replace(/^./, (c) => c.toUpperCase()),
    path,
    // Thin or illustrative pages stay out of the index until they have real places.
    noindex: result.source === "sample" || n === 0,
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: title,
        numberOfItems: n,
        itemListElement: result.places.map((p, i) => ({ "@type": "ListItem", position: i + 1, url: absoluteUrl(activityPath(p)), name: placeTitle(p) })),
      },
      breadcrumbs([
        { name: "Home", path: "/" },
        { name: "Nearby", path: "/nearby" },
        { name: area.name, path: hubPath(area.slug) },
        ...(type ? [{ name: ACTIVITY_META[type].plural, path }] : []),
      ]),
    ],
  });
};

export default function NearbyHub({ loaderData }: Route.ComponentProps) {
  const { area, type, result, categories } = loaderData;
  const title = heading(type, area);
  const counts = new Map(categories.map((c) => [c.value, c.count]));
  const n = result.meta.total;
  const plural = type ? (n === 1 ? ACTIVITY_META[type].label : ACTIVITY_META[type].plural) : n === 1 ? "place" : "places";
  const sample = result.source === "sample";

  return (
    <>
      <section className="relative overflow-hidden bg-ink text-white">
        <div aria-hidden className="pattern-u absolute inset-0 bg-white/[0.04]" />
        <div className="container-x relative py-16 sm:py-24">
          <Reveal>
            <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-sm text-neutral-400">
              <Link to="/nearby" className="hover:text-white">Nearby</Link>
              <span aria-hidden>/</span>
              {type ? <Link to={hubPath(area.slug)} className="hover:text-white">{area.name}</Link> : <span className="text-white">{area.name}</span>}
              {type && (
                <>
                  <span aria-hidden>/</span>
                  <span className="text-white">{ACTIVITY_META[type].plural}</span>
                </>
              )}
            </nav>
            <p className="eyebrow mt-6 text-blue-400">
              <MapPin className="size-4" /> Nearby
            </p>
            <h1 className="mt-4 max-w-3xl text-5xl leading-[1] sm:text-7xl">
              {type ? ACTIVITY_META[type].plural : "Places Nearby"} in <span className="text-blue-400">{area.name}</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-neutral-400">
              {result.meta.total > 0
                ? `${result.meta.total} ${plural.toLowerCase()} recorded at properties in ${area.kind === "city" ? area.name : `${area.name}, ${area.city}`}. Open one for its address, contact details and directions.`
                : `No ${plural.toLowerCase()} are recorded in ${area.name} yet.`}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink to={`/nearby?area=${area.slug}${type ? `&type=${type}` : ""}#search`} variant="light">
                Explore on the Map
              </ButtonLink>
            </div>
          </Reveal>
          <nav aria-label="Areas" className="mt-10 flex flex-wrap gap-2">
            {HUB_AREAS.map((a) => (
              <Link
                key={a.slug}
                to={hubPath(a.slug, type ?? undefined)}
                className={`rounded-full px-4 py-2 text-sm transition ${a.slug === area.slug ? "bg-white text-ink" : "bg-white/[0.07] text-neutral-300 hover:bg-white/15"}`}
              >
                {a.name}
              </Link>
            ))}
          </nav>
        </div>
      </section>

      <section className="bg-[#F9FAFB] py-12 sm:py-16">
        <div className="container-x">
          <nav aria-label="Categories" className="flex flex-wrap gap-2">
            <Link
              to={hubPath(area.slug)}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition ${!type ? "bg-ink text-white" : "border border-neutral-200 bg-white hover:border-neutral-400"}`}
            >
              All
            </Link>
            {HUB_TYPES.filter((t) => counts.get(t)).map((t) => (
              <Link
                key={t}
                to={hubPath(area.slug, t)}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition ${type === t ? "bg-ink text-white" : "border border-neutral-200 bg-white hover:border-neutral-400"}`}
              >
                {ACTIVITY_META[t].label} · {counts.get(t)}
              </Link>
            ))}
          </nav>
          {sample && (
            <p className="mt-4 flex items-center gap-2 text-xs text-neutral-500">
              <SampleBadge /> Sample places until live data is connected.
            </p>
          )}
          {result.places.length > 0 ? (
            <ul className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {result.places.map((p) => (
                <li key={p.id}>
                  <NearbyListCard place={p} to={activityPath(p)} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-6 rounded-2xl bg-white p-6 text-center ring-1 ring-black/5">
              <p className="text-sm font-semibold">Nothing found nearby</p>
              <p className="mt-1 text-xs text-neutral-500">Try another area or category.</p>
            </div>
          )}
          {type && (
            <p className="mt-10 text-sm text-neutral-600">
              {ACTIVITY_META[type].plural} in other areas:{" "}
              {HUB_AREAS.filter((a) => a.slug !== area.slug).map((a, i) => (
                <span key={a.slug}>
                  {i > 0 && " · "}
                  <Link to={hubPath(a.slug, type)} className="font-semibold text-urbn hover:underline">{a.name}</Link>
                </span>
              ))}
            </p>
          )}
        </div>
      </section>
      <CtaBanner />
    </>
  );
}

