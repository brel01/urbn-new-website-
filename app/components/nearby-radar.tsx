import { useQuery } from "@tanstack/react-query";
import { clsx } from "clsx";
import { ArrowRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Link } from "react-router";
import { ACTIVITY_META, placeTitle, SHORTCUT_TYPES } from "~/lib/nearby/categories";
import { activityPath, formatDistance, type NearbyResult } from "~/lib/nearby/types";
import { PLACES } from "~/lib/places";
import { MapBackdrop } from "./ibadan-map";
import { EASE, Reveal } from "./motion";
import { PlaceIcon, SampleBadge } from "./nearby";
import { ButtonLink } from "./ui";

const AREAS = PLACES.filter((p) => p.live && p.kind === "area" && p.center);

/** Polar position inside the radar disc (percent), from distance + bearing to the area centre. */
function polar(center: [number, number], lat: number, lng: number, radiusKm: number) {
  const dy = (lat - center[0]) * 111.32;
  const dx = (lng - center[1]) * 111.32 * Math.cos((center[0] * Math.PI) / 180);
  const r = Math.min(Math.hypot(dx, dy) / radiusKm, 1) * 44; // keep inside the rim
  const a = Math.atan2(dy, dx);
  return { x: 50 + r * Math.cos(a), y: 50 - r * Math.sin(a), delay: ((Math.PI / 2 - a + 2 * Math.PI) % (2 * Math.PI)) / (2 * Math.PI) };
}

/**
 * Homepage Nearby preview: a radar over the illustrated city. The sweep reveals the
 * places recorded around the chosen area; four cards sit alongside. Sample content is labelled.
 */
export function NearbyRadar({ initial, initialArea }: { initial: NearbyResult; initialArea: string }) {
  const [area, setArea] = useState(initialArea);
  const place = AREAS.find((a) => a.slug === area) ?? AREAS[0];
  const { data = initial, isFetching } = useQuery({
    queryKey: ["nearby-preview", area],
    queryFn: async () => (await (await fetch(`/api/nearby?area=${area}&limit=12`)).json()) as NearbyResult,
    initialData: area === initialArea ? initial : undefined,
    staleTime: 60_000,
  });
  const radius = data.radius;
  const dots = data.places.filter((p) => p.lat != null && p.lng != null);
  const cards = data.places.slice(0, 4);

  return (
    <section className="relative overflow-hidden bg-ink py-16 text-white sm:py-24 lg:py-28" aria-labelledby="nearby-heading">
      <div aria-hidden className="pattern-u absolute inset-0 bg-white/[0.03]" />
      <div className="container-x relative grid grid-cols-[minmax(0,1fr)] items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-16">
        <Reveal>
          <p className="eyebrow text-blue-300">
            <span className="size-2 rounded-full bg-blue-400" /> Nearby
          </p>
          <h2 id="nearby-heading" className="mt-4 text-[2.5rem] leading-[1.02] sm:text-6xl">
            Discover What Is <span className="text-blue-400">Around You</span>
          </h2>
          <p className="mt-5 max-w-md text-[17px] text-neutral-400">Explore places and activities recorded at properties around a location you choose.</p>

          <p className="mt-8 text-xs font-semibold tracking-widest text-neutral-500 uppercase">Choose an Area</p>
          <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Choose an area">
            {AREAS.map((a) => (
              <button
                key={a.slug}
                type="button"
                onClick={() => setArea(a.slug)}
                aria-pressed={a.slug === area}
                className={clsx(
                  "h-9 shrink-0 rounded-full px-4 text-[13px] font-semibold transition active:scale-95",
                  a.slug === area ? "bg-white text-ink" : "bg-white/10 text-white/75 hover:bg-white/15",
                )}
              >
                {a.name}
              </button>
            ))}
          </div>

          <p className="mt-6 text-xs font-semibold tracking-widest text-neutral-500 uppercase">Or Jump to a Category</p>
          <div className="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
            {SHORTCUT_TYPES.map((t) => {
              const m = ACTIVITY_META[t];
              return (
                <Link
                  key={t}
                  to={`/nearby?area=${area}&type=${t}`}
                  className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-white/15 px-3.5 text-[13px] font-semibold text-white/85 transition hover:border-white/40 active:scale-95"
                >
                  <m.icon className="size-4" /> {m.plural}
                </Link>
              );
            })}
          </div>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <ButtonLink to={`/nearby?area=${area}`} variant="light" size="lg">Explore Nearby</ButtonLink>
            <ButtonLink to="/features#nearby" variant="ghost-light" size="lg">How It Works</ButtonLink>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          {/* radar */}
          <div className="relative mx-auto aspect-square w-full max-w-[30rem]">
            <div className="absolute inset-0 overflow-hidden rounded-full ring-1 ring-white/10">
              <div className="absolute inset-0 opacity-[0.22] grayscale invert">
                <MapBackdrop labels={false} />
              </div>
              <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_35%,#000_75%)]" />
              {[0.25, 0.5, 0.75, 1].map((r) => (
                <span key={r} aria-hidden className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-400/20" style={{ width: `${r * 88}%`, height: `${r * 88}%` }} />
              ))}
              <span aria-hidden className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,rgba(92,109,235,0.42)_40deg,transparent_70deg)] motion-safe:animate-[spin_6s_linear_infinite]" />
            </div>
            {/* origin */}
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <span className="absolute top-1/2 left-1/2 size-10 -translate-x-1/2 -translate-y-1/2 animate-ping-slow rounded-full bg-blue-400/30" />
              <span className="relative block size-3.5 rounded-full border-2 border-white bg-urbn" />
            </span>
            <span className="absolute top-[55.5%] left-1/2 z-10 -translate-x-1/2 rounded-full bg-ink/80 px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap ring-1 ring-white/15 backdrop-blur">
              {place.name}
            </span>
            <AnimatePresence>
              {dots.map((p) => {
                const pos = polar(place.center!, p.lat!, p.lng!, radius);
                const m = ACTIVITY_META[p.activityType];
                return (
                  <motion.span
                    key={`${area}-${p.id}`}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{ delay: 0.2 + pos.delay * 1.4, type: "spring", stiffness: 300, damping: 18 }}
                    className={clsx("absolute grid size-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-ink shadow-lg", m.tint)}
                    style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                    title={placeTitle(p)}
                  >
                    <m.icon className="size-3.5" aria-hidden />
                  </motion.span>
                );
              })}
            </AnimatePresence>
            <span className="absolute right-[6%] bottom-[6%] rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/70 backdrop-blur">{radius} km</span>
          </div>

          {/* nearest four */}
          <div className="mt-6 flex items-center justify-between gap-3">
            <p className="text-sm text-neutral-400" aria-live="polite">
              {isFetching ? "Looking around…" : `${data.meta.total} ${data.meta.total === 1 ? "place" : "places"} around ${place.name}`}
            </p>
            {data.source === "sample" && <SampleBadge className="bg-warning/25 text-warning" />}
          </div>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            <AnimatePresence mode="popLayout">
              {cards.map((p, i) => (
                <motion.li key={`${area}-${p.id}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.06, ease: EASE }}>
                  <Link to={activityPath(p)} className="group flex items-center gap-3 rounded-2xl bg-white/[0.06] p-3 transition hover:bg-white/[0.1]">
                    <PlaceIcon type={p.activityType} size="sm" />
                    <span className="min-w-0 flex-1">
                      <b className="block truncate text-sm">{placeTitle(p)}</b>
                      <span className="block truncate text-xs text-white/55">
                        {p.businessCategory || ACTIVITY_META[p.activityType].label}
                        {formatDistance(p.distance) && ` · ${formatDistance(p.distance)} from centre`}
                      </span>
                    </span>
                    <ArrowRight className="size-4 shrink-0 text-white/40 transition group-hover:translate-x-0.5 group-hover:text-white" />
                  </Link>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
