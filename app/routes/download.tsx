import { Check } from "lucide-react";
import { motion } from "motion/react";
import { SceneFrame, SkyClouds } from "~/components/city-scene";
import { EASE, Reveal, WordsReveal } from "~/components/motion";
import { AppHomeScreen, Phone, UBeepScreen } from "~/components/phone";
import { WaitlistForm } from "~/components/waitlist-form";
import { breadcrumbs, seo } from "~/lib/seo";
import { SITE } from "~/lib/site";
import type { Route } from "./+types/download";

export const meta: Route.MetaFunction = () =>
  seo({
    title: "Get the Urbn App | iOS & Android",
    description:
      "Explore property records, browse listings, discover what's nearby, request inspections and manage property activities with Urbn.",
    path: "/download",
    jsonLd: breadcrumbs([
      { name: "Home", path: "/" },
      { name: "Download", path: "/download" },
    ]),
  });

function StoreBadge({ store }: { store: "ios" | "android" }) {
  return (
    <a
      href={SITE.apps[store]}
      className="inline-flex h-14 items-center gap-3 rounded-xl bg-ink px-5 text-white transition hover:bg-neutral-800 active:scale-[0.97]"
    >
      {store === "ios" ? (
        <svg viewBox="0 0 24 24" className="size-7" fill="currentColor" aria-hidden>
          <path d="M16.4 12.6c0-2.6 2.1-3.8 2.2-3.9-1.2-1.8-3.1-2-3.7-2-1.6-.2-3.1.9-3.9.9-.8 0-2-.9-3.4-.9-1.7 0-3.3 1-4.2 2.6-1.8 3.1-.5 7.7 1.3 10.2.8 1.2 1.8 2.6 3.1 2.6 1.3-.1 1.7-.8 3.3-.8 1.5 0 1.9.8 3.3.8 1.4 0 2.2-1.3 3-2.5 1-1.4 1.4-2.8 1.4-2.9 0 0-2.4-1-2.4-4.1ZM13.9 4.9c.7-.9 1.2-2 1-3.2-1 .1-2.3.7-3 1.6-.7.8-1.2 2-1.1 3.1 1.2.1 2.3-.6 3.1-1.5Z" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="size-6" aria-hidden>
          <path fill="#34A853" d="M3.6 2.3 13.7 12 3.6 21.7c-.4-.2-.6-.6-.6-1.1V3.4c0-.5.2-.9.6-1.1Z" />
          <path fill="#FBBC04" d="m17 8.6-3.3 3.4 3.3 3.4 3.8-2.1c.8-.5.8-1.6 0-2.1L17 8.6Z" />
          <path fill="#4285F4" d="M3.6 2.3c.3-.2.8-.2 1.2 0L17 8.6 13.7 12 3.6 2.3Z" />
          <path fill="#EA4335" d="M13.7 12 17 15.4 4.8 21.7c-.4.2-.9.2-1.2 0L13.7 12Z" />
        </svg>
      )}
      <span className="text-left leading-tight">
        <span className="block text-[11px] text-neutral-400">{store === "ios" ? "Download on the" : "Get it on"}</span>
        <span className="block text-lg font-semibold">{store === "ios" ? "App Store" : "Google Play"}</span>
      </span>
    </a>
  );
}

export default function Download() {
  return (
    <section className="relative isolate overflow-hidden bg-white">
      <SkyClouds className="absolute inset-x-0 top-0 -z-10 h-full w-full" />
      <div className="absolute top-1/4 right-0 -z-10 size-[36rem] rounded-full bg-blue-100/70 blur-[120px]" aria-hidden />
      <div className="container-x relative grid items-center gap-16 pt-12 pb-10 sm:pt-20 lg:grid-cols-2">
        <div>
          <WordsReveal text="Properties, Places and People. One App." highlight={["One", "App."]} className="text-5xl leading-[1] sm:text-7xl" />
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8, ease: EASE }}>
            <p className="lede mt-6 max-w-lg">
              Find a property, check its record, discover what's around you or manage what you own with Urbn.
            </p>
            <ul className="mt-8 space-y-3">
              {["Check a property's Urbn record", "Discover places and activities nearby", "Watch available video walkthroughs", "Request physical or virtual inspections", "Message owners or managers", "Send property alerts with U-Beep"].map((t) => (
                <li key={t} className="flex items-center gap-3">
                  <span className="grid size-6 place-items-center rounded-full bg-urbn text-white"><Check className="size-3.5" /></span>
                  {t}
                </li>
              ))}
            </ul>
            <div className="mt-10 flex flex-wrap gap-3">
              <StoreBadge store="ios" />
              <StoreBadge store="android" />
            </div>
            <div id="launch-updates" className="scroll-mt-24">
              <Reveal className="mt-12 max-w-md">
                <p className="font-display text-xl">Waiting for Urbn in Your City?</p>
                <p className="mt-1 mb-3 text-sm text-neutral-600">Get an email when local coverage becomes available.</p>
                <WaitlistForm dark={false} className="[&_form]:ring-1 [&_form]:ring-black/10" />
              </Reveal>
            </div>
          </motion.div>
        </div>
        <div className="relative mx-auto flex w-full max-w-md justify-center gap-5">
          <motion.div className="w-1/2 animate-float" initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: EASE, delay: 0.2 }}>
            <Phone><AppHomeScreen /></Phone>
          </motion.div>
          <motion.div className="mt-16 w-1/2 animate-float [animation-delay:1.5s]" initial={{ opacity: 0, y: 80 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: EASE, delay: 0.35 }}>
            <Phone><UBeepScreen /></Phone>
          </motion.div>
        </div>
      </div>
      {/* The city the app works in: scan, Verified, delivery and Nearby, all on one street. */}
      <SceneFrame focus="overview" className="mx-auto max-w-5xl" />
    </section>
  );
}
