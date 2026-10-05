import { clsx } from "clsx";
import { Bath, BedDouble, MapPin, Ruler, Search } from "lucide-react";
import { AnimatePresence, motion, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Form, Link } from "react-router";
import { type ListingCard, formatPrice, listingPath, listingTypeLabel, roomCount } from "~/lib/marketplace/types";
import { LIVE_AREAS } from "~/lib/places";
import { Rail } from "./mobile";
import { EASE } from "./motion";

const ROADS = [
  "M-20 300 C 150 280, 260 330, 400 300 S 650 240, 760 280 S 940 330, 1020 300",
  "M120 -20 C 160 120, 230 200, 300 260 S 420 420, 470 620",
  "M520 -20 C 500 100, 560 180, 540 280 S 480 460, 520 620",
  "M1020 120 C 880 150, 780 110, 680 160 S 520 220, 400 180 S 200 120, -20 150",
  "M820 -20 C 780 120, 840 220, 800 330 S 760 500, 820 620",
  "M-20 460 C 120 430, 260 470, 380 440 S 600 400, 700 460 S 900 520, 1020 480",
  "M300 260 C 380 230, 450 260, 540 280 S 700 330, 800 330",
];
const MINOR = [
  "M60 80 C 120 110, 180 70, 240 110",
  "M640 40 C 680 80, 720 60, 760 100",
  "M880 380 C 920 410, 960 390, 1000 420",
  "M200 520 C 260 500, 320 540, 360 520",
  "M600 520 C 640 500, 700 540, 740 520",
  "M380 360 C 420 380, 470 350, 500 380",
];
const LABELS: [string, number, number][] = [
  ["ALAKO", 150, 60],
  ["SANGO", 90, 190],
  ["OLD BODIJA", 520, 150],
  ["SAMONDA", 640, 70],
  ["AKOBO", 830, 200],
  ["CHALLENGE", 250, 330],
  ["UCH", 380, 230],
  ["DUGBE", 370, 400],
  ["JERICHO", 600, 390],
  ["OLUYOLE ESTATE", 840, 400],
  ["APATA", 210, 410],
  ["IDO", 50, 360],
  ["MOKOLA", 390, 540],
  ["ASHI", 960, 290],
];


/** Projects listing coordinates into 0–100% map space, fitted with padding. */
export function projectPins<T extends Pick<ListingCard, "latitude" | "longitude">>(rows: T[]) {
  const pts = rows.filter((r) => r.latitude != null && r.longitude != null);
  if (!pts.length) return [] as (T & { x: number; y: number })[];
  const lats = pts.map((p) => p.latitude!), lngs = pts.map((p) => p.longitude!);
  let [minLat, maxLat, minLng, maxLng] = [Math.min(...lats), Math.max(...lats), Math.min(...lngs), Math.max(...lngs)];
  const padLat = Math.max((maxLat - minLat) * 0.18, 0.01), padLng = Math.max((maxLng - minLng) * 0.12, 0.01);
  minLat -= padLat; maxLat += padLat; minLng -= padLng; maxLng += padLng;
  return pts.map((p) => ({
    ...p,
    x: ((p.longitude! - minLng) / (maxLng - minLng)) * 100,
    y: ((maxLat - p.latitude!) / (maxLat - minLat)) * 100,
  }));
}

export function MapBackdrop({ inView = true }: { inView?: boolean }) {
  return (
        <svg viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full" aria-hidden>
      <rect width="1000" height="600" fill="#f2f3ef" />
      {/* parks */}
      <ellipse cx="90" cy="420" rx="70" ry="40" fill="#e3eddc" />
      <ellipse cx="560" cy="470" rx="50" ry="30" fill="#e3eddc" />
      <ellipse cx="960" cy="80" rx="80" ry="50" fill="#e3eddc" />
      {MINOR.map((d, i) => (
        <motion.path
          key={d}
          d={d}
          stroke="#e2e4df"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={inView ? { pathLength: 1 } : {}}
          transition={{ duration: 1.6, delay: 0.4 + i * 0.1, ease: EASE }}
        />
      ))}
      {ROADS.map((d, i) => (
        <g key={d}>
          <motion.path
            d={d}
            stroke="#dcdfda"
            strokeWidth="16"
            fill="none"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={inView ? { pathLength: 1 } : {}}
            transition={{ duration: 1.8, delay: i * 0.12, ease: EASE }}
          />
          <motion.path
            d={d}
            stroke="#ffffff"
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={inView ? { pathLength: 1 } : {}}
            transition={{ duration: 1.8, delay: i * 0.12, ease: EASE }}
          />
        </g>
      ))}
      {LABELS.map(([t, x, y], i) => (
        <motion.text
          key={t}
          x={x}
          y={y}
          className="fill-neutral-500 font-sans text-[13px] font-medium tracking-[0.12em]"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 1 + i * 0.04 }}
        >
          {t}
        </motion.text>
      ))}
      <g className="font-sans text-[11px] font-bold">
        <rect x="744" y="262" width="28" height="18" rx="3" fill="#3f8f5a" />
        <text x="758" y="275" textAnchor="middle" fill="#fff">A5</text>
        <rect x="256" y="252" width="28" height="18" rx="3" fill="#3f8f5a" />
        <text x="270" y="265" textAnchor="middle" fill="#fff">A1</text>
      </g>
    </svg>
  );
}

export function IbadanMap({ listings }: { listings: ListingCard[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20%" });
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const pins = projectPins(listings.slice(0, 7));
  const current = pins[active];

  useEffect(() => {
    if (!inView || paused) return;
    const t = setInterval(() => setActive((a) => (a + 1) % pins.length), 3200);
    return () => clearInterval(t);
  }, [inView, paused, pins.length]);

  return (
    <div ref={ref} className="relative">
      <div className="hidden md:block">
        <MapFilters />
      </div>
      {/* phones: tap an area instead of filling a form */}
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-4 md:hidden">
        <Link to="/listings" className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-urbn px-4 py-2.5 text-[13px] font-semibold text-white active:scale-95">
          <Search className="size-4" /> All of Ibadan
        </Link>
        {LIVE_AREAS.map((a) => (
          <Link key={a.slug} to={`/listings/in/${a.slug}`} className="shrink-0 rounded-full border border-neutral-200 bg-white px-4 py-2.5 text-[13px] font-semibold active:scale-95 active:bg-mist">
            {a.name}
          </Link>
        ))}
      </div>
      <div
        className="relative aspect-[4/3] overflow-hidden md:mt-[-1.75rem] bg-[#f3f4f1] sm:aspect-[16/8] lg:aspect-[1440/560]"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <MapBackdrop inView={inView} />

        {/* pins */}
        {pins.map((l, i) => (
          <motion.button
            key={l.id}
            type="button"
            aria-label={`Show ${l.propertyTitle}`}
            onClick={() => setActive(i)}
            onFocus={() => setActive(i)}
            className="absolute z-10 -translate-x-1/2 -translate-y-full"
            style={{ left: `${l.x}%`, top: `${12 + l.y * 0.82}%` }}
            initial={{ y: -40, opacity: 0 }}
            animate={inView ? { y: 0, opacity: 1 } : {}}
            transition={{ type: "spring", stiffness: 300, damping: 16, delay: 1.1 + i * 0.12 }}
          >
            <span className="relative block">
              {i === active && <span className="absolute inset-0 animate-ping-slow rounded-full bg-urbn/50" />}
              <span
                className={clsx(
                  "relative block size-11 overflow-hidden rounded-full border-[3px] bg-white transition-all duration-300 sm:size-14",
                  i === active ? "scale-110 border-urbn" : "border-urbn/80",
                )}
              >
                {l.thumbnailUrl && <img src={l.thumbnailUrl} alt="" className="size-full object-cover" loading="lazy" />}
              </span>
              <span className="mx-auto -mt-1 block h-0 w-0 border-x-[7px] border-t-[9px] border-x-transparent border-t-urbn" />
            </span>
          </motion.button>
        ))}

        {/* active card (desktop overlay) */}
        <div className="pointer-events-none absolute inset-0 hidden md:block">
          <AnimatePresence mode="wait">
            {inView && current && (
              <motion.div
                key={current.id}
                className="pointer-events-auto absolute z-20 w-60"
                style={{
                  left: `clamp(8rem, ${current.x}%, calc(100% - 8rem))`,
                  top: `${12 + current.y * 0.82}%`,
                }}
                initial={{ opacity: 0, y: 10, scale: 0.94, x: "-50%" }}
                animate={{ opacity: 1, y: current.y > 45 ? "calc(-100% - 4.6rem)" : "0.75rem", scale: 1, x: "-50%" }}
                exit={{ opacity: 0, scale: 0.96, x: "-50%" }}
                transition={{ duration: 0.45, ease: EASE }}
              >
                <MapCard listing={current} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      {/* phones: swipe through the pinned homes, map-app style */}
      <div className="container-x relative z-10 -mt-14 md:hidden">
        <Rail item="w-[72%] sm:w-[45%]" label="Homes on the Map">
          {pins.map((l) => (
            <MapCard key={l.id} listing={l} />
          ))}
        </Rail>
      </div>
    </div>
  );
}

export function MapCard({ listing }: { listing: ListingCard }) {
  const beds = roomCount(listing, "Bedroom");
  const baths = roomCount(listing, "Bathroom");
  return (
    <Link
      to={listingPath(listing)}
      className="relative block rounded-2xl bg-ink p-2.5 text-white shadow-2xl ring-1 ring-white/10 transition hover:ring-urbn"
    >
      <div className="relative">
        {listing.thumbnailUrl && <img src={listing.thumbnailUrl} alt="" className="h-32 w-full rounded-xl object-cover" />}
        <span className="absolute top-2 left-2 rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-ink">{listingTypeLabel(listing.listingType)}</span>
        <span className="absolute top-2 right-2 grid size-6 place-items-center rounded-full bg-white text-success">
          <svg viewBox="0 0 20 20" className="size-4" fill="currentColor" aria-hidden>
            <path d="M10 1.5 3 4.5v5c0 4.2 2.9 8.1 7 9 4.1-.9 7-4.8 7-9v-5l-7-3Zm-1.2 12.1-3.1-3.1 1.2-1.2 1.9 1.9 4.6-4.6 1.2 1.2-5.8 5.8Z" />
          </svg>
        </span>
      </div>
      <div className="px-1.5 pt-3 pb-1.5">
        <p className="truncate font-display text-base leading-tight">{listing.structureType ?? listing.propertyTitle}</p>
        <p className="mt-1 flex items-center gap-1 truncate text-[11px] text-neutral-400">
          <MapPin className="size-3 shrink-0" /> {listing.propertyTitle} · {listing.propertyCity}
        </p>
        <p className="mt-2 flex items-center gap-2 text-[10.5px] text-neutral-300">
          {listing.squareFootage && <><Ruler className="size-3" /> {listing.squareFootage}sqm</>}
          {beds != null && <><BedDouble className="size-3" /> {beds} bed</>}
          {baths != null && <><Bath className="size-3" /> {baths} bath</>}
        </p>
        <p className="mt-3 font-display text-lg">{formatPrice(listing.price, listing.rentPeriod)}</p>
      </div>
    </Link>
  );
}

function MapFilters() {
  const field = "flex flex-col gap-1 px-4 py-2 text-left sm:px-5";
  const select =
    "w-full cursor-pointer appearance-none bg-transparent pr-6 text-[15px] font-medium text-ink outline-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22black%22 stroke-width=%222%22><path d=%22m6 9 6 6 6-6%22/></svg>')] bg-[length:16px] bg-[right_center] bg-no-repeat";
  return (
    <Form
      action="/listings"
      method="get"
      className="relative z-30 mx-auto flex w-[calc(100%-2rem)] max-w-3xl flex-col rounded-2xl bg-white p-2 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.35)] ring-1 ring-black/5 sm:flex-row sm:items-center"
    >
      <label className={clsx(field, "flex-1 border-b border-neutral-100 sm:border-r sm:border-b-0")}>
        <span className="text-xs text-neutral-500">Location</span>
        <select name="search" className={select} defaultValue="">
          <option value="">All of Ibadan</option>
          {LIVE_AREAS.map((a) => (
            <option key={a.slug} value={a.name}>
              {a.name}
            </option>
          ))}
        </select>
      </label>
      <label className={clsx(field, "flex-1 border-b border-neutral-100 sm:border-r sm:border-b-0")}>
        <span className="text-xs text-neutral-500">Listing Type</span>
        <select name="listingType" className={select} defaultValue="">
          <option value="">All</option>
          <option value="Rent">For Rent</option>
          <option value="Sale">For Sale</option>
          <option value="Lease">Lease</option>
          <option value="ShortTermRental">Short Term</option>
        </select>
      </label>
      <label className={clsx(field, "flex-1")}>
        <span className="text-xs text-neutral-500">Budget</span>
        <select name="maxPrice" className={select} defaultValue="">
          <option value="">Any Budget</option>
          <option value="500000">Up to ₦500k</option>
          <option value="1500000">Up to ₦1.5M</option>
          <option value="2500000">Up to ₦2.5M</option>
          <option value="5000000">Up to ₦5M</option>
          <option value="100000000">Up to ₦100M</option>
        </select>
      </label>
      <button
        type="submit"
        aria-label="Search Homes"
        className="m-1 grid h-12 shrink-0 place-items-center gap-2 rounded-xl bg-urbn px-4 text-white transition hover:bg-blue-600 active:scale-95 sm:size-12 sm:rounded-full sm:px-0"
      >
        <Search className="size-5" />
      </button>
    </Form>
  );
}
