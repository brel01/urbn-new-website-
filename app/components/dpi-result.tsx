import { clsx } from "clsx";
import { BadgeCheck, CalendarDays, Copy, FileBadge, MapPin, ShieldCheck, TriangleAlert, UserPlus, Check } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { appDeepLink, DPI_ERROR_COPY, type DpiErrorCode, type DpiRecord } from "~/lib/dpi";
import { formatPrice, listingTypeLabel, type ListingType, type RentPeriod } from "~/lib/marketplace/types";
import { EASE } from "./motion";
import { ButtonLink } from "./ui";

// App date format: DD MMM YYYY
const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

/** Verified record card, matching the "Verified result" layout from the designs. */
export function VerifiedResult({ record, animate = true }: { record: DpiRecord; animate?: boolean }) {
  const [scanning, setScanning] = useState(animate);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!animate) return;
    const t = setTimeout(() => setScanning(false), 1500);
    return () => clearTimeout(t);
  }, [animate]);

  const rows = [
    { icon: ShieldCheck, k: "Verification status", v: <span className="inline-flex items-center gap-1 font-semibold text-success"><BadgeCheck className="size-4" /> Verified</span> },
    { icon: MapPin, k: "Registered address", v: [record.address, record.lga && `${record.lga} LGA`, record.state].filter(Boolean).join(", ") },
    ...(record.registeredOn ? [{ icon: CalendarDays, k: "Registration date", v: fmtDate(record.registeredOn) }] : []),
    { icon: FileBadge, k: "Ownership status", v: record.ownership },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-[0.8fr_2fr_0.8fr]">
      <div className="flex flex-col justify-between rounded-card bg-mist p-6">
        <p className="text-xs font-semibold tracking-wider text-neutral-500 uppercase">Verified result</p>
        <AnimatePresence mode="wait">
          {scanning ? (
            <motion.p key="s" exit={{ opacity: 0 }} className="mt-6 flex items-center gap-2 font-display text-xl text-neutral-500" role="status">
              <span className="size-5 animate-spin rounded-full border-2 border-urbn border-t-transparent" /> Checking record…
            </motion.p>
          ) : (
            <motion.div key="v" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 18 }} className="mt-6" role="status">
              <p className="flex items-center gap-2 font-display text-2xl">
                <span className="grid size-8 place-items-center rounded-full bg-success text-white"><Check className="size-5" /></span>
                Property Verified
              </p>
              <p className="mt-3 text-sm text-neutral-500">This property passed identity, title document and physical checks before its DPI was issued.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="relative grid gap-5 overflow-hidden rounded-card border border-neutral-200 bg-white p-4 sm:grid-cols-[0.9fr_1.1fr] sm:p-5">
        <div className="relative overflow-hidden rounded-xl">
          <img src={record.image ?? "/images/house-result.webp"} alt={record.name} className="aspect-square size-full object-cover" />
          <span className="absolute top-3 left-3 grid size-8 place-items-center rounded-full bg-white text-success shadow">
            <ShieldCheck className="size-5" />
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
        <div>
          <h2 className="font-display text-2xl">{record.name}</h2>
          <p className="text-sm text-neutral-500">
            {[record.city, record.state].filter(Boolean).join(", ")}
            {record.houseNo && ` · House no. ${record.houseNo}`} · {record.unitType}
          </p>
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
            <div className="grid grid-cols-[auto_1fr] items-center gap-x-3 text-sm sm:grid-cols-[auto_9.5rem_1fr]">
              <BadgeCheck className="size-4 text-neutral-400" aria-hidden />
              <dt className="text-neutral-500">DPI code</dt>
              <dd className="col-start-2 flex items-center gap-2 font-mono font-semibold sm:col-start-3">
                {record.code}
                {record.unitCode && <span className="text-neutral-400">/{record.unitCode}</span>}
                <button
                  type="button"
                  aria-label="Copy DPI code"
                  className="rounded p-1 text-neutral-400 hover:bg-mist hover:text-ink"
                  onClick={() => {
                    navigator.clipboard?.writeText(record.unitCode ? `${record.code}/${record.unitCode}` : record.code);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  }}
                >
                  {copied ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5" />}
                </button>
              </dd>
            </div>
          </dl>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            {record.listingPath && record.listing && (
              <Link to={record.listingPath} className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-urbn hover:bg-blue-100">
                {listingTypeLabel(record.listing.type as ListingType)} · {formatPrice(record.listing.price, record.listing.rentPeriod as RentPeriod | null)} →
              </Link>
            )}
            <a href={appDeepLink(record.code, record.unitCode)} className="text-sm font-semibold text-ink underline-offset-4 hover:underline">
              Open in Urbn App
            </a>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center rounded-card bg-mist p-6 text-center">
        <motion.span
          initial={animate ? { scale: 0, rotate: -30 } : false}
          animate={{ scale: scanning ? 0 : 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 14 }}
          className="text-success"
        >
          <ShieldCheck className="size-16 stroke-[1.5]" />
        </motion.span>
        <p className="mt-4 text-sm text-neutral-600">This is what you'll see whenever a property is fully verified.</p>
      </div>

      {record.history.length > 0 && (
        <div className="rounded-card border border-neutral-200 p-6 lg:col-span-3">
          <h3 className="font-display text-xl">Record history</h3>
          <p className="text-sm text-neutral-500">Timestamped events logged to this DPI. Entries are added, never overwritten.</p>
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
    </div>
  );
}

/** "Don't panic" no-match guidance. */
export function NoMatch({ code, error = "PROPERTY_NOT_FOUND" }: { code?: string; error?: DpiErrorCode }) {
  const copy = DPI_ERROR_COPY[error];
  const steps = [
    { title: "Check the code", text: "Make sure there are no typos. Codes look like IBADAN-NORTH-0041-U, and the last letter is a typo check." },
    { title: "Ask questions", text: "Ask whoever's showing you the property why it isn't verified." },
    { title: "Don't assume it's verified", text: "Until there's a match, there's no independent Urbn verification to rely on." },
  ];
  return (
    <div className="grid gap-6 rounded-card bg-mist p-6 sm:p-8 lg:grid-cols-[0.9fr_2fr_0.9fr] lg:items-center">
      <div>
        <div className="flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-full bg-ink text-white">
            <TriangleAlert className="size-5" />
          </span>
          <span className="rounded-full bg-urbn px-2.5 py-1 text-xs font-medium text-white">{error === "PROPERTY_NOT_FOUND" ? "No match?" : copy.title}</span>
        </div>
        <h2 className="mt-5 text-3xl">{error === "PROPERTY_NOT_FOUND" ? "Don't Panic." : copy.title}</h2>
        <p className="mt-2 text-sm text-neutral-600">
          {code && (
            <>
              We couldn't find <span className="font-mono font-semibold text-ink">{code}</span>.{" "}
            </>
          )}
          {copy.body}
        </p>
      </div>
      <div>
        <p className="font-semibold">Before you move forward:</p>
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
        <p className="mt-3 font-medium">Own or manage this property?</p>
        <ButtonLink to="/dpi" variant="ghost-light" arrow={false} className={clsx("mt-5 w-full")}>
          Get a DPI
        </ButtonLink>
      </div>
    </div>
  );
}
