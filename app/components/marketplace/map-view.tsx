import { clsx } from "clsx";
import { MapPinOff, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { MapBackdrop, projectPins } from "~/components/ibadan-map";
import { ListingCard } from "~/components/listing-card";
import { EASE } from "~/components/motion";
import { type ListingCard as Card, formatCompactNaira } from "~/lib/marketplace/types";

/** Marketplace map mode: price pins + selected listing card (app's MapSelectedListingCard). */
export function MarketplaceMap({ listings }: { listings: Card[] }) {
  // Spread into the drawable area, then nudge overlapping price pills apart.
  const pins = projectPins(listings).map((p) => ({ ...p, left: 5 + p.x * 0.9, top: 12 + p.y * 0.72 }));
  for (let pass = 0; pass < 4; pass++)
    for (let i = 0; i < pins.length; i++)
      for (let j = i + 1; j < pins.length; j++) {
        const a = pins[i], b = pins[j];
        if (Math.abs(a.left - b.left) < 7 && Math.abs(a.top - b.top) < 6) {
          b.top += a.top <= b.top ? 3.5 : -3.5;
          a.top -= a.top <= b.top ? 3.5 : -3.5;
        }
      }
  const [selected, setSelected] = useState<string | null>(pins[0]?.id ?? null);
  useEffect(() => {
    if (!pins.some((p) => p.id === selected)) setSelected(pins[0]?.id ?? null);
  }, [listings]); // eslint-disable-line react-hooks/exhaustive-deps
  const current = listings.find((l) => l.id === selected);

  return (
    <div className="relative -mx-4 h-[calc(100svh-15rem)] min-h-[26rem] overflow-hidden bg-[#f2f3ef] ring-1 ring-black/5 sm:mx-0 sm:h-[40rem] sm:rounded-2xl">
      <div className="absolute inset-0">
        <MapBackdrop />
      </div>
      {pins.length === 0 && (
        <div className="absolute inset-0 grid place-items-center text-center text-sm text-neutral-500">
          <span>
            <MapPinOff className="mx-auto mb-2 size-6" />
            Location unavailable
          </span>
        </div>
      )}
      {pins.map((p, i) => (
        <motion.button
          key={p.id}
          type="button"
          onClick={() => setSelected(p.id)}
          aria-label={`${p.propertyTitle}, ${formatCompactNaira(p.price)}`}
          aria-pressed={selected === p.id}
          className={clsx(
            "absolute z-10 -translate-x-1/2 -translate-y-full rounded-full px-3 py-1.5 text-xs font-bold shadow-lg ring-2 transition-colors",
            selected === p.id ? "z-20 bg-urbn text-white ring-white" : "bg-white text-ink ring-white hover:bg-ink hover:text-white",
          )}
          style={{ left: `${p.left}%`, top: `${p.top}%` }}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 320, damping: 18, delay: i * 0.05 }}
        >
          {formatCompactNaira(p.price)}
          <span className={clsx("absolute top-full left-1/2 -translate-x-1/2 border-x-[6px] border-t-[7px] border-x-transparent", selected === p.id ? "border-t-urbn" : "border-t-white")} />
        </motion.button>
      ))}
      <AnimatePresence mode="wait">
        {current && (
          <motion.div
            key={current.id}
            className="absolute right-3 bottom-3 left-3 z-30 sm:right-auto sm:w-80"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            <button
              type="button"
              onClick={() => setSelected(null)}
              aria-label="Close Preview"
              className="absolute -top-3 -right-3 z-10 grid size-8 place-items-center rounded-full bg-white shadow ring-1 ring-black/5"
            >
              <X className="size-4" />
            </button>
            <ListingCard listing={current} className="shadow-2xl" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
