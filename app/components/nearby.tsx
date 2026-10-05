// Nearby UI, mirroring the app's Near Me components (urbn-mobile
// src/components/property-activity): NearbyActivityCard (list / row / detail
// variants), ActivityDetailSheet, ActivityCategoryChips and PublicActivityPreview.
import { clsx } from "clsx";
import { ChevronLeft, ChevronRight, Globe, MapPin, Navigation2, Phone, X } from "lucide-react";
import { type MouseEvent, type ReactNode, useRef, useState } from "react";
import { Link } from "react-router";
import { ACTIVITY_META, placeTitle } from "~/lib/nearby/categories";
import { type ActivityType, type CategoryCount, formatDistanceAway, locationLabel, type NearbyPlace, type NearbyPlaceExtras } from "~/lib/nearby/types";
import { BrandIcon } from "./social";

export function SampleBadge({ className }: { className?: string }) {
  return (
    <span className={clsx("inline-flex items-center rounded-full bg-warning/15 px-2 py-0.5 text-[10px] font-bold tracking-wider text-[#93370d] uppercase", className)}>
      Sample
    </span>
  );
}

/** The app's ActivityTypeIcon: the type's icon on its tint. Also the placeholder when a place has no photo. */
export function PlaceIcon({ type, className, size = "md" }: { type: ActivityType; className?: string; size?: "sm" | "md" | "lg" | "xl" }) {
  const m = ACTIVITY_META[type];
  const box = { sm: "size-8 rounded-lg", md: "size-14 rounded-xl", lg: "size-16 rounded-2xl", xl: "size-20 rounded-2xl" }[size];
  const icon = { sm: "size-4", md: "size-6", lg: "size-7", xl: "size-9" }[size];
  return (
    <span className={clsx("grid shrink-0 place-items-center", m.tint, box, className)}>
      <m.icon className={icon} aria-hidden />
    </span>
  );
}

const Thumb = ({ place, size = "md" }: { place: NearbyPlace; size?: "sm" | "md" }) =>
  place.imageUrl ? (
    <img src={place.imageUrl} alt="" loading="lazy" className={clsx("shrink-0 object-cover", size === "sm" ? "size-9 rounded-xl" : "size-14 rounded-xl")} />
  ) : (
    <PlaceIcon type={place.activityType} size={size === "sm" ? "sm" : "md"} />
  );

/** Plain clicks run `onOpen` (e.g. open the sheet); modified clicks and crawlers follow the real page URL. */
const intercept = (onOpen?: () => void) =>
  onOpen
    ? (e: MouseEvent) => {
        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        onOpen();
      }
    : undefined;

const distanceCity = (p: NearbyPlace) => [formatDistanceAway(p.distance), p.property.city].filter(Boolean).join(" · ");

/** The app's list-variant card. Opens the activity's detail. */
export function NearbyListCard({ place, to, onOpen, active, onHover }: { place: NearbyPlace; to: string; onOpen?: () => void; active?: boolean; onHover?: (id: string | null) => void }) {
  return (
    <Link
      to={to}
      onClick={intercept(onOpen)}
      preventScrollReset
      onMouseEnter={() => onHover?.(place.id)}
      onMouseLeave={() => onHover?.(null)}
      className={clsx(
        "flex items-center gap-3 rounded-2xl bg-white p-3 ring-1 transition-[box-shadow,transform] duration-300 active:scale-[0.99]",
        active ? "shadow-[0_14px_34px_-18px_rgba(0,0,0,0.45)] ring-ink" : "ring-black/5 hover:ring-neutral-300",
      )}
    >
      <Thumb place={place} />
      <span className="min-w-0 flex-1">
        <span className="flex min-w-0 items-center gap-2">
          <b className="truncate text-sm font-semibold">{placeTitle(place)}</b>
          {place.socialLinks?.whatsapp && (
            <span title="On WhatsApp" className="shrink-0 text-[#25D366]">
              <BrandIcon name="whatsapp" className="size-3.5" />
              <span className="sr-only">On WhatsApp</span>
            </span>
          )}
          {place.sample && <SampleBadge className="shrink-0" />}
        </span>
        {place.businessCategory && <span className="block truncate text-xs text-neutral-500">{place.businessCategory}</span>}
        <span className="mt-1 flex items-center gap-1 text-xs text-neutral-500">
          <MapPin className="size-3 shrink-0" />
          <span className="truncate">{locationLabel(place)}</span>
        </span>
        {distanceCity(place) && <span className="mt-0.5 block text-xs text-neutral-500">{distanceCity(place)}</span>}
      </span>
    </Link>
  );
}

/** The app's row-variant card, used in the map's bottom results strip. */
export function NearbyRowCard({ place, selected, onSelect }: { place: NearbyPlace; selected?: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={clsx("flex w-52 shrink-0 snap-start items-center gap-2 rounded-2xl bg-white p-3 text-left shadow-lg ring-1 transition", selected ? "ring-ink" : "ring-black/5")}
    >
      <Thumb place={place} size="sm" />
      <span className="min-w-0 flex-1">
        <b className="block truncate text-sm font-semibold">{placeTitle(place)}</b>
        {place.businessCategory && <span className="block truncate text-xs text-neutral-500">{place.businessCategory}</span>}
        <span className="block truncate text-xs text-neutral-500">{distanceCity(place)}</span>
      </span>
    </button>
  );
}

const directionsUrl = (p: NearbyPlace) =>
  p.lat != null && p.lng != null ? `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}` : null;

/** The app's detail-variant card: shown over the map for the selected place. */
export function NearbySelectedCard({ place, to, onOpen, onClose }: { place: NearbyPlace; to: string; onOpen?: () => void; onClose: () => void }) {
  const m = ACTIVITY_META[place.activityType];
  const dir = directionsUrl(place);
  return (
    <div className="rounded-2xl bg-white p-4 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.35)] ring-1 ring-black/5">
      <div className="flex items-start gap-3">
        <Link to={to} onClick={intercept(onOpen)} preventScrollReset className="flex min-w-0 flex-1 items-start gap-3">
          <Thumb place={place} />
          <span className="min-w-0 flex-1">
            <span className="flex min-w-0 items-center gap-2">
              <b className="truncate text-base font-bold">{placeTitle(place)}</b>
              {place.sample && <SampleBadge className="shrink-0" />}
            </span>
            <span className="block truncate text-xs text-neutral-500">
              {place.businessCategory || m.label}
              {distanceCity(place) && ` · ${distanceCity(place)}`}
            </span>
            <span className="mt-1 flex items-center gap-1 text-xs text-neutral-500">
              <MapPin className="size-3 shrink-0" />
              <span className="truncate">{locationLabel(place)}</span>
            </span>
          </span>
        </Link>
        <button type="button" onClick={onClose} aria-label="Close" className="-m-1 grid size-8 shrink-0 place-items-center rounded-full text-neutral-500 hover:bg-mist">
          <X className="size-[18px]" />
        </button>
      </div>
      {place.description && (
        <Link to={to} onClick={intercept(onOpen)} preventScrollReset className="mt-3 line-clamp-2 block text-sm text-neutral-800">
          {place.description}
        </Link>
      )}
      <div className="mt-3 flex items-center gap-2">
        {contactActions(place).slice(0, 3).map((a) => (
          <ContactLink key={a.id} action={a} sample={place.sample} className={clsx("grid size-9 place-items-center rounded-full", a.id === "whatsapp" ? "bg-[#25D366] text-white hover:bg-[#1ebe5a]" : "bg-mist hover:bg-fog")}>
            <a.icon className="size-4" />
          </ContactLink>
        ))}
        <Link to={to} onClick={intercept(onOpen)} preventScrollReset className="text-xs font-semibold text-neutral-600 hover:text-ink">
          View Details
        </Link>
        {dir && (
          <a href={dir} target="_blank" rel="noopener" className="ml-auto inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-xs font-semibold text-white hover:bg-neutral-800">
            <Navigation2 className="size-3.5" /> Get Directions
          </a>
        )}
      </div>
    </div>
  );
}

type ContactAction = { id: string; label: string; icon: (p: { className?: string }) => ReactNode; href: string };
const brand = (name: "whatsapp" | "instagram" | "facebook" | "x") => (p: { className?: string }) => <BrandIcon name={name} className={p.className} />;
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
    <path d="M16.6 5.8A4.3 4.3 0 0 1 15.5 3h-3.1v12.4a2.6 2.6 0 1 1-2.6-2.6c.3 0 .5 0 .8.1V9.7a5.7 5.7 0 1 0 4.9 5.7V9a7.4 7.4 0 0 0 4.3 1.4V7.3a4.3 4.3 0 0 1-3.2-1.5Z" />
  </svg>
);
const withScheme = (u: string) => (/^https?:\/\//.test(u) ? u : `https://${u}`);

/** A wa.me chat link with a greeting, so the business knows the enquiry came from Urbn. */
export function whatsappHref(p: NearbyPlace) {
  const raw = p.socialLinks?.whatsapp?.trim();
  if (!raw) return null;
  // The app's form asks for a wa.me link, but accept a bare number too.
  const url = /^\+?[\d\s()-]{7,}$/.test(raw) ? `https://wa.me/${raw.replace(/\D/g, "")}` : withScheme(raw);
  if (!/\/\/(wa\.me|api\.whatsapp\.com)\//.test(url) || /[?&]text=/.test(url)) return url;
  const text = encodeURIComponent(`Hello ${placeTitle(p)}, I found you on Urbn Nearby.`);
  return `${url}${url.includes("?") ? "&" : "?"}text=${text}`;
}

/** The app's detail sheet order (Call, WhatsApp, Instagram, Facebook, Twitter, Website), plus TikTok from the Add Activity form. */
function contactActions(p: NearbyPlace): ContactAction[] {
  const s = p.socialLinks ?? {};
  const wa = whatsappHref(p);
  return [
    p.contactPhone && { id: "call", label: "Call", icon: Phone, href: `tel:${p.contactPhone.replace(/[^\d+]/g, "")}` },
    wa && { id: "whatsapp", label: "WhatsApp", icon: brand("whatsapp"), href: wa },
    s.instagram && { id: "instagram", label: "Instagram", icon: brand("instagram"), href: withScheme(s.instagram) },
    s.facebook && { id: "facebook", label: "Facebook", icon: brand("facebook"), href: withScheme(s.facebook) },
    s.twitter && { id: "twitter", label: "X", icon: brand("x"), href: withScheme(s.twitter) },
    s.tiktok && { id: "tiktok", label: "TikTok", icon: TikTokIcon, href: withScheme(s.tiktok) },
    s.website && { id: "website", label: "Website", icon: Globe, href: withScheme(s.website) },
  ].filter(Boolean) as ContactAction[];
}

/** A contact link, or an inert chip for sample places (their details are placeholders). */
function ContactLink({ action: a, sample, className, children }: { action: ContactAction; sample?: boolean; className: string; children: ReactNode }) {
  if (sample) {
    return (
      <span className={clsx(className, "cursor-default opacity-70")} title="Sample place: real places link here">
        {children}
      </span>
    );
  }
  return (
    <a href={a.href} target={a.id === "call" ? undefined : "_blank"} rel="noopener nofollow" aria-label={a.id === "call" ? `Call ${a.label}` : a.label} className={className}>
      {children}
    </a>
  );
}

/**
 * Photo gallery: swipe on phones, arrows and thumbnails on larger screens, a counter
 * like the app's. With no photos it shows the type tile (never an invented photo).
 */
function HeroGallery({ place, images }: { place: NearbyPlace; images: string[] }) {
  const urls = images.length ? images : place.imageUrl ? [place.imageUrl] : [];
  const [index, setIndex] = useState(0);
  const strip = useRef<HTMLDivElement>(null);
  if (urls.length === 0) {
    return (
      <div className={clsx("grid h-56 place-items-center rounded-2xl sm:h-64", ACTIVITY_META[place.activityType].tint)}>
        <PlaceIcon type={place.activityType} size="xl" className="bg-white/60" />
      </div>
    );
  }
  const go = (i: number) => {
    const el = strip.current;
    const next = (i + urls.length) % urls.length;
    el?.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
    setIndex(next);
  };
  const arrow = "absolute top-1/2 hidden size-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink shadow-md transition hover:bg-white sm:grid";
  return (
    <div>
      <div className="relative h-56 overflow-hidden rounded-2xl bg-mist sm:h-80" role="group" aria-roledescription="carousel" aria-label={`${placeTitle(place)} photos`}>
        <div
          ref={strip}
          className="no-scrollbar flex h-full snap-x snap-mandatory overflow-x-auto"
          onScroll={(e) => setIndex(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
        >
          {urls.map((u, i) => (
            <img key={u} src={u} alt={`${placeTitle(place)}, photo ${i + 1} of ${urls.length}`} loading={i ? "lazy" : undefined} className="h-full w-full shrink-0 snap-start object-cover" />
          ))}
        </div>
        {urls.length > 1 && (
          <>
            <button type="button" onClick={() => go(index - 1)} aria-label="Previous photo" className={clsx(arrow, "left-3")}>
              <ChevronLeft className="size-5" />
            </button>
            <button type="button" onClick={() => go(index + 1)} aria-label="Next photo" className={clsx(arrow, "right-3")}>
              <ChevronRight className="size-5" />
            </button>
            <span className="absolute top-3 right-3 rounded-full bg-black/55 px-2.5 py-1 text-xs font-semibold text-white">
              {index + 1}/{urls.length}
            </span>
          </>
        )}
      </div>
      {urls.length > 1 && (
        <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto">
          {urls.map((u, i) => (
            <button
              key={u}
              type="button"
              onClick={() => go(i)}
              aria-label={`Show photo ${i + 1}`}
              aria-current={i === index}
              className={clsx("size-14 shrink-0 overflow-hidden rounded-lg ring-2 transition", i === index ? "ring-ink" : "ring-transparent opacity-70 hover:opacity-100")}
            >
              <img src={u} alt="" loading="lazy" className="size-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** The type-specific answers from the Add Activity form, plus when the place was recorded. */
function detailRows(e?: NearbyPlaceExtras) {
  if (!e) return [];
  const since = e.createdAt ? new Date(e.createdAt) : null;
  return [
    e.schoolLevel && ["School level", e.schoolLevel],
    e.facilityUse && ["Facility use", e.facilityUse],
    e.cropTypes.length > 0 && ["Crops", e.cropTypes.join(", ")],
    e.livestockTypes.length > 0 && ["Livestock", e.livestockTypes.join(", ")],
    since && !Number.isNaN(since.getTime()) && ["On Urbn since", since.toLocaleDateString("en-NG", { month: "long", year: "numeric", timeZone: "UTC" })],
  ].filter(Boolean) as [string, string][];
}

/** The app's ActivityDetailSheet content. No property record: Nearby is about the place. */
export function NearbyDetail({ place, images = [], extras, header }: { place: NearbyPlace; images?: string[]; extras?: NearbyPlaceExtras; header?: ReactNode }) {
  const m = ACTIVITY_META[place.activityType];
  const actions = contactActions(place);
  const wa = actions.find((a) => a.id === "whatsapp");
  const others = actions.filter((a) => a.id !== "whatsapp");
  const dir = directionsUrl(place);
  const rows = detailRows(extras);
  return (
    <div>
      {header}
      <HeroGallery place={place} images={images} />
      <div className="space-y-5 pt-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-sans text-2xl font-bold tracking-tight sm:text-3xl">{placeTitle(place)}</h1>
            {place.sample && <SampleBadge />}
          </div>
          <p className="mt-1 text-sm font-medium text-neutral-500">
            {m.label}
            {place.businessCategory ? ` · ${place.businessCategory}` : ""}
          </p>
          {distanceCity(place) && <p className="text-sm text-neutral-500">{distanceCity(place)}</p>}
        </div>
        <p className="flex items-start gap-2 text-sm">
          <MapPin className="mt-0.5 size-4 shrink-0 text-neutral-500" />
          {locationLabel(place)}
        </p>
        {/* WhatsApp is how most people reach a business here, so it sits beside directions. */}
        {(wa || dir) && (
          <div className={clsx("grid gap-2", wa && dir && "sm:grid-cols-2")}>
            {wa && (
              <ContactLink action={wa} sample={place.sample} className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3.5 text-sm font-semibold text-white hover:bg-[#1ebe5a]">
                <wa.icon className="size-4" /> Chat on WhatsApp
              </ContactLink>
            )}
            {dir && (
              <a href={dir} target="_blank" rel="noopener" className="flex items-center justify-center gap-2 rounded-xl bg-ink px-4 py-3.5 text-sm font-semibold text-white hover:bg-neutral-800">
                <Navigation2 className="size-4" /> Get Directions
              </a>
            )}
          </div>
        )}
        {place.description && (
          <div>
            <h2 className="font-sans text-sm font-semibold tracking-normal">About</h2>
            <p className="mt-1 text-sm leading-relaxed text-neutral-600">{place.description}</p>
          </div>
        )}
        {rows.length > 0 && (
          <div>
            <h2 className="font-sans text-sm font-semibold tracking-normal">Details</h2>
            <dl className="mt-2 divide-y divide-neutral-100 rounded-xl bg-mist/60 px-4 text-sm">
              {rows.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 py-2.5">
                  <dt className="text-neutral-500">{k}</dt>
                  <dd className="text-right font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
        {others.length > 0 && (
          <div>
            <h2 className="font-sans text-sm font-semibold tracking-normal">Contact</h2>
            {place.contactPhone && <p className="mt-1 text-sm text-neutral-600">{place.contactPhone}</p>}
            <div className="mt-2 flex flex-wrap gap-2">
              {others.map((a) => (
                <ContactLink key={a.id} action={a} sample={place.sample} className="inline-flex items-center gap-2 rounded-full bg-mist px-4 py-2.5 text-sm font-semibold hover:bg-fog">
                  <a.icon className="size-[15px]" /> {a.label}
                </ContactLink>
              ))}
            </div>
            {place.sample && <p className="mt-2 text-xs text-neutral-500">Sample contact details. Real places link straight to their phone, WhatsApp and pages.</p>}
          </div>
        )}
      </div>
    </div>
  );
}

/** The app's ActivityCategoryChips: All, then only the types present here as "Label · count". */
export function NearbyCategoryChips({
  categories,
  selected,
  onChange,
}: {
  categories: CategoryCount[];
  selected?: ActivityType;
  onChange: (t?: ActivityType) => void;
}) {
  const chip = (active: boolean) =>
    clsx(
      "shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition active:scale-95",
      active ? "bg-ink text-white" : "border border-neutral-200 bg-white text-ink hover:border-neutral-400",
    );
  return (
    <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0" role="group" aria-label="Filter by type">
      <button type="button" onClick={() => onChange(undefined)} aria-pressed={!selected} className={chip(!selected)}>
        All
      </button>
      {categories.map((c) => (
        <button key={c.value} type="button" onClick={() => onChange(c.value)} aria-pressed={selected === c.value} className={chip(selected === c.value)}>
          {ACTIVITY_META[c.value].label} · {c.count}
        </button>
      ))}
    </div>
  );
}

/** The app's PublicActivityPreview ("Activity Here") on a DPI result: up to three, then "+N more". */
export function ActivityHere({ activities }: { activities: (NearbyPlace & { href: string })[] }) {
  if (activities.length === 0) return null;
  const visible = activities.slice(0, 3);
  const remaining = activities.length - visible.length;
  return (
    <div className="space-y-2 rounded-xl bg-mist px-3.5 py-3">
      <p className="text-[10px] font-semibold tracking-widest text-neutral-500 uppercase">Activity Here</p>
      {visible.map((a) => (
        <Link key={a.id} to={a.href} className="group flex items-center gap-3" aria-label={`View ${placeTitle(a)} details`}>
          <PlaceIcon type={a.activityType} size="sm" />
          <span className="min-w-0 flex-1">
            <b className="block truncate text-sm font-semibold">{placeTitle(a)}</b>
            {a.businessCategory && <span className="block truncate text-xs text-neutral-500">{a.businessCategory}</span>}
          </span>
          <ChevronRight className="size-4 text-neutral-400 transition group-hover:translate-x-0.5" />
        </Link>
      ))}
      {remaining > 0 && <p className="text-xs text-neutral-500">+{remaining} more</p>}
    </div>
  );
}
