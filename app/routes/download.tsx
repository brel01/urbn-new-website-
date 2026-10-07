import { Check } from "lucide-react";
import { motion } from "motion/react";
import { SceneFrame, SkyClouds } from "~/components/city-scene";
import { EASE, Reveal, WordsReveal } from "~/components/motion";
import { AppHomeScreen, Phone, UBeepScreen } from "~/components/phone";
import { WaitlistForm } from "~/components/waitlist-form";
import { breadcrumbs, seo } from "~/lib/seo";
import type { Route } from "./+types/download";
import { StoreBadge } from "~/components/store-badges";

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
