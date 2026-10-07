// Property Reels on the web, mirroring the app's Reels tab (urbn-mobile
// src/app/(app)/reels.tsx and components/reels/reel-card.tsx): a vertical, swipeable
// feed of listing videos with the price badge, listing title, agent and location,
// tap to pause, double-tap to like, mute and a progress bar.
//
// Watching and sharing work here. Liking, saving, commenting, agent profiles and
// the rest open a "Continue in the app" prompt that deep-links to the listing.
import { clsx } from "clsx";
import { Bookmark, Check, Copy, Heart, Link2, MapPin, MessageCircle, Play, Send, Volume2, VolumeX, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { formatCompactNaira, formatCount, listedByLabel, listingPath, listingTypeLabel, roomCount } from "~/lib/marketplace/types";
import { appListingLink, type Reel, type ReelComments, reelPath, reelPoster, reelVideo } from "~/lib/reels";
import { absoluteUrl } from "~/lib/site";
import { EASE } from "./motion";
import { SampleBadge } from "./nearby";
import { BrandIcon } from "./social";
import { StoreBadge } from "./store-badges";

export type AppAction = "like" | "save" | "comment" | "reply" | "agent";

const PROMPT: Record<AppAction, { title: string; body: string }> = {
  like: { title: "Like This Home in the App", body: "Likes are saved to your Urbn account, so you can find this home again and see similar ones." },
  save: { title: "Save This Home in the App", body: "Saved homes live in your Urbn account, ready when you want to compare or book an inspection." },
  comment: { title: "Join the Conversation in the App", body: "Ask about the home and read replies from the owner or agent in the Urbn app." },
  reply: { title: "See the Replies in the App", body: "Replies to comments are in the Urbn app, alongside the owner's and agent's answers." },
  agent: { title: "See This Agent in the App", body: "Agent profiles, ratings and their other listings are in the Urbn app." },
};

const priceLabel = (r: Reel) => {
  const suffix = r.rentPeriod ? { Yearly: "/yr", Monthly: "/mo", Weekly: "/wk", Daily: "/day" }[r.rentPeriod as string] ?? "" : "";
  return `${formatCompactNaira(r.price)}${suffix} · ${listingTypeLabel(r.listingType)}`;
};

const shareText = (r: Reel) => `${r.propertyTitle} in ${r.propertyCity}, ${priceLabel(r)}. Watch it on Urbn:`;

// --- "Continue in the app" prompt ----------------------------------------------

export function AppPrompt({ action, reel, onClose }: { action: AppAction | null; reel: Reel | null; onClose: () => void }) {
  useEffect(() => {
    if (!action) return;
    const key = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [action, onClose]);
  const p = action ? PROMPT[action] : null;
  return (
    <AnimatePresence>
      {p && reel && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-labelledby="app-prompt-title">
          <motion.button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            className="relative w-full max-w-md rounded-t-[1.75rem] bg-white px-6 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:rounded-[1.75rem] sm:pt-6"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-neutral-200 sm:hidden" />
            <button type="button" onClick={onClose} aria-label="Close" className="absolute top-4 right-4 hidden size-9 place-items-center rounded-full bg-mist hover:bg-fog sm:grid">
              <X className="size-4" />
            </button>
            <div className="flex items-center gap-3">
              {reelPoster(reel) && <img src={reelPoster(reel)!} alt="" className="h-16 w-12 shrink-0 rounded-lg object-cover" />}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{reel.propertyTitle}</p>
                <p className="text-xs text-neutral-500">{priceLabel(reel)}</p>
              </div>
            </div>
            <h2 id="app-prompt-title" className="mt-5 font-display text-2xl leading-tight">{p.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-neutral-600">{p.body}</p>
            <a
              href={appListingLink(reel.id)}
              className="mt-5 flex h-12 items-center justify-center rounded-xl bg-urbn text-sm font-semibold text-white hover:bg-blue-600"
            >
              Open in the Urbn App
            </a>
            <p className="mt-4 text-center text-xs text-neutral-500">Don't have it yet?</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <StoreBadge store="ios" size="sm" className="justify-center" />
              <StoreBadge store="android" size="sm" className="justify-center" />
            </div>
            <button type="button" onClick={onClose} className="mt-3 h-11 w-full rounded-xl text-sm font-semibold text-neutral-600 hover:bg-mist">
              Keep Watching
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// --- share ---------------------------------------------------------------------

/** Native share sheet on phones; on desktop a small menu: copy link, WhatsApp, X, Facebook. */
export function ShareMenu({ reel, open, onClose }: { reel: Reel; open: boolean; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const url = absoluteUrl(reelPath(reel));
  const text = shareText(reel);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked */
    }
  };
  const targets = [
    { label: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`, icon: <BrandIcon name="whatsapp" className="size-4" /> },
    { label: "X", href: `https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, icon: <BrandIcon name="x" className="size-4" /> },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, icon: <BrandIcon name="facebook" className="size-4" /> },
  ];
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label="Share this reel">
          <motion.button type="button" aria-label="Close" className="absolute inset-0 bg-black/50" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.div
            className="relative w-full max-w-sm rounded-t-[1.75rem] bg-white p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:rounded-[1.75rem]"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl">Share This Reel</h2>
              <button type="button" onClick={onClose} aria-label="Close" className="grid size-9 place-items-center rounded-full bg-mist hover:bg-fog">
                <X className="size-4" />
              </button>
            </div>
            <p className="mt-1 text-sm text-neutral-500">Anyone with the link can watch it, no app needed.</p>
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-mist p-1.5 pl-3">
              <Link2 className="size-4 shrink-0 text-neutral-500" />
              <span className="min-w-0 flex-1 truncate text-sm">{url}</span>
              <button type="button" onClick={copy} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-ink px-3 text-xs font-semibold text-white">
                {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />} {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {targets.map((t) => (
                <a key={t.label} href={t.href} target="_blank" rel="noopener" className="flex flex-col items-center gap-1.5 rounded-xl bg-mist py-3 text-xs font-semibold hover:bg-fog">
                  {t.icon} {t.label}
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// --- comments ------------------------------------------------------------------

const ago = (iso: string) => {
  const h = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 3_600_000));
  return h < 24 ? `${h}h` : `${Math.round(h / 24)}d`;
};

/** Read-only comments, like the app's comments sheet; writing one continues in the app. */
export function CommentsSheet({ reel, onClose, onApp }: { reel: Reel | null; onClose: () => void; onApp: (a: AppAction) => void }) {
  const [state, setState] = useState<{ id: string; data: ReelComments | null; error: boolean } | null>(null);
  const [more, setMore] = useState(false);
  const url = (id: string, cursor?: string | null) => `/api/reels/${encodeURIComponent(id)}/comments${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ""}`;

  // The API returns comments a page at a time: fetch the next page near the bottom of the list.
  const loadMore = useCallback(() => {
    const d = state?.data;
    if (!reel || !d?.nextCursor || more) return;
    setMore(true);
    fetch(url(reel.id, d.nextCursor))
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((next: ReelComments) =>
        setState((s) => (s && s.id === reel.id && s.data ? { ...s, data: { ...s.data, data: [...s.data.data, ...next.data], nextCursor: next.nextCursor } } : s)),
      )
      .catch(() => {})
      .finally(() => setMore(false));
  }, [reel, state, more]);

  useEffect(() => {
    if (!reel) return;
    const ctrl = new AbortController();
    setState({ id: reel.id, data: null, error: false });
    fetch(url(reel.id), { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: ReelComments) => setState({ id: reel.id, data, error: false }))
      .catch(() => !ctrl.signal.aborted && setState({ id: reel.id, data: null, error: true }));
    const key = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", key);
    return () => {
      ctrl.abort();
      document.removeEventListener("keydown", key);
    };
  }, [reel, onClose]);
  const d = state?.data;
  return (
    <AnimatePresence>
      {reel && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label="Comments">
          <motion.button type="button" aria-label="Close" className="absolute inset-0 bg-black/40" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.div
            className="relative flex max-h-[70svh] w-full max-w-md flex-col rounded-t-[1.75rem] bg-white sm:max-h-[80svh] sm:rounded-[1.75rem]"
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <div className="flex items-center justify-between border-b border-black/5 px-5 py-4">
              <h2 className="flex items-center gap-2 font-sans text-base font-semibold tracking-normal">
                Comments <span className="text-neutral-400">{formatCount(reel.commentCount)}</span>
                {d?.source === "sample" && <SampleBadge />}
              </h2>
              <button type="button" onClick={onClose} aria-label="Close" className="grid size-9 place-items-center rounded-full bg-mist hover:bg-fog">
                <X className="size-4" />
              </button>
            </div>
            {/* min-h-0 lets the list shrink inside the sheet and scroll; overscroll-contain keeps swipes off the reels behind. */}
            <div
              className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain px-5 py-3"
              onScroll={(e) => {
                const el = e.currentTarget;
                if (el.scrollHeight - el.scrollTop - el.clientHeight < 120) loadMore();
              }}
            >
              {!d && !state?.error && <p className="py-8 text-center text-sm text-neutral-400">Loading comments…</p>}
              {(state?.error || d?.unavailable) && (
                <p className="py-8 text-center text-sm text-neutral-500">Comments on this home are in the Urbn app.</p>
              )}
              {d && !d.unavailable && d.data.length === 0 && <p className="py-8 text-center text-sm text-neutral-500">No comments yet. Be the first, in the app.</p>}
              <ul className="space-y-4">
                {d?.data
                  .filter((c) => !c.isDeleted && c.text)
                  .map((c) => (
                    <li key={c.id} className="flex gap-3">
                      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-mist text-sm font-semibold">{c.user?.firstName.charAt(0) ?? "?"}</span>
                      <div className="min-w-0">
                        <p className="text-xs text-neutral-500">
                          <b className="font-semibold text-ink">{c.user ? `${c.user.firstName} ${c.user.lastInitial}.` : "Urbn user"}</b> · {ago(c.createdAt)}
                        </p>
                        <p className="mt-0.5 text-sm leading-snug">{c.text}</p>
                        {c.replyCount > 0 && (
                          <button type="button" onClick={() => onApp("reply")} className="mt-1 text-xs font-semibold text-neutral-500 hover:text-ink">
                            View {c.replyCount} {c.replyCount === 1 ? "reply" : "replies"}
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
              </ul>
              {d?.nextCursor && (
                <button type="button" onClick={loadMore} className="mt-4 w-full py-2 text-center text-xs font-semibold text-neutral-500 hover:text-ink">
                  {more ? "Loading…" : "Load more comments"}
                </button>
              )}
            </div>
            <div className="border-t border-black/5 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <button type="button" onClick={() => onApp("comment")} className="flex h-11 w-full items-center rounded-full bg-mist px-4 text-left text-sm text-neutral-500 hover:bg-fog">
                Add a comment…
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// --- one reel --------------------------------------------------------------------

function Action({ label, onClick, children, count }: { label: string; onClick: () => void; children: ReactNode; count?: number }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} className="group flex min-w-11 flex-col items-center gap-1 text-white drop-shadow active:scale-90 lg:drop-shadow-none">
      <span className="grid size-11 place-items-center rounded-full transition lg:bg-white/10 lg:group-hover:bg-white/20">{children}</span>
      {count != null && <span className="text-[11px] font-semibold">{formatCount(count)}</span>}
    </button>
  );
}

export function ReelItem({
  reel,
  active,
  near,
  muted,
  sample,
  onToggleMute,
  onApp,
  onComments,
  onShare,
}: {
  reel: Reel;
  active: boolean;
  /** Mount the <video> only for the active reel and its neighbours, to save data. */
  near: boolean;
  muted: boolean;
  sample: boolean;
  onToggleMute: () => void;
  onApp: (a: AppAction) => void;
  onComments: () => void;
  onShare: () => void;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [heart, setHeart] = useState(0);
  const lastTap = useRef(0);
  const tapTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const src = reelVideo(reel)!;
  const poster = reelPoster(reel) ?? undefined;
  const beds = roomCount(reel, "Bedroom");
  const baths = roomCount(reel, "Bathroom");

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    v.muted = muted;
  }, [muted, near]);

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    if (active) {
      v.play().then(() => setPaused(false), () => setPaused(true));
    } else {
      v.pause();
    }
  }, [active, near]);

  const togglePlay = useCallback(() => {
    const v = video.current;
    if (!v) return;
    if (v.paused) v.play().then(() => setPaused(false), () => {});
    else {
      v.pause();
      setPaused(true);
    }
  }, []);

  // Single tap pauses; double tap "likes", which continues in the app (as the app does for signed-out users).
  const onTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 280) {
      clearTimeout(tapTimer.current);
      lastTap.current = 0;
      setHeart((h) => h + 1);
      setTimeout(() => onApp("like"), 650);
      return;
    }
    lastTap.current = now;
    tapTimer.current = setTimeout(togglePlay, 280);
  };

  return (
    <article className="relative flex h-full w-full snap-start snap-always items-center justify-center lg:gap-5" aria-label={`${reel.propertyTitle}, ${priceLabel(reel)}`}>
      <div className="relative h-full w-full overflow-hidden bg-black lg:aspect-[9/16] lg:h-[calc(100%-2rem)] lg:w-auto lg:rounded-[1.75rem]">
        {near ? (
          <video
            ref={video}
            src={src}
            poster={poster}
            loop
            playsInline
            muted
            preload={active ? "auto" : "metadata"}
            onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime / (e.currentTarget.duration || 1))}
            className="absolute inset-0 size-full object-cover"
          />
        ) : (
          poster && <img src={poster} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />
        )}
        <button type="button" onClick={onTap} aria-label={paused ? "Play" : "Pause"} className="absolute inset-0" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-black/40 to-transparent" />

        <AnimatePresence>
          {paused && active && (
            <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="pointer-events-none absolute inset-0 grid place-items-center">
              <span className="grid size-18 place-items-center rounded-full bg-black/40">
                <Play className="size-8 fill-white text-white" />
              </span>
            </motion.span>
          )}
          {heart > 0 && (
            <motion.span
              key={heart}
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: [0, 1, 1, 0], scale: [0.4, 1.1, 1, 1] }}
              transition={{ duration: 0.9, times: [0, 0.3, 0.7, 1] }}
              className="pointer-events-none absolute inset-0 grid place-items-center"
            >
              <Heart className="size-20 fill-error text-error" />
            </motion.span>
          )}
        </AnimatePresence>

        {/* price badge → the listing page */}
        <Link to={listingPath(reel)} className="absolute top-4 left-4 rounded-xl bg-black/50 px-3.5 py-2.5 text-white backdrop-blur-sm hover:bg-black/60">
          <span className="block text-base font-bold">{priceLabel(reel)}</span>
          {(beds || baths) && (
            <span className="block text-xs text-white/80">
              {beds ? `${beds} Bed` : ""}
              {beds && baths ? " · " : ""}
              {baths ? `${baths} Bath` : ""}
            </span>
          )}
        </Link>
        {sample && (
          <span className="absolute top-5 right-4 rounded-full bg-white">
            <SampleBadge />
          </span>
        )}

        {/* title, lister and area */}
        <div className="absolute inset-x-0 bottom-0 px-4 pr-20 pb-5 text-white lg:pr-4">
          <Link to={listingPath(reel)} className="line-clamp-1 text-[15px] font-bold drop-shadow hover:underline">
            {reel.propertyTitle}
          </Link>
          <div className="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-white/75">
            {reel.agent ? (
              <button type="button" onClick={() => onApp("agent")} className="flex min-w-0 items-center gap-1.5 hover:text-white">
                <span className="grid size-5 shrink-0 place-items-center rounded-full bg-white/20 text-[9px] font-bold">{reel.agent.displayName.charAt(0)}</span>
                <span className="truncate">{listedByLabel(reel)}</span>
              </button>
            ) : (
              <span>Owner Listed</span>
            )}
            <span aria-hidden>·</span>
            <MapPin className="size-3 shrink-0" />
            <span className="truncate">{[reel.propertyCity, reel.propertyState].filter(Boolean).join(", ")}</span>
          </div>
          <Link to={listingPath(reel)} className="mt-3 inline-flex h-9 items-center rounded-full bg-white px-4 text-xs font-semibold text-ink hover:bg-neutral-200">
            View Listing
          </Link>
        </div>

        {/* progress */}
        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-white/20">
          <div className="h-full bg-white" style={{ width: `${progress * 100}%` }} />
        </div>

        {/* actions: over the video on phones */}
        <div className="absolute right-3 bottom-24 flex flex-col items-center gap-4 lg:hidden">
          <Actions reel={reel} muted={muted} onToggleMute={onToggleMute} onApp={onApp} onComments={onComments} onShare={onShare} />
        </div>
      </div>
      {/* actions: beside the video on desktop */}
      <div className="hidden flex-col items-center gap-4 self-end pb-8 lg:flex">
        <Actions reel={reel} muted={muted} onToggleMute={onToggleMute} onApp={onApp} onComments={onComments} onShare={onShare} />
      </div>
    </article>
  );
}

function Actions({
  reel,
  muted,
  onToggleMute,
  onApp,
  onComments,
  onShare,
}: {
  reel: Reel;
  muted: boolean;
  onToggleMute: () => void;
  onApp: (a: AppAction) => void;
  onComments: () => void;
  onShare: () => void;
}) {
  return (
    <>
      <Action label={`Like (${reel.likeCount})`} count={reel.likeCount} onClick={() => onApp("like")}>
        <Heart className="size-6" />
      </Action>
      <Action label={`Save (${reel.saveCount})`} count={reel.saveCount} onClick={() => onApp("save")}>
        <Bookmark className="size-6" />
      </Action>
      <Action label={`Comments (${reel.commentCount})`} count={reel.commentCount} onClick={onComments}>
        <MessageCircle className="size-6" />
      </Action>
      <Action label="Share" onClick={onShare}>
        <Send className="size-6" />
      </Action>
      <Action label={muted ? "Unmute" : "Mute"} onClick={onToggleMute}>
        {muted ? <VolumeX className="size-6" /> : <Volume2 className="size-6" />}
      </Action>
    </>
  );
}
