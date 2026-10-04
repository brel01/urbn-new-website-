import { Link } from "react-router";
import { FOOTER, SITE } from "~/lib/site";
import { Logo } from "./logo";
import { SocialLinks } from "./social";

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-ink text-neutral-400">
      <div className="container-x grid gap-14 pt-20 pb-12 lg:grid-cols-[1.2fr_2fr]">
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
        <nav aria-label="Footer" className="grid grid-cols-2 gap-10 sm:grid-cols-3">
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
        </nav>
      </div>
      <div className="container-x">
        <div className="flex flex-col gap-4 border-t border-white/15 py-8 text-sm sm:flex-row sm:items-center sm:justify-between">
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
