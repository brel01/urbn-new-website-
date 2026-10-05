import { ChevronLeft, Info, MapPin, Navigation, Phone, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import { data, Link, redirect, useLocation } from "react-router";
import { PlaceCard, PlaceIcon, SampleBadge } from "~/components/nearby";
import { EASE, Reveal } from "~/components/motion";
import { ButtonLink } from "~/components/ui";
import { verifyPath } from "~/lib/dpi";
import { ACTIVITY_META, placeSubtitle, placeTitle } from "~/lib/nearby/categories";
import { getNearbyPlace, placesAround } from "~/lib/nearby/source.server";
import { activityPath, activitySlug } from "~/lib/nearby/types";
import { breadcrumbs, seo } from "~/lib/seo";
import { absoluteUrl } from "~/lib/site";
import type { Route } from "./+types/nearby-activity";

export async function loader({ params }: Route.LoaderArgs) {
  // Resolved by immutable id; closed, private and missing records all 404 here.
  const place = await getNearbyPlace(params.id);
  if (!place) throw data("Activity Unavailable", { status: 404 });
  // Compare route params, not request.url (data requests carry a .data suffix).
  if (params.slug !== activitySlug(place)) throw redirect(activityPath(place), 301);
  const around =
    place.lat != null && place.lng != null
      ? (await placesAround({ lat: place.lat, lng: place.lng }, place.property.dpi, 4)).places
      : [];
  return { place, around };
}

export const meta: Route.MetaFunction = ({ loaderData }) => {
  if (!loaderData) return [{ title: "Activity Unavailable | Urbn" }];
  const p = loaderData.place;
  const title = placeTitle(p);
  const where = p.property.area ?? p.property.city ?? "Ibadan";
  return seo({
    title: `${title}: ${ACTIVITY_META[p.activityType].label} in ${where}`,
    description: (p.description ?? `${title}, a ${ACTIVITY_META[p.activityType].label.toLowerCase()} recorded at a property in ${where}.`).slice(0, 155),
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
        address: { "@type": "PostalAddress", streetAddress: p.property.address, addressLocality: p.property.city ?? "Ibadan", addressCountry: "NG" },
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
  const { place: p, around } = loaderData;
  const location = useLocation();
  const back = `/nearby${(location.state as { from?: string } | null)?.from ?? ""}`;
  const m = ACTIVITY_META[p.activityType];
  const title = placeTitle(p);
  const record = verifyPath(p.property.dpi, p.unit?.unitNumber);
  const directions = p.lat != null && p.lng != null ? `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}` : null;
  const socials = Object.entries(p.socialLinks ?? {}).filter(([, v]) => !!v) as [string, string][];

  return (
    <>
      <section className="container-x pt-6 pb-16 sm:pt-10">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-neutral-500">
          <Link to={back} className="inline-flex items-center gap-1 hover:text-ink">
            <ChevronLeft className="size-4" /> Nearby
          </Link>
          <span aria-hidden>/</span>
          <span className="truncate text-ink">{title}</span>
        </nav>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_22rem] lg:gap-12">
          <div>
            <motion.header initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE }} className="flex items-start gap-4">
              {p.imageUrl ? (
                <img src={p.imageUrl} alt="" className="size-20 shrink-0 rounded-2xl object-cover" />
              ) : (
                <PlaceIcon type={p.activityType} size="lg" />
              )}
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${m.tint}`}>
                    <m.icon className="size-3.5" /> {m.label}
                  </span>
                  {p.sample && <SampleBadge />}
                </div>
                <h1 className="mt-2 text-3xl leading-tight sm:text-5xl">{title}</h1>
                <p className="mt-1 text-neutral-500">{placeSubtitle(p)}</p>
              </div>
            </motion.header>

            {p.images.length > 0 && (
              <div className="no-scrollbar -mx-4 mt-8 flex snap-x gap-3 overflow-x-auto px-4 sm:mx-0 sm:px-0">
                {p.images.map((src, i) => (
                  <img key={src} src={src} alt={`${title}, photo ${i + 1}`} loading="lazy" className="h-56 w-auto shrink-0 snap-start rounded-2xl object-cover sm:h-72" />
                ))}
              </div>
            )}

            {p.description && (
              <Reveal className="mt-8 max-w-2xl">
                <h2 className="font-sans text-sm font-semibold tracking-normal text-neutral-500 uppercase">About</h2>
                <p className="mt-2 text-[17px] leading-relaxed text-neutral-800">{p.description}</p>
              </Reveal>
            )}

            <Reveal className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-mist p-4">
                <p className="flex items-center gap-1.5 text-xs text-neutral-500"><MapPin className="size-3.5" /> Location</p>
                <p className="mt-1 font-medium">{p.property.address}</p>
                {p.unit && <p className="text-sm text-neutral-500">Unit {p.unit.unitNumber}</p>}
              </div>
              {p.contactPhone && (
                <a href={`tel:${p.contactPhone}`} className="rounded-2xl bg-mist p-4 transition hover:bg-fog">
                  <p className="flex items-center gap-1.5 text-xs text-neutral-500"><Phone className="size-3.5" /> Contact</p>
                  <p className="mt-1 font-medium">{p.contactPhone}</p>
                </a>
              )}
              {socials.length > 0 && (
                <div className="rounded-2xl bg-mist p-4 sm:col-span-2">
                  <p className="text-xs text-neutral-500">Online</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {socials.map(([k, v]) => (
                      <a key={k} href={v.startsWith("http") ? v : `https://${v}`} target="_blank" rel="noopener nofollow" className="rounded-full bg-white px-3 py-1 text-sm font-medium capitalize hover:text-urbn">
                        {k}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </Reveal>
          </div>

          <aside className="space-y-3 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl bg-ink p-5 text-white">
              <p className="flex items-center gap-2 text-[10px] font-semibold tracking-widest text-blue-300 uppercase">
                <ShieldCheck className="size-4" /> Connected Property Record
              </p>
              <p className="mt-3 font-mono text-lg">{p.property.dpi}{p.unit ? `/${p.unit.unitNumber}` : ""}</p>
              <p className="mt-1 text-sm text-neutral-400">{p.unit ? `Recorded at unit ${p.unit.unitNumber} of this property.` : "Recorded at this property."}</p>
              <ButtonLink to={record} variant="light" className="mt-4 w-full">View Property Record</ButtonLink>
            </div>
            <div className="grid gap-2">
              {directions && (
                <a href={directions} target="_blank" rel="noopener" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-white text-sm font-semibold ring-1 ring-black/10 hover:ring-ink">
                  <Navigation className="size-4" /> Get Directions
                </a>
              )}
              <ButtonLink to="/download" variant="outline" className="w-full">Get the Urbn App</ButtonLink>
            </div>
            <p className="flex gap-2 px-1 text-xs leading-relaxed text-neutral-500">
              <Info className="mt-0.5 size-3.5 shrink-0" />
              An active record means this use is recorded at the property, not that it is open right now. Property verification is separate:
              it doesn't mean Urbn licenses or endorses this place.
            </p>
          </aside>
        </div>
      </section>

      {around.length > 0 && (
        <section className="bg-mist py-14 sm:py-20">
          <div className="container-x">
            <div className="flex items-end justify-between gap-4">
              <h2 className="text-2xl sm:text-3xl">More Places Around Here</h2>
              <Link to={`/nearby${p.property.area ? `?area=${p.property.area.toLowerCase()}` : ""}`} className="text-sm font-semibold text-urbn hover:underline">
                Explore This Area →
              </Link>
            </div>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {around.map((a) => (
                <li key={a.id}><PlaceCard place={a} compact /></li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
