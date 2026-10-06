import { motion } from "motion/react";
import { SceneFrame, SkyClouds } from "./city-scene";
import { DpiSearch } from "./dpi-search";
import { EASE, Reveal, WordsReveal } from "./motion";
import { ButtonLink } from "./ui";

export function VerifyHero({ defaultValue = "", compact = false }: { defaultValue?: string; compact?: boolean }) {
  return (
    <section className="relative isolate overflow-hidden bg-white">
      <SkyClouds className="absolute inset-x-0 top-0 -z-10 h-full w-full" />
      <div className={`container-x flex flex-col items-center text-center ${compact ? "py-14 sm:py-20" : "pt-12 pb-4 sm:pt-20"}`}>
        {compact ? (
          <h1 className="text-4xl sm:text-5xl">Check a Property Record</h1>
        ) : (
          <WordsReveal text="Check a Property Record" className="max-w-3xl text-[2.7rem] leading-[1] sm:text-6xl lg:text-7xl" />
        )}
        <motion.p
          className="mt-5 max-w-xl text-base font-medium text-neutral-800 sm:text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Enter its DPI code or scan an Urbn plaque to view the available record and verification status.
        </motion.p>
        <motion.div
          className="mt-8 w-full max-w-xl rounded-2xl bg-white p-5 text-left shadow-[0_30px_70px_-25px_rgba(0,0,0,0.45)]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8, ease: EASE }}
        >
          <DpiSearch variant="card" defaultValue={defaultValue} />
        </motion.div>
      </div>
      {/* The homepage street, closed in on the scan and the Verified result. */}
      {!compact && (
        <motion.div
          className="mx-auto max-w-5xl"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 1, ease: EASE }}
        >
          <SceneFrame focus="verify" />
        </motion.div>
      )}
    </section>
  );
}

export function CheckBeforeCommit() {
  return (
    <section className="container-x pb-8">
      <Reveal className="grid gap-6 lg:grid-cols-2 lg:gap-16">
        <h2 className="text-5xl leading-[0.98] sm:text-6xl lg:text-7xl">
          Check Before You Commit
        </h2>
        <p className="lede self-end">
          Before paying or signing, check the property's current Urbn record, review the available details and ask about
          anything that does not match.
        </p>
      </Reveal>
      <Reveal className="relative mt-12 overflow-hidden rounded-card">
        <img
          src="/images/house-modern.webp"
          srcSet="/images/house-modern-640.webp 640w, /images/house-modern.webp 816w"
          sizes="100vw"
          alt="Contemporary house with timber and dark metal cladding"
          loading="lazy"
          className="h-[28rem] w-full object-cover sm:h-[32rem]"
        />
        <motion.div
          className="absolute right-4 bottom-4 left-4 max-w-md rounded-2xl bg-white p-6 sm:right-8 sm:bottom-8 sm:left-auto sm:p-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.8, ease: EASE }}
        >
          <h3 className="font-display text-2xl">Add Your Property to Urbn</h3>
          <p className="mt-2 text-sm text-neutral-600">
            Create a connected property record and complete the required verification checks.
          </p>
          <ButtonLink to="/dpi" variant="dark" className="mt-5" arrow={false}>
            Add Your Property
          </ButtonLink>
        </motion.div>
      </Reveal>
    </section>
  );
}
