// App Store and Google Play badges (Download page, "Continue in the app" prompts).
import { clsx } from "clsx";
import { SITE } from "~/lib/site";

export function StoreBadge({
  store,
  className,
  tone = "dark",
  size = "md",
}: {
  store: "ios" | "android";
  className?: string;
  /** "light" for dark backgrounds. */
  tone?: "dark" | "light";
  /** "sm" fits two side by side in a phone-width sheet. */
  size?: "sm" | "md";
}) {
  const sm = size === "sm";
  return (
    <a
      href={SITE.apps[store]}
      className={clsx(
        "inline-flex items-center rounded-xl whitespace-nowrap transition active:scale-[0.97]",
        sm ? "h-12 gap-2 px-3" : "h-14 gap-3 px-5",
        tone === "light" ? "bg-white text-ink hover:bg-neutral-200" : "bg-ink text-white hover:bg-neutral-800",
        className,
      )}
    >
      {store === "ios" ? (
        <svg viewBox="0 0 24 24" className={sm ? "size-5" : "size-7"} fill="currentColor" aria-hidden>
          <path d="M16.4 12.6c0-2.6 2.1-3.8 2.2-3.9-1.2-1.8-3.1-2-3.7-2-1.6-.2-3.1.9-3.9.9-.8 0-2-.9-3.4-.9-1.7 0-3.3 1-4.2 2.6-1.8 3.1-.5 7.7 1.3 10.2.8 1.2 1.8 2.6 3.1 2.6 1.3-.1 1.7-.8 3.3-.8 1.5 0 1.9.8 3.3.8 1.4 0 2.2-1.3 3-2.5 1-1.4 1.4-2.8 1.4-2.9 0 0-2.4-1-2.4-4.1ZM13.9 4.9c.7-.9 1.2-2 1-3.2-1 .1-2.3.7-3 1.6-.7.8-1.2 2-1.1 3.1 1.2.1 2.3-.6 3.1-1.5Z" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className={sm ? "size-5" : "size-6"} aria-hidden>
          <path fill="#34A853" d="M3.6 2.3 13.7 12 3.6 21.7c-.4-.2-.6-.6-.6-1.1V3.4c0-.5.2-.9.6-1.1Z" />
          <path fill="#FBBC04" d="m17 8.6-3.3 3.4 3.3 3.4 3.8-2.1c.8-.5.8-1.6 0-2.1L17 8.6Z" />
          <path fill="#4285F4" d="M3.6 2.3c.3-.2.8-.2 1.2 0L17 8.6 13.7 12 3.6 2.3Z" />
          <path fill="#EA4335" d="M13.7 12 17 15.4 4.8 21.7c-.4.2-.9.2-1.2 0L13.7 12Z" />
        </svg>
      )}
      <span className="text-left leading-tight">
        <span className={clsx("block text-neutral-400", sm ? "text-[9.5px]" : "text-[11px]", tone === "light" && "text-neutral-500")}>{store === "ios" ? "Download on the" : "Get it on"}</span>
        <span className={clsx("block font-semibold", sm ? "text-[15px]" : "text-lg")}>{store === "ios" ? "App Store" : "Google Play"}</span>
      </span>
    </a>
  );
}
