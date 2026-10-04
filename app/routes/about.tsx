import { Eye, HeartHandshake, Scale, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import { CtaBanner } from "~/components/cta-banner";
import { CountUp, EASE, Reveal, Rings, Stagger, StaggerItem, WordsReveal } from "~/components/motion";
import { Rail } from "~/components/mobile";
import { ButtonLink, SectionHeading } from "~/components/ui";
import { breadcrumbs, seo } from "~/lib/seo";
import type { Route } from "./+types/about";

export const meta: Route.MetaFunction = () =>
  seo({
    title: "About Urbn: Building Nigeria's Property Identity Layer",
    description:
      "Urbn is building Nigeria's first Digital Property Identity system so anyone can confirm who really owns a property, without depending on anyone's word.",
    path: "/about",
    jsonLd: breadcrumbs([
      { name: "Home", path: "/" },
      { name: "About", path: "/about" },
    ]),
  });

const VALUES = [
  { icon: ShieldCheck, title: "Verify, don't vouch", text: "We never ask you to take anyone's word for it, including ours. Every claim on Urbn can be checked." },
  { icon: Scale, title: "The record is neutral", text: "A DPI belongs to the property, not to whoever holds it today. It treats owners, agents and renters the same." },
  { icon: Eye, title: "Nothing hidden, nothing erased", text: "History is added, never overwritten. Transparency is how trust survives a change of hands." },
  { icon: HeartHandshake, title: "Earn every city", text: "We expand carefully, city by city, because one unverified home undermines all the verified ones." },
];

const ROADMAP = [
  { city: "Ibadan", status: "Live", note: "Our first city, with full verification running today." },
  { city: "Lagos", status: "Next", note: "Lekki, Yaba, Ikeja and beyond." },
  { city: "Abuja", status: "Planned", note: "Coming after Lagos." },
  { city: "Port Harcourt", status: "Planned", note: "Coming after Lagos." },
];

export default function About() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="container-x grid gap-12 pt-16 pb-20 lg:grid-cols-2 lg:items-center lg:pt-24">
          <div>
            <p className="eyebrow"><span className="size-2 rounded-full bg-urbn" /> About Urbn</p>
            <WordsReveal text="Every property deserves an identity." highlight={["identity."]} className="mt-4 text-5xl leading-[1] sm:text-6xl lg:text-7xl" />
            <motion.p className="lede mt-6 max-w-xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
              People are verified. Bank accounts are verified. Phone numbers are verified. But the most valuable thing most
              Nigerians will ever rent or buy, their home, has never had an identity of its own. Urbn is changing that.
            </motion.p>
          </div>
          <motion.div className="relative" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.2, ease: EASE }}>
            <Rings className="top-1/2 left-1/2 aspect-square w-[110%] -translate-x-1/2 -translate-y-1/2" />
            <img src="/images/house-identity.webp" alt="Verified modern home" className="relative w-full mix-blend-multiply" />
          </motion.div>
        </div>
      </section>

      <section className="bg-ink py-16 text-white sm:py-24 lg:py-32">
        <div className="container-x grid gap-12 lg:grid-cols-2">
          <Reveal>
            <h2 className="text-4xl leading-[1.05] sm:text-5xl">Real estate in Nigeria runs on blind trust.</h2>
          </Reveal>
          <Reveal delay={0.1} className="space-y-5 text-lg leading-relaxed text-neutral-400">
            <p>
              A property's identity depends on whoever's standing in front of you. Records live with individual agents or
              owners, and when they change, the history goes with them. Anyone can claim to represent a property, and
              there's no independent registry to check that claim against.
            </p>
            <p>
              The result: one in three property deals involves a documentation dispute, and countless renters and buyers
              lose money to fake or duplicate listings every year.
            </p>
            <p className="text-white">
              Urbn is building the missing identity layer: a permanent, verified record for every property, which anyone
              can check in seconds.
            </p>
          </Reveal>
        </div>
        <div className="container-x mt-20 grid gap-8 border-t border-white/10 pt-12 sm:grid-cols-3">
          {[
            { v: <CountUp to={10000} suffix="+" />, l: "people on the waitlist" },
            { v: <CountUp to={50} />, l: "properties currently in verification" },
            { v: <><CountUp to={1} /> city</>, l: "live, with three more on the roadmap" },
          ].map((s, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <p className="font-display text-5xl">{s.v}</p>
              <p className="mt-2 text-neutral-400">{s.l}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="container-x py-16 sm:py-24 lg:py-32">
        <Reveal>
          <SectionHeading eyebrow="What we believe" title="Built on four principles." />
        </Reveal>
        <Reveal className="mt-8 md:mt-14">
        <Rail grid="md:grid-cols-2 md:gap-5 lg:grid-cols-4" item="w-[78%] sm:w-[52%]" label="Our principles">
          {VALUES.map((v) => (
            <div key={v.title} className="h-full rounded-card bg-mist p-7">
              <span className="grid size-12 place-items-center rounded-full bg-urbn text-white">
                <v.icon className="size-5" />
              </span>
              <h3 className="mt-6 font-display text-xl">{v.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">{v.text}</p>
            </div>
          ))}
        </Rail>
        </Reveal>
      </section>

      <section className="container-x pb-16 sm:pb-24 lg:pb-32">
        <Reveal>
          <SectionHeading eyebrow="Where we're going" title="Growing fast, city by city." />
        </Reveal>
        <Reveal className="mt-8 md:mt-14">
        <Rail grid="md:grid-cols-4 md:gap-4" item="w-[62%] sm:w-[40%]" label="City roadmap">
          {ROADMAP.map((r, i) => (
            <div key={r.city} className={`relative h-full rounded-card p-6 ${i === 0 ? "bg-urbn text-white" : "border border-neutral-200 bg-white"}`}>
              <span className={`text-xs font-semibold tracking-wider uppercase ${i === 0 ? "text-blue-100" : "text-urbn"}`}>{r.status}</span>
              <h3 className="mt-2 font-display text-3xl">{r.city}</h3>
              <p className={`mt-2 text-sm ${i === 0 ? "text-blue-100" : "text-neutral-500"}`}>{r.note}</p>
            </div>
          ))}
        </Rail>
        </Reveal>
        <div className="mt-12 flex flex-wrap justify-center gap-3">
          <ButtonLink to="/careers" variant="dark">Join the team</ButtonLink>
          <ButtonLink to="/contact" variant="outline">Contact us</ButtonLink>
        </div>
      </section>
      <CtaBanner variant="waitlist" body="Get updates as we launch in new cities, plus early access when we do." />
    </>
  );
}
