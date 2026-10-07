import { clsx } from "clsx";
import {
  BookOpen,
  Briefcase,
  Building2,
  CircleHelp,
  Compass,
  House,
  LayoutGrid,
  MapPin,
  Mail,
  Play,
  ScanLine,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { Children, type ReactNode, useEffect, useRef, useState } from "react";
import { Link, NavLink, matchPath, useLocation, useMatches, useNavigation } from "react-router";
import { EASE } from "./motion";
import { SocialLinks } from "./social";

// ---------------------------------------------------------------------------
// Hooks

/** SSR-safe media query (false on the server and first paint). */
export function useMediaQuery(query: string) {
  const [match, setMatch] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatch(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [query]);
  return match;
}
export const useIsDesktop = () => useMediaQuery("(min-width: 1024px)");

/** Routes can opt out of the tab bar with `export const handle = { hideTabBar: true }`. */
export const useTabBarHidden = () => useMatches().some((m) => (m.handle as { hideTabBar?: boolean } | undefined)?.hideTabBar);

// ---------------------------------------------------------------------------
// Rail: swipeable cards on phones, a regular grid from `md` up.

export function Rail({
  children,
  grid = "md:grid-cols-3",
  item = "w-[84%] sm:w-[60%]",
  dark,
  className,
  label,
}: {
  children: ReactNode;
  /** grid classes applied from md up */
  grid?: string;
  /** slide width on phones */
  item?: string;
  dark?: boolean;
  className?: string;
  label?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const items = Children.toArray(children);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      const first = el.firstElementChild as HTMLElement | null;
      if (!first) return;
      const step = first.offsetWidth + 16;
      setActive(Math.min(items.length - 1, Math.round(el.scrollLeft / step)));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [items.length]);

  const go = (i: number) => {
    const el = ref.current;
    const target = el?.children[i] as HTMLElement | undefined;
    if (el && target) el.scrollTo({ left: target.offsetLeft - el.offsetLeft - 16, behavior: "smooth" });
  };

  return (
    <div className={className}>
      <div
        ref={ref}
        role="region"
        aria-label={label}
        className={clsx(
          "no-scrollbar -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:scroll-px-6 sm:px-6",
          "md:mx-0 md:grid md:snap-none md:overflow-visible md:px-0 md:pb-0",
          grid,
        )}
      >
        {items.map((child, i) => (
          <div key={i} className={clsx("shrink-0 snap-start md:w-auto", item)}>
            {child}
          </div>
        ))}
      </div>
      {items.length > 1 && (
        <div className="mt-5 flex items-center justify-center gap-1.5 md:hidden" aria-hidden>
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              tabIndex={-1}
              onClick={() => go(i)}
              className={clsx(
                "h-1.5 rounded-full transition-all duration-300",
                i === active ? "w-6" : "w-1.5",
                dark ? (i === active ? "bg-white" : "bg-white/30") : i === active ? "bg-urbn" : "bg-neutral-300",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// App-style bottom navigation (phones and tablets).

const TABS = [
  { to: "/", label: "Home", icon: House, end: true },
  { to: "/listings", label: "Listings", icon: Search },
  { to: "/verify", label: "Verify", icon: ScanLine, primary: true },
  { to: "/nearby", label: "Nearby", icon: MapPin },
] as const;

export function TabBar() {
  const [menu, setMenu] = useState(false);
  const [hidden, setHidden] = useState(false);
  const { scrollY } = useScroll();
  const location = useLocation();
  const routeHidden = useTabBarHidden();
  // Highlight the tapped tab straight away, while its page is still loading.
  const target = useNavigation().location?.pathname ?? location.pathname;
  const isOn = (t: (typeof TABS)[number]) => !!matchPath({ path: t.to, end: "end" in t }, target);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    if (Math.abs(y - prev) < 6) return;
    setHidden(y > 320 && y > prev);
  });
  useEffect(() => setMenu(false), [location.pathname]);

  if (routeHidden) return null;
  return (
    <>
      <motion.nav
        aria-label="Primary"
        className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-50 lg:hidden"
        animate={{ y: hidden && !menu ? "140%" : "0%" }}
        transition={{ duration: 0.35, ease: EASE }}
      >
        <ul className="mx-auto flex max-w-md items-center justify-between rounded-[1.4rem] bg-ink/90 px-2 py-1.5 text-white shadow-[0_18px_40px_-12px_rgba(0,0,0,0.55)] ring-1 ring-white/10 backdrop-blur-xl">
          {TABS.map((t) => (
            <li key={t.to} className="flex-1">
              <NavLink
                to={t.to}
                end={"end" in t}
                // Fetch each tab's code and data while the bar is on screen, so a tap lands at once.
                prefetch="viewport"
                className="group flex flex-col items-center gap-0.5 py-1 active:scale-95"
                aria-label={t.label}
              >
                {() =>
                  "primary" in t ? (
                    <span className="-mt-6 grid size-14 place-items-center rounded-full bg-urbn shadow-[0_10px_24px_-6px_rgba(37,61,226,0.9)] ring-4 ring-[#F9FAFB] transition-transform group-active:scale-90">
                      <t.icon className="size-6" />
                    </span>
                  ) : (
                    <>
                      <span className="relative grid h-8 w-12 place-items-center">
                        {isOn(t) && (
                          <motion.span layoutId="tab-pill" className="absolute inset-0 rounded-full bg-white/15" transition={{ type: "spring", stiffness: 420, damping: 34 }} />
                        )}
                        <t.icon className={clsx("relative size-[1.2rem]", isOn(t) ? "text-white" : "text-white/55")} />
                      </span>
                      <span className={clsx("text-[10px] font-medium", isOn(t) ? "text-white" : "text-white/55")}>{t.label}</span>
                    </>
                  )
                }
              </NavLink>
            </li>
          ))}
          <li className="flex-1">
            <button
              type="button"
              onClick={() => setMenu(true)}
              aria-haspopup="dialog"
              aria-expanded={menu}
              className="flex w-full flex-col items-center gap-0.5 py-1 active:scale-95"
            >
              <span className="grid h-8 w-12 place-items-center">
                <LayoutGrid className="size-[1.2rem] text-white/55" />
              </span>
              <span className="text-[10px] font-medium text-white/55">More</span>
            </button>
          </li>
        </ul>
      </motion.nav>
      <MenuSheet open={menu} onClose={() => setMenu(false)} />
    </>
  );
}

const MENU = [
  { to: "/features", label: "Features", icon: Sparkles },
  { to: "/dpi", label: "What Is DPI?", icon: ShieldCheck },
  { to: "/about", label: "About Urbn", icon: Building2 },
  { to: "/for-renters", label: "For Renters", icon: Compass },
  { to: "/for-owners", label: "For Owners", icon: House },
  { to: "/for-agents", label: "For Agents & Managers", icon: Briefcase },
  { to: "/blog", label: "Stories", icon: BookOpen },
  { to: "/faq", label: "FAQs", icon: CircleHelp },
  { to: "/careers", label: "Careers", icon: Users },
  { to: "/contact", label: "Contact", icon: Mail },
];

/** Bottom sheet with the rest of the site, swipe down or tap outside to close. */
export function MenuSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <motion.div className="absolute inset-0 bg-black/45 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            className="absolute inset-x-0 bottom-0 rounded-t-[1.75rem] bg-white px-5 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.45, ease: EASE }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => (info.offset.y > 90 || info.velocity.y > 500) && onClose()}
          >
            <div className="mx-auto h-1.5 w-10 rounded-full bg-neutral-200" />
            <div className="mt-4 flex items-center justify-between">
              <p className="font-display text-2xl">Explore Urbn</p>
              <button type="button" onClick={onClose} aria-label="Close menu" className="grid size-10 place-items-center rounded-full bg-mist">
                <X className="size-5" />
              </button>
            </div>
            {/* Reels lead the menu: the easiest thing to watch and share. */}
            <Link to="/reels" prefetch="intent" className="mt-5 flex items-center gap-3 rounded-2xl bg-ink p-4 text-white transition active:scale-[0.98]">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-urbn">
                <Play className="size-5 fill-white" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-semibold">Property Reels</span>
                <span className="block text-xs text-white/60">Watch and share video tours of homes</span>
              </span>
              <span aria-hidden className="text-white/50">→</span>
            </Link>
            <motion.ul
              className="mt-3 grid grid-cols-3 gap-2.5"
              initial="h"
              animate="s"
              variants={{ h: {}, s: { transition: { staggerChildren: 0.03, delayChildren: 0.12 } } }}
            >
              {MENU.map((m) => (
                <motion.li key={m.to} variants={{ h: { opacity: 0, y: 12, scale: 0.96 }, s: { opacity: 1, y: 0, scale: 1 } }}>
                  <Link to={m.to} prefetch="intent" className="flex aspect-square flex-col items-start justify-between rounded-2xl bg-mist p-3 transition active:scale-95 active:bg-fog">
                    <span className="grid size-9 place-items-center rounded-xl bg-white text-urbn shadow-sm">
                      <m.icon className="size-[18px]" />
                    </span>
                    <span className="text-[13px] leading-tight font-semibold">{m.label}</span>
                  </Link>
                </motion.li>
              ))}
            </motion.ul>
            <Link to="/download" className="mt-4 flex items-center justify-between rounded-2xl bg-urbn px-5 py-4 text-white active:scale-[0.98]">
              <span>
                <span className="block font-semibold">Get the Urbn App</span>
                <span className="text-sm text-blue-100">Check property records, find listings and book inspections.</span>
              </span>
              <span aria-hidden>→</span>
            </Link>
            <SocialLinks className="mt-3 justify-center text-neutral-500 [&_a:hover]:bg-mist" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/** Sticky bottom action bar for detail pages (replaces the tab bar). */
export function BottomBar({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-black/5 bg-white/90 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl lg:hidden">
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// NavProgress: a thin bar along the top while the next page loads, so a tap on
// a slow connection is acknowledged at once. Hidden for quick navigations.

export function NavProgress() {
  const loading = useNavigation().state === "loading";
  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5 overflow-hidden">
      <div
        className={clsx(
          "h-full origin-left bg-urbn",
          loading ? "scale-x-[0.85] opacity-100 transition-[transform,opacity] delay-150 duration-[2500ms] ease-out" : "scale-x-0 opacity-0 transition-opacity duration-200",
        )}
      />
    </div>
  );
}
