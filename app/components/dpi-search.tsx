import { clsx } from "clsx";
import { ScanLine, ShieldCheck } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useId, useState } from "react";
import { Form, useNavigate, useNavigation } from "react-router";
import { DPI_ERROR_COPY, isValidDpiFormat, makeDpi, parseDpiIdentifier, verifyPath } from "~/lib/dpi";
import { Arrow } from "./ui";

const EXAMPLES = [makeDpi("IBADAN-NORTH", 41), makeDpi("LAGELU", 12), makeDpi("AKINYELE", 22)];

/** Cycles typed-out example codes in the placeholder. */
function useTypewriter(words: string[], active: boolean) {
  const [text, setText] = useState("");
  useEffect(() => {
    if (!active) return;
    let w = 0;
    let i = 0;
    let deleting = false;
    let t: ReturnType<typeof setTimeout>;
    const tick = () => {
      const word = words[w];
      i += deleting ? -1 : 1;
      setText(word.slice(0, i));
      let delay = deleting ? 28 : 70;
      if (!deleting && i === word.length) {
        deleting = true;
        delay = 1800;
      } else if (deleting && i === 0) {
        deleting = false;
        w = (w + 1) % words.length;
        delay = 400;
      }
      t = setTimeout(tick, delay);
    };
    t = setTimeout(tick, 900);
    return () => clearTimeout(t);
  }, [words, active]);
  return text;
}

export function DpiSearch({
  defaultValue = "",
  variant = "pill",
  autoFocus,
  className,
}: {
  defaultValue?: string;
  variant?: "pill" | "card";
  autoFocus?: boolean;
  className?: string;
}) {
  const id = useId();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const [value, setValue] = useState(defaultValue);
  const [error, setError] = useState<string | null>(null);
  const typed = useTypewriter(EXAMPLES, value === "");
  const busy = navigation.state !== "idle" && navigation.location?.pathname.startsWith("/verify/");

  return (
    <Form
      method="get"
      action="/verify"
      onSubmit={(e) => {
        e.preventDefault();
        if (!value.trim()) return setError("Enter a DPI code to check.");
        const parsed = parseDpiIdentifier(value);
        if (!parsed || !isValidDpiFormat(parsed.dpiCode)) return setError(DPI_ERROR_COPY.INVALID_DPI_FORMAT.body);
        setError(null);
        navigate(verifyPath(parsed.dpiCode, parsed.unitCode));
      }}
      className={className}
      role="search"
      aria-label="Check a property's DPI"
    >
      {variant === "card" && (
        <label htmlFor={id} className="mb-3 block text-left font-display text-xl text-ink">
          Check a Property's DPI
        </label>
      )}
      <div
        className={clsx(
          "flex items-center gap-2 bg-white p-1.5 transition-shadow",
          variant === "pill"
            ? "rounded-2xl shadow-[0_20px_60px_-20px_rgba(0,0,0,0.45)] ring-1 ring-black/5 focus-within:ring-2 focus-within:ring-urbn"
            : "rounded-xl ring-1 ring-neutral-200 focus-within:ring-2 focus-within:ring-urbn",
        )}
      >
        <span className="grid size-10 shrink-0 place-items-center text-ink">
          {variant === "pill" ? <ShieldCheck className="size-6" aria-hidden /> : <ScanLine className="size-5" aria-hidden />}
        </span>
        {variant === "pill" && (
          <label htmlFor={id} className="sr-only">
            Check a Property's DPI
          </label>
        )}
        <div className="relative min-w-0 flex-1">
          <input
            id={id}
            name="code"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              if (error) setError(null);
            }}
            autoFocus={autoFocus}
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-err` : undefined}
            className="h-11 w-full bg-transparent text-[15px] text-ink uppercase outline-none placeholder:normal-case"
          />
          {value === "" && (
            <span className="pointer-events-none absolute inset-0 flex items-center overflow-hidden text-[15px] whitespace-nowrap text-neutral-400">
              <span className="hidden sm:inline">Enter a DPI code, e.g.&nbsp;</span>
              <span className="sm:hidden">e.g.&nbsp;</span>
              {typed}
              <span className="ml-px h-5 w-px animate-pulse bg-neutral-400" />
            </span>
          )}
        </div>
        <button
          type="submit"
          className="group inline-flex h-11 shrink-0 items-center gap-1.5 rounded-xl bg-ink px-4 text-[15px] font-medium text-white transition hover:bg-neutral-800 active:scale-[0.97] sm:px-5"
        >
          {busy ? "Checking…" : "Check Record"}
          <Arrow />
        </button>
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            id={`${id}-err`}
            role="alert"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 rounded-lg bg-error/10 px-3 py-2 text-left text-sm text-error"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </Form>
  );
}
