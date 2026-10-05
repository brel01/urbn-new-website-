import { motion } from "motion/react";
import { Link } from "react-router";
import { ACTIVITY_META, placeTitle, SHORTCUT_TYPES } from "~/lib/nearby/categories";
import type { NearbyResult } from "~/lib/nearby/types";
import { EASE, Reveal, Rings } from "./motion";
import { PlaceIcon, SampleBadge } from "./nearby";
import { NearbyScreen, Phone } from "./phone";
import { ButtonLink } from "./ui";

/**
 * Homepage introduction to Nearby, in the same visual language as the identity
 * section above it: copy on one side, the app's Nearby screen framed by Urbn's
 * rings on the other, with two of the nearest places floating beside it.
 */
export function NearbySection({ preview }: { preview: NearbyResult }) {
  const [a, b] = preview.places;
  const sample = preview.source === "sample";
  const Float = ({ place, className, delay }: { place: NonNullable<typeof a>; className: string; delay: number }) => (
    <motion.div
      className={`absolute z-10 flex items-center gap-3 rounded-2xl bg-white p-3 pr-5 shadow-xl ring-1 ring-black/5 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.8, ease: EASE }}
    >
      <PlaceIcon type={place.activityType} size="sm" className="size-10 rounded-xl" />
      <span className="text-sm">
        <b className="block font-semibold">{placeTitle(place)}</b>
        <span className="text-xs text-neutral-500">
          {[place.businessCategory || ACTIVITY_META[place.activityType].label, place.property.city].filter(Boolean).join(" · ")}
        </span>
      </span>
    </motion.div>
  );

  return (
    <section className="overflow-hidden bg-white" aria-labelledby="nearby-heading">
      <div className="container-x grid items-center gap-10 py-14 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:py-28">
        <div className="relative mx-auto w-full max-w-md">
          <Rings className="top-1/2 left-1/2 aspect-square w-[130%] -translate-x-1/2 -translate-y-1/2" count={4} />
          <motion.div
            className="relative mx-auto w-[62%] max-w-[16rem]"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: EASE }}
          >
            <Phone>
              <NearbyScreen />
            </Phone>
          </motion.div>
          {a && <Float place={a} className="top-[18%] -left-2 sm:-left-10" delay={0.5} />}
          {b && <Float place={b} className="right-0 bottom-[16%] sm:-right-8" delay={0.7} />}
        </div>

        <Reveal>
          <p className="eyebrow">
            <span className="size-2 rounded-full bg-urbn" /> Nearby
          </p>
          <h2 id="nearby-heading" className="mt-4 text-[2.6rem] leading-[1.02] sm:text-6xl">
            Discover What Is <span className="text-urbn">Around You</span>
          </h2>
          <p className="lede mt-6 max-w-lg">
            Find the businesses, schools, clinics, restaurants and other places recorded at properties near you. Search,
            filter by type and get directions in a tap.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {SHORTCUT_TYPES.map((t) => {
              const m = ACTIVITY_META[t];
              return (
                <Link
                  key={t}
                  to={`/nearby?type=${t}#search`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-semibold transition-colors hover:border-ink"
                >
                  <m.icon className="size-3.5" /> {m.plural}
                </Link>
              );
            })}
          </div>
          <div className="mt-8 grid gap-2 sm:flex sm:flex-wrap sm:gap-3">
            <ButtonLink to="/nearby" variant="blue" className="w-full sm:w-auto">
              Explore Nearby
            </ButtonLink>
            <ButtonLink to="/features#nearby" variant="outline" className="w-full sm:w-auto">
              How It Works
            </ButtonLink>
          </div>
          {sample && (
            <p className="mt-5 flex items-center gap-2 text-xs text-neutral-500">
              <SampleBadge /> Sample places shown until live data is connected.
            </p>
          )}
        </Reveal>
      </div>
    </section>
  );
}
