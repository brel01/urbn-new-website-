import { Link } from "react-router";
import { FOOTER, SITE } from "~/lib/site";
import { Logo } from "./logo";
import { SocialLinks } from "./social";

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-ink text-neutral-400">
      <div className="container-x grid gap-10 pt-14 pb-10 sm:gap-14 sm:pt-20 sm:pb-12 lg:grid-cols-[1.2fr_2fr]">
        <div>
          <Link to="/" aria-label="Urbn home">
            <Logo className="w-36 text-white" />
          </Link>
          <p className="mt-6 max-w-xs text-[15px] leading-relaxed">
            The digital infrastructure for housing. Get updates as we launch in new cities, plus early
            access when we do.
          </p>
          <SocialLinks className="mt-6 -ml-2.5 text-neutral-400" />
        </div>
        <nav aria-label="Footer">
          {/* desktop/tablet: columns */}
          <div className="hidden grid-cols-3 gap-10 sm:grid">
            {FOOTER.map((col) => (
              <div key={col.title}>
                <h2 className="font-sans text-base font-semibold tracking-normal text-white">{col.title}</h2>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.to}>
                      <Link to={l.to} className="text-[14.5px] transition-colors hover:text-white">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          {/* phones: accordions */}
          <div className="divide-y divide-white/10 border-y border-white/10 sm:hidden">
            {FOOTER.map((col) => (
              <details key={col.title} className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between py-4 font-semibold text-white [&::-webkit-details-marker]:hidden">
                  {col.title}
                  <span className="text-xl leading-none text-white/50 transition-transform group-open:rotate-45">+</span>
                </summary>
                <ul className="grid grid-cols-2 gap-x-4 gap-y-3 pb-5">
                  {col.links.map((l) => (
                    <li key={l.to}>
                      <Link to={l.to} className="text-[14.5px] active:text-white">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </div>
        </nav>
      </div>
      <div className="container-x">
        <div className="flex flex-col gap-4 border-t border-white/15 pt-8 pb-32 text-sm sm:flex-row sm:items-center sm:justify-between lg:pb-8">
          <Logo className="w-16 text-white" />
          <p>
            © {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </p>
        </div>
      </div>
      {/* oversized wordmark watermark */}
      <Logo className="pointer-events-none absolute -bottom-[6vw] left-1/2 w-[110vw] max-w-none -translate-x-1/2 text-white/[0.025]" />
    </footer>
  );
}
