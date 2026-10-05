import { clsx } from "clsx";
import {
  Bath,
  BedDouble,
  Building2,
  CalendarCheck,
  CalendarDays,
  Check,
  ChevronLeft,
  Eye,
  Heart,
  Home,
  MapPin,
  MessageCircle,
  Navigation,
  PawPrint,
  Play,
  Ruler,
  Share2,
  ShieldCheck,
  Star,
  User,
  Video,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { data, Link, redirect } from "react-router";
import { ListingCard } from "~/components/listing-card";
import { EASE, Reveal } from "~/components/motion";
import { Plaque } from "~/components/plaque";
import { BottomBar } from "~/components/mobile";
import { ButtonLink } from "~/components/ui";
import { appDeepLink, verifyPath } from "~/lib/dpi";
import { getListing, similarListings } from "~/lib/marketplace/source.server";
import {
  formatCount,
  formatPrice,
  formatTextCase,
  listedByLabel,
  listingPath,
  listingTypeLabel,
  roomCount,
} from "~/lib/marketplace/types";
import { breadcrumbs, seo } from "~/lib/seo";
import { absoluteUrl } from "~/lib/site";
import { PlaceCard } from "~/components/nearby";
import { placesAround, placesAtProperty } from "~/lib/nearby/source.server";
import { PLACES } from "~/lib/places";
import type { Route } from "./+types/listing";

export async function loader({ params }: Route.LoaderArgs) {
  const listing = await getListing(decodeURIComponent(params.id));
  if (!listing) throw data("Listing Unavailable", { status: 404 });
  // Compare route params, not request.url (v8 data requests carry a .data suffix).
  const canonical = listingPath(listing);
  if (params.slug !== canonical.split("/").pop()) throw redirect(canonical, 301);
  const point = listing.latitude != null && listing.longitude != null ? { lat: listing.latitude, lng: listing.longitude } : null;
  // The search origin is resolved here on the server; only results and distances reach the page.
  const [similar, around, atProperty] = await Promise.all([
    similarListings(listing.id, 3),
    point ? placesAround(point, listing.dpi ?? null, 4) : null,
    listing.dpi ? placesAtProperty({ propertyId: listing.propertyId ?? null, dpi: listing.dpi }) : [],
  ]);
  const addr = listing.propertyAddress.toLowerCase();
  const nearbyArea = PLACES.find((p) => p.live && p.kind === "area" && [p.name.toLowerCase(), ...p.aliases].some((a) => addr.includes(a)))?.slug ?? "ibadan";
  return { listing, similar, around: around?.places ?? [], atProperty, nearbyArea };
}

const fmtDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : null;

// Phones swap the tab bar for a sticky price + Book Inspection bar.
export const handle = { hideTabBar: true };

export const meta: Route.MetaFunction = ({ loaderData }) => {
  if (!loaderData) return [{ title: "Listing Unavailable | Urbn" }];
  const l = loaderData.listing;
  const beds = roomCount(l, "Bedroom");
  const what = [beds && `${beds}-bedroom`, l.structureType ?? formatTextCase(l.propertyBuildingType)].filter(Boolean).join(" ");
  const where = [l.propertyAddress.split(",").slice(-1)[0]?.trim(), l.propertyCity].filter(Boolean).join(", ");
  return seo({
    title: `${l.propertyTitle}: ${what} ${listingTypeLabel(l.listingType).toLowerCase()} in ${where}`,
    description: `${what || "Property"} in ${where}, ${formatPrice(l.price, l.rentPeriod, true)}. View listing details and check the property's current Urbn record.`,
    path: listingPath(l),
    image: l.images[0] ?? undefined,
    imageAlt: `${l.propertyTitle} in ${where}`,
    type: "product",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "RealEstateListing",
        name: `${l.propertyTitle}: ${what} in ${where}`,
        url: absoluteUrl(listingPath(l)),
        image: l.images.map((i) => absoluteUrl(i)),
        description: l.description ?? undefined,
        datePosted: l.publishedAt ?? l.createdAt,
        offers: {
          "@type": "Offer",
          price: l.price,
          priceCurrency: "NGN",
          availability: "https://schema.org/InStock",
          businessFunction: l.listingType === "Sale" ? "http://purl.org/goodrelations/v1#Sell" : "http://purl.org/goodrelations/v1#LeaseOut",
          ...(l.rentPeriod && {
            priceSpecification: { "@type": "UnitPriceSpecification", price: l.price, priceCurrency: "NGN", unitText: l.rentPeriod.toUpperCase() },
          }),
        },
        about: {
          "@type": ["Apartment", "MiniFlat", "BlockOfFlats", "Penthouse"].includes(l.propertyBuildingType) ? "Apartment" : "SingleFamilyResidence",
          numberOfBedrooms: beds ?? undefined,
          numberOfBathroomsTotal: roomCount(l, "Bathroom") ?? undefined,
          floorSize: l.squareFootage ? { "@type": "QuantitativeValue", value: l.squareFootage, unitCode: "MTK" } : undefined,
          petsAllowed: l.allowPets ?? undefined,
          address: { "@type": "PostalAddress", streetAddress: l.propertyAddress, addressLocality: l.propertyCity, addressRegion: l.propertyState, addressCountry: "NG" },
          geo: l.latitude != null ? { "@type": "GeoCoordinates", latitude: l.latitude, longitude: l.longitude } : undefined,
          identifier: l.dpi ? { "@type": "PropertyValue", propertyID: "Urbn DPI", value: l.dpi } : undefined,
        },
      },
      breadcrumbs([
        { name: "Home", path: "/" },
        { name: "Listings", path: "/listings" },
        { name: l.propertyCity, path: `/listings?search=${encodeURIComponent(l.propertyCity)}` },
        { name: l.propertyTitle, path: listingPath(l) },
      ]),
    ],
  });
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <h2 className="font-sans text-lg font-bold tracking-normal">{children}</h2>;
}

export default function ListingPage({ loaderData }: Route.ComponentProps) {
  const { listing: l, similar, around, atProperty, nearbyArea } = loaderData;
  const [img, setImg] = useState(0);
  const [mode, setMode] = useState<"physical" | "virtual">(l.inspectionType === "VIRTUAL" ? "virtual" : "physical");
  const [saved, setSaved] = useState(false);
  const [shared, setShared] = useState(false);
  const beds = roomCount(l, "Bedroom");
  const baths = roomCount(l, "Bathroom");
  const hasVideo = !!(l.listingVideoUrl ?? l.propertyVideoUrl);
  const canPhysical = l.inspectionType !== "VIRTUAL";
  const canVirtual = l.inspectionType === "VIRTUAL" || l.inspectionType === "BOTH";
  const keyFeatures = l.keyFeatures?.split("\n").map((s) => s.trim()).filter(Boolean) ?? [];
  const costs = [
    l.deposit && ["Caution Deposit", l.deposit],
    l.serviceCharge && ["Service Charge", l.serviceCharge],
    l.legalFee && ["Legal Fee", l.legalFee],
  ].filter(Boolean) as [string, number][];
  const amenities = [...l.securityFeatures, ...l.outdoorFeatures, ...l.waterSources, ...l.electricitySources];

  const share = async () => {
    const url = absoluteUrl(listingPath(l));
    try {
      if (navigator.share) await navigator.share({ title: l.propertyTitle, url });
      else {
        await navigator.clipboard.writeText(url);
        setShared(true);
        setTimeout(() => setShared(false), 1600);
      }
    } catch {
      /* dismissed */
    }
  };

  return (
    <div className="bg-[#F9FAFB]">
      <MobileGallery
        images={l.images}
        title={l.propertyTitle}
        badges={
          <>
            {l.isFeatured && <span className="inline-flex items-center gap-1 rounded-full bg-urbn px-3 py-1 text-[11px] font-bold text-white"><Star className="size-3 fill-white" /> Featured</span>}
            <span className="rounded-full bg-black px-3 py-1 text-[11px] font-bold text-white">{listingTypeLabel(l.listingType)}</span>
          </>
        }
        saved={saved}
        onSave={() => setSaved((v) => !v)}
        onShare={share}
        shared={shared}
      />
      <div className="container-x hidden pt-6 lg:block">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-neutral-500">
          <Link to="/listings" className="inline-flex items-center gap-1 hover:text-ink">
            <ChevronLeft className="size-4" /> Listings
          </Link>
          <span>/</span>
          <Link to={`/listings?search=${encodeURIComponent(l.propertyCity)}`} className="hover:text-ink">{l.propertyCity}</Link>
          <span>/</span>
          <span className="truncate text-ink">{l.propertyTitle}</span>
        </nav>
      </div>

      {/* Hero gallery (desktop) */}
      <section className="container-x mt-5 hidden lg:block">
        <div className="grid gap-3 lg:grid-cols-[2fr_1fr]">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-mist sm:aspect-[16/10]">
            <AnimatePresence initial={false}>
              {l.images[img] ? (
                <motion.img
                  key={img}
                  src={l.images[img]}
                  alt={`${l.propertyTitle}, photo ${img + 1} of ${l.images.length}`}
                  className="absolute inset-0 size-full object-cover"
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: EASE }}
                />
              ) : (
                <div className="absolute inset-0 grid place-items-center text-neutral-300"><Home className="size-12" /></div>
              )}
            </AnimatePresence>
            <div className="absolute top-4 left-4 flex gap-2">
              {l.isFeatured && (
                <span className="inline-flex items-center gap-1 rounded-full bg-urbn px-3 py-1 text-[11px] font-bold text-white"><Star className="size-3 fill-white" /> Featured</span>
              )}
              <span className="rounded-full bg-black px-3 py-1 text-[11px] font-bold text-white">{listingTypeLabel(l.listingType)}</span>
            </div>
            <div className="absolute top-4 right-4 flex gap-2">
              <button type="button" onClick={share} aria-label="Share Listing" className="grid size-10 place-items-center rounded-full bg-white/90 backdrop-blur hover:bg-white">
                {shared ? <Check className="size-4 text-success" /> : <Share2 className="size-4" />}
              </button>
              <button type="button" onClick={() => setSaved((s) => !s)} aria-pressed={saved} aria-label="Save Listing" className="grid size-10 place-items-center rounded-full bg-white/90 backdrop-blur hover:bg-white">
                <Heart className={clsx("size-4", saved && "fill-error text-error")} />
              </button>
            </div>
            {hasVideo && (
              <a href="/download" className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-black/70 py-1.5 pr-4 pl-1.5 text-sm text-white backdrop-blur hover:bg-black">
                <span className="grid size-8 place-items-center rounded-full bg-white text-ink"><Play className="size-3.5 fill-ink" /></span>
                Watch Video in the App
              </a>
            )}
          </div>
          {l.images.length > 1 && (
            <div className="relative">
            <div className="grid grid-cols-3 gap-3 lg:absolute lg:inset-0 lg:grid-cols-1 lg:grid-rows-3">
              {l.images.slice(0, 3).map((src, i) => (
                <button
                  key={src + i}
                  type="button"
                  onClick={() => setImg(i)}
                  aria-label={`Show photo ${i + 1}`}
                  aria-current={img === i}
                  className={clsx("min-h-0 overflow-hidden rounded-xl ring-2 ring-offset-2 ring-offset-[#F9FAFB] transition", img === i ? "ring-urbn" : "ring-transparent opacity-80 hover:opacity-100")}
                >
                  <img src={src} alt="" loading="lazy" className="aspect-[4/3] size-full object-cover lg:aspect-auto" />
                </button>
              ))}
            </div>
            </div>
          )}
        </div>
      </section>

      <section className="container-x relative z-10 -mt-6 grid gap-10 pb-28 lg:mt-8 lg:grid-cols-[1fr_23rem] lg:pb-24">
        <div className="space-y-5">
          {/* Header */}
          <Reveal className="rounded-2xl bg-white p-5 sm:p-6">
            <p className="text-3xl font-bold tracking-tight sm:text-4xl">
              {formatPrice(l.price, l.rentPeriod)}
              {l.isNegotiable && <span className="ml-2 align-middle text-xs font-semibold text-neutral-500">Negotiable</span>}
            </p>
            <h1 className="mt-2 font-sans text-2xl font-bold tracking-tight sm:text-3xl">{l.propertyTitle}</h1>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-neutral-500">
              <MapPin className="size-4" /> {[l.propertyAddress, l.propertyCity, l.propertyState].join(", ")}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-neutral-100 pt-4 text-xs text-neutral-500">
              <span className="inline-flex items-center gap-1"><Eye className="size-3.5" /> {formatCount(l.views)} views</span>
              <span className="inline-flex items-center gap-1"><Heart className="size-3.5" /> {l.likeCount} likes</span>
              <span className="inline-flex items-center gap-1">
                {l.agent ? <Building2 className="size-3.5" /> : <User className="size-3.5" />} {listedByLabel(l)}
              </span>
            </div>
          </Reveal>

          {/* Property strip: DPI */}
          {l.dpi && (
            <Reveal className="grid gap-6 rounded-2xl bg-ink p-5 text-white sm:p-7 md:grid-cols-[1fr_1.1fr] md:items-center">
              <div>
                <p className="flex items-center gap-2 text-[10px] font-semibold tracking-widest text-blue-300 uppercase">
                  <ShieldCheck className="size-4" /> Property Record
                </p>
                <p className="mt-3 font-mono text-lg">{l.dpi}</p>
                <p className="mt-2 text-sm leading-relaxed text-neutral-400">
                  Check this property's details and current verification status on Urbn before proceeding.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <ButtonLink to={verifyPath(l.dpi)} variant="light" size="sm">View Record</ButtonLink>
                  <a href={appDeepLink(l.dpi)} className="inline-flex h-9 items-center rounded-[10px] px-3 text-sm font-medium text-white hover:bg-white/10">Open in App</a>
                </div>
              </div>
              <Plaque
                data={{
                  code: l.dpi,
                  houseNo: l.propertyAddress.match(/^\d+\w?/)?.[0] ?? "—",
                  houseRef: l.lga ? `${l.lga.slice(0, 3).toUpperCase()}-${l.dpi.split("-").slice(-2, -1)[0]}` : "",
                  address: [`${l.propertyAddress.split(",")[0]},`, ...(l.propertyAddress.split(",").slice(1, 2).map((s) => `${s.trim()},`)), `${l.propertyCity},`, `${l.propertyState} State.`],
                }}
              />
            </Reveal>
          )}

          {/* Quick stats */}
          <Reveal>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[
                { i: Home, v: l.isMainUnit ? "Whole Property" : "Unit" },
                beds != null && { i: BedDouble, v: `${beds} Bedroom${beds !== 1 ? "s" : ""}` },
                baths != null && { i: Bath, v: `${baths} Bathroom${baths !== 1 ? "s" : ""}` },
                l.squareFootage && { i: Ruler, v: `${l.squareFootage} sqm` },
                { i: PawPrint, v: l.allowPets ? "Pets Allowed" : "No Pets" },
                { i: CalendarDays, v: l.immediateAvailability ? "Available Now" : l.availableFrom ? `Available From ${fmtDate(l.availableFrom)}` : "Check Availability" },
              ]
                .filter(Boolean)
                .map((s: any) => (
                  <li key={s.v} className="flex items-center gap-3 rounded-2xl bg-white p-4">
                    <span className="grid size-10 place-items-center rounded-xl bg-mist"><s.i className="size-[18px] text-urbn" /></span>
                    <span className="text-sm font-medium">{s.v}</span>
                  </li>
                ))}
            </ul>
          </Reveal>

          {/* Text sections */}
          {l.description && (
            <Reveal className="rounded-2xl bg-white p-5 sm:p-6">
              <SectionLabel>About This Listing</SectionLabel>
              <p className="mt-3 leading-relaxed text-neutral-700">{l.description}</p>
            </Reveal>
          )}
          {(keyFeatures.length > 0 || amenities.length > 0) && (
            <Reveal className="rounded-2xl bg-white p-5 sm:p-6">
              <SectionLabel>Key Features</SectionLabel>
              <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                {[...keyFeatures, ...amenities.map(formatTextCase)].map((a) => (
                  <li key={a} className="flex items-start gap-2.5 text-sm">
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-success/15 text-success"><Check className="size-3" /></span>
                    {a}
                  </li>
                ))}
              </ul>
            </Reveal>
          )}
          {l.requirements && l.requirements.length > 0 && (
            <Reveal className="rounded-2xl bg-white p-5 sm:p-6">
              <SectionLabel>Requirements</SectionLabel>
              <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-neutral-700">
                {l.requirements.map((r) => <li key={r}>{r}</li>)}
              </ul>
            </Reveal>
          )}

          {/* Costs + dates */}
          <div className="grid gap-5 md:grid-cols-2">
            {costs.length > 0 && (
              <Reveal className="rounded-2xl bg-white p-5 sm:p-6">
                <SectionLabel>Additional Costs</SectionLabel>
                <dl className="mt-3 divide-y divide-neutral-100 text-sm">
                  {costs.map(([k, v]) => (
                    <div key={k} className="flex justify-between py-2.5">
                      <dt className="text-neutral-500">{k}</dt>
                      <dd className="font-semibold">₦{v.toLocaleString("en-NG")}</dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
            )}
            <Reveal className="rounded-2xl bg-white p-5 sm:p-6">
              <SectionLabel>Dates & Terms</SectionLabel>
              <dl className="mt-3 divide-y divide-neutral-100 text-sm">
                {[
                  ["Date Listed", fmtDate(l.publishedAt ?? l.createdAt)],
                  ["Available From", l.immediateAvailability ? "Now" : fmtDate(l.availableFrom)],
                  l.minLeaseTerm && ["Lease Term", l.maxLeaseTerm ? `${l.minLeaseTerm}–${l.maxLeaseTerm} Months` : `Minimum Lease: ${l.minLeaseTerm} Months`],
                  l.expiresAt && ["Listing Expiry", fmtDate(l.expiresAt)],
                ]
                  .filter((r): r is [string, string] => Array.isArray(r) && !!r[1])
                  .map(([k, v]) => (
                    <div key={k} className="flex justify-between py-2.5">
                      <dt className="text-neutral-500">{k}</dt>
                      <dd className="font-semibold">{v}</dd>
                    </div>
                  ))}
              </dl>
            </Reveal>
          </div>

          {/* Location */}
          <Reveal className="rounded-2xl bg-white p-5 sm:p-6">
            <SectionLabel>Location</SectionLabel>
            <div className="relative mt-4 h-60 overflow-hidden rounded-xl bg-[#eef0ea]">
              <svg viewBox="0 0 600 260" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full" aria-hidden>
                <path d="M-10 180 C 120 150, 240 200, 360 160 S 560 120, 620 150" stroke="#fff" strokeWidth="14" fill="none" />
                <path d="M200 -10 C 220 80, 260 150, 250 280" stroke="#fff" strokeWidth="10" fill="none" />
                <path d="M420 -10 C 400 90, 450 180, 430 280" stroke="#fff" strokeWidth="8" fill="none" />
                <ellipse cx="520" cy="60" rx="60" ry="30" fill="#dfe9d6" />
              </svg>
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full">
                <span className="absolute inset-0 animate-ping-slow rounded-full bg-urbn/40" />
                <span className="relative grid size-12 place-items-center rounded-full border-4 border-white bg-urbn text-white shadow-xl"><MapPin className="size-5" /></span>
              </span>
              <div className="absolute right-3 bottom-3 left-3 flex items-center gap-3 rounded-xl bg-white p-3 sm:right-auto">
                <Navigation className="size-5 shrink-0 text-urbn" />
                <p className="text-sm">
                  <b className="block">{[l.propertyAddress.split(",").slice(-1)[0]?.trim(), l.propertyCity].join(", ")}</b>
                  <span className="text-neutral-500">Exact location and directions appear in the app when your inspection is confirmed.</span>
                </p>
              </div>
            </div>
          </Reveal>

          {(around.length > 0 || atProperty.length > 0) && (
            <Reveal className="rounded-2xl bg-white p-5 sm:p-6">
              {atProperty.length > 0 && (
                <div className="mb-6">
                  <SectionLabel>Activities at This Property</SectionLabel>
                  <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                    {atProperty.map((p) => (
                      <li key={p.id}><PlaceCard place={p} compact /></li>
                    ))}
                  </ul>
                </div>
              )}
              {around.length > 0 && (
                <>
                  <div className="flex items-end justify-between gap-3">
                    <SectionLabel>Around This Property</SectionLabel>
                    <Link to={`/nearby?area=${nearbyArea}`} className="text-sm font-semibold text-urbn hover:underline">Explore This Area →</Link>
                  </div>
                  <p className="mt-1 text-xs text-neutral-500">Places recorded at nearby properties. Distances are approximate, from this property.</p>
                  <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                    {around.map((p) => (
                      <li key={p.id}><PlaceCard place={p} origin={{ kind: "property", label: "Around this property" }} compact /></li>
                    ))}
                  </ul>
                </>
              )}
            </Reveal>
          )}
        </div>

        {/* Sticky CTA */}
        <aside className="hidden lg:sticky lg:top-24 lg:block lg:self-start">
          <div className="rounded-2xl bg-white p-6 ring-1 ring-black/5">
            <p className="text-xs text-neutral-500">{listingTypeLabel(l.listingType)}</p>
            <p className="text-3xl font-bold tracking-tight">{formatPrice(l.price, l.rentPeriod, true)}</p>
            {l.isAcceptingInspections ? (
              <>
                <h2 className="mt-6 font-sans text-sm font-semibold tracking-normal">Request Inspection</h2>
                <div role="radiogroup" aria-label="Inspection type" className="mt-3 grid grid-cols-2 gap-1 rounded-xl bg-mist p-1 text-sm font-medium">
                  {(["physical", "virtual"] as const).map((m) => {
                    const ok = m === "physical" ? canPhysical : canVirtual;
                    return (
                      <button
                        key={m}
                        type="button"
                        role="radio"
                        aria-checked={mode === m}
                        disabled={!ok}
                        onClick={() => setMode(m)}
                        className={clsx("relative rounded-lg py-2.5 transition-colors disabled:cursor-not-allowed disabled:opacity-40", mode === m ? "text-white" : "text-neutral-600")}
                      >
                        {mode === m && <motion.span layoutId="insp" className="absolute inset-0 rounded-lg bg-ink" />}
                        <span className="relative inline-flex items-center gap-1.5">
                          {m === "physical" ? <CalendarCheck className="size-4" /> : <Video className="size-4" />}
                          {m === "physical" ? "Physical" : "Virtual"}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="mt-3 text-xs text-neutral-500">
                  {l.inspectionFeeKobo ? `Inspection Fee: ₦${(l.inspectionFeeKobo / 100).toLocaleString("en-NG")}. ` : "No Inspection Fee. "}
                  Request a slot in the app, then check there for the {l.agent ? "agent's" : "owner's"} acceptance and booking confirmation.
                </p>
                <ButtonLink to="/download" variant="blue" size="lg" className="mt-5 w-full">Request Inspection</ButtonLink>
              </>
            ) : (
              <p className="mt-6 rounded-xl bg-mist p-3 text-sm text-neutral-600">This property is not accepting inspection requests right now.</p>
            )}
            <ButtonLink to="/download" variant="outline" size="lg" arrow={false} className="mt-2 w-full">
              <MessageCircle className="size-4" /> Message {l.agent ? "Agent" : "Owner"}
            </ButtonLink>
            <div className="mt-6 flex items-center gap-3 border-t border-neutral-100 pt-5">
              <span className="grid size-11 place-items-center rounded-full bg-ink text-sm font-semibold text-white">
                {(l.agent?.agencyName ?? l.agent?.displayName ?? "Owner").split(" ").map((w) => w[0]).join("").slice(0, 2)}
              </span>
              <div className="text-sm">
                <p className="font-semibold">{listedByLabel(l)}</p>
                <p className="text-neutral-500">
                  {l.agent ? (
                    <>{l.agent.agencyName ? "Property Manager" : "Agent"}{l.agent.rating ? ` · ★ ${l.agent.rating} (${l.agent.reviewCount})` : ""}</>
                  ) : (
                    "Property Owner"
                  )}
                </p>
              </div>
            </div>
          </div>
          <p className="mt-4 flex items-start gap-2 px-2 text-xs text-neutral-500">
            <ShieldCheck className="size-4 shrink-0 text-success" />
            Check the property record before paying. For transactions arranged through Urbn, use the payment instructions shown in the app.
          </p>
        </aside>
      </section>

      {similar.length > 0 && (
        <section className="bg-white py-20">
          <div className="container-x">
            <div className="flex items-end justify-between gap-4">
              <h2 className="text-3xl sm:text-4xl">Similar Listings</h2>
              <Link to="/listings" className="text-sm font-semibold text-urbn hover:underline">View All Listings →</Link>
            </div>
            <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((s) => <li key={s.id}><ListingCard listing={s} /></li>)}
            </ul>
          </div>
        </section>
      )}
      <BottomBar>
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-bold tracking-tight">{formatPrice(l.price, l.rentPeriod)}</p>
            <p className="truncate text-xs text-neutral-500">
              {l.inspectionFeeKobo ? `Inspection Fee ₦${(l.inspectionFeeKobo / 100).toLocaleString("en-NG")}` : "No Inspection Fee"} · {listedByLabel(l)}
            </p>
          </div>
          <Link to="/download" aria-label={`Message ${l.agent ? "agent" : "owner"}`} className="grid size-12 shrink-0 place-items-center rounded-xl border border-neutral-200 active:scale-95">
            <MessageCircle className="size-5" />
          </Link>
          <Link to="/download" className="inline-flex h-12 shrink-0 items-center rounded-xl bg-urbn px-5 text-sm font-semibold text-white shadow-[0_10px_24px_-10px_rgba(37,61,226,0.9)] active:scale-95">
            Request Inspection
          </Link>
        </div>
      </BottomBar>
    </div>
  );
}

/** Phones: full-bleed swipeable photos with a counter and floating controls. */
function MobileGallery({
  images,
  title,
  badges,
  saved,
  onSave,
  onShare,
  shared,
}: {
  images: string[];
  title: string;
  badges: React.ReactNode;
  saved: boolean;
  onSave: () => void;
  onShare: () => void;
  shared: boolean;
}) {
  const [index, setIndex] = useState(0);
  return (
    <section className="relative lg:hidden" aria-label="Photos">
      <div
        className="no-scrollbar flex aspect-[4/3.4] snap-x snap-mandatory overflow-x-auto"
        onScroll={(e) => setIndex(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
      >
        {(images.length ? images : [""]).map((src, i) => (
          <div key={i} className="relative w-full shrink-0 snap-center bg-mist">
            {src ? (
              <img src={src} alt={`${title}, photo ${i + 1} of ${images.length}`} loading={i ? "lazy" : "eager"} className="size-full object-cover" />
            ) : (
              <div className="grid size-full place-items-center text-neutral-300"><Home className="size-12" /></div>
            )}
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/35 to-transparent" />
      <div className="absolute inset-x-4 top-3 flex items-center justify-between">
        <Link to="/listings" aria-label="Back to Listings" className="grid size-10 place-items-center rounded-full bg-white/90 backdrop-blur active:scale-90">
          <ChevronLeft className="size-5" />
        </Link>
        <div className="flex gap-2">
          <button type="button" onClick={onShare} aria-label="Share Listing" className="grid size-10 place-items-center rounded-full bg-white/90 backdrop-blur active:scale-90">
            {shared ? <Check className="size-4 text-success" /> : <Share2 className="size-4" />}
          </button>
          <button type="button" onClick={onSave} aria-pressed={saved} aria-label="Save Listing" className="grid size-10 place-items-center rounded-full bg-white/90 backdrop-blur active:scale-90">
            <Heart className={clsx("size-4", saved && "fill-error text-error")} />
          </button>
        </div>
      </div>
      <div className="absolute bottom-10 left-4 flex gap-2">{badges}</div>
      {images.length > 1 && (
        <span className="absolute right-4 bottom-10 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">
          {index + 1} / {images.length}
        </span>
      )}
    </section>
  );
}
