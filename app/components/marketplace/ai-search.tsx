import { clsx } from "clsx";
import { ChevronDown, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import type { AiQuota } from "~/lib/marketplace/types";

// Same guidance the app shows in its AI search tips panel, localised to Ibadan.
const TIPS = [
  'Location: neighbourhood, city, or area (e.g. "Bodija", "Akobo, Ibadan")',
  'Budget: a range works best (e.g. "between 1 and 2 million naira per year")',
  "Size: bedrooms, bathrooms or floor area",
  "Property type: flat, duplex, mini flat, shop, office, warehouse, etc.",
  "Purpose: renting, buying, leasing, short stay",
  "Must-haves: parking, 24hr security, borehole, furnished",
];
const EXAMPLES = [
  "A 3-bedroom flat in Bodija, up to ₦2M a year, with parking.",
  "A 4-bedroom duplex in Samonda to buy, between ₦150M and ₦200M.",
  "A shop on Ring Road to rent, up to ₦1.5M a year.",
  "A furnished apartment in Bodija for one week, up to ₦60k a night.",
];

const formatReset = (iso: string) => new Date(iso).toLocaleTimeString("en-NG", { hour: "numeric", minute: "2-digit" });

export function AiSearchPanel({
  defaultQuery,
  onSearch,
  busy,
  error,
  quota,
}: {
  defaultQuery: string;
  onSearch: (q: string) => void;
  busy: boolean;
  error?: string;
  quota?: AiQuota;
}) {
  const [q, setQ] = useState(defaultQuery);
  const [tips, setTips] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  useEffect(() => setQ(defaultQuery), [defaultQuery]);
  const exhausted = quota?.remaining === 0;

  const submit = (value = q) => {
    const v = value.trim();
    if (v.length < 5) return setLocalError("Describe the property you want using at least 5 characters.");
    setLocalError(null);
    onSearch(v);
  };

  return (
    <div className="space-y-3">
      <div>
        <p className="flex items-center gap-1.5 text-sm font-bold">
          <Sparkles className="size-4 text-urbn" /> AI Search
        </p>
        <p className="mt-0.5 text-[13px] text-neutral-500">Describe the property you're looking for.</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="rounded-2xl bg-white p-2 ring-1 ring-black/5 focus-within:ring-2 focus-within:ring-urbn"
      >
        <label htmlFor="ai-q" className="sr-only">Describe the property you're looking for</label>
        <div className="flex items-start gap-2">
          <span className="mt-1 grid size-9 shrink-0 place-items-center rounded-xl bg-urbn text-white">
            <Sparkles className="size-4" />
          </span>
          <textarea
            id="ai-q"
            rows={2}
            maxLength={500}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            disabled={exhausted}
            placeholder="Location, budget, bedrooms and must-haves"
            className="min-h-[3.25rem] flex-1 resize-none bg-transparent py-2 text-[15px] outline-none placeholder:text-neutral-400 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={busy || exhausted}
            className="mt-1 h-10 shrink-0 rounded-xl bg-ink px-4 text-sm font-semibold text-white transition hover:bg-neutral-800 active:scale-95 disabled:opacity-60"
          >
            {busy ? "Searching…" : "Search Listings"}
          </button>
        </div>
      </form>

      {(localError || error) && (
        <p role="alert" className="rounded-xl bg-error/10 px-3 py-2 text-sm text-error">{localError ?? error}</p>
      )}
      {quota && (
        <p className={clsx("text-xs", exhausted ? "text-error" : quota.remaining <= 3 ? "text-warning" : "text-neutral-500")}>
          {exhausted
            ? `You've reached today's AI Search limit. Try again at ${formatReset(quota.resetsAt)}, or use filters to keep searching.`
            : `${quota.remaining} of ${quota.limit} searches remaining today`}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => {
              setQ(ex);
              submit(ex);
            }}
            className="rounded-xl bg-white px-3 py-2 text-left text-xs text-neutral-600 ring-1 ring-black/5 transition hover:text-ink hover:ring-urbn"
          >
            {ex}
          </button>
        ))}
      </div>

      <div className="rounded-2xl bg-white ring-1 ring-black/5">
        <button type="button" onClick={() => setTips((t) => !t)} aria-expanded={tips} className="flex w-full items-center justify-between px-4 py-3 text-[13px] font-bold">
          Getting the best results
          <ChevronDown className={clsx("size-4 transition-transform", tips && "rotate-180")} />
        </button>
        <AnimatePresence initial={false}>
          {tips && (
            <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
              <div className="space-y-3 px-4 pb-4 text-xs leading-relaxed text-neutral-500">
                <p>Start with an area, budget and property type. Add bedrooms and the features that matter to you, such as parking or furnishing.</p>
                <p className="font-semibold text-ink">Include:</p>
                <ul className="space-y-1">
                  {TIPS.map((t) => (
                    <li key={t} className="flex gap-1.5"><span className="text-urbn">•</span>{t}</li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
