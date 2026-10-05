import { Eye, HeartHandshake, Scale, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import { CtaBanner } from "~/components/cta-banner";
import { EASE, Reveal, Rings, Stagger, StaggerItem, WordsReveal } from "~/components/motion";
import { Rail } from "~/components/mobile";
import { ButtonLink, SectionHeading } from "~/components/ui";
import { breadcrumbs, seo } from "~/lib/seo";
import type { Route } from "./+types/about";

export const meta: Route.MetaFunction = () =>
  seo({
    title: "About Urbn | The Digital Infrastructure for Housing",
    description: "Urbn connects property identities, people and the activities in every space, from homes and shops to schools and clinics, starting with Ibadan.",
    path: "/about",
    jsonLd: breadcrumbs([
      { name: "Home", path: "/" },
      { name: "About", path: "/about" },
    ]),
  });

const VALUES = [
  { icon: ShieldCheck, title: "Check the Details", text: "Make verification status clear." },
  { icon: Scale, title: "Keep Records Connected", text: "Build around the property." },
  { icon: Eye, title: "Respect People's Information", text: "Be clear about visibility and access." },
  { icon: HeartHandshake, title: "Build With Local Knowledge", text: "Establish coverage before expanding." },
];

const ROADMAP = [
  { city: "Ibadan", status: "First City", note: "Ibadan is our first city." },
  { city: "New Cities", status: "Coming Later", note: "We'll announce additional locations as coverage becomes available." },
];

export default function About() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="container-x grid gap-12 pt-16 pb-20 lg:grid-cols-2 lg:items-center lg:pt-24">
          <div>
            <p className="eyebrow"><span className="size-2 rounded-full bg-urbn" /> About Urbn</p>
            <WordsReveal text="Every Property Deserves a Connected Record." highlight={["Connected", "Record."]} className="mt-4 text-5xl leading-[1] sm:text-6xl" />
            <motion.p className="lede mt-6 max-w-xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
              A property is more than a location. It has spaces, people, agreements and a history. Urbn is building the
              digital infrastructure that connects them.
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
            <h2 className="text-4xl leading-[1.05] sm:text-5xl">Property Information Is Scattered.</h2>
          </Reveal>
          <Reveal delay={0.1} className="space-y-5 text-lg leading-relaxed text-neutral-400">
            <p>An agreement in a folder. A payment receipt in a chat. An update known only to the manager.</p>
            <p className="text-white">
              Urbn connects them around the property, whether it's a home, a shop, an office or a school, with Digital
              Property Identity as the foundation.
            </p>
          </Reveal>
        </div>
        <div className="container-x mt-20 grid gap-8 border-t border-white/10 pt-12 sm:grid-cols-3">
          {[
            { v: "Ibadan", l: "Our Starting Point" },
            { v: "Digital Property Identity", l: "Our Foundation" },
            { v: "Connecting Properties, People and Activities", l: "Our Focus" },
          ].map((s, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <p className="font-display text-3xl leading-tight">{s.v}</p>
              <p className="mt-2 text-neutral-400">{s.l}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="container-x py-16 sm:py-24 lg:py-32">
        <Reveal>
          <SectionHeading eyebrow="Principles" title="What We Believe" />
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
          <SectionHeading eyebrow="Coverage" title="Where We're Starting" lede="Ibadan is our first city. We'll announce additional locations as coverage becomes available." />
        </Reveal>
        <Reveal className="mt-8 md:mt-14">
        <Rail grid="md:grid-cols-2 md:gap-4" item="w-[78%] sm:w-[48%]" label="Coverage">
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
          <ButtonLink to="/careers" variant="dark">Explore Careers</ButtonLink>
          <ButtonLink to="/contact" variant="outline">Contact Us</ButtonLink>
        </div>
      </section>
      <CtaBanner variant="waitlist" />
    </>
  );
}
