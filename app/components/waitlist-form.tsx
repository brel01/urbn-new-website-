import { clsx } from "clsx";
import { Check, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useId } from "react";
import { Link, useFetcher } from "react-router";

type Result = { ok: true } | { ok: false; error: string };

/** Email capture posting to the /api/waitlist resource route. */
export function WaitlistForm({ className, dark = true }: { className?: string; dark?: boolean }) {
  const fetcher = useFetcher<Result>();
  const id = useId();
  const busy = fetcher.state !== "idle";
  const done = fetcher.data?.ok === true;
  const error = fetcher.data && !fetcher.data.ok ? fetcher.data.error : null;

  return (
    <div className={className}>
      <AnimatePresence mode="wait" initial={false}>
        {done ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-3 rounded-xl bg-success/15 px-4 py-4 text-success"
            role="status"
          >
            <span className="grid size-8 place-items-center rounded-full bg-success text-white">
              <Check className="size-4" />
            </span>
            <span className={dark ? "text-white" : "text-ink"}>You're on the list. We'll email you with city launch updates.</span>
          </motion.div>
        ) : (
          <motion.div key="form" exit={{ opacity: 0, y: -8 }}>
            <fetcher.Form method="post" action="/api/waitlist" className="flex gap-2 rounded-xl bg-white p-1.5">
              <label htmlFor={id} className="sr-only">
                Email address
              </label>
              <input
                id={id}
                type="email"
                name="email"
                required
                placeholder="Enter your email"
                autoComplete="email"
                className="h-12 min-w-0 flex-1 bg-transparent px-3 text-[15px] text-ink outline-none placeholder:text-neutral-400"
              />
              <button
                type="submit"
                disabled={busy}
                aria-label="Get Launch Updates"
                className="grid size-12 shrink-0 place-items-center rounded-lg bg-urbn text-white transition hover:bg-blue-600 active:scale-95 disabled:opacity-60"
              >
                <ChevronRight className={clsx("size-5", busy && "animate-pulse")} />
              </button>
            </fetcher.Form>
            {error && (
              <p role="alert" className="mt-2 text-sm text-error">
                {error}
              </p>
            )}
            <p className={clsx("mt-3 text-xs", dark ? "text-neutral-500" : "text-neutral-500")}>
              By subscribing you agree to our{" "}
              <Link to="/privacy" className="underline underline-offset-2 hover:text-urbn">
                Privacy Policy
              </Link>
              .
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
