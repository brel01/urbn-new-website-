import { clsx } from "clsx";
import { ChevronRight } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { Link } from "react-router";

type Variant = "dark" | "blue" | "light" | "outline" | "ghost-light";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  dark: "bg-ink text-white hover:bg-neutral-800",
  blue: "bg-urbn text-white hover:bg-blue-600 shadow-[0_10px_30px_-12px_rgba(37,61,226,0.8)]",
  light: "bg-white text-ink hover:bg-neutral-100",
  outline: "border border-neutral-300 text-ink hover:border-ink",
  "ghost-light": "border border-white/25 text-white hover:bg-white/10",
};
const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-[15px]",
  lg: "h-13 px-7 text-base",
};

export function buttonClass(variant: Variant = "dark", size: Size = "md", className?: string) {
  return clsx(
    "group inline-flex items-center justify-center gap-2 rounded-[10px] font-medium whitespace-nowrap",
    "transition-[background-color,border-color,transform,box-shadow] duration-200 active:scale-[0.97]",
    variants[variant],
    sizes[size],
    className,
  );
}

type BtnProps = {
  variant?: Variant;
  size?: Size;
  arrow?: boolean;
  children: ReactNode;
  className?: string;
};

export function ButtonLink({
  to,
  variant,
  size,
  arrow = true,
  children,
  className,
  ...rest
}: BtnProps & Omit<ComponentProps<typeof Link>, "className" | "children">) {
  return (
    <Link to={to} className={buttonClass(variant, size, className)} {...rest}>
      {children}
      {arrow && <Arrow />}
    </Link>
  );
}

export function Button({
  variant,
  size,
  arrow = false,
  children,
  className,
  ...rest
}: BtnProps & Omit<ComponentProps<"button">, "className" | "children">) {
  return (
    <button className={buttonClass(variant, size, className)} {...rest}>
      {children}
      {arrow && <Arrow />}
    </button>
  );
}

export const Arrow = () => (
  <ChevronRight aria-hidden className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
);

export function Eyebrow({ children, className, dark }: { children: ReactNode; className?: string; dark?: boolean }) {
  return (
    <p className={clsx("eyebrow", dark && "text-blue-400", className)}>
      <span className="relative flex size-2">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-current opacity-50" />
        <span className="relative inline-flex size-2 rounded-full bg-current" />
      </span>
      {children}
    </p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  lede,
  dark,
  align = "center",
  as: As = "h2",
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  lede?: ReactNode;
  dark?: boolean;
  align?: "center" | "left";
  as?: "h1" | "h2";
  className?: string;
}) {
  return (
    <div className={clsx("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && <Eyebrow dark={dark} className={clsx("mb-4", align === "center" && "justify-center")}>{eyebrow}</Eyebrow>}
      <As className={clsx("text-4xl leading-[1.05] text-balance sm:text-5xl lg:text-[3.5rem]", dark ? "text-white" : "text-ink")}>
        {title}
      </As>
      {lede && <p className={clsx("mt-5 text-pretty", dark ? "text-base text-neutral-400 sm:text-lg" : "lede")}>{lede}</p>}
    </div>
  );
}

export function VerifiedBadge({ className, label = "Verified" }: { className?: string; label?: string }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full bg-success/12 px-2 py-0.5 text-xs font-semibold text-success",
        className,
      )}
    >
      <svg viewBox="0 0 20 20" className="size-3.5" aria-hidden fill="currentColor">
        <path d="M10 1.5 3 4.5v5c0 4.2 2.9 8.1 7 9 4.1-.9 7-4.8 7-9v-5l-7-3Zm-1.2 12.1-3.1-3.1 1.2-1.2 1.9 1.9 4.6-4.6 1.2 1.2-5.8 5.8Z" />
      </svg>
      {label}
    </span>
  );
}
