import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { clsx } from "clsx";
import { Crosshair, List, LoaderCircle, Map as MapIcon, MapPin, Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { type ShouldRevalidateFunctionArgs, useLocation, useSearchParams } from "react-router";
import { CategoryChip, NearbyMap, PlaceCard, SampleBadge } from "~/components/nearby";
import { ButtonLink } from "~/components/ui";
import { DISCOVERABLE_TYPES, ACTIVITY_META, SHORTCUT_TYPES } from "~/lib/nearby/categories";
import { nearbyCategories, parseNearbyQuery, searchNearby } from "~/lib/nearby/source.server";
import { type ActivityType, type CategoryCount, DEFAULT_RADIUS, type NearbyResult, RADII } from "~/lib/nearby/types";
import { getPlace, PLACES } from "~/lib/places";
import { breadcrumbs, seo } from "~/lib/seo";
import type { Route } from "./+types/nearby";

const AREAS = PLACES.filter((p) => p.live && p.center);
const PAGE = 12;

export async function loader({ request }: Route.LoaderArgs) {
  const sp = new URL(request.url).searchParams;
  // Device coordinates never reach the page URL; the loader only sees manual areas.
  sp.delete("lat");
  sp.delete("lng");
  const q = { ...parseNearbyQuery(sp), limit: PAGE };
  const [first, categories] = await Promise.all([searchNearby(q), nearbyCategories(q)]);
  return { first, categories, key: keyOf(sp) };
}

// Filters change client-side through TanStack Query; don't re-run the loader for them.
export function shouldRevalidate({ currentUrl, nextUrl, defaultShouldRevalidate }: ShouldRevalidateFunctionArgs) {
  return currentUrl.pathname === nextUrl.pathname ? false : defaultShouldRevalidate;
}

export const meta: Route.MetaFunction = () =>
  seo({
    title: "Nearby: Discover Places Around You in Ibadan",
    description:
      "Choose a location to discover businesses, schools, clinics, restaurants and other places recorded at properties around it. Each place links to its property's Urbn record.",
    path: "/nearby",
    jsonLd: breadcrumbs([
      { name: "Home", path: "/" },
      { name: "Nearby", path: "/nearby" },
    ]),
  });

const FILTER_KEYS = ["area", "type", "q", "radius", "sort"] as const;
const keyOf = (sp: URLSearchParams) => JSON.stringify(FILTER_KEYS.map((k) => sp.get(k) ?? ""));

type Point = { lat: number; lng: number };
type Geo = "idle" | "locating" | "denied" | "unavailable";

export default function Nearby({ loaderData }: Route.ComponentProps) {
  const [sp, setSp] = useSearchParams();
  const location = useLocation();
  const [point, setPoint] = useState<Point | null>(null); // device location: temporary state only
  const [geo, setGeo] = useState<Geo>("idle");
  const [view, setView] = useState<"list" | "map">("list");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [allCats, setAllCats] = useState(false);
  const [text, setText] = useState(sp.get("q") ?? "");
  const debounce = useRef<ReturnType<typeof setTimeout>>(undefined);

  const area = point ? null : getPlace(sp.get("area") ?? "ibadan") ?? getPlace("ibadan")!;
  const type = (sp.get("type") as ActivityType | null) ?? undefined;
  const radiusParam = sp.get("radius");
  const q = sp.get("q") ?? "";
  const sort = sp.get("sort") ?? "NEAREST";
  const key = keyOf(sp);

  const set = (patch: Record<string, string | null>) =>
    setSp(
      (prev) => {
        const next = new URLSearchParams(prev);
        for (const [k, v] of Object.entries(patch)) (v == null || v === "" ? next.delete(k) : next.set(k, v));
        return next;
      },
      { replace: true, preventScrollReset: true },
    );

  const params = useMemo(() => {
    const p = new URLSearchParams();
    for (const k of FILTER_KEYS) {
      const v = sp.get(k);
      if (v) p.set(k, v);
    }
    if (point) {
      p.delete("area");
      p.set("lat", point.lat.toFixed(5));
      p.set("lng", point.lng.toFixed(5));
    }
    return p;
  }, [key, point]);
  const useLoader = !point && key === loaderData.key;

  const results = useInfiniteQuery({
    queryKey: ["nearby", params.toString()],
    queryFn: async ({ pageParam, signal }) => {
      const r = await fetch(`/api/nearby?${params}&page=${pageParam}&limit=${PAGE}`, { signal });
      if (!r.ok) throw new Error("We could not load nearby places.");
      const json = (await r.json()) as NearbyResult;
      if (json.error) throw new Error("We could not load nearby places.");
      return json;
    },
    initialPageParam: 1,
    getNextPageParam: (last) => (last.meta.page < last.meta.totalPages ? last.meta.page + 1 : undefined),
    initialData: useLoader ? { pages: [loaderData.first], pageParams: [1] } : undefined,
    staleTime: 60_000,
  });
  const categories = useQuery({
    queryKey: ["nearby-cats", point ? `${point.lat},${point.lng}` : sp.get("area") ?? "", radiusParam ?? ""],
    queryFn: async ({ signal }) => {
      const p = new URLSearchParams(params);
      p.set("categories", "1");
      p.set("limit", "1");
      const r = await fetch(`/api/nearby?${p}`, { signal });
      return ((await r.json()).categories ?? []) as CategoryCount[];
    },
    initialData: useLoader ? loaderData.categories : undefined,
    staleTime: 60_000,
  });

  const pages = results.data?.pages ?? [];
  const first = pages[0];
  // Deduplicate by id across pages; stale pages are discarded with the query key.
  const places = useMemo(() => {
    const seen = new Set<string>();
    return pages.flatMap((p) => p.places).filter((p) => !seen.has(p.id) && seen.add(p.id));
  }, [pages]);
  const total = first?.meta.total ?? 0;
  const radius = first?.radius ?? Number(radiusParam ?? DEFAULT_RADIUS);
  const origin = first?.origin ?? null;
  const sample = first?.source === "sample";
  const originPoint = point ?? (area?.center ? { lat: area.center[0], lng: area.center[1] } : null);
  const from = location.search;

  const useMyLocation = () => {
    if (!("geolocation" in navigator)) return setGeo("unavailable");
    setGeo("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPoint({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeo("idle");
      },
      (err) => setGeo(err.code === err.PERMISSION_DENIED ? "denied" : "unavailable"),
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 300_000 },
    );
  };
  const chooseArea = (slug: string) => {
    setPoint(null);
    setGeo("idle");
    set({ area: slug === "ibadan" ? null : slug, radius: null });
  };

  useEffect(() => () => clearTimeout(debounce.current), []);
  const counts = new Map(categories.data?.map((c) => [c.value, c.count]) ?? []);
  const chipTypes = [...new Set([...SHORTCUT_TYPES, ...(type ? [type] : [])])];
  const moreTypes = DISCOVERABLE_TYPES.filter((t) => !chipTypes.includes(t));

  return (
    <div className="bg-[#F9FAFB] pb-24">
      {/* compact, functional header: controls before marketing */}
      <section className="container-x pt-8 sm:pt-12">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">
              <span className="size-2 rounded-full bg-urbn" /> Nearby
            </p>
            <h1 className="mt-2 text-[2.2rem] leading-none sm:text-5xl">Discover What Is Around You</h1>
            <p className="mt-3 max-w-xl text-[15px] text-neutral-600">Choose a location to discover the places recorded around it.</p>
          </div>
          {sample && (
            <p className="flex max-w-sm items-start gap-2 rounded-xl bg-warning/10 px-3 py-2 text-xs text-neutral-700">
              <SampleBadge className="mt-px" /> These are sample places. Live places appear here once public data is connected.
            </p>
          )}
        </div>
      </section>

      {/* controls */}
      <section className="sticky top-0 z-40 mt-5 border-b border-black/5 bg-[#F9FAFB]/95 backdrop-blur-xl lg:static lg:border-0 lg:bg-transparent lg:backdrop-blur-none">
        <div className="container-x space-y-3 py-3">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
            <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:px-0" role="group" aria-label="Choose an area">
              <button
                type="button"
                onClick={useMyLocation}
                aria-pressed={!!point}
                className={clsx(
                  "inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-[13px] font-semibold transition",
                  point ? "bg-urbn text-white" : "bg-white text-urbn ring-1 ring-urbn/30 hover:ring-urbn",
                )}
              >
                {geo === "locating" ? <LoaderCircle className="size-4 animate-spin" /> : <Crosshair className="size-4" />}
                Use My Location
              </button>
              {AREAS.map((a) => (
                <CategoryChip key={a.slug} active={!point && area?.slug === a.slug} onClick={() => chooseArea(a.slug)}>
                  {a.kind === "city" ? `All of ${a.name}` : a.name}
                </CategoryChip>
              ))}
            </div>
            <form
              role="search"
              onSubmit={(e) => {
                e.preventDefault();
                clearTimeout(debounce.current);
                set({ q: text.trim() || null });
              }}
              className="flex flex-1 items-center gap-2 rounded-xl bg-white px-3.5 ring-1 ring-black/10 focus-within:ring-2 focus-within:ring-urbn lg:ml-2"
            >
              <Search className="size-4 shrink-0 text-neutral-500" />
              <label htmlFor="nearby-q" className="sr-only">Search Places</label>
              <input
                id="nearby-q"
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  clearTimeout(debounce.current);
                  const v = e.target.value.trim();
                  debounce.current = setTimeout(() => set({ q: v || null }), 450);
                }}
                placeholder="Search by name or keyword"
                className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-neutral-400"
              />
              {text && (
                <button type="button" aria-label="Clear search" onClick={() => { setText(""); set({ q: null }); }} className="text-neutral-500 hover:text-ink">
                  <X className="size-4" />
                </button>
              )}
            </form>
          </div>

          <div className="no-scrollbar -mx-4 flex items-center gap-2 overflow-x-auto px-4 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0" role="group" aria-label="Categories">
            <CategoryChip active={!type} onClick={() => set({ type: null })} count={categories.data?.reduce((s, c) => s + c.count, 0)}>
              All
            </CategoryChip>
            {chipTypes.map((t) => (
              <CategoryChip key={t} active={type === t} onClick={() => set({ type: type === t ? null : t })} icon={ACTIVITY_META[t].icon} count={counts.get(t) ?? 0}>
                {ACTIVITY_META[t].plural}
              </CategoryChip>
            ))}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setAllCats((v) => !v)}
                aria-expanded={allCats}
                className="inline-flex h-9 items-center gap-1.5 rounded-full bg-white px-3.5 text-[13px] font-semibold text-neutral-700 ring-1 ring-black/10 hover:ring-neutral-400"
              >
                <SlidersHorizontal className="size-4" /> More Categories
              </button>
            </div>
            <span className="mx-1 h-6 w-px shrink-0 bg-neutral-200" />
            <div className="flex shrink-0 rounded-full bg-white p-1 ring-1 ring-black/10" role="group" aria-label="Radius">
              {RADII.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => set({ radius: String(r) })}
                  aria-pressed={radius === r}
                  className={clsx("rounded-full px-2.5 py-1 text-xs font-semibold transition", radius === r ? "bg-ink text-white" : "text-neutral-600 hover:text-ink")}
                >
                  {r} km
                </button>
              ))}
            </div>
            <label className="sr-only" htmlFor="nearby-sort">Sort</label>
            <select
              id="nearby-sort"
              value={sort}
              onChange={(e) => set({ sort: e.target.value === "NEAREST" ? null : e.target.value })}
              className="h-9 shrink-0 rounded-full bg-white px-3 text-[13px] font-semibold ring-1 ring-black/10"
            >
              <option value="NEAREST">Nearest First</option>
              <option value="NEWEST">Newest</option>
              <option value="ALPHABETICAL">A–Z</option>
            </select>
          </div>
          {allCats && (
            <div className="flex flex-wrap gap-2 rounded-2xl bg-white p-3 ring-1 ring-black/5">
              {moreTypes.map((t) => (
                <CategoryChip
                  key={t}
                  active={type === t}
                  onClick={() => {
                    set({ type: t });
                    setAllCats(false);
                  }}
                  icon={ACTIVITY_META[t].icon}
                  count={counts.get(t) ?? 0}
                >
                  {ACTIVITY_META[t].plural}
                </CategoryChip>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* results */}
      <section className="container-x mt-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-neutral-600" aria-live="polite">
            {results.isFetching && !results.isFetchingNextPage ? (
              "Searching…"
            ) : (
              <>
                <b className="text-ink">{total} {total === 1 ? "place" : "places"}</b>
                {origin && <> · {origin.label}</>} · within {radius} km
                {origin?.note && <span className="hidden text-neutral-400 sm:inline"> · {origin.note}</span>}
              </>
            )}
          </p>
          <div className="flex rounded-xl bg-fog p-1 lg:hidden" role="group" aria-label="View">
            {(["list", "map"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                aria-pressed={view === v}
                aria-label={v === "list" ? "List View" : "Map View"}
                className={clsx("rounded-lg px-3 py-1.5 transition-colors", view === v ? "bg-white text-ink shadow-sm" : "text-neutral-500")}
              >
                {v === "list" ? <List className="size-[18px]" /> : <MapIcon className="size-[18px]" />}
              </button>
            ))}
          </div>
        </div>

        {geo === "denied" && <Notice>Location access is off. Choose an area to continue.</Notice>}
        {geo === "unavailable" && <Notice>We couldn't get your location. Choose an area to continue.</Notice>}

        <div className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
          <div className={clsx(view === "map" && "hidden lg:block")}>
            {results.isError ? (
              <State title="We could not load nearby places." body="Your filters are kept.">
                <button type="button" onClick={() => results.refetch()} className="rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-white">
                  Retry
                </button>
              </State>
            ) : !origin && !results.isFetching ? (
              <State title="Discovery is not available in this area yet." body="Choose one of the areas above, or get city updates.">
                <ButtonLink to="/download#launch-updates" variant="outline" size="sm">Get Launch Updates</ButtonLink>
              </State>
            ) : places.length === 0 && !results.isFetching ? (
              <State title="No recorded places match this search." body="Try another category or area, or search a wider radius.">
                <div className="flex flex-wrap justify-center gap-2">
                  {RADII.filter((r) => r > radius).slice(0, 1).map((r) => (
                    <button key={r} type="button" onClick={() => set({ radius: String(r) })} className="rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-white">
                      Search Within {r} km
                    </button>
                  ))}
                  {(type || q) && (
                    <button type="button" onClick={() => { setText(""); set({ type: null, q: null }); }} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-neutral-600 hover:bg-mist">
                      Clear Filters
                    </button>
                  )}
                </div>
              </State>
            ) : (
              <>
                <ul className={clsx("grid gap-3 transition-opacity sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2", results.isFetching && !results.isFetchingNextPage && "opacity-60")}>
                  {places.map((p) => (
                    <li key={p.id}>
                      <PlaceCard place={p} origin={origin} active={activeId === p.id} onHover={setActiveId} from={from} />
                    </li>
                  ))}
                </ul>
                {results.hasNextPage && (
                  <div className="mt-6 text-center">
                    <button
                      type="button"
                      onClick={() => results.fetchNextPage()}
                      disabled={results.isFetchingNextPage}
                      className="h-11 rounded-[10px] bg-ink px-6 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-60"
                    >
                      {results.isFetchingNextPage ? "Loading…" : `Load More (${places.length} of ${total})`}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
          <div className={clsx("lg:block", view === "list" && "hidden")}>
            <div className="lg:sticky lg:top-24">
              <NearbyMap
                places={places}
                originPoint={originPoint}
                originLabel={point ? "You" : area?.name}
                activeId={activeId}
                onSelect={setActiveId}
                className="-mx-4 h-[calc(100svh-17rem)] min-h-[24rem] sm:mx-0 sm:rounded-2xl lg:h-[calc(100svh-9rem)] lg:max-h-[46rem]"
              />
              <p className="mt-2 text-xs text-neutral-500">
                Markers show places recorded at properties. Places that share a property are grouped. {origin?.note ? `${origin.note}.` : ""}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <p role="status" className="mt-3 flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm text-neutral-700 ring-1 ring-black/5">
      <MapPin className="size-4 text-warning" /> {children}
    </p>
  );
}

function State({ title, body, children }: { title: string; body: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-neutral-300 px-6 py-16 text-center">
      <p className="font-semibold">{title}</p>
      <p className="text-sm text-neutral-500">{body}</p>
      {children}
    </div>
  );
}
