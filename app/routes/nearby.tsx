// Nearby, mirroring the app's Near Me screen (urbn-mobile
// src/app/(public)/activities-nearby.tsx): search around the visitor's location
// (used automatically when already allowed) or a default centre, "Search nearby…"
// with sort and type filters, category chips with counts, list mode by default and
// a map mode with "Search this area". Opening a place shows its detail sheet.
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { clsx } from "clsx";
import { Check, Filter, List, LoaderCircle, Map as MapIcon, Navigation, Search, SlidersHorizontal, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, type ShouldRevalidateFunctionArgs, useSearchParams } from "react-router";
import { EASE, WordsReveal } from "~/components/motion";
import { NearbyCategoryChips, NearbyDetail, NearbyListCard, NearbyRowCard, NearbySelectedCard, SampleBadge } from "~/components/nearby";
import type { MapArea } from "~/components/nearby-map";
import { ButtonLink } from "~/components/ui";
import { ACTIVITY_META, ALL_TYPES, placeTitle } from "~/lib/nearby/categories";
import { nearbyCategories, parseNearbyQuery, resolveOrigin, searchNearby } from "~/lib/nearby/source.server";
import {
  type ActivityType,
  activityPath,
  type CategoryCount,
  DEFAULT_RADIUS,
  LIST_LIMIT,
  MAP_LIMIT,
  type NearbyPlace,
  type NearbyPlaceDetail,
  type NearbyResult,
  type NearbySort,
} from "~/lib/nearby/types";
import { getPlace, LIVE_AREAS, PLACES } from "~/lib/places";
import { HUB_TYPES, hubPath } from "~/lib/nearby/seo";
import { breadcrumbs, seo } from "~/lib/seo";
import type { Route } from "./+types/nearby";

// Leaflet touches `window`; load the map only in the browser, only in map mode.
const NearbyMap = lazy(() => import("~/components/nearby-map").then((m) => ({ default: m.NearbyMap })));

type Center = { lat: number; lng: number; radius: number };

export async function loader({ request }: Route.LoaderArgs) {
  const sp = new URL(request.url).searchParams;
  // Device coordinates never reach page URLs; the first render uses the default centre (or ?area=).
  sp.delete("lat");
  sp.delete("lng");
  const q = { ...parseNearbyQuery(sp), limit: LIST_LIMIT, page: 1 };
  const o = resolveOrigin(q);
  const [first, categories] = await Promise.all([searchNearby(q), nearbyCategories(q)]);
  return { first, categories, center: o ? { lat: o.lat, lng: o.lng, radius: o.radius } : null, areaName: getPlace(q.area ?? "ibadan")?.name ?? "Ibadan" };
}

export function shouldRevalidate({ currentUrl, nextUrl, defaultShouldRevalidate }: ShouldRevalidateFunctionArgs) {
  return currentUrl.pathname === nextUrl.pathname ? false : defaultShouldRevalidate;
}

export const meta: Route.MetaFunction = () =>
  seo({
    title: "Nearby: Discover Places Around You",
    description:
      "Discover the businesses, schools, clinics, restaurants and other places recorded at properties around you. Search, filter by type and get directions.",
    path: "/nearby",
    jsonLd: breadcrumbs([
      { name: "Home", path: "/" },
      { name: "Nearby", path: "/nearby" },
    ]),
  });

const SORTS: { value: NearbySort; label: string }[] = [
  { value: "NEAREST", label: "Nearest" },
  { value: "NEWEST", label: "Newest" },
  { value: "ALPHABETICAL", label: "A–Z" },
];

const fetchJson = async <T,>(url: string, signal?: AbortSignal) => {
  const r = await fetch(url, { signal });
  if (!r.ok) throw new Error(String(r.status));
  return (await r.json()) as T;
};

export default function Nearby({ loaderData }: Route.ComponentProps) {
  const [sp, setSp] = useSearchParams();
  const view = sp.get("view") === "map" ? "map" : "list";
  const type = (sp.get("type") as ActivityType | null) ?? undefined;
  const sort = (sp.get("sort") as NearbySort | null) ?? "NEAREST";
  const placeId = sp.get("place");

  const fallback = loaderData.center ?? { lat: 7.3964, lng: 3.9167, radius: DEFAULT_RADIUS };
  const [center, setCenter] = useState<Center>(fallback);
  const [user, setUser] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);
  const [text, setText] = useState(sp.get("q") ?? "");
  const [q, setQ] = useState(sp.get("q") ?? "");
  const [selected, setSelected] = useState<NearbyPlace | null>(null);
  const [menu, setMenu] = useState<"sort" | "filter" | null>(null);

  const set = useCallback(
    (patch: Record<string, string | null>) =>
      setSp(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const [k, v] of Object.entries(patch)) (v == null || v === "" ? next.delete(k) : next.set(k, v));
          return next;
        },
        { preventScrollReset: true },
      ),
    [setSp],
  );

  // Debounced text search (400 ms, as in the app); the URL keeps it shareable.
  useEffect(() => {
    const t = setTimeout(() => {
      setQ(text.trim());
      if ((sp.get("q") ?? "") !== text.trim()) set({ q: text.trim() || null });
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  const locate = useCallback((silent: boolean) => {
    if (!("geolocation" in navigator)) return !silent && setLocError("Could not get your current location.");
    setLocating(true);
    setLocError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const here = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUser(here);
        setCenter({ ...here, radius: DEFAULT_RADIUS });
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        if (!silent) setLocError(err.code === err.PERMISSION_DENIED ? "Location permission denied." : "Could not get your current location.");
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 300_000 },
    );
  }, []);

  // Like the app, centre on the visitor automatically, but only when they've already allowed location.
  // A first-time visitor isn't prompted on page load; they tap Use My Location.
  useEffect(() => {
    navigator.permissions
      ?.query({ name: "geolocation" as PermissionName })
      .then((s) => s.state === "granted" && locate(true))
      .catch(() => {});
  }, [locate]);

  const isDefault = !user && center.lat === fallback.lat && center.lng === fallback.lng && center.radius === fallback.radius;
  const params = useMemo(() => {
    const p = new URLSearchParams({ lat: center.lat.toFixed(5), lng: center.lng.toFixed(5), radius: String(center.radius), sort });
    if (type) p.set("type", type);
    if (q) p.set("q", q);
    return p.toString();
  }, [center, type, q, sort]);
  const limit = view === "map" ? MAP_LIMIT : LIST_LIMIT;
  const firstMatchesLoader = isDefault && !type && !q && sort === "NEAREST" && view === "list";

  const results = useInfiniteQuery({
    queryKey: ["nearby", params, limit],
    queryFn: ({ pageParam, signal }) => fetchJson<NearbyResult>(`/api/nearby?${params}&page=${pageParam}&limit=${limit}`, signal),
    initialPageParam: 1,
    // Map mode never paginates (one larger page), like the app.
    getNextPageParam: (last) => (view === "list" && last.meta.page < last.meta.totalPages ? last.meta.page + 1 : undefined),
    initialData: firstMatchesLoader ? { pages: [loaderData.first], pageParams: [1] } : undefined,
    staleTime: 60_000,
  });
  // Chip counts ignore the text query so the row stays stable while typing.
  const cats = useQuery({
    queryKey: ["nearby-cats", center.lat, center.lng, center.radius],
    queryFn: ({ signal }) =>
      fetchJson<{ categories: CategoryCount[] }>(`/api/nearby?lat=${center.lat.toFixed(5)}&lng=${center.lng.toFixed(5)}&radius=${center.radius}&categories=1&limit=1`, signal).then(
        (r) => r.categories ?? [],
      ),
    initialData: isDefault ? loaderData.categories : undefined,
    staleTime: 60_000,
  });

  const places = useMemo(() => {
    const seen = new Set<string>();
    return (results.data?.pages ?? []).flatMap((p) => p.places).filter((p) => !seen.has(p.id) && seen.add(p.id));
  }, [results.data]);
  const sample = results.data?.pages[0]?.source === "sample";
  const loadingFirst = results.isLoading || (results.isFetching && !results.isFetchingNextPage && places.length === 0);

  // Infinite scroll in list mode (the app loads more at the end of the list).
  const sentinel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinel.current;
    if (!el || view !== "list") return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && results.hasNextPage && !results.isFetchingNextPage && results.fetchNextPage(), { rootMargin: "400px" });
    io.observe(el);
    return () => io.disconnect();
  }, [view, results.hasNextPage, results.isFetchingNextPage, results.fetchNextPage]);

  const atUser = !!user && center.lat === user.lat && center.lng === user.lng;
  const where = atUser ? "your location" : isDefault ? loaderData.areaName : "this area";

  return (
    <>
      <Hero />
      <section id="search" className="scroll-mt-16 bg-[#F9FAFB] pt-6 pb-24 sm:pt-14">
        <div className="container-x">
          <div className="sticky top-0 z-40 -mx-4 bg-[#F9FAFB]/95 px-4 pt-3 pb-3 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:static lg:mx-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
            {/* App-style header: title, my location, list/map switch */}
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] tracking-widest text-neutral-400 uppercase">Urbn</p>
                <h2 className="font-sans text-xl font-bold tracking-tight sm:text-3xl">Nearby</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => locate(false)}
                  aria-pressed={!!user}
                  className={clsx(
                    "inline-flex h-10 items-center gap-2 rounded-[10px] px-3 text-sm font-semibold transition-colors",
                    user ? "bg-urbn text-white" : "bg-fog text-neutral-600 hover:text-ink",
                  )}
                >
                  {locating ? <LoaderCircle className="size-4 animate-spin" /> : <Navigation className="size-4" />}
                  <span className="hidden sm:inline">Use My Location</span>
                  <span className="sr-only sm:hidden">Use My Location</span>
                </button>
                <div className="flex rounded-xl bg-fog p-1" role="group" aria-label="View">
                  {(["list", "map"] as const).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => {
                        setSelected(null);
                        set({ view: v === "map" ? "map" : null });
                      }}
                      aria-pressed={view === v}
                      aria-label={v === "list" ? "List View" : "Map View"}
                      className={clsx("rounded-lg px-3 py-2 transition-colors", view === v ? "bg-white text-ink shadow-sm" : "text-neutral-500")}
                    >
                      {v === "list" ? <List className="size-[18px]" /> : <MapIcon className="size-[18px]" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Search nearby… with sort and type filter, as in the app */}
            <div className="relative mt-3 lg:mt-5">
              <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 ring-1 ring-black/5 focus-within:ring-2 focus-within:ring-urbn">
                <Search className="size-4 shrink-0 text-neutral-500" />
                <label htmlFor="nearby-q" className="sr-only">Search nearby</label>
                <input
                  id="nearby-q"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Search nearby..."
                  autoComplete="off"
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-neutral-400"
                />
                {text && (
                  <button type="button" onClick={() => setText("")} aria-label="Clear search" className="text-neutral-500 hover:text-ink">
                    <X className="size-4" />
                  </button>
                )}
                <button type="button" onClick={() => setMenu(menu === "sort" ? null : "sort")} aria-expanded={menu === "sort"} aria-label="Sort by" className="text-neutral-500 hover:text-ink">
                  <SlidersHorizontal className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setMenu(menu === "filter" ? null : "filter")}
                  aria-expanded={menu === "filter"}
                  aria-label={type ? `Filter by type: ${ACTIVITY_META[type].label}` : "Filter by type"}
                  className={type ? "text-ink" : "text-neutral-500 hover:text-ink"}
                >
                  <Filter className={clsx("size-4", type && "fill-ink")} />
                </button>
              </div>
              <AnimatePresence>
                {menu && (
                  <OptionsMenu
                    key={menu}
                    title={menu === "sort" ? "Sort by" : "Filter by type"}
                    onClose={() => setMenu(null)}
                    options={
                      menu === "sort"
                        ? SORTS.map((s) => ({ key: s.value, label: s.label, active: sort === s.value, pick: () => set({ sort: s.value === "NEAREST" ? null : s.value }) }))
                        : [
                            { key: "all", label: "All types", active: !type, pick: () => set({ type: null }) },
                            ...ALL_TYPES.map((t) => ({ key: t, label: ACTIVITY_META[t].label, active: type === t, pick: () => set({ type: t }) })),
                          ]
                    }
                  />
                )}
              </AnimatePresence>
            </div>

            <div className="mt-3">
              <NearbyCategoryChips categories={cats.data ?? []} selected={type} onChange={(t) => set({ type: t ?? null })} />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm text-neutral-600" aria-live="polite">
            <span>
              {loadingFirst ? "Searching…" : `Places around ${where}`}
              {locError && <span className="ml-2 text-error">{locError}</span>}
            </span>
            {sample && (
              <span className="inline-flex items-center gap-2 text-xs text-neutral-500">
                <SampleBadge /> Sample places until live data is connected
              </span>
            )}
          </div>

          {view === "list" ? (
            <div className="mt-3">
              {results.isError ? (
                <Empty title="Couldn't load nearby places" body="Check your connection and try again.">
                  <button type="button" onClick={() => results.refetch()} className="mt-3 rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-white">Try Again</button>
                </Empty>
              ) : loadingFirst ? (
                <ListSkeleton />
              ) : places.length === 0 ? (
                <Empty title="Nothing found nearby" body="Try widening the search area or clearing the type filter." />
              ) : (
                <ul className={clsx("grid gap-3 sm:grid-cols-2 lg:grid-cols-3", results.isFetching && !results.isFetchingNextPage && "opacity-60")}>
                  {places.map((p) => (
                    <li key={p.id}>
                      <NearbyListCard place={p} to={activityPath(p)} onOpen={() => set({ place: p.id })} />
                    </li>
                  ))}
                </ul>
              )}
              <div ref={sentinel} />
              {results.isFetchingNextPage && (
                <p className="flex justify-center py-6 text-neutral-400">
                  <LoaderCircle className="size-5 animate-spin" />
                </p>
              )}
            </div>
          ) : (
            <div className="relative mt-3 -mx-4 sm:mx-0">
              <Suspense fallback={<div className="h-[calc(100svh-15rem)] min-h-[28rem] animate-pulse bg-fog sm:rounded-2xl" />}>
                <NearbyMap
                  places={places}
                  center={center}
                  selectedId={selected?.id}
                  user={user}
                  locating={locating}
                  onSelect={setSelected}
                  onSearchArea={(a: MapArea) => {
                    setSelected(null);
                    setCenter(a);
                  }}
                  onLocate={() => locate(false)}
                  className="h-[calc(100svh-15rem)] min-h-[28rem] sm:rounded-2xl lg:h-[40rem]"
                />
              </Suspense>
              {/* bottom: results strip, or the selected place */}
              <div className="pointer-events-none absolute inset-x-0 bottom-4 z-[500]">
                {selected ? (
                  <div className="pointer-events-auto mx-4 sm:max-w-md">
                    <NearbySelectedCard place={selected} to={activityPath(selected)} onOpen={() => set({ place: selected.id })} onClose={() => setSelected(null)} />
                  </div>
                ) : loadingFirst ? (
                  <div className="pointer-events-auto mx-4 flex justify-center rounded-2xl bg-white p-4 shadow-lg sm:max-w-md">
                    <LoaderCircle className="size-5 animate-spin" />
                  </div>
                ) : places.length === 0 ? (
                  <div className="pointer-events-auto mx-4 rounded-2xl bg-white p-4 text-center shadow-lg sm:max-w-md">
                    <p className="text-sm font-semibold">Nothing found nearby</p>
                    <p className="mt-1 text-xs text-neutral-500">Try widening the search area or clearing the type filter.</p>
                  </div>
                ) : (
                  <div className="no-scrollbar pointer-events-auto flex snap-x gap-3 overflow-x-auto px-4">
                    {places.map((p) => (
                      <NearbyRowCard key={p.id} place={p} selected={false} onSelect={() => setSelected(p)} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      <BrowseByArea />

      <PlaceSheet id={placeId} places={places} onClose={() => set({ place: null })} />
    </>
  );
}

/** Plain links to every area and category page, so people and search engines can browse without the tool. */
function BrowseByArea() {
  const areas = [PLACES[0], ...LIVE_AREAS];
  return (
    <section className="border-t border-black/5 bg-white py-14 sm:py-20" aria-labelledby="browse-heading">
      <div className="container-x">
        <h2 id="browse-heading" className="text-2xl sm:text-3xl">Browse Nearby by Area</h2>
        <div className="mt-6 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
          {areas.map((a) => (
            <div key={a.slug}>
              <Link to={hubPath(a.slug)} className="font-semibold hover:text-urbn">
                Places in {a.name}
              </Link>
              <p className="mt-1.5 text-sm leading-relaxed text-neutral-500">
                {HUB_TYPES.slice(0, 6).map((t, i) => (
                  <span key={t}>
                    {i > 0 && " · "}
                    <Link to={hubPath(a.slug, t)} className="hover:text-ink hover:underline">
                      {ACTIVITY_META[t].plural}
                    </Link>
                  </span>
                ))}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-mist">
      <motion.div
        className="absolute inset-y-0 right-0 -z-10 w-full lg:w-[70%]"
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.4, ease: EASE }}
      >
        <img
          src="/images/hero-lagos.webp"
          srcSet="/images/hero-lagos-768.webp 768w, /images/hero-lagos.webp 1440w"
          sizes="(min-width: 1024px) 70vw, 100vw"
          alt="A busy Nigerian street lined with shops, offices and homes"
          fetchPriority="high"
          className="size-full object-cover object-[60%_center]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-mist via-mist/70 to-transparent lg:via-mist/10" />
        <div className="absolute inset-0 bg-mist/75 lg:hidden" />
      </motion.div>
      <div className="container-x flex min-h-[18rem] flex-col justify-end pt-16 pb-8 sm:min-h-[30rem] sm:pt-24 sm:pb-12 lg:min-h-[32rem] lg:justify-center lg:py-20">
        <WordsReveal text="Discover What Is Around You." className="max-w-xl text-[2.6rem] leading-[1] sm:text-7xl" />
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8, ease: EASE }}>
          <p className="mt-3 max-w-md text-[15px] text-neutral-700 sm:mt-6 sm:text-lg">
            Find the businesses, schools, clinics, restaurants and other places recorded at properties near you, then get
            directions in a tap.
          </p>
          <div className="mt-8 hidden flex-wrap gap-3 sm:flex">
            <a href="#search" className="inline-flex h-11 items-center rounded-[10px] bg-ink px-5 text-[15px] font-medium text-white transition hover:bg-neutral-800">
              Explore Nearby
            </a>
            <ButtonLink to="/download" variant="dark" arrow={false}>
              Get the App
            </ButtonLink>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/** Sort / type pickers, the web version of the app's bottom sheets. */
function OptionsMenu({ title, options, onClose }: { title: string; options: { key: string; label: string; active: boolean; pick: () => void }[]; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const down = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && !(e.target as HTMLElement).closest("[aria-expanded]") && onClose();
    const key = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("pointerdown", down);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("pointerdown", down);
      document.removeEventListener("keydown", key);
    };
  }, [onClose]);
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.18 }}
      className="absolute top-full right-0 z-50 mt-2 max-h-[60svh] w-full overflow-y-auto rounded-2xl bg-white p-4 shadow-xl ring-1 ring-black/5 sm:w-72"
      role="dialog"
      aria-label={title}
    >
      <p className="mb-2 text-base font-bold">{title}</p>
      <ul>
        {options.map((o) => (
          <li key={o.key}>
            <button
              type="button"
              onClick={() => {
                o.pick();
                onClose();
              }}
              className="flex w-full items-center justify-between border-b border-neutral-100 py-3 text-left text-sm last:border-0"
            >
              {o.label}
              {o.active && <Check className="size-4" />}
            </button>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

/** The app's ActivityDetailSheet: a bottom sheet on phones, a side sheet on desktop. Photos load when opened. */
function PlaceSheet({ id, places, onClose }: { id: string | null; places: NearbyPlace[]; onClose: () => void }) {
  const fromList = places.find((p) => p.id === id);
  const detail = useQuery({
    queryKey: ["nearby-place", id],
    queryFn: ({ signal }) => fetchJson<NearbyPlaceDetail>(`/api/nearby/${encodeURIComponent(id!)}`, signal),
    enabled: !!id,
    retry: false,
    staleTime: 60_000,
  });
  // Keep the list's distance (the detail endpoint has none), add the detail's photos.
  const place = fromList ? { ...fromList, description: detail.data?.description ?? fromList.description } : detail.data;
  useEffect(() => {
    if (!id) return;
    const key = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", key);
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", key);
      document.documentElement.style.overflow = "";
    };
  }, [id, onClose]);

  return (
    <AnimatePresence>
      {id && (
        <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label={place ? placeTitle(place) : "Place"}>
          <motion.div className="absolute inset-0 bg-black/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            className="absolute inset-x-0 bottom-0 max-h-[88svh] overflow-y-auto rounded-t-[1.75rem] bg-white px-5 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] lg:inset-y-0 lg:right-0 lg:left-auto lg:max-h-none lg:w-[30rem] lg:rounded-none lg:px-7 lg:pt-6"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-neutral-200 lg:hidden" />
            <div className="mb-4 flex items-center justify-between">
              {place ? (
                <Link to={activityPath(place)} className="text-xs font-semibold text-neutral-500 hover:text-ink">
                  Open Full Page ↗
                </Link>
              ) : (
                <span />
              )}
              <button type="button" onClick={onClose} aria-label="Close" className="grid size-9 place-items-center rounded-full bg-mist hover:bg-fog">
                <X className="size-4" />
              </button>
            </div>
            {place ? (
              <NearbyDetail place={place} images={detail.data?.images ?? []} extras={detail.data?.extras} />
            ) : detail.isError ? (
              <Empty title="This activity is no longer available to view." body="It may have closed or been made private." />
            ) : (
              <div className="space-y-3">
                <div className="h-56 animate-pulse rounded-2xl bg-mist" />
                <div className="h-6 w-2/3 animate-pulse rounded bg-mist" />
                <div className="h-4 w-1/3 animate-pulse rounded bg-mist" />
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function ListSkeleton() {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-hidden>
      {Array.from({ length: 6 }).map((_, i) => (
        <li key={i} className="flex items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-black/5">
          <span className="size-14 animate-pulse rounded-xl bg-mist" />
          <span className="flex-1 space-y-2">
            <span className="block h-3.5 w-2/3 animate-pulse rounded bg-mist" />
            <span className="block h-3 w-1/2 animate-pulse rounded bg-mist" />
            <span className="block h-3 w-1/3 animate-pulse rounded bg-mist" />
          </span>
        </li>
      ))}
    </ul>
  );
}

function Empty({ title, body, children }: { title: string; body: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-2xl bg-white p-6 text-center ring-1 ring-black/5">
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-xs text-neutral-500">{body}</p>
      {children}
    </div>
  );
}
