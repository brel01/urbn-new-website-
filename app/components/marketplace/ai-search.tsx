import { clsx } from "clsx";
import { ChevronDown, MessageCircle, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import type { AiQuota } from "~/lib/marketplace/types";

// Same guidance the app shows in its AI search tips panel, localised to Ibadan.
const TIPS = [
  'Location: neighbourhood, city, or area (e.g. "Bodija", "Akobo, Ibadan")',
  'Budget: a range works best (e.g. "between 1 and 2 million naira per year")',
  "Size: number of bedrooms and bathrooms",
  "Property type: flat, duplex, detached house, mini flat, etc.",
  "Purpose: renting, buying, short stay",
  "Must-haves: parking, 24hr security, borehole, furnished",
];
const EXAMPLES = [
  "3 bedroom flat in Bodija, max 2 million per year, needs parking and 24hr security",
  "I want to buy a 4 bedroom duplex in Samonda, budget 150 to 200 million",
  "Furnished short-let apartment in Bodija for a week, max 60,000 per night",
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
    if (v.length < 5) return setLocalError("Please enter at least 5 characters.");
    setLocalError(null);
    onSearch(v);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <span className="rounded-xl border border-urbn bg-white py-2.5 text-center text-xs font-semibold text-urbn">Quick Search</span>
        <Link to="/download" className="flex items-center justify-center gap-1.5 rounded-xl bg-fog py-2.5 text-xs font-semibold text-neutral-500 transition hover:text-ink">
          <MessageCircle className="size-3.5" /> AI Advisor <span className="font-normal">· in the app</span>
        </Link>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="rounded-2xl bg-white p-2 ring-1 ring-black/5 focus-within:ring-2 focus-within:ring-urbn"
      >
        <label htmlFor="ai-q" className="sr-only">Describe the home you want</label>
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
            placeholder="Location, budget, size, features…"
            className="min-h-[3.25rem] flex-1 resize-none bg-transparent py-2 text-[15px] outline-none placeholder:text-neutral-400 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={busy || exhausted}
            className="mt-1 h-10 shrink-0 rounded-xl bg-ink px-4 text-sm font-semibold text-white transition hover:bg-neutral-800 active:scale-95 disabled:opacity-60"
          >
            {busy ? "Searching…" : "Search"}
          </button>
        </div>
      </form>

      {(localError || error) && (
        <p role="alert" className="rounded-xl bg-error/10 px-3 py-2 text-sm text-error">{localError ?? error}</p>
      )}
      {quota && (
        <p className={clsx("text-xs", exhausted ? "text-error" : quota.remaining <= 3 ? "text-warning" : "text-neutral-500")}>
          {exhausted
            ? `You've used all your AI searches for today. Resets at ${formatReset(quota.resetsAt)}.`
            : `${quota.remaining} of ${quota.limit} AI searches remaining today`}
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
                <p>Write like you are describing your ideal home to a friend. The more detail you give, the better the match.</p>
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
