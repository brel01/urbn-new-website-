import { clsx } from "clsx";
import { BadgeCheck, Bell, Building2, CalendarDays, Check, Copy, FileBadge, Home, Layers, Link2, MapPin, QrCode, Search, Share2, ShieldCheck, TriangleAlert, UserPlus, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { appDeepLink, DPI_ERROR_COPY, dpiShareLink, SAMPLE_DPI, type DpiErrorCode, type DpiRecord } from "~/lib/dpi";
import { formatPrice, listingTypeLabel, type ListingType, type RentPeriod } from "~/lib/marketplace/types";
import type { NearbyPlace } from "~/lib/nearby/types";
import { EASE } from "./motion";
import { activityPath } from "~/lib/nearby/types";
import { ActivityHere } from "./nearby";
import { UBeepSheet } from "./ubeep";
import { ButtonLink } from "./ui";

const PropertyMap = lazy(() => import("./property-map").then((m) => ({ default: m.PropertyMap })));

// App date format: DD MMM YYYY
const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

/** The app's listing line: price in the listing's currency, then purpose · type. */
const listingLine = (l: NonNullable<DpiRecord["listing"]>) => {
  const price =
    l.currency && l.currency !== "NGN"
      ? new Intl.NumberFormat("en-NG", { style: "currency", currency: l.currency, maximumFractionDigits: 0 }).format(l.price)
      : formatPrice(l.price, l.rentPeriod as RentPeriod | null);
  return { price, kind: [l.purpose, listingTypeLabel(l.type as ListingType)].filter(Boolean).join(" · ") };
};

/** Focus the DPI search at the top of the page (Search Again). */
const searchAgain = () => {
  const input = document.querySelector<HTMLInputElement>("[data-dpi-input]");
  window.scrollTo({ top: 0, behavior: "smooth" });
  setTimeout(() => {
    input?.focus({ preventScroll: true });
    input?.select();
  }, 350);
};

/**
 * Verified record, laid out like the app's Find a Property result card
 * (urbn-mobile components/properties/dpi-search-result-card.tsx and the unit
 * variant): Verified badge, DPI code panel with QR and copy, photo, details,
 * listing, and the U-Beep button.
 */
export function VerifiedResult({
  record,
  animate = true,
  activities = [],
  sampleMode = false,
  searchAgainButton = true,
}: {
  record: DpiRecord;
  animate?: boolean;
  activities?: NearbyPlace[];
  /** no live API: U-Beep runs its sample version */
  sampleMode?: boolean;
  searchAgainButton?: boolean;
}) {
  const [scanning, setScanning] = useState(animate);
  const [copied, setCopied] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [params, setParams] = useSearchParams();
  // ?beep=1 opens U-Beep straight away (e.g. from a "Beep this property" link).
  const [beepOpen, setBeepOpen] = useState(() => params.get("beep") === "1");
  const closeBeep = useCallback(() => {
    setBeepOpen(false);
    if (params.has("beep")) {
      const next = new URLSearchParams(params);
      next.delete("beep");
      setParams(next, { replace: true, preventScrollReset: true });
    }
  }, [params, setParams]);
  const closeQr = useCallback(() => setQrOpen(false), []);
  const sample = record.code === SAMPLE_DPI;
  const isUnit = !!record.unitCode;
  const fullCode = isUnit ? `${record.code}/${record.unitCode}` : record.code;
  const title = isUnit ? `Unit ${record.unit?.number ?? record.unitCode}` : record.name;
  const traceable = record.mode === "TRACEABLE";
  useEffect(() => {
    if (!animate) return;
    const t = setTimeout(() => setScanning(false), 1500);
    return () => clearTimeout(t);
  }, [animate]);

  const rows = [
    { icon: ShieldCheck, k: "Verification Status", v: <span className="inline-flex items-center gap-1 font-semibold text-success"><BadgeCheck className="size-4" /> Verified</span> },
    ...(!traceable ? [{ icon: MapPin, k: "Registered Address", v: [record.houseNo && !record.address.startsWith(record.houseNo) ? record.houseNo : null, record.address, record.lga && `${record.lga} LGA`, record.state].filter(Boolean).join(", ") }] : []),
    ...(record.postalCode ? [{ icon: MapPin, k: "Postal Code", v: record.postalCode }] : []),
    ...(record.buildingType ? [{ icon: Building2, k: "Building Type", v: record.buildingType }] : []),
    ...(isUnit && record.unit?.floor != null ? [{ icon: Layers, k: "Floor", v: record.unit.floor === 0 ? "Ground floor" : `Floor ${record.unit.floor}` }] : []),
    ...(isUnit && record.unit?.rooms ? [{ icon: Home, k: "Rooms", v: String(record.unit.rooms) }] : []),
    ...(record.registeredOn ? [{ icon: CalendarDays, k: "Registration Date", v: fmtDate(record.registeredOn) }] : []),
    ...(record.ownership ? [{ icon: FileBadge, k: "Ownership Status", v: record.ownership }] : []),
  ];
  const listing = record.listing ? listingLine(record.listing) : null;

  return (
    <div className="grid gap-4 lg:grid-cols-[0.8fr_2fr_0.8fr]">
      <div className="flex flex-col justify-between rounded-card bg-mist p-5 lg:p-6">
        <p className="text-xs font-semibold tracking-wider text-neutral-500 uppercase">{sample ? "Sample Record" : "Property Record"}</p>
        <AnimatePresence mode="wait">
          {scanning ? (
            <motion.p key="s" exit={{ opacity: 0 }} className="mt-6 flex items-center gap-2 font-display text-xl text-neutral-500" role="status">
              <span className="size-5 animate-spin rounded-full border-2 border-urbn border-t-transparent" /> Checking record…
            </motion.p>
          ) : (
            <motion.div key="v" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 18 }} className="mt-3 lg:mt-6" role="status">
              <p className="flex items-center gap-2 font-display text-2xl">
                <span className="grid size-8 place-items-center rounded-full bg-success text-white"><Check className="size-5" /></span>
                {isUnit ? "Verified Property" : "Property Verified"}
              </p>
              <p className="mt-3 text-sm text-neutral-500">
                {traceable ? "This DPI identifies a real property and shows its location." : "This DPI identifies the property below."}{" "}
                {isUnit ? "The unit sits within a property that completed Urbn's verification checks." : "It completed Urbn's required verification checks."}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="relative grid gap-5 overflow-hidden rounded-card border border-neutral-200 bg-white p-4 sm:grid-cols-[0.9fr_1.1fr] sm:p-5">
        <div className="space-y-3">
          <div className="relative overflow-hidden rounded-xl">
            <img src={record.image ?? "/images/house-result.webp"} alt={record.name} className="aspect-square size-full object-cover" />
            <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-white py-1 pr-2.5 pl-1.5 text-xs font-semibold text-success shadow">
              <ShieldCheck className="size-4" /> {isUnit ? "Verified Property" : "Verified"}
            </span>
            {scanning && (
              <motion.span
                className="absolute inset-x-0 h-1/3 bg-gradient-to-b from-transparent via-urbn/40 to-transparent"
                initial={{ y: "-100%" }}
                animate={{ y: "300%" }}
                transition={{ duration: 1.4, ease: "easeInOut" }}
              />
            )}
          </div>
          {/* DPI Code panel, as in the app: code, then QR and copy */}
          <div className="rounded-xl bg-ink p-3.5 text-white">
            <p className="text-[11px] font-semibold tracking-wider text-white/50 uppercase">DPI Code</p>
            <div className="mt-1 flex items-center gap-2">
              <p className="min-w-0 flex-1 font-mono text-[15px] font-semibold break-all lg:text-[13px]">
                {record.code}
                {record.unitCode && <span className="text-white/60">/{record.unitCode}</span>}
              </p>
              <button type="button" aria-label="Show QR code" onClick={() => setQrOpen(true)} className="grid size-9 shrink-0 place-items-center rounded-lg bg-white/10 hover:bg-white/20">
                <QrCode className="size-4" />
              </button>
              <button
                type="button"
                aria-label="Copy DPI Code"
                className="grid size-9 shrink-0 place-items-center rounded-lg bg-white/10 hover:bg-white/20"
                onClick={() => {
                  navigator.clipboard?.writeText(fullCode);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
              >
                {copied ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
              </button>
            </div>
            <p className="sr-only" role="status">{copied ? "DPI code copied" : ""}</p>
          </div>
        </div>
        <div className="flex flex-col">
          <h2 className="font-display text-2xl">{title}</h2>
          <p className="text-sm text-neutral-500">
            {isUnit && `${record.name} · `}
            {[record.city, record.state].filter(Boolean).join(", ")}
            {!isUnit && record.houseNo && ` · House no. ${record.houseNo}`}
            {!isUnit && ` · ${record.unitType}`}
          </p>
          {record.description && <p className="mt-3 line-clamp-4 text-sm text-neutral-600">{record.description}</p>}
          <dl className="mt-5 space-y-3.5">
            {rows.map((r, i) => (
              <motion.div
                key={r.k}
                className="grid grid-cols-[auto_1fr] gap-x-3 text-sm sm:grid-cols-[auto_9.5rem_1fr]"
                initial={animate ? { opacity: 0, x: 12 } : false}
                animate={{ opacity: scanning ? 0.25 : 1, x: 0 }}
                transition={{ delay: animate ? 0.2 + i * 0.12 : 0, duration: 0.5, ease: EASE }}
              >
                <r.icon className="size-4 text-neutral-400" aria-hidden />
                <dt className="text-neutral-500">{r.k}</dt>
                <dd className="col-start-2 sm:col-start-3">{r.v}</dd>
              </motion.div>
            ))}
          </dl>
          {listing && (
            <div className="mt-5 rounded-xl border border-neutral-200 px-4 py-3">
              <p className="font-display text-xl">{listing.price}</p>
              <p className="text-xs text-neutral-500">{listing.kind}</p>
            </div>
          )}
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setBeepOpen(true)}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-ink text-sm font-semibold text-white transition hover:bg-neutral-800 active:scale-[0.98]"
            >
              <Bell className="size-4" /> U-Beep
            </button>
            {record.listingPath && record.listing ? (
              <Link to={record.listingPath} className="inline-flex h-12 items-center justify-center rounded-xl bg-blue-50 text-sm font-semibold text-urbn hover:bg-blue-100">
                View Listing
              </Link>
            ) : (
              <a href={appDeepLink(record.code, record.unitCode)} className="inline-flex h-12 items-center justify-center rounded-xl border border-neutral-200 text-sm font-semibold hover:bg-mist">
                Open in Urbn
              </a>
            )}
          </div>
          <p className="mt-2 text-xs text-neutral-500">U-Beep lets the people at this {isUnit ? "unit" : "property"} know you're at the gate. They can reply within 30 minutes.</p>
          {record.listingPath && record.listing && (
            <a href={appDeepLink(record.code, record.unitCode)} className="mt-3 text-sm font-semibold text-ink underline-offset-4 hover:underline">
              Open in Urbn
            </a>
          )}
          {activities.length > 0 && (
            <div className="mt-5">
              <ActivityHere activities={activities.map((a) => ({ ...a, href: activityPath(a) }))} />
            </div>
          )}
        </div>
      </div>

      <div className="hidden flex-col items-center justify-center rounded-card bg-mist p-6 text-center lg:flex">
        <motion.span
          initial={animate ? { scale: 0, rotate: -30 } : false}
          animate={{ scale: scanning ? 0 : 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 14 }}
          className="text-success"
        >
          <ShieldCheck className="size-16 stroke-[1.5]" />
        </motion.span>
        {sample ? (
          <p className="mt-4 text-sm text-neutral-600">
            <b className="block text-ink">Sample Record</b>
            This example shows how a property record may appear. Available details depend on the record and access settings.
          </p>
        ) : (
          <p className="mt-4 text-sm text-neutral-600">Check the details against the property and its documents before you commit.</p>
        )}
      </div>

      {record.lat != null && record.lng != null && (
        <div className="overflow-hidden rounded-card border border-neutral-200 lg:col-span-3">
          <Suspense fallback={<div className="h-56 bg-mist sm:h-64" />}>
            <PropertyMap lat={record.lat} lng={record.lng} label={record.name} className="z-0 h-56 bg-mist sm:h-64" />
          </Suspense>
        </div>
      )}

      {record.history.length > 0 && (
        <div className="rounded-card border border-neutral-200 p-6 lg:col-span-3">
          <h3 className="font-display text-xl">Record History</h3>
          <p className="text-sm text-neutral-500">View the property updates and events available on this record.</p>
          <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {record.history.map((e, i) => (
              <motion.li
                key={i}
                className="relative border-l-2 border-urbn pl-4"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <p className="text-xs font-semibold text-urbn">{fmtDate(e.date)}</p>
                <p className="mt-1 text-sm">{e.label}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      )}

      {searchAgainButton && (
        <div className="flex justify-center lg:col-span-3">
          <button type="button" onClick={searchAgain} className="inline-flex h-11 items-center gap-2 rounded-xl border border-neutral-200 px-5 text-sm font-semibold hover:bg-mist">
            <Search className="size-4" /> Search Again
          </button>
        </div>
      )}

      <UBeepSheet open={beepOpen} onClose={closeBeep} dpiCode={record.code} unitCode={record.unitCode} propertyName={record.name} sample={sampleMode} />
      <QrSheet open={qrOpen} onClose={closeQr} code={fullCode} link={dpiShareLink(record.code, record.unitCode)} name={title} />
    </div>
  );
}

/** The record's QR (the same universal link the app shares), with share and copy. */
function QrSheet({ open, onClose, code, link, name }: { open: boolean; onClose: () => void; code: string; link: string; name: string }) {
  const [src, setSrc] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!open) return;
    let live = true;
    import("qrcode").then((q) => q.toDataURL(link, { margin: 1, width: 480, color: { dark: "#000000", light: "#ffffff" } })).then((d) => live && setSrc(d));
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", k);
    return () => {
      live = false;
      document.removeEventListener("keydown", k);
    };
  }, [open, link, onClose]);
  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: name, text: `View ${name} on urbn\nDPI: ${code}`, url: link });
      } catch {
        /* dismissed */
      }
      return;
    }
    await navigator.clipboard?.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label="DPI QR code">
          <motion.button type="button" aria-label="Close" className="absolute inset-0 bg-black/50" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.div
            className="relative w-full max-w-sm rounded-t-[1.75rem] bg-white px-6 pt-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-center sm:rounded-[1.75rem]"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <button type="button" onClick={onClose} aria-label="Close" className="absolute top-4 right-4 grid size-9 place-items-center rounded-full bg-mist hover:bg-fog">
              <X className="size-4" />
            </button>
            <p className="font-display text-xl">{name}</p>
            <p className="mt-1 font-mono text-sm text-neutral-500">{code}</p>
            <div className="mx-auto mt-4 grid size-56 place-items-center rounded-2xl border border-neutral-200 p-2">
              {src ? <img src={src} alt={`QR code for DPI ${code}`} className="size-full" /> : <span className="size-6 animate-spin rounded-full border-2 border-urbn border-t-transparent" />}
            </div>
            <p className="mt-3 text-xs text-neutral-500">Scan with a phone camera: it opens in the Urbn app, or on this website.</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button type="button" onClick={share} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-ink text-sm font-semibold text-white hover:bg-neutral-800">
                <Share2 className="size-4" /> Share
              </button>
              <button
                type="button"
                onClick={async () => {
                  await navigator.clipboard?.writeText(link);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-neutral-200 text-sm font-semibold hover:bg-mist"
              >
                {copied ? <Check className="size-4 text-success" /> : <Link2 className="size-4" />} {copied ? "Copied" : "Copy Link"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/** Neutral next steps when a lookup doesn't return a public record. */
export function NoMatch({ code, error = "PROPERTY_NOT_FOUND" }: { code?: string; error?: DpiErrorCode }) {
  const copy = DPI_ERROR_COPY[error];
  const steps = [
    { title: "Check the Code", text: "Enter the complete code exactly as it appears on the plaque or property record, then try again." },
    { title: "Ask for the Current DPI", text: "Ask the owner or manager for the property's current DPI or record." },
    { title: "Review the Documents", text: "A missing result does not establish whether the property is legitimate. Review the available documents before committing." },
  ];
  return (
    <div className="grid gap-6 rounded-card bg-mist p-6 sm:p-8 lg:grid-cols-[0.9fr_2fr_0.9fr] lg:items-center">
      <div>
        <div className="flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-full bg-ink text-white">
            <TriangleAlert className="size-5" />
          </span>
          <span className="rounded-full bg-urbn px-2.5 py-1 text-xs font-medium text-white">{error === "PROPERTY_NOT_FOUND" ? "No Match" : copy.title}</span>
        </div>
        <h2 className="mt-5 text-3xl">{error === "PROPERTY_NOT_FOUND" ? "No Matching Record" : copy.title}</h2>
        <p className="mt-2 text-sm text-neutral-600">
          {code && (
            <>
              <span className="mb-1 block font-mono font-semibold text-ink">{code}</span>
            </>
          )}
          {copy.body}
        </p>
      </div>
      <div>
        <p className="font-semibold">Next steps</p>
        <ol className="mt-4 grid gap-5 sm:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.title} className="border-neutral-300 sm:border-l sm:pl-4">
              <span className="grid size-7 place-items-center rounded-full bg-ink text-xs font-semibold text-white">{String(i + 1).padStart(2, "0")}</span>
              <p className="mt-3 font-display text-lg leading-tight">{s.title}</p>
              <p className="mt-1 text-sm text-neutral-500">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
      <div className="flex flex-col items-center rounded-2xl bg-ink p-6 text-center text-white">
        <UserPlus className="size-8" />
        <p className="mt-3 font-medium">Own or Manage This Property?</p>
        <ButtonLink to="/dpi" variant="ghost-light" arrow={false} className={clsx("mt-5 w-full")}>
          Add Your Property
        </ButtonLink>
      </div>
    </div>
  );
}
