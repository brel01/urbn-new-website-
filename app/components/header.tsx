import { clsx } from "clsx";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router";
import { NAV } from "~/lib/site";
import { Logo } from "./logo";
import { EASE } from "./motion";
import { ButtonLink } from "./ui";

export function Header() {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  const location = useLocation();

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 12);
    setHidden(y > 240 && y > prev && !open);
  });

  useEffect(() => setOpen(false), [location.pathname]);
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
  }, [open]);

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
          "fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow] duration-300",
          scrolled || open ? "bg-white/85 shadow-[0_1px_0_rgba(0,0,0,0.06)] backdrop-blur-xl" : "bg-white",
        )}
      >
        <div className="container-x flex h-16 items-center justify-between gap-6 lg:h-[4.5rem]">
          <Link to="/" aria-label="Urbn home" className="shrink-0">
            <Logo className="w-[4.6rem] text-ink" />
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
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <span className="hidden sm:block">
              <ButtonLink to="/download" variant="dark" arrow={false}>
                Download App Now
              </ButtonLink>
            </span>
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              className="grid size-11 place-items-center rounded-full text-ink hover:bg-mist lg:hidden"
            >
              {open ? <X className="size-6" /> : <Menu className="size-6" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.nav
              id="mobile-menu"
              aria-label="Mobile"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "calc(100dvh - 4rem)", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.45, ease: EASE }}
              className="overflow-hidden bg-white lg:hidden"
            >
              <motion.ul
                className="container-x flex flex-col gap-1 pt-6"
                initial="hidden"
                animate="show"
                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } } }}
              >
                {[{ label: "Home", to: "/" }, ...NAV].map((item) => (
                  <motion.li
                    key={item.to}
                    variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
                    className="border-b border-neutral-100"
                  >
                    <NavLink
                      to={item.to}
                      end
                      className={({ isActive }) =>
                        clsx("block py-4 font-display text-3xl", isActive ? "text-urbn" : "text-ink")
                      }
                    >
                      {item.label}
                    </NavLink>
                  </motion.li>
                ))}
                <motion.li variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }} className="pt-6">
                  <ButtonLink to="/download" variant="blue" size="lg" className="w-full">
                    Download App Now
                  </ButtonLink>
                </motion.li>
              </motion.ul>
            </motion.nav>
          )}
        </AnimatePresence>
      </motion.header>
      <div aria-hidden className="h-16 lg:h-[4.5rem]" />
    </>
  );
}
