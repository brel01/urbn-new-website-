import { clsx } from "clsx";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import { EASE, Reveal } from "./motion";
import { SocialLinks } from "./social";
import { ButtonLink } from "./ui";
import { WaitlistForm } from "./waitlist-form";

/** The closing band used across the designs. */
export function CtaBanner({
  variant = "actions",
  title,
  body,
  children,
}: {
  variant?: "actions" | "waitlist";
  title?: ReactNode;
  body?: string;
  children?: ReactNode;
}) {
  const waitlist = variant === "waitlist";
  title ??= waitlist ? (
    <>
      Be Part of Urbn's <span className="text-urbn">Next City</span>
    </>
  ) : (
    <>
      Your Property. <span className="text-urbn">Your Next Step.</span>
    </>
  );
  body ??= waitlist
    ? "Find out when Urbn becomes available in your city."
    : "Find a property, check its record or bring your own property onto Urbn. Start with what you need today.";
  return (
    <section className="container-x pb-20 sm:pb-28">
      <Reveal className="relative overflow-hidden rounded-[1.75rem] bg-ink px-6 pt-12 pb-40 sm:px-12 sm:py-16 lg:px-16">
        {/* drifting brand pattern */}
        <motion.div
          aria-hidden
          className="pattern-u absolute -inset-20 bg-white/[0.05]"
          animate={{ x: [0, -90], y: [0, -90] }}
          transition={{ duration: 30, ease: "linear", repeat: Infinity }}
        />
        <motion.img
          src="/images/skyline-blue.webp"
          alt=""
          aria-hidden
          loading="lazy"
          className="pointer-events-none absolute right-0 bottom-0 w-56 mix-blend-screen sm:w-72 lg:w-80"
          initial={{ y: 60, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: EASE, delay: 0.2 }}
        />
        <div
          className={clsx(
            "relative",
            variant === "waitlist" ? "grid items-center gap-10 lg:grid-cols-2" : "mx-auto max-w-2xl text-center",
          )}
        >
          <div>
            <h2 className="text-4xl leading-[1.05] text-white sm:text-5xl lg:text-6xl">{title}</h2>
            <p className="mt-5 text-base text-neutral-400 sm:text-lg">{body}</p>
            {variant === "waitlist" && (
              <div className="mt-6 flex items-center gap-2 text-sm text-white">
                Follow Urbn <SocialLinks className="text-white" />
              </div>
            )}
          </div>
          {variant === "waitlist" ? (
            <WaitlistForm className="w-full max-w-md lg:justify-self-end" />
          ) : (
            (children ?? (
              <div className="mt-8 grid gap-3 sm:mt-9 sm:flex sm:flex-wrap sm:items-center sm:justify-center">
                <ButtonLink to="/download" variant="light" size="lg" className="w-full sm:h-11 sm:w-auto sm:px-5 sm:text-[15px]">
                  Get the App
                </ButtonLink>
                <ButtonLink to="/verify" variant="ghost-light" size="lg" className="w-full sm:h-11 sm:w-auto sm:px-5 sm:text-[15px]">
                  Verify a Property
                </ButtonLink>
              </div>
            ))
          )}
        </div>
      </Reveal>
    </section>
  );
}
