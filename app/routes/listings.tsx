import { keepPreviousData, useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { clsx } from "clsx";
import { List, Map as MapIcon, MapPin, Search, SlidersHorizontal, Sparkles, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { type ShouldRevalidateFunctionArgs, useSearchParams } from "react-router";
import { CtaBanner } from "~/components/cta-banner";
import { ListingCard } from "~/components/listing-card";
import { AiSearchPanel } from "~/components/marketplace/ai-search";
import { FilterPanel } from "~/components/marketplace/filter-panel";
import { MarketplaceMap } from "~/components/marketplace/map-view";
import { EASE, WordsReveal } from "~/components/motion";
import { ButtonLink } from "~/components/ui";
import { activeFilterCount, filtersToParams, parseFilters } from "~/lib/marketplace/filters";
import { aiSearch, featuredListings, searchListings } from "~/lib/marketplace/source.server";
import {
  type AiSearchResult,
  type ListingCard as Card,
  type ListingFilters,
  type Paged,
  LISTING_TYPE_CHIPS,
  listingPath,
} from "~/lib/marketplace/types";
import { IBADAN_LGAS, PLACES } from "~/lib/places";
import { breadcrumbs, seo } from "~/lib/seo";
import { absoluteUrl } from "~/lib/site";
import type { Route } from "./+types/listings";

const UI_KEYS = ["mode", "q", "view"];
const filterParams = (sp: URLSearchParams) => {
  const p = new URLSearchParams(sp);
  UI_KEYS.forEach((k) => p.delete(k));
  return p;
};

export async function loader({ request }: Route.LoaderArgs) {
  const sp = new URL(request.url).searchParams;
  const mode = sp.get("mode") === "ai" ? "ai" : "standard";
  const q = sp.get("q") ?? "";
  const filters = parseFilters(filterParams(sp));
  const [page, featured, ai] = await Promise.all([
    mode === "standard" ? searchListings(filters) : null,
    featuredListings(6),
    mode === "ai" && q ? aiSearch(q) : null,
  ]);
  return { key: filtersToParams(filters).toString(), page, featured, ai, q };
}

// Search, filters and AI results run client-side through TanStack Query.
export function shouldRevalidate({ currentUrl, nextUrl, defaultShouldRevalidate }: ShouldRevalidateFunctionArgs) {
  return currentUrl.pathname === nextUrl.pathname ? false : defaultShouldRevalidate;
}

export const meta: Route.MetaFunction = ({ loaderData }) =>
  seo({
    title: "Homes for Rent & Sale in Ibadan | Urbn",
    description:
      "Browse homes for rent or sale in Ibadan. Search by area, compare listing details and check each property's Urbn record.",
    path: "/listings",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "Listings on Urbn",
        itemListElement: (loaderData?.page?.data ?? loaderData?.featured ?? []).map((l, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: absoluteUrl(listingPath(l)),
          name: l.propertyTitle,
        })),
      },
      breadcrumbs([
        { name: "Home", path: "/" },
        { name: "Listings", path: "/listings" },
      ]),
    ],
  });

async function fetchPage(key: string, page: number): Promise<Paged<Card>> {
  const res = await fetch(`/api/listings?${key}${key ? "&" : ""}page=${page}`);
  if (!res.ok) throw new Error("We couldn't load the listings. Try again.");
  return res.json();
}

async function fetchAi(query: string): Promise<AiSearchResult> {
  const res = await fetch("/api/listings/ai-search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  const json = await res.json().catch(() => null);
  if (!json) throw new Error("AI Search is temporarily unavailable. Use search filters instead.");
  return json;
}

const SORTS = [
  { label: "Recommended", value: "" },
  { label: "Newest", value: "createdAt:desc" },
  { label: "Price: Low to High", value: "price:asc" },
  { label: "Price: High to Low", value: "price:desc" },
  { label: "Most Viewed", value: "views:desc" },
  { label: "Most Liked", value: "likeCount:desc" },
];

export default function Listings({ loaderData }: Route.ComponentProps) {
  const [sp, setSp] = useSearchParams();
  const mode = sp.get("mode") === "ai" ? "ai" : "standard";
  const view = sp.get("view") === "map" ? "map" : "list";
  const q = sp.get("q") ?? "";
  const filters = useMemo(() => parseFilters(filterParams(sp)), [sp]);
  const key = filtersToParams({ ...filters, page: undefined }).toString();
  const [panelOpen, setPanelOpen] = useState(false);

  const setParams = (mutate: (p: URLSearchParams) => void) => {
    const next = new URLSearchParams(sp);
    mutate(next);
    next.delete("page");
    setSp(next, { replace: true, preventScrollReset: true });
  };
  const applyFilters = (f: ListingFilters) =>
    setParams((p) => {
      const ui = UI_KEYS.map((k) => [k, p.get(k)] as const);
      [...p.keys()].forEach((k) => p.delete(k));
      filtersToParams(f).forEach((v, k) => p.set(k, v));
      ui.forEach(([k, v]) => v && p.set(k, v));
    });
  const patch = (f: Partial<ListingFilters>) => applyFilters({ ...filters, ...f });

  const standard = useInfiniteQuery({
    queryKey: ["listings", key],
    queryFn: ({ pageParam }) => fetchPage(key, pageParam),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.meta.page < last.meta.totalPages ? last.meta.page + 1 : undefined),
    initialData: loaderData.page && loaderData.key === key ? { pages: [loaderData.page], pageParams: [1] } : undefined,
    placeholderData: keepPreviousData,
    enabled: mode === "standard",
  });
  const ai = useQuery({
    queryKey: ["ai-search", q],
    queryFn: () => fetchAi(q),
    enabled: mode === "ai" && q.length >= 5,
    initialData: loaderData.ai && loaderData.q === q ? loaderData.ai : undefined,
    staleTime: 5 * 60_000,
  });

  const listings: Card[] = mode === "ai" ? (ai.data?.data ?? []) : (standard.data?.pages.flatMap((p) => p.data) ?? []);
  const total = mode === "ai" ? (ai.data?.meta.total ?? 0) : (standard.data?.pages[0]?.meta.total ?? 0);
  const busy = mode === "ai" ? ai.isFetching : standard.isFetching && !standard.isFetchingNextPage;
  const count = activeFilterCount(filters);
  const showFeatured = mode === "standard" && !count && !filters.search && !filters.listingType && view === "list" && loaderData.featured.length > 0;

  return (
    <>
      <Hero />
      <section id="search" className="scroll-mt-16 bg-[#F9FAFB] pt-6 pb-24 sm:pt-14">
        <div className="container-x">
          {/* phones: the toolbar pins to the top while results scroll, like the app */}
          <div className="sticky top-0 z-40 -mx-4 bg-[#F9FAFB]/95 px-4 pt-3 pb-3 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:static lg:mx-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
          {/* App-style header: title, AI toggle, list/map switch */}
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] tracking-widest text-neutral-400 uppercase">Urbn</p>
              <h2 className="font-sans text-xl font-bold tracking-tight sm:text-3xl">Listings</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setParams((p) => (mode === "ai" ? (p.delete("mode"), p.delete("q")) : p.set("mode", "ai")))}
                aria-pressed={mode === "ai"}
                className={clsx(
                  "inline-flex h-10 items-center gap-2 rounded-[10px] px-3 text-sm font-semibold transition-colors",
                  mode === "ai" ? "bg-urbn text-white" : "bg-fog text-neutral-600 hover:text-ink",
                )}
              >
                <Sparkles className="size-4" />
                <span className="hidden sm:inline">AI Search</span>
                <span className="sr-only sm:hidden">AI Search</span>
              </button>
              <div className="flex rounded-xl bg-fog p-1" role="group" aria-label="View">
                {(["list", "map"] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setParams((p) => (v === "map" ? p.set("view", "map") : p.delete("view")))}
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

          <div className="mt-3 lg:mt-5">
            <AnimatePresence mode="wait" initial={false}>
              {mode === "ai" ? (
                <motion.div key="ai" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3, ease: EASE }}>
                  <AiSearchPanel
                    defaultQuery={q}
                    busy={ai.isFetching}
                    error={ai.data?.error ?? (ai.error as Error | null)?.message}
                    quota={ai.data?.quota}
                    onSearch={(v) => setParams((p) => p.set("q", v))}
                  />
                </motion.div>
              ) : (
                <motion.div key="std" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3, ease: EASE }}>
                  <AreaSearch value={filters.search ?? ""} onChange={(search) => patch({ search: search || undefined })} />
                  <div className="mt-3 flex items-center gap-2">
                    <div className="no-scrollbar -ml-4 flex flex-1 gap-2 overflow-x-auto pl-4 sm:ml-0 sm:pl-0">
                      {LISTING_TYPE_CHIPS.map((c) => (
                        <button
                          key={c.label}
                          type="button"
                          onClick={() => patch({ listingType: c.value })}
                          aria-pressed={filters.listingType === c.value}
                          className={clsx(
                            "shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-colors",
                            filters.listingType === c.value ? "bg-ink text-white" : "border border-neutral-200 bg-white hover:border-ink",
                          )}
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>
                    <span className="h-6 w-px bg-neutral-200" />
                    <button
                      type="button"
                      onClick={() => setPanelOpen(true)}
                      aria-label={count > 0 ? `Filters, ${count} active` : "Filters"}
                      className="relative inline-flex h-10 shrink-0 items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 text-xs font-semibold hover:border-ink"
                    >
                      <SlidersHorizontal className="size-4" /> <span className="hidden sm:inline">Filters</span>
                      {count > 0 && <span className="grid size-5 place-items-center rounded-full bg-urbn text-[10px] text-white">{count}</span>}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          </div>

          {showFeatured && <FeaturedCarousel listings={loaderData.featured} />}

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 lg:mt-8">
            <div className="text-sm text-neutral-500" aria-live="polite">
              {mode === "ai" && q && ai.data && !ai.data.error ? (
                <p className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-urbn">
                  <Sparkles className="size-3" /> AI-matched results for: "{q}"
                  {ai.data.understood.map((u) => (
                    <span key={u} className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px]">{u}</span>
                  ))}
                </p>
              ) : (
                <p>
                  <span className="font-semibold text-ink">{total}</span> verified {total === 1 ? "listing" : "listings"}
                  {filters.search && <> in <span className="font-semibold text-ink">{filters.search}</span></>}
                </p>
              )}
              {busy && <span className="mt-1 block h-0.5 w-24 animate-pulse rounded bg-urbn" />}
            </div>
            {mode === "standard" && (
              <label className="flex items-center gap-2 text-sm">
                <span className="text-neutral-500">Sort</span>
                <select
                  value={filters.sortBy ? `${filters.sortBy}:${filters.sortOrder ?? "desc"}` : ""}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split(":") as [ListingFilters["sortBy"], ListingFilters["sortOrder"]];
                    patch({ sortBy: sortBy || undefined, sortOrder: sortOrder || undefined });
                  }}
                  className="h-10 rounded-lg border border-neutral-200 bg-white px-3 outline-none focus:border-urbn"
                >
                  {SORTS.map((s) => <option key={s.label} value={s.value}>{s.label}</option>)}
                </select>
              </label>
            )}
          </div>

          <div className={clsx("mt-5 transition-opacity", busy && "opacity-60")}>
            {listings.length === 0 ? (
              <EmptyState
                mode={mode}
                searched={mode === "ai" ? !!q && !!ai.data : true}
                filterCount={count + (filters.search ? 1 : 0) + (filters.listingType ? 1 : 0)}
                onAdjust={() => setPanelOpen(true)}
                onClear={() => applyFilters({})}
              />
            ) : view === "map" ? (
              <MarketplaceMap listings={listings} />
            ) : (
              <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence mode="popLayout">
                  {listings.map((l, i) => (
                    <motion.li
                      key={l.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.4, ease: EASE, delay: Math.min(i % 12, 6) * 0.04 }}
                    >
                      <ListingCard listing={l} priority={i < 3} />
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            )}
          </div>

          {mode === "standard" && view === "list" && standard.hasNextPage && (
            <div className="mt-10 text-center">
              <button
                type="button"
                onClick={() => standard.fetchNextPage()}
                disabled={standard.isFetchingNextPage}
                className="h-11 rounded-[10px] bg-ink px-6 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-60"
              >
                {standard.isFetchingNextPage ? "Loading…" : "Load More"}
              </button>
            </div>
          )}

          <AppStrip />
        </div>
      </section>
      <FilterPanel open={panelOpen} onClose={() => setPanelOpen(false)} value={filters} onApply={applyFilters} />
      <div className="h-20" />
      <CtaBanner
        title={<>Give Your Listing a <span className="text-urbn">Connected Record</span></>}
        body="Own or manage a property? Add its details, complete the required checks and publish eligible listings through Urbn."
      >
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <ButtonLink to="/for-owners" variant="light">For Owners</ButtonLink>
          <ButtonLink to="/for-agents" variant="light">For Agents & Managers</ButtonLink>
        </div>
      </CtaBanner>
    </>
  );
}

// ---------------------------------------------------------------------------

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
          src="/images/hero-billboard.webp"
          srcSet="/images/hero-billboard-640.webp 640w, /images/hero-billboard.webp 992w"
          sizes="(min-width: 1024px) 70vw, 100vw"
          alt="Verified apartment building with an Urbn DPI billboard"
          fetchPriority="high"
          className="size-full object-cover object-right"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-mist via-mist/70 to-transparent lg:via-mist/10" />
        <div className="absolute inset-0 bg-mist/75 lg:hidden" />
      </motion.div>
      <div className="container-x flex min-h-[18rem] flex-col justify-end pt-16 pb-8 sm:min-h-[30rem] sm:pt-24 sm:pb-12 lg:min-h-[32rem] lg:justify-center lg:py-20">
        <WordsReveal text="Find a Home That Fits." className="max-w-xl text-[2.6rem] leading-[1] sm:text-7xl" />
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8, ease: EASE }}>
          <p className="mt-3 max-w-md text-[15px] text-neutral-700 sm:mt-6 sm:text-lg">
            Explore available homes, compare the details and check each property's current verification status before
            taking the next step.
          </p>
          <div className="mt-8 hidden flex-wrap gap-3 sm:flex">
            <a href="#search" className="inline-flex h-11 items-center rounded-[10px] bg-ink px-5 text-[15px] font-medium text-white transition hover:bg-neutral-800">
              Search Homes
            </a>
            <ButtonLink to="/dpi" variant="dark" arrow={false}>
              What Is DPI?
            </ButtonLink>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/** "Search by area or property" with neighbourhood/LGA suggestions; debounced like the app (500ms). */
function AreaSearch({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [text, setText] = useState(value);
  const [focused, setFocused] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => setText(value), [value]);
  const commit = (v: string) => {
    clearTimeout(timer.current);
    onChange(v.trim());
  };
  const suggestions = useMemo(() => {
    const t = text.trim().toLowerCase();
    const places = PLACES.filter((p) => p.live).map((p) => ({ label: p.name, sub: p.kind === "city" ? "City" : `${p.lga} · Ibadan` }));
    const lgas = IBADAN_LGAS.map((l) => ({ label: l, sub: "LGA · Oyo" }));
    return [...places, ...lgas].filter((s) => !t || s.label.toLowerCase().includes(t)).slice(0, 7);
  }, [text]);

  return (
    <div className="relative">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          commit(text);
          (document.activeElement as HTMLElement)?.blur();
        }}
        className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 ring-1 ring-black/5 focus-within:ring-2 focus-within:ring-urbn"
      >
        <Search className="size-4 text-neutral-500" />
        <label htmlFor="area-search" className="sr-only">Search by area or property</label>
        <input
          id="area-search"
          value={text}
          autoComplete="off"
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          onChange={(e) => {
            setText(e.target.value);
            clearTimeout(timer.current);
            const v = e.target.value;
            timer.current = setTimeout(() => onChange(v.trim()), 500);
          }}
          placeholder="Search by area or property"
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-neutral-400"
        />
        {text && (
          <button type="button" onClick={() => { setText(""); commit(""); }} aria-label="Clear search" className="text-neutral-500 hover:text-ink">
            <X className="size-4" />
          </button>
        )}
      </form>
      <AnimatePresence>
        {focused && suggestions.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="absolute inset-x-0 top-full z-40 mt-2 overflow-hidden rounded-xl bg-white py-1 shadow-xl ring-1 ring-black/5"
            role="listbox"
          >
            {suggestions.map((s) => (
              <li key={s.label}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setText(s.label);
                    commit(s.label);
                    setFocused(false);
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-mist"
                >
                  <MapPin className="size-4 text-neutral-400" />
                  <span className="font-medium">{s.label}</span>
                  <span className="ml-auto text-xs text-neutral-400">{s.sub}</span>
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

function FeaturedCarousel({ listings }: { listings: Card[] }) {
  return (
    <div className="mt-8">
      <h3 className="text-[10px] font-semibold tracking-widest text-neutral-400 uppercase">Featured</h3>
      <ul className="no-scrollbar -mx-4 mt-3 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
        {listings.map((l) => (
          <li key={l.id} className="w-[80%] shrink-0 snap-start sm:w-[22rem]">
            <ListingCard listing={l} />
          </li>
        ))}
      </ul>
    </div>
  );
}

// Copy mirrors the app's MarketplaceListEmptyState.
function EmptyState({
  mode,
  searched,
  filterCount,
  onAdjust,
  onClear,
}: {
  mode: "ai" | "standard";
  searched: boolean;
  filterCount: number;
  onAdjust: () => void;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-neutral-300 px-6 py-20 text-center">
      {mode === "ai" ? (
        <>
          <p className="font-semibold">{searched ? "No homes match your search." : "Describe the home you're looking for above."}</p>
          {searched && <p className="text-sm text-neutral-500">Try a different area, budget or feature.</p>}
        </>
      ) : filterCount > 0 ? (
        <>
          <p className="font-semibold">No listings match these filters.</p>
          <div className="mt-2 flex gap-2">
            <button onClick={onAdjust} className="rounded-xl bg-ink px-6 py-3 text-sm font-semibold text-white">Adjust Filters</button>
            <button onClick={onClear} className="rounded-xl px-4 py-3 text-sm font-semibold text-neutral-600 hover:bg-mist">Clear Filters</button>
          </div>
        </>
      ) : (
        <p className="font-semibold">No listings available here yet. Check another area.</p>
      )}
    </div>
  );
}

function AppStrip() {
  return (
    <div className="mt-16 flex flex-col items-start justify-between gap-6 rounded-2xl bg-ink p-7 text-white sm:flex-row sm:items-center sm:p-10">
      <div>
        <p className="text-[10px] tracking-widest text-neutral-400 uppercase">In the Urbn App</p>
        <h3 className="mt-2 text-2xl sm:text-3xl">Keep Your Search With You</h3>
        <p className="mt-2 max-w-xl text-neutral-400">
          Use the Urbn app to save listings, request inspections and message owners or managers.
        </p>
      </div>
      <ButtonLink to="/download" variant="light" className="shrink-0">Get the App</ButtonLink>
    </div>
  );
}
