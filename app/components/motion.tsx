import { clsx } from "clsx";
import { animate, motion, useInView, useReducedMotion, type Variants } from "motion/react";
import { type ReactNode, useEffect, useRef, useState } from "react";

export const EASE = [0.16, 1, 0.3, 1] as const;

// Blur is GPU-heavy on phones, so it only runs on wider screens.
const canBlur = typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches;
const revealVariants: Variants = canBlur
  ? {
      hidden: { opacity: 0, y: 28, filter: "blur(6px)" },
      show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.8, ease: EASE } },
    }
  : {
      hidden: { opacity: 0, y: 22 },
      show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
    };

/** Fades and lifts content into view once, as the reader scrolls. */
export function Reveal({
  children,
  className,
  delay = 0,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "li" | "section" | "article";
}) {
  const M = motion[as];
  return (
    <M
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      variants={revealVariants}
      transition={{ delay }}
    >
      {children}
    </M>
  );
}

/** Parent that staggers its <StaggerItem> children into view. */
export function Stagger({
  children,
  className,
  stagger = 0.09,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  as?: "div" | "ul" | "ol";
}) {
  const M = motion[as];
  return (
    <M
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger } } }}
    >
      {children}
    </M>
  );
}

export function StaggerItem({
  children,
  className,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "li" | "article";
}) {
  const M = motion[as];
  return (
    <M className={className} variants={revealVariants}>
      {children}
    </M>
  );
}

/** Headline that rises in word by word. Keeps the full text for crawlers. */
export function WordsReveal({
  text,
  className,
  highlight,
  delay = 0,
  as = "h1",
}: {
  text: string;
  className?: string;
  /** words (exact match) rendered in URBN Blue */
  highlight?: string[];
  delay?: number;
  as?: "h1" | "h2";
}) {
  const M = motion[as];
  const words = text.split(" ");
  return (
    <M
      className={className}
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: delay } } }}
      aria-label={text}
    >
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.12em] align-bottom" aria-hidden>
          <motion.span
            className={clsx("inline-block", highlight?.includes(w) && "text-urbn")}
            variants={{
              hidden: { y: "110%", rotate: 4 },
              show: { y: "0%", rotate: 0, transition: { duration: 0.9, ease: EASE } },
            }}
          >
            {w}
          </motion.span>
          {i < words.length - 1 && " "}
        </span>
      ))}
    </M>
  );
}

/** Counts up to `to` when scrolled into view. */
export function CountUp({
  to,
  suffix = "",
  prefix = "",
  duration = 1.8,
  className,
}: {
  to: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const reduce = useReducedMotion();
  const [value, setValue] = useState(to);
  const started = useRef(false);

  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;
    if (reduce) return setValue(to);
    setValue(0);
    const controls = animate(0, to, { duration, ease: EASE, onUpdate: (v) => setValue(Math.round(v)) });
    return () => controls.stop();
  }, [inView, to, duration, reduce]);

  return (
    <span ref={ref} className={clsx("tabular-nums", className)}>
      {prefix}
      {value.toLocaleString("en-NG")}
      {suffix}
    </span>
  );
}

/** Concentric "signal" rings, the radial motif behind houses in the designs. */
export function Rings({ className, count = 4 }: { className?: string; count?: number }) {
  return (
    <div className={clsx("pointer-events-none absolute", className)} aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute inset-0 rounded-[50%] border border-blue-300/50"
          style={{ scale: 1 - i * 0.2 }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: [0, 1, 0.6] }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, delay: 0.25 * (count - i), ease: EASE }}
        />
      ))}
    </div>
  );
}
