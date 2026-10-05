import { clsx } from "clsx";
import { ChevronRight, MapPin, ShieldCheck, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { Link } from "react-router";
import { verifyPath } from "~/lib/dpi";
import { ACTIVITY_META, placeSubtitle, placeTitle } from "~/lib/nearby/categories";
import { type ActivityType, activityPath, formatDistance, type NearbyPlace, type NearbyOrigin } from "~/lib/nearby/types";
import { MapBackdrop } from "./ibadan-map";

export function SampleBadge({ className }: { className?: string }) {
  return (
    <span className={clsx("inline-flex items-center rounded-full bg-warning/15 px-2 py-0.5 text-[10px] font-bold tracking-wider text-[#93370d] uppercase", className)}>
      Sample
    </span>
  );
}

/** Category icon tile, also the neutral placeholder when a place has no image (never an invented photo). */
export function PlaceIcon({ type, className, size = "md" }: { type: ActivityType; className?: string; size?: "sm" | "md" | "lg" }) {
  const m = ACTIVITY_META[type];
  return (
    <span className={clsx("grid shrink-0 place-items-center rounded-2xl", m.tint, size === "sm" ? "size-9 rounded-xl" : size === "lg" ? "size-20" : "size-12", className)}>
      <m.icon className={size === "sm" ? "size-4" : size === "lg" ? "size-9" : "size-5"} aria-hidden />
    </span>
  );
}

/**
 * A discovery result. The title is the card's main link (stretched over the card);
 * the Property Record chip is a separate, real link above it.
 */
export function PlaceCard({
  place,
  origin,
  active,
  onHover,
  from,
  compact,
}: {
  place: NearbyPlace;
  origin?: NearbyOrigin | null;
  active?: boolean;
  onHover?: (id: string | null) => void;
  /** search string to return to from the detail page */
  from?: string;
  compact?: boolean;
}) {
  const distance = formatDistance(place.distance);
  return (
    <article
      onMouseEnter={() => onHover?.(place.id)}
      onMouseLeave={() => onHover?.(null)}
      className={clsx(
        "group relative flex h-full gap-4 rounded-2xl bg-white p-4 ring-1 transition-all duration-300 focus-within:ring-2 focus-within:ring-urbn",
        active ? "ring-urbn shadow-[0_18px_40px_-20px_rgba(37,61,226,0.55)]" : "ring-black/5 hover:ring-neutral-300",
      )}
    >
      {place.imageUrl ? (
        <img src={place.imageUrl} alt="" loading="lazy" className={clsx("shrink-0 rounded-2xl object-cover", compact ? "size-14" : "size-16 sm:size-20")} />
      ) : (
        <PlaceIcon type={place.activityType} className={compact ? "size-14" : "size-16 sm:size-20"} />
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <h3 className="min-w-0 font-sans text-[15px] leading-snug font-semibold tracking-normal">
            <Link
              to={activityPath(place)}
              state={from != null ? { from } : undefined}
              className="outline-none after:absolute after:inset-0 after:rounded-2xl after:content-['']"
            >
              {placeTitle(place)}
            </Link>
          </h3>
          {place.sample && <SampleBadge className="shrink-0" />}
        </div>
        <p className="mt-0.5 truncate text-[13px] text-neutral-500">{placeSubtitle(place)}</p>
        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-2.5 text-xs">
          {distance && (
            <span className="inline-flex items-center gap-1 text-neutral-600" title={origin?.note}>
              <MapPin className="size-3.5 text-urbn" /> {distance}
              {origin?.kind === "device" ? " away" : origin?.kind === "area" ? " from centre" : ""}
            </span>
          )}
          <Link
            to={verifyPath(place.property.dpi, place.unit?.unitNumber)}
            className="relative z-10 inline-flex items-center gap-1 rounded-full bg-mist px-2 py-1 font-medium text-neutral-700 transition hover:bg-fog"
          >
            <ShieldCheck className="size-3.5" /> Property Record{place.unit ? ` · ${place.unit.unitNumber}` : ""}
          </Link>
          {!compact && (
            <span className="ml-auto hidden items-center gap-0.5 font-semibold text-urbn sm:inline-flex">
              View Details <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

// ---------------------------------------------------------------------------
// Map: illustrated city backdrop with grouped markers. Several activities can
// share one property coordinate; they're grouped, never merged or duplicated.

type Group = { key: string; x: number; y: number; places: NearbyPlace[] };

function project(places: NearbyPlace[], originPoint?: { lat: number; lng: number } | null) {
  const pts = places.filter((p) => p.lat != null && p.lng != null);
  const all = [...pts.map((p) => [p.lat!, p.lng!] as const), ...(originPoint ? [[originPoint.lat, originPoint.lng] as const] : [])];
  if (!all.length) return { groups: [] as Group[], origin: null as null | { x: number; y: number } };
  let minLat = Math.min(...all.map((a) => a[0])), maxLat = Math.max(...all.map((a) => a[0]));
  let minLng = Math.min(...all.map((a) => a[1])), maxLng = Math.max(...all.map((a) => a[1]));
  const padLat = Math.max((maxLat - minLat) * 0.2, 0.006), padLng = Math.max((maxLng - minLng) * 0.15, 0.006);
  minLat -= padLat; maxLat += padLat; minLng -= padLng; maxLng += padLng;
  const xy = (lat: number, lng: number) => ({ x: ((lng - minLng) / (maxLng - minLng)) * 100, y: ((maxLat - lat) / (maxLat - minLat)) * 100 });
  const byProperty = new Map<string, Group>();
  for (const p of pts) {
    const key = p.property.id;
    const g = byProperty.get(key) ?? { key, ...xy(p.lat!, p.lng!), places: [] };
    if (!g.places.some((x) => x.id === p.id)) g.places.push(p);
    byProperty.set(key, g);
  }
  return { groups: [...byProperty.values()], origin: originPoint ? xy(originPoint.lat, originPoint.lng) : null };
}

export function NearbyMap({
  places,
  originPoint,
  originLabel,
  activeId,
  onSelect,
  className,
}: {
  places: NearbyPlace[];
  originPoint?: { lat: number; lng: number } | null;
  originLabel?: string;
  activeId?: string | null;
  onSelect?: (id: string | null) => void;
  className?: string;
}) {
  const { groups, origin } = useMemo(() => project(places, originPoint), [places, originPoint]);
  const [open, setOpen] = useState<string | null>(null);
  const openGroup = groups.find((g) => g.key === open);
  return (
    <div className={clsx("relative overflow-hidden bg-[#f2f3ef] ring-1 ring-black/5", className)} role="region" aria-label="Map of nearby places">
      <div className="absolute inset-0">
        <MapBackdrop labels={false} />
      </div>
      {origin && (
        <span className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${origin.x}%`, top: `${origin.y}%` }}>
          <span className="absolute top-1/2 left-1/2 size-40 -translate-x-1/2 -translate-y-1/2 animate-ping-slow rounded-full bg-urbn/10" />
          <span className="relative block size-4 rounded-full border-[3px] border-white bg-urbn shadow-lg" />
          {originLabel && (
            <span className="absolute top-5 left-1/2 -translate-x-1/2 rounded-full bg-ink px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap text-white">{originLabel}</span>
          )}
        </span>
      )}
      {groups.map((g) => {
        const first = g.places[0];
        const m = ACTIVITY_META[first.activityType];
        const isActive = g.places.some((p) => p.id === activeId);
        return (
          <button
            key={g.key}
            type="button"
            onClick={() => {
              setOpen(open === g.key ? null : g.key);
              onSelect?.(g.places.length === 1 ? first.id : null);
            }}
            aria-label={g.places.length > 1 ? `${g.places.length} places at ${first.property.address}` : placeTitle(first)}
            aria-expanded={open === g.key}
            className={clsx(
              "absolute grid -translate-x-1/2 -translate-y-full place-items-center rounded-full border-[3px] border-white shadow-lg transition-transform duration-200",
              isActive || open === g.key ? "z-20 scale-125 bg-ink text-white" : clsx("z-10 hover:scale-110", m.tint),
            )}
            style={{ left: `${g.x}%`, top: `${g.y}%`, width: 38, height: 38 }}
          >
            <m.icon className="size-4" aria-hidden />
            {g.places.length > 1 && (
              <span className="absolute -top-1.5 -right-1.5 grid size-5 place-items-center rounded-full bg-urbn text-[10px] font-bold text-white">{g.places.length}</span>
            )}
          </button>
        );
      })}
      <AnimatePresence>
        {openGroup && (
          <motion.div
            key={openGroup.key}
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="absolute inset-x-3 top-3 z-30 rounded-2xl bg-white p-3 shadow-xl sm:right-auto sm:w-80"
          >
            <div className="flex items-start justify-between gap-2 px-1">
              <p className="text-xs text-neutral-500">
                {openGroup.places.length > 1 ? `${openGroup.places.length} places at this property` : "Place"} · {openGroup.places[0].property.address}
              </p>
              <button type="button" onClick={() => setOpen(null)} aria-label="Close" className="-m-1 grid size-7 shrink-0 place-items-center rounded-full hover:bg-mist">
                <X className="size-4" />
              </button>
            </div>
            <ul className="mt-2 space-y-1">
              {openGroup.places.map((p) => (
                <li key={p.id}>
                  <Link to={activityPath(p)} className="flex items-center gap-3 rounded-xl p-2 hover:bg-mist">
                    <PlaceIcon type={p.activityType} size="sm" />
                    <span className="min-w-0">
                      <b className="block truncate text-sm">{placeTitle(p)}</b>
                      <span className="block truncate text-xs text-neutral-500">{placeSubtitle(p)}{p.unit ? ` · Unit ${p.unit.unitNumber}` : ""}</span>
                    </span>
                    <ChevronRight className="ml-auto size-4 shrink-0 text-neutral-400" />
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function CategoryChip({
  active,
  onClick,
  children,
  icon: Icon,
  count,
  dark,
}: {
  active: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  count?: number;
  dark?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={clsx(
        "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-semibold transition active:scale-95",
        active
          ? dark ? "bg-white text-ink" : "bg-ink text-white"
          : dark ? "bg-white/10 text-white/80 hover:bg-white/15" : "bg-white text-neutral-700 ring-1 ring-black/10 hover:ring-neutral-400",
      )}
    >
      {Icon && <Icon className="size-4" />}
      {children}
      {count != null && <span className={clsx("text-xs font-medium", active ? "opacity-70" : "opacity-50")}>{count}</span>}
    </button>
  );
}
