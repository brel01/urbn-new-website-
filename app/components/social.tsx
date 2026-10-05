import { SITE } from "~/lib/site";

export const ICONS = {
  whatsapp:
    "M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.2.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 12 12 0 0 0 4.6 4c1.7.7 2.4.8 3.2.7.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z",
  x: "M17.7 3h3.1l-6.8 7.7 8 10.3h-6.2l-4.9-6.3L5.3 21H2.2l7.2-8.3L1.7 3H8l4.4 5.8L17.7 3Zm-1.1 16.2h1.7L7.5 4.7H5.6l11 14.5Z",
  instagram:
    "M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 8.2a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4Zm5.2-9.6a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4ZM21.9 8a5.8 5.8 0 0 0-1.6-4.2A5.8 5.8 0 0 0 16 2.1C14.4 2 9.6 2 8 2.1a5.8 5.8 0 0 0-4.2 1.6A5.8 5.8 0 0 0 2.1 8C2 9.6 2 14.4 2.1 16a5.8 5.8 0 0 0 1.6 4.2A5.8 5.8 0 0 0 8 21.9c1.6.1 6.4.1 8 0a5.8 5.8 0 0 0 4.2-1.6 5.8 5.8 0 0 0 1.6-4.2c.2-1.6.2-6.4.1-8Zm-2.1 9.9a3.3 3.3 0 0 1-1.9 1.9c-1.3.5-4.3.4-5.9.4s-4.6.1-5.9-.4a3.3 3.3 0 0 1-1.9-1.9c-.5-1.3-.4-4.3-.4-5.9s-.1-4.6.4-5.9a3.3 3.3 0 0 1 1.9-1.9C7.4 3.7 10.4 3.8 12 3.8s4.6-.1 5.9.4a3.3 3.3 0 0 1 1.9 1.9c.5 1.3.4 4.3.4 5.9s.1 4.6-.4 5.9Z",
  facebook:
    "M14 13.5h2.5l1-4H14v-2c0-1 0-2 2-2h1.5V2.1A28 28 0 0 0 14.6 2C12 2 10 3.7 10 6.7v2.8H7v4h3V22h4v-8.5Z",
  linkedin:
    "M6.9 21H2.6V8.9h4.3V21ZM4.7 7.1a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5ZM21.4 21h-4.3v-5.9c0-1.4 0-3.2-2-3.2s-2.3 1.5-2.3 3.1v6h-4.3V8.9h4.1v1.7h.1a4.5 4.5 0 0 1 4-2.2c4.3 0 5.1 2.8 5.1 6.5V21Z",
} as const;

const LABELS: Record<keyof typeof ICONS, string> = {
  whatsapp: "WhatsApp",
  x: "X (Twitter)",
  instagram: "Instagram",
  facebook: "Facebook",
  linkedin: "LinkedIn",
};

/** A brand mark from the paths above, sized like a lucide icon. */
export function BrandIcon({ name, className }: { name: keyof typeof ICONS; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d={ICONS[name]} />
    </svg>
  );
}

export function SocialLinks({ className = "" }: { className?: string }) {
  return (
    <ul className={`flex items-center gap-1 ${className}`}>
      {(Object.keys(ICONS) as (keyof typeof ICONS)[]).map((k) => (
        <li key={k}>
          <a
            href={SITE.socials[k]}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Urbn on ${LABELS[k]}`}
            className="grid size-10 place-items-center rounded-full transition hover:bg-white/10 hover:text-white"
          >
            <svg viewBox="0 0 24 24" className="size-[18px]" fill="currentColor" aria-hidden>
              <path d={ICONS[k]} />
            </svg>
          </a>
        </li>
      ))}
    </ul>
  );
}
