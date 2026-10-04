import { motion } from "motion/react";
import { DpiSearch } from "./dpi-search";
import { EASE, Reveal, WordsReveal } from "./motion";
import { ButtonLink } from "./ui";

export function VerifyHero({ defaultValue = "", compact = false }: { defaultValue?: string; compact?: boolean }) {
  return (
    <section className="relative isolate overflow-hidden bg-[#7fb6e6]">
      <motion.img
        src="/images/hero-verify.webp"
        srcSet="/images/hero-verify-768.webp 768w, /images/hero-verify.webp 1440w"
        sizes="100vw"
        alt=""
        aria-hidden
        fetchPriority="high"
        className="absolute inset-0 -z-10 size-full object-cover object-[60%_center]"
        initial={{ scale: 1.08 }}
        animate={{ scale: 1 }}
        transition={{ duration: 2, ease: EASE }}
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white/50 via-white/15 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-2/5 bg-gradient-to-t from-white via-white/60 to-transparent" />
      <div className={`container-x flex flex-col items-center text-center ${compact ? "py-14 sm:py-20" : "pt-16 pb-28 sm:pt-24 sm:pb-36"}`}>
        {compact ? (
          <h1 className="text-4xl sm:text-5xl">Check any property's identity</h1>
        ) : (
          <WordsReveal text="Check any property's identity" className="max-w-3xl text-[2.7rem] leading-[1] sm:text-6xl lg:text-7xl" />
        )}
        <motion.p
          className="mt-5 max-w-xl text-base font-medium text-neutral-800 sm:text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Enter a DPI code or scan the plaque's QR code to see the verified record. Instant, and no account needed.
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
    </section>
  );
}

export function CheckBeforeCommit() {
  return (
    <section className="container-x pb-8">
      <Reveal className="grid gap-6 lg:grid-cols-2 lg:gap-16">
        <h2 className="text-5xl leading-[0.98] sm:text-6xl lg:text-7xl">
          Check before you commit
        </h2>
        <p className="lede self-end">
          Most property disputes happen because no one checked anything before money changed hands. A verified DPI takes
          seconds to check and can save you from a deal that was never legitimate in the first place. Before you pay a
          deposit, sign an agreement, or hand over rent, verify. It costs you nothing, and it's the one step that
          protects you if anything goes wrong later.
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
          <h3 className="font-display text-2xl">Get your own DPI</h3>
          <p className="mt-2 text-sm text-neutral-600">
            Own a property that isn't verified yet? Now's a good time to get it. It protects your ownership, and it's the
            fastest way to prove a listing is genuinely yours.
          </p>
          <ButtonLink to="/dpi" variant="dark" className="mt-5" arrow={false}>
            Get Started
          </ButtonLink>
        </motion.div>
      </Reveal>
    </section>
  );
}
