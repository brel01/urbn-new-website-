import { clsx } from "clsx";
import { ChevronDown, LocateFixed, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { type ReactNode, useEffect, useState } from "react";
import { EASE } from "~/components/motion";
import { activeFilterCount } from "~/lib/marketplace/filters";
import {
  BUILDING_TYPES,
  LISTING_TYPE_CHIPS,
  NEARBY_PLACES,
  OUTDOOR_FEATURES,
  SECURITY_FEATURES,
  type Furnishing,
  type ListingFilters,
  formatTextCase,
} from "~/lib/marketplace/types";
import { IBADAN_LGAS } from "~/lib/places";

const STATES = ["Oyo", "Lagos", "FCT", "Rivers"];

function SectionTitle({ children }: { children: ReactNode }) {
  return <h3 className="text-[10px] font-semibold tracking-widest text-neutral-400 uppercase">{children}</h3>;
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={clsx(
        "rounded-full px-4 py-2 text-xs font-semibold transition-colors",
        active ? "bg-ink text-white" : "border border-neutral-200 bg-white text-ink hover:border-ink",
      )}
    >
      {children}
    </button>
  );
}

function Stepper({ label, value, onChange }: { label: string; value?: number; onChange: (v?: number) => void }) {
  return (
    <div>
      <p className="text-sm font-medium">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {[undefined, 1, 2, 3, 4, 5].map((opt) => (
          <Chip key={String(opt)} active={value === opt} onClick={() => onChange(opt)}>
            {opt == null ? "Any" : `${opt}+`}
          </Chip>
        ))}
      </div>
    </div>
  );
}

function Collapsible({ title, children, count }: { title: string; children: ReactNode; count: number }) {
  const [open, setOpen] = useState(count > 0);
  return (
    <div className="rounded-xl border border-neutral-200">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium">
        <span>
          {title}
          {count > 0 && <span className="ml-2 rounded-full bg-urbn px-1.5 py-0.5 text-[10px] text-white">{count}</span>}
        </span>
        <ChevronDown className={clsx("size-4 transition-transform", open && "rotate-180")} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="flex flex-wrap gap-2 px-4 pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const toggleCsv = (csv: string | undefined, v: string) => {
  const set = new Set((csv ?? "").split(",").filter(Boolean));
  set.has(v) ? set.delete(v) : set.add(v);
  return set.size ? [...set].join(",") : undefined;
};

/** Web twin of the app's ListingFilterPanel: a drawer on desktop, a sheet on mobile. */
export function FilterPanel({
  open,
  onClose,
  value,
  onApply,
  resultCount,
}: {
  open: boolean;
  onClose: () => void;
  value: ListingFilters;
  onApply: (f: ListingFilters) => void;
  resultCount?: number;
}) {
  const [f, setF] = useState<ListingFilters>(value);
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  useEffect(() => {
    if (open) setF(value);
  }, [open, value]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [open, onClose]);

  const set = (patch: Partial<ListingFilters>) => setF((p) => ({ ...p, ...patch }));
  const csvCount = (s?: string) => (s ? s.split(",").filter(Boolean).length : 0);
  const nearMe = f.lat != null && f.lng != null;

  const toggleNearMe = () => {
    if (nearMe) return set({ lat: undefined, lng: undefined });
    setGeoError(null);
    setLocating(true);
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        setLocating(false);
        set({ lat: +pos.coords.latitude.toFixed(5), lng: +pos.coords.longitude.toFixed(5), radius: f.radius ?? 10, lga: undefined, state: undefined });
      },
      () => {
        setLocating(false);
        setGeoError("Location permission denied");
      },
      { timeout: 8000 },
    );
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-labelledby="filters-title">
          <motion.div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.aside
            className="absolute inset-x-0 bottom-0 flex max-h-[92dvh] flex-col rounded-t-3xl bg-white sm:inset-y-0 sm:right-0 sm:left-auto sm:max-h-none sm:w-[26rem] sm:rounded-none sm:rounded-l-3xl"
            initial={{ y: "100%", x: 0 }}
            animate={{ y: 0, x: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
              <h2 id="filters-title" className="font-sans text-lg font-bold tracking-normal">Filters</h2>
              <button type="button" onClick={onClose} aria-label="Close filters" className="grid size-10 place-items-center rounded-full hover:bg-mist">
                <X className="size-5" />
              </button>
            </div>

            <div className="flex-1 space-y-7 overflow-y-auto px-5 py-6">
              <section className="space-y-3">
                <SectionTitle>Listed By</SectionTitle>
                <div className="flex flex-wrap gap-2">
                  <Chip active={!f.listedBy} onClick={() => set({ listedBy: undefined })}>All</Chip>
                  <Chip active={f.listedBy === "OWNER"} onClick={() => set({ listedBy: "OWNER" })}>By Owner</Chip>
                  <Chip active={f.listedBy === "AGENT"} onClick={() => set({ listedBy: "AGENT" })}>By Agent</Chip>
                </div>
              </section>

              <section className="space-y-3">
                <SectionTitle>Location</SectionTitle>
                <div className="grid grid-cols-2 gap-3">
                  <label className="text-sm font-medium">
                    State
                    <select
                      value={f.state ?? ""}
                      onChange={(e) => set({ state: e.target.value || undefined, lga: undefined, lat: undefined, lng: undefined })}
                      className="mt-1.5 h-11 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-urbn"
                    >
                      <option value="">Select state</option>
                      {STATES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </label>
                  <label className="text-sm font-medium">
                    City / LGA
                    <select
                      value={f.lga ?? ""}
                      disabled={f.state !== "Oyo"}
                      onChange={(e) => set({ lga: e.target.value || undefined, lat: undefined, lng: undefined })}
                      className="mt-1.5 h-11 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-urbn disabled:bg-mist disabled:text-neutral-400"
                    >
                      <option value="">{f.state === "Oyo" ? "All LGAs" : f.state ? "Coming soon" : "Select state first"}</option>
                      {IBADAN_LGAS.map((l) => <option key={l}>{l}</option>)}
                    </select>
                  </label>
                </div>
                <button
                  type="button"
                  onClick={toggleNearMe}
                  aria-pressed={nearMe}
                  className={clsx("inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold", nearMe ? "bg-urbn text-white" : "border border-neutral-200")}
                >
                  <LocateFixed className={clsx("size-3.5", locating && "animate-spin")} />
                  {nearMe ? `Near me (${f.radius ?? 10}km)` : locating ? "Locating…" : "Near me"}
                </button>
                {nearMe && (
                  <label className="block text-xs text-neutral-500">
                    Radius: {f.radius ?? 10}km
                    <input type="range" min={1} max={50} value={f.radius ?? 10} onChange={(e) => set({ radius: +e.target.value })} className="mt-2 w-full accent-[var(--color-urbn)]" />
                  </label>
                )}
                {geoError && <p className="text-xs text-error">{geoError}</p>}
              </section>

              <section className="space-y-3">
                <SectionTitle>Type</SectionTitle>
                <div className="flex flex-wrap gap-2">
                  {LISTING_TYPE_CHIPS.map((c) => (
                    <Chip key={c.label} active={f.listingType === c.value} onClick={() => set({ listingType: c.value })}>{c.label}</Chip>
                  ))}
                </div>
              </section>

              <section className="space-y-3">
                <SectionTitle>Price Range</SectionTitle>
                <div className="grid grid-cols-2 gap-3">
                  {(["minPrice", "maxPrice"] as const).map((k) => (
                    <label key={k} className="relative">
                      <span className="sr-only">{k === "minPrice" ? "Minimum price" : "Maximum price"}</span>
                      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-neutral-400">₦</span>
                      <input
                        inputMode="numeric"
                        placeholder={k === "minPrice" ? "Min" : "Max"}
                        value={f[k] ? f[k]!.toLocaleString("en-NG") : ""}
                        onChange={(e) => {
                          const n = Number(e.target.value.replace(/[^\d]/g, ""));
                          set({ [k]: n || undefined });
                        }}
                        className="h-11 w-full rounded-lg border border-neutral-200 pr-3 pl-7 text-sm outline-none focus:border-urbn"
                      />
                    </label>
                  ))}
                </div>
              </section>

              <section className="space-y-3">
                <SectionTitle>Property Type</SectionTitle>
                <div className="flex flex-wrap gap-2">
                  {BUILDING_TYPES.map((t) => (
                    <Chip key={t} active={f.buildingType === t} onClick={() => set({ buildingType: f.buildingType === t ? undefined : t })}>
                      {formatTextCase(t)}
                    </Chip>
                  ))}
                </div>
                <div className="space-y-4 pt-2">
                  <Stepper label="Bedrooms" value={f.bedrooms} onChange={(v) => set({ bedrooms: v })} />
                  <Stepper label="Bathrooms" value={f.bathrooms} onChange={(v) => set({ bathrooms: v })} />
                </div>
              </section>

              <section className="space-y-3">
                <SectionTitle>Furnishing</SectionTitle>
                <div className="flex flex-wrap gap-2">
                  {(["Furnished", "SemiFurnished", "Unfurnished"] as Furnishing[]).map((s) => (
                    <Chip key={s} active={f.furnishingStatus === s} onClick={() => set({ furnishingStatus: f.furnishingStatus === s ? undefined : s })}>
                      {formatTextCase(s)}
                    </Chip>
                  ))}
                </div>
                <label className="flex items-center justify-between rounded-xl border border-neutral-200 px-4 py-3 text-sm font-medium">
                  Featured only
                  <input type="checkbox" checked={!!f.featuredOnly} onChange={(e) => set({ featuredOnly: e.target.checked || undefined })} className="size-5 accent-[var(--color-urbn)]" />
                </label>
              </section>

              <section className="space-y-3">
                <SectionTitle>Features</SectionTitle>
                <Collapsible title="Security Features" count={csvCount(f.securityFeatures)}>
                  {SECURITY_FEATURES.map((x) => (
                    <Chip key={x} active={!!f.securityFeatures?.split(",").includes(x)} onClick={() => set({ securityFeatures: toggleCsv(f.securityFeatures, x) })}>{formatTextCase(x)}</Chip>
                  ))}
                </Collapsible>
                <Collapsible title="Outdoor Features" count={csvCount(f.outdoorFeatures)}>
                  {OUTDOOR_FEATURES.map((x) => (
                    <Chip key={x} active={!!f.outdoorFeatures?.split(",").includes(x)} onClick={() => set({ outdoorFeatures: toggleCsv(f.outdoorFeatures, x) })}>{formatTextCase(x)}</Chip>
                  ))}
                </Collapsible>
              </section>

              <section className="space-y-3">
                <SectionTitle>Nearby Places</SectionTitle>
                <div className="flex flex-wrap gap-2">
                  {NEARBY_PLACES.map((x) => (
                    <Chip key={x} active={!!f.nearbyPlaceTypes?.split(",").includes(x)} onClick={() => set({ nearbyPlaceTypes: toggleCsv(f.nearbyPlaceTypes, x) })}>{formatTextCase(x)}</Chip>
                  ))}
                </div>
              </section>
            </div>

            <div className="flex items-center gap-3 border-t border-neutral-100 px-5 py-4">
              <button
                type="button"
                onClick={() => setF({ search: f.search, sortBy: f.sortBy, sortOrder: f.sortOrder })}
                className="h-12 rounded-xl px-4 text-sm font-semibold text-neutral-600 hover:bg-mist"
              >
                Clear all{activeFilterCount(f) ? ` (${activeFilterCount(f)})` : ""}
              </button>
              <button
                type="button"
                onClick={() => {
                  onApply({ ...f, page: undefined });
                  onClose();
                }}
                className="h-12 flex-1 rounded-xl bg-ink text-sm font-semibold text-white transition hover:bg-neutral-800 active:scale-[0.98]"
              >
                Apply Filters
              </button>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
