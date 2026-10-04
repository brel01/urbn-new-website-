import { MapPin } from "lucide-react";
import { data, Link } from "react-router";
import { CtaBanner } from "~/components/cta-banner";
import { ListingCard } from "~/components/listing-card";
import { Reveal, Stagger, StaggerItem } from "~/components/motion";
import { ButtonLink } from "~/components/ui";
import { WaitlistForm } from "~/components/waitlist-form";
import { searchListings } from "~/lib/marketplace/source.server";
import { getPlace, LIVE_AREAS, PLACES } from "~/lib/places";
import { breadcrumbs, seo } from "~/lib/seo";
import type { Route } from "./+types/listings-place";

export async function loader({ params }: Route.LoaderArgs) {
  const place = getPlace(params.place);
  if (!place) throw data("Not found", { status: 404 });
  const listings = place.live ? (await searchListings({ search: place.kind === "city" ? place.city : place.name, limit: 24 })).data : [];
  return { place, listings };
}

export const meta: Route.MetaFunction = ({ loaderData }) => {
  if (!loaderData) return [{ title: "Not found | Urbn" }];
  const { place, listings } = loaderData;
  const where = place.kind === "area" ? `${place.name}, ${place.city}` : place.name;
  return seo({
    title: place.live ? `Verified Homes for Rent & Sale in ${where}` : `Urbn in ${where}: Coming Soon`,
    description: place.live
      ? `${listings.length} verified ${listings.length === 1 ? "home" : "homes"} in ${where}, each with a permanent DPI. ${place.blurb}`
      : `Verified property listings with Digital Property Identity are coming to ${where}. Join the Urbn waitlist to hear first.`,
    path: `/listings/in/${place.slug}`,
    jsonLd: breadcrumbs([
      { name: "Home", path: "/" },
      { name: "Listings", path: "/listings" },
      { name: place.name, path: `/listings/in/${place.slug}` },
    ]),
  });
};

export default function PlacePage({ loaderData }: Route.ComponentProps) {
  const { place, listings } = loaderData;
  const where = place.kind === "area" ? `${place.name}, ${place.city}` : place.name;
  return (
    <>
      <section className="relative overflow-hidden bg-ink text-white">
        <div aria-hidden className="pattern-u absolute inset-0 bg-white/[0.04]" />
        <div className="container-x relative py-20 sm:py-28">
          <Reveal>
            <p className="eyebrow text-blue-400">
              <MapPin className="size-4" /> {place.live ? "Live on Urbn" : "Coming soon"}
            </p>
            <h1 className="mt-4 max-w-3xl text-5xl leading-[1] sm:text-7xl">
              {place.live ? (
                <>Verified homes in <span className="text-blue-400">{place.name}</span></>
              ) : (
                <>Urbn is coming to <span className="text-blue-400">{place.name}</span></>
              )}
            </h1>
            <p className="mt-6 max-w-xl text-lg text-neutral-400">{place.blurb}</p>
          </Reveal>
          {place.live && (
            <nav aria-label="Areas" className="mt-10 flex flex-wrap gap-2">
              {[PLACES[0], ...LIVE_AREAS].map((a) => (
                <Link
                  key={a.slug}
                  to={`/listings/in/${a.slug}`}
                  className={`rounded-full px-4 py-2 text-sm transition ${a.slug === place.slug ? "bg-white text-ink" : "bg-white/[0.07] text-neutral-300 hover:bg-white/15"}`}
                >
                  {a.name}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </section>

      {place.live ? (
        <section className="container-x py-16 sm:py-24">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-3xl">
              {listings.length} verified {listings.length === 1 ? "home" : "homes"} in {where}
            </h2>
            <ButtonLink to={`/listings?search=${encodeURIComponent(place.kind === "area" ? place.name : place.city)}#search`} variant="outline" size="sm">
              Filter & search
            </ButtonLink>
          </div>
          {listings.length > 0 ? (
            <Stagger className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" as="ul">
              {listings.map((l) => (
                <StaggerItem key={l.id} as="li">
                  <ListingCard listing={l} />
                </StaggerItem>
              ))}
            </Stagger>
          ) : (
            <p className="lede mt-8">New verified homes in {place.name} are on the way. Check back soon.</p>
          )}
        </section>
      ) : (
        <section className="container-x grid gap-10 py-16 sm:py-24 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl">Be first to know when we launch in {place.name}.</h2>
            <p className="lede mt-4">
              We're expanding carefully, city by city, because verification only works if you can trust it. Join the
              waitlist and we'll tell you the moment verified homes go live in {place.name}.
            </p>
          </div>
          <div className="rounded-card bg-ink p-6 sm:p-8">
            <WaitlistForm />
          </div>
        </section>
      )}
      <CtaBanner />
    </>
  );
}
