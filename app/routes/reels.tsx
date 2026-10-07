// /reels and /reels/:id/:slug: the app's Reels feed on the web. A shared reel link
// opens the feed at that reel, with a rich preview (poster, title, price, video) in
// WhatsApp, X and Facebook. Watching and sharing work here; likes, saves, comments,
// agent profiles and the rest continue in the app.
import { ChevronDown, ChevronUp } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { data, redirect } from "react-router";
import { type AppAction, AppPrompt, CommentsSheet, ReelItem, ShareMenu } from "~/components/reels";
import { SampleBadge } from "~/components/nearby";
import { StoreBadge } from "~/components/store-badges";
import { getReel, reelsFeed } from "~/lib/marketplace/source.server";
import { formatCompactNaira, listingTypeLabel, roomCount } from "~/lib/marketplace/types";
import { type Reel, type ReelsPage, reelPath, reelPoster, reelVideo } from "~/lib/reels";
import { breadcrumbs, seo } from "~/lib/seo";
import { absoluteUrl } from "~/lib/site";
import type { Route } from "./+types/reels";

export const handle = { hideTabBar: true };

export async function loader({ params }: Route.LoaderArgs) {
  const { id, slug } = params as { id?: string; slug?: string };
  const feed = await reelsFeed({ page: 1 });
  if (!id) return { reel: null, feed };
  const reel = await getReel(id);
  if (!reel) throw data("Not found", { status: 404 });
  // Old or missing slugs redirect to the canonical reel URL.
  if (slug !== reelPath(reel).split("/").pop()) throw redirect(reelPath(reel), 301);
  return { reel, feed };
}

export function headers() {
  return { "Cache-Control": "public, max-age=60, s-maxage=600, stale-while-revalidate=86400" };
}

export const meta: Route.MetaFunction = ({ loaderData }) => {
  if (!loaderData) return [{ title: "Not found | Urbn" }];
  const { reel, feed } = loaderData;
  const sample = feed.source === "sample";
  if (!reel) {
    return seo({
      title: "Property Reels: Video Tours of Homes in Ibadan",
      description: "Watch short video tours of homes, shops and spaces listed on Urbn. Share the ones you like, and open them in the Urbn app to save, like or ask a question.",
      path: "/reels",
      noindex: sample,
      jsonLd: breadcrumbs([
        { name: "Home", path: "/" },
        { name: "Reels", path: "/reels" },
      ]),
    });
  }
  const beds = roomCount(reel, "Bedroom");
  const kind = `${beds ? `${beds}-bedroom ` : ""}${reel.structureType ?? reel.propertyBuildingType}`.toLowerCase();
  const price = `${formatCompactNaira(reel.price)}${reel.rentPeriod === "Yearly" ? "/yr" : reel.rentPeriod === "Monthly" ? "/mo" : ""}`;
  const title = `${reel.propertyTitle}, ${price} ${listingTypeLabel(reel.listingType)} in ${reel.propertyCity}`;
  const description = `Watch a video tour of ${reel.propertyTitle}, a ${kind} at ${reel.propertyAddress}, ${reel.propertyCity}. ${listingTypeLabel(reel.listingType)} at ${price}.`;
  const poster = reelPoster(reel);
  const video = reelVideo(reel)!;
  return seo({
    title: `${title} | Urbn Reels`,
    description,
    path: reelPath(reel),
    image: poster ?? undefined,
    imageAlt: `${reel.propertyTitle}, ${reel.propertyCity}`,
    video: { url: video },
    noindex: sample,
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "VideoObject",
        name: title,
        description,
        thumbnailUrl: poster ? [absoluteUrl(poster)] : undefined,
        uploadDate: reel.createdAt,
        contentUrl: absoluteUrl(video),
        embedUrl: absoluteUrl(reelPath(reel)),
        publisher: { "@type": "Organization", name: "Urbn", url: absoluteUrl("/") },
      },
      breadcrumbs([
        { name: "Home", path: "/" },
        { name: "Reels", path: "/reels" },
        { name: reel.propertyTitle, path: reelPath(reel) },
      ]),
    ],
  });
};

export default function Reels({ loaderData }: Route.ComponentProps) {
  // A fresh feed for each reel link (e.g. arriving from a listing page).
  return <Feed key={loaderData.reel?.id ?? "all"} reel={loaderData.reel} feed={loaderData.feed} />;
}

const dedupe = (rows: (Reel | null)[]) => {
  const seen = new Set<string>();
  return rows.filter((r): r is Reel => !!r && !seen.has(r.id) && !!seen.add(r.id));
};

function Feed({ reel, feed }: { reel: Reel | null; feed: ReelsPage }) {
  const sample = feed.source === "sample";
  const [items, setItems] = useState<Reel[]>(() => dedupe([reel, ...feed.data]));
  const [page, setPage] = useState({ n: feed.meta.page, total: feed.meta.totalPages, loading: false });
  const [active, setActive] = useState(0);
  const [muted, setMuted] = useState(true);
  const [prompt, setPrompt] = useState<AppAction | null>(null);
  const [commentsFor, setCommentsFor] = useState<Reel | null>(null);
  const [shareFor, setShareFor] = useState<Reel | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const current = items[active] ?? null;
  const sheetOpen = Boolean(prompt || commentsFor || shareFor);

  // While a sheet is open, swipes must not move the feed or the page behind it.
  useEffect(() => {
    if (!sheetOpen) return;
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = prev;
    };
  }, [sheetOpen]);
  const closeComments = useCallback(() => setCommentsFor(null), []);
  const closePrompt = useCallback(() => setPrompt(null), []);
  const commentsToApp = useCallback((a: AppAction) => {
    setCommentsFor(null);
    setPrompt(a);
  }, []);

  // Which reel is on screen.
  useEffect(() => {
    const root = scroller.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.index));
      },
      { root, threshold: 0.6 },
    );
    root.querySelectorAll("[data-index]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items.length]);

  // Keep the address bar on the reel being watched, so copying the URL shares it.
  useEffect(() => {
    if (!current || (active === 0 && !reel)) return;
    const path = reelPath(current);
    if (window.location.pathname !== path) window.history.replaceState(window.history.state, "", path);
  }, [active, current, reel]);

  // Load the next page as the viewer nears the end.
  useEffect(() => {
    if (page.loading || page.n >= page.total || active < items.length - 3) return;
    setPage((p) => ({ ...p, loading: true }));
    fetch(`/api/reels?page=${page.n + 1}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((next: ReelsPage) => {
        setItems((rows) => dedupe([...rows, ...next.data]));
        setPage({ n: next.meta.page, total: next.meta.totalPages, loading: false });
      })
      .catch(() => setPage((p) => ({ ...p, loading: false })));
  }, [active, items.length, page]);

  const go = useCallback((i: number) => {
    const el = scroller.current?.querySelector<HTMLElement>(`[data-index="${i}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  // ↑/↓ (or j/k) to move between reels, M to mute.
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (prompt || commentsFor || shareFor || (e.target as HTMLElement).closest("input, textarea")) return;
      if (e.key === "ArrowDown" || e.key === "j") {
        e.preventDefault();
        go(Math.min(items.length - 1, active + 1));
      } else if (e.key === "ArrowUp" || e.key === "k") {
        e.preventDefault();
        go(Math.max(0, active - 1));
      } else if (e.key === "m") setMuted((m) => !m);
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [active, items.length, go, prompt, commentsFor, shareFor]);

  const share = async (r: Reel) => {
    const url = absoluteUrl(reelPath(r));
    // Phones get the native share sheet (WhatsApp first); desktops get the share menu.
    if (navigator.share && window.matchMedia("(pointer: coarse)").matches) {
      try {
        await navigator.share({ title: r.propertyTitle, text: `${r.propertyTitle} in ${r.propertyCity} on Urbn`, url });
      } catch {
        /* dismissed */
      }
      return;
    }
    setShareFor(r);
  };

  if (items.length === 0) {
    return (
      <section className="grid h-[calc(100svh-3.5rem)] place-items-center bg-black px-6 text-center text-white lg:h-[calc(100svh-4.5rem)]">
        <div>
          <h1 className="text-3xl">No Reels Yet</h1>
          <p className="mt-2 text-white/70">Video tours will appear here as owners and agents add them in the Urbn app.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative h-[calc(100svh-3.5rem)] bg-black lg:h-[calc(100svh-4.5rem)]" aria-label="Property reels">
      <h1 className="sr-only">{reel ? `${reel.propertyTitle} video tour` : "Property Reels"}</h1>
      <div ref={scroller} className={`no-scrollbar h-full snap-y snap-mandatory ${sheetOpen ? "overflow-hidden" : "overflow-y-auto"}`}>
        {items.map((r, i) => (
          <div key={r.id} data-index={i} className="h-full">
            <ReelItem
              reel={r}
              active={i === active && !prompt}
              near={Math.abs(i - active) <= 1}
              muted={muted}
              sample={sample}
              onToggleMute={() => setMuted((m) => !m)}
              onApp={(a) => setPrompt(a)}
              onComments={() => setCommentsFor(r)}
              onShare={() => share(r)}
            />
          </div>
        ))}
      </div>

      {/* desktop: what this is, and the way into the app */}
      <aside className="pointer-events-none absolute inset-y-0 left-0 hidden w-[calc(50%-14rem)] items-center pl-10 text-white xl:flex">
        <div className="pointer-events-auto max-w-xs">
          <p className="text-xs font-semibold tracking-widest text-white/50 uppercase">Urbn Reels</p>
          <p className="mt-2 font-display text-3xl leading-tight">Video Tours of Homes and Spaces</p>
          <p className="mt-3 text-sm text-white/60">Share any reel with a friend. Like, save and ask questions in the Urbn app.</p>
          {sample && (
            <p className="mt-3 flex items-center gap-2 text-xs text-white/60">
              <SampleBadge /> Sample reels until live data is connected
            </p>
          )}
          <div className="mt-6 flex flex-wrap gap-2">
            <StoreBadge store="ios" tone="light" size="sm" />
            <StoreBadge store="android" tone="light" size="sm" />
          </div>
        </div>
      </aside>
      <div className="absolute top-1/2 right-8 hidden -translate-y-1/2 flex-col gap-2 lg:flex">
        <button type="button" onClick={() => go(Math.max(0, active - 1))} disabled={active === 0} aria-label="Previous reel" className="grid size-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-30">
          <ChevronUp className="size-5" />
        </button>
        <button type="button" onClick={() => go(Math.min(items.length - 1, active + 1))} disabled={active >= items.length - 1} aria-label="Next reel" className="grid size-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-30">
          <ChevronDown className="size-5" />
        </button>
      </div>

      <CommentsSheet reel={commentsFor} onClose={closeComments} onApp={commentsToApp} />
      {shareFor && <ShareMenu reel={shareFor} open onClose={() => setShareFor(null)} />}
      <AppPrompt action={prompt} reel={current} onClose={closePrompt} />
    </section>
  );
}
