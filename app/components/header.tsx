import { clsx } from "clsx";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router";
import { NAV, NAV_MORE } from "~/lib/site";
import { Logo } from "./logo";
import { EASE } from "./motion";
import { ButtonLink } from "./ui";

export function Header() {
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 12);
    setHidden(y > 240 && y > prev);
  });

  return (
    <>
      <a
        href="#main"
        className="sr-only z-[60] rounded-md bg-urbn px-4 py-2 text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <motion.header
        animate={{ y: hidden ? "-110%" : "0%" }}
        transition={{ duration: 0.35, ease: EASE }}
        className={clsx(
          "fixed inset-x-0 top-0 z-50 pt-[env(safe-area-inset-top)] transition-[background-color,box-shadow] duration-300",
          scrolled ? "bg-white/85 shadow-[0_1px_0_rgba(0,0,0,0.06)] backdrop-blur-xl" : "bg-white",
        )}
      >
        <div className="container-x flex h-14 items-center justify-between gap-6 lg:h-[4.5rem]">
          <Link to="/" aria-label="Urbn home" className="shrink-0">
            <Logo className="w-[4.1rem] text-ink lg:w-[4.6rem]" />
          </Link>

          <nav aria-label="Main" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {NAV.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      clsx(
                        "relative rounded-full px-3.5 py-2 text-[14.5px] transition-colors",
                        isActive ? "text-ink" : "text-neutral-600 hover:text-ink",
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <motion.span
                            layoutId="nav-pill"
                            className="absolute inset-0 -z-10 rounded-full bg-mist"
                            transition={{ type: "spring", stiffness: 380, damping: 32 }}
                          />
                        )}
                        {item.label}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
              <li>
                <MoreMenu />
              </li>
            </ul>
          </nav>

          <span className="hidden lg:block">
            <ButtonLink to="/download" variant="dark" arrow={false}>
              Get the App
            </ButtonLink>
          </span>
          {/* phones/tablets: navigation lives in the bottom tab bar */}
          <Link
            to="/download"
            className="inline-flex h-9 items-center gap-1.5 rounded-full bg-ink px-4 text-[13px] font-semibold text-white active:scale-95 lg:hidden"
          >
            Get the App
          </Link>
        </div>
      </motion.header>
      <div aria-hidden className="h-14 lg:h-[4.5rem]" />
    </>
  );
}

/** "More" dropdown for secondary links. Closes on outside click, Escape and navigation. */
function MoreMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();
  const active = NAV_MORE.some((l) => pathname.startsWith(l.to));
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="true"
        className={clsx("inline-flex items-center gap-1 rounded-full px-3.5 py-2 text-[14.5px] transition-colors", active || open ? "text-ink" : "text-neutral-600 hover:text-ink")}
      >
        More <ChevronDown className={clsx("size-4 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <ul className="absolute top-full right-0 mt-2 w-44 rounded-2xl bg-white p-1.5 shadow-xl ring-1 ring-black/5">
          {NAV_MORE.map((l) => (
            <li key={l.to}>
              <NavLink to={l.to} className={({ isActive }) => clsx("block rounded-xl px-3 py-2 text-sm hover:bg-mist", isActive && "bg-mist font-semibold")}>
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
