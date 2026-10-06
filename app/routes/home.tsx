import { clsx } from "clsx";
import { Briefcase, FileUp, House, Search, ShieldCheck, Stamp, Users, MapPin } from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { CityScene, SkyClouds } from "~/components/city-scene";
import { ConflictingArt, ConnectedArt, QuestionsArt } from "~/components/problem-art";
import { CtaBanner } from "~/components/cta-banner";
import { DpiSearch } from "~/components/dpi-search";
import { FaqSection } from "~/components/faq";
import { IbadanMap } from "~/components/ibadan-map";
import { ListingCard } from "~/components/listing-card";
import { CountUp, EASE, Reveal, Rings, Stagger, StaggerItem, WordsReveal } from "~/components/motion";
import { Rail, useIsDesktop } from "~/components/mobile";
import { ButtonLink, SectionHeading } from "~/components/ui";
import { SAMPLE_DPI } from "~/lib/dpi";
import { HOME_FAQS } from "~/lib/faqs";
import { featuredListings } from "~/lib/marketplace/source.server";
import { searchNearby } from "~/lib/nearby/source.server";
import { NearbySection } from "~/components/nearby-section";
import type { ListingCard as Card } from "~/lib/marketplace/types";
import { faqJsonLd, seo } from "~/lib/seo";
import { STORIES, coverFit } from "~/lib/stories";
import type { Route } from "./+types/home";

export const meta: Route.MetaFunction = () =>
  seo({
    title: "Urbn | The Digital Infrastructure for Housing",
    description:
      "Find properties in Ibadan, check property records and discover what's around you with Urbn, the digital infrastructure for housing.",
    path: "/",
    jsonLd: faqJsonLd(HOME_FAQS),
  });

export async function loader() {
  const [featured, nearby] = await Promise.all([featuredListings(7), searchNearby({ area: "bodija", limit: 2 })]);
  return { featured, nearby };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { featured, nearby } = loaderData;
  return (
    <>
      <Hero />
      <Problem />
      <Identity />
      <NearbySection preview={nearby} />
      <HowItWorks />
      <Audiences />
      <Growth listings={featured} />
      <FeaturedListings listings={featured} />
      <Stories />
      <FaqSection faqs={HOME_FAQS} />
      <CtaBanner variant="waitlist" />
    </>
  );
}

// ---------------------------------------------------------------------------

function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  // Layers drift at different speeds as the hero scrolls away (desktop only).
  const far = useTransform(scrollYProgress, [0, 1], [0, 70]);
  const mid = useTransform(scrollYProgress, [0, 1], [0, 28]);
  const fade = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const desktop = useIsDesktop();

  return (
    <section ref={ref} className="relative isolate flex flex-col overflow-hidden bg-white">
      {/* Soft grey clouds drifting behind the text and the scene. */}
      <SkyClouds className="absolute inset-x-0 top-0 -z-10 h-[34rem] w-full lg:h-[40rem]" />

      {/* The illustrated Ibadan street: under the text on desktop, above it on phones. */}
      <motion.div
        className="pointer-events-none relative order-first h-[clamp(17rem,44svh,23rem)] overflow-hidden lg:order-last lg:-mt-[11vw] xl:-mt-[15vw] lg:h-auto lg:overflow-visible"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: EASE }}
      >
        <CityScene
          far={desktop ? far : undefined}
          mid={desktop ? mid : undefined}
          className="absolute bottom-0 left-1/2 h-full w-auto max-w-none -translate-x-[31%] lg:static lg:block lg:h-auto lg:w-full lg:translate-x-0"
        />
      </motion.div>

      <motion.div
        style={desktop ? { opacity: fade } : undefined}
        className="container-x relative z-10 flex flex-col pt-2 pb-10 lg:items-center lg:pt-8 lg:pb-0 lg:text-center"
      >
        <motion.span
          className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold shadow-sm lg:hidden"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <span className="size-1.5 animate-pulse rounded-full bg-success" /> Live in Ibadan
        </motion.span>
        <WordsReveal
          text="A Property Has More Than an Address."
          className="max-w-4xl text-[2.75rem] leading-[0.98] text-ink sm:text-7xl lg:text-[5.5rem]"
        />
        <motion.p
          className="mt-4 max-w-xl text-[15px] text-neutral-600 sm:text-lg lg:mt-5 lg:font-medium lg:text-neutral-800"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8, ease: EASE }}
        >
          Urbn connects a property's identity, people and activities, from homes and shops to offices, schools and clinics. Find a property, check its record or manage yours.
        </motion.p>
        <motion.div
          className="mt-6 w-full max-w-2xl lg:mt-8"
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.9, ease: EASE }}
        >
          <DpiSearch />
          {/* phones: app-style quick actions */}
          <div className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 lg:hidden">
            {[
              { to: "/listings", label: "Browse Listings", icon: Search },
              { to: "/nearby", label: "Explore Nearby", icon: MapPin },
              { to: "/dpi", label: "What Is DPI?", icon: ShieldCheck },
              { to: "/for-owners", label: "Add Your Property", icon: House },
            ].map((a) => (
              <Link key={a.to} to={a.to} className="inline-flex shrink-0 items-center gap-2 rounded-full bg-mist px-4 py-2.5 text-[13px] font-semibold active:scale-95 active:bg-fog">
                <a.icon className="size-4 text-urbn" /> {a.label}
              </Link>
            ))}
          </div>
          <p className="mt-4 hidden items-center gap-1.5 rounded-full bg-white/90 px-4 py-2 text-sm text-neutral-700 shadow-sm backdrop-blur lg:inline-flex">
            No DPI code?
            <Link to="/listings" className="font-semibold text-urbn underline-offset-4 hover:underline">
              Browse Listings in Ibadan →
            </Link>
            <span className="text-neutral-300" aria-hidden>|</span>
            <Link to="/nearby" className="font-semibold text-urbn underline-offset-4 hover:underline">
              Explore Nearby →
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}

function Problem() {
  const cards = [
    {
      big: "One Property. Conflicting Details.",
      text: "Different listings can tell different stories about the same space.",
      art: <ConflictingArt />,
      tone: "bg-ink text-white",
    },
    {
      big: "Records That Stay Connected",
      text: "Keep a property's details and activities linked as people come and go.",
      art: <ConnectedArt />,
      tone: "bg-urbn text-white",
    },
    {
      big: "Questions Before Payment",
      text: "Check the available property record and ask for the details you need before committing.",
      art: <QuestionsArt />,
      tone: "bg-mist text-ink",
    },
  ];
  return (
    <section className="container-x py-16 sm:py-24 lg:py-32">
      <Reveal>
        <SectionHeading
          title="Property Details Shouldn't Get Lost."
          lede="Listings in one place. Agreements in another. Payment records buried in chats. Urbn brings property activities into one connected record."
        />
      </Reveal>
      <Reveal className="mt-8 md:mt-14">
        <Rail grid="md:grid-cols-3 md:gap-5" item="w-[78%] sm:w-[55%]" label="Why property details get lost">
        {cards.map((c, i) => (
            <article key={i} className={clsx("group relative flex h-full flex-col overflow-hidden rounded-card", c.tone)}>
              {i === 1 && <Rings className="-top-16 -right-16 size-48" />}
              <div className="relative p-7 pb-6">
                <h3 className="font-display text-[1.75rem] leading-[1.08] sm:text-3xl">{c.big}</h3>
                <span className={clsx("mt-4 block h-0.5 w-10", i === 2 ? "bg-urbn" : i === 1 ? "bg-white" : "bg-urbn")} />
                <p className={clsx("mt-3 max-w-[16rem] text-[15px] leading-snug", i === 2 ? "text-neutral-600" : "text-white/75")}>
                  {c.text}
                </p>
              </div>
              {/* Drawn in the hero city's line style, so the section reads as the same world. */}
              <div className="mt-auto px-4 pb-4 transition-transform duration-700 group-hover:scale-[1.03]">{c.art}</div>
            </article>
        ))}
        </Rail>
      </Reveal>
    </section>
  );
}

function Identity() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const desktop = useIsDesktop();
  return (
    <section className="overflow-hidden bg-gradient-to-b from-white via-blue-50/60 to-white">
      <div ref={ref} className="container-x grid items-center gap-6 py-14 lg:grid-cols-[1fr_1.15fr] lg:gap-10 lg:py-28">
        <Reveal>
          <p className="eyebrow">
            <span className="size-2 rounded-full bg-urbn" /> Digital Property Identity
          </p>
          <h2 className="mt-4 text-[2.6rem] leading-[1.02] sm:text-6xl">
            A Record Built Around the <span className="text-urbn">Property</span>
          </h2>
          <p className="lede mt-6 max-w-lg">
            A Digital Property Identity (DPI) connects a property to its record on Urbn. It helps keep details and
            activities linked to the same property as owners, managers and occupants change.
          </p>
          <div className="mt-6 grid gap-2 sm:flex sm:flex-wrap sm:gap-3 lg:mt-8">
            <ButtonLink to="/dpi" variant="blue" className="w-full sm:w-auto">
              Explore Property Identity
            </ButtonLink>
            <ButtonLink to="/verify" variant="outline" className="w-full sm:w-auto">
              Check a DPI
            </ButtonLink>
          </div>
        </Reveal>
        <div className="relative order-first -mx-4 lg:order-none lg:mx-0">
          <Rings className="top-[58%] left-1/2 aspect-[2.6] w-[115%] -translate-x-1/2 -translate-y-1/2" count={4} />
          <motion.img
            style={desktop ? { y } : undefined}
            src="/images/house-identity.webp"
            srcSet="/images/house-identity-640.webp 640w, /images/house-identity.webp 810w"
            sizes="(min-width: 1024px) 50vw, 100vw"
            alt="Modern two-storey white house with a verified Digital Property Identity"
            loading="lazy"
            className="relative w-full mix-blend-multiply [mask-image:radial-gradient(ellipse_at_center,black_55%,transparent_78%)]"
          />
          <motion.div
            className="absolute bottom-[12%] left-0 flex items-center gap-3 rounded-2xl bg-white p-3 pr-5 shadow-xl ring-1 ring-black/5 sm:left-[6%]"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.8, ease: EASE }}
          >
            <span className="grid size-10 place-items-center rounded-full bg-success/15 text-success">
              <ShieldCheck className="size-5" />
            </span>
            <span className="text-sm">
              <b className="block font-semibold">Property Verified</b>
              <span className="block text-[11px] font-semibold tracking-wider text-warning uppercase">Sample Record</span>
              <span className="font-mono text-xs text-neutral-500">{SAMPLE_DPI}</span>
            </span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

const STEPS = [
  { icon: FileUp, title: "Submit Your Property", text: "Add the property details and provide the documents required for your role." },
  { icon: ShieldCheck, title: "Complete the Checks", text: "Urbn reviews the submitted information and carries out the checks required for the property." },
  { icon: Stamp, title: "View Your Property Record", text: "Once approved, check the property's verification status and available plaque options in Urbn." },
];

function HowItWorks() {
  const [active, setActive] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (!visible) return;
    const t = setInterval(() => setActive((a) => (a + 1) % 4), 2600);
    return () => clearInterval(t);
  }, [visible]);

  return (
    <section className="bg-ink py-16 text-white sm:py-24 lg:py-32">
      <div className="container-x" ref={ref}>
        <Reveal>
          <SectionHeading dark eyebrow="How It Works" title="Give Your Property a Connected Record" lede="Submit your details, complete the required checks and follow your property's status in Urbn." />
        </Reveal>
        <HowItWorksDeck />
        <div className="mt-14 hidden gap-4 lg:grid lg:grid-cols-[1fr_1fr_1fr]">
          <ol className="flex flex-col gap-4">
            {STEPS.map((s, i) => (
              <li key={s.title}>
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  className={clsx(
                    "relative flex w-full items-center gap-4 overflow-hidden rounded-card p-5 text-left transition-all duration-500 sm:p-6",
                    active === i ? "bg-urbn" : "bg-blue-950/60 hover:bg-blue-900/60",
                  )}
                >
                  <span className="grid size-12 shrink-0 place-items-center rounded-full bg-white text-urbn">
                    <s.icon className="size-5" />
                  </span>
                  <span className="relative z-10">
                    <span className="block font-display text-xl">{s.title}</span>
                    <span className="mt-1 block text-sm leading-snug text-white/80">{s.text}</span>
                  </span>
                  <span className="pointer-events-none absolute right-3 -bottom-4 font-display text-8xl text-white/15">{i + 1}</span>
                  {active === i && visible && (
                    <motion.span
                      key={`bar-${i}`}
                      className="absolute bottom-0 left-0 h-1 bg-white/70"
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 2.6, ease: "linear" }}
                    />
                  )}
                </button>
              </li>
            ))}
          </ol>

          <Reveal delay={0.1} className="h-full">
            <button
              type="button"
              onClick={() => setActive(3)}
              className={clsx(
                "relative flex h-full w-full flex-col overflow-hidden rounded-card bg-graphite text-left ring-2 transition-all duration-500",
                active === 3 ? "ring-urbn" : "ring-transparent",
              )}
            >
              <img src="/images/property-card-scene.webp" alt="Black Urbn Property Card with QR code" loading="lazy" className="aspect-[1.42] w-full object-cover" />
              <div className="relative flex flex-1 flex-col p-6">
                <p className="font-display text-2xl leading-tight">Your Property Card</p>
                <p className="mt-3 text-sm text-white/65">
                  View the relationship to a property recorded on your Urbn account.
                </p>
                <Link to="/dpi#property-card" className="mt-6 inline-flex w-fit items-center gap-1 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-ink">
                  Learn About Property Cards ›
                </Link>
                <span className="pointer-events-none absolute right-4 -bottom-4 font-display text-8xl text-white/10">4</span>
              </div>
            </button>
          </Reveal>

          <Reveal delay={0.2} className="relative hidden overflow-hidden rounded-card lg:block">
            <img src="/images/app-in-hand.webp" alt="The Urbn app showing verified properties on a phone" loading="lazy" className="size-full object-cover" />
            <motion.div
              className="absolute right-4 bottom-4 left-4 rounded-xl bg-black/70 p-3 text-xs backdrop-blur"
              key={active}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {active < 3 ? <span className="text-white/60">Step {active + 1} of 3 · </span> : <span className="text-white/60">Optional · </span>}
              {["Property Submitted", "Under Review", "Verification Complete", "Property Card"][active]}
            </motion.div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/** Phones: a swipe-through deck, one step per card, like an app onboarding. */
function HowItWorksDeck() {
  const cards = [
    ...STEPS.map((s, i) => ({ ...s, n: i + 1, img: null as string | null })),
    { icon: ShieldCheck, title: "Your Property Card", text: "View the relationship to a property recorded on your Urbn account.", n: 4, img: "/images/property-card-scene.webp" },
  ];
  return (
    <Reveal className="mt-8 lg:hidden">
      <Rail grid="md:grid-cols-2 md:gap-4" item="w-[82%] sm:w-[58%]" dark label="How it works">
        {cards.map((c) => (
          <article key={c.title} className={clsx("relative flex h-full min-h-[19rem] flex-col overflow-hidden rounded-[1.5rem] p-6", c.n === 4 ? "bg-graphite" : "bg-urbn")}>
            <div className="flex items-center justify-between">
              <span className="grid size-12 place-items-center rounded-full bg-white text-urbn">
                <c.icon className="size-5" />
              </span>
              <span className="text-xs font-semibold tracking-widest text-white/60 uppercase">{c.n < 4 ? `Step ${c.n} of 3` : "Optional"}</span>
            </div>
            {c.img && <img src={c.img} alt="Urbn Property Card" loading="lazy" className="mt-5 aspect-[1.6] w-full rounded-xl object-cover" />}
            <h3 className="mt-auto pt-6 font-display text-3xl">{c.title}</h3>
            <p className="mt-2 text-[15px] leading-snug text-white/80">{c.text}</p>
            <span className="pointer-events-none absolute -right-2 -bottom-8 font-display text-[9rem] leading-none text-white/10">{c.n}</span>
          </article>
        ))}
      </Rail>
    </Reveal>
  );
}

function Audiences() {
  const items = [
    {
      icon: House,
      title: "Property Owners",
      kicker: "Keep Your Property in View",
      text: "Bring property details, spaces, occupants and tenancy records into one place.",
      link: "Explore Owner Tools",
      img: "/images/illus-owners.webp",
      to: "/for-owners",
      dark: false,
    },
    {
      icon: Briefcase,
      title: "Agents & Property Managers",
      kicker: "Keep Your Work Organised",
      text: "Manage listings, inspection requests and property activities with a clearer record.",
      link: "Explore Agent Tools",
      img: "/images/illus-agents.webp",
      to: "/for-agents",
      dark: true,
    },
    {
      icon: Search,
      title: "Renters & Home Seekers",
      kicker: "Find a Home. Stay Informed.",
      text: "Explore listings, book inspections and keep track of your tenancy.",
      link: "Explore Renter Tools",
      img: "/images/illus-renters.webp",
      to: "/for-renters",
      dark: false,
    },
  ];
  return (
    <section className="container-x py-16 sm:py-24 lg:py-32">
      <Reveal>
        <SectionHeading
          eyebrow="Who Urbn Is For"
          title="Built for the People Around Every Property"
          lede="Owners, renters, managers and the businesses and services inside every building can keep their property activities connected."
        />
      </Reveal>
      <Reveal className="mt-8 md:mt-14">
        <Rail grid="md:grid-cols-3 md:items-center md:gap-5" item="w-[80%] sm:w-[55%]" label="Who Urbn is for">
        {items.map((it) => (
            <Link
              key={it.title}
              to={it.to}
              className={clsx(
                "group flex h-full flex-col rounded-card p-7 transition-all duration-500 active:scale-[0.98] lg:hover:-translate-y-1.5",
                it.dark
                  ? "bg-ink text-white shadow-[0_30px_60px_-25px_rgba(0,0,0,0.6)] md:py-10"
                  : "bg-white shadow-[0_20px_60px_-30px_rgba(0,0,0,0.25)] ring-1 ring-black/5",
              )}
            >
              <span className={clsx("grid size-12 place-items-center rounded-full", it.dark ? "bg-white text-ink" : "bg-blue-50 text-urbn")}>
                <it.icon className="size-5" />
              </span>
              <h3 className="mt-6 font-display text-2xl">{it.title}</h3>
              <p className={clsx("mt-1 text-[15px]", it.dark ? "text-white/70" : "text-neutral-600")}>{it.kicker}</p>
              <span className="mt-4 block h-px w-24 bg-current opacity-30" />
              <p className={clsx("mt-4 text-sm leading-relaxed", it.dark ? "text-white/60" : "text-neutral-500")}>{it.text}</p>
              <img src={it.img} alt="" loading="lazy" className={clsx("mt-6 h-28 w-full object-contain object-bottom", !it.dark && "mix-blend-multiply")} />
              <span className={clsx("mt-5 text-sm font-semibold", it.dark ? "text-blue-300" : "text-urbn")}>
                {it.link} <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
              </span>
            </Link>
        ))}
        </Rail>
      </Reveal>
    </section>
  );
}

function Growth({ listings }: { listings: Card[] }) {
  const stats = [
    { icon: MapPin, label: "Starting in Ibadan", text: "We'll announce new locations as coverage becomes available." },
    { icon: House, label: "A Clearer Property Record", text: "Follow submitted details and verification status in Urbn." },
    { icon: Users, label: "Be Part of Urbn's Next City", text: "Get an email when Urbn becomes available near you.", to: "/download#launch-updates" },
  ];
  return (
    <section className="pt-4 pb-16 sm:pb-24 lg:pt-8 lg:pb-32">
      <Reveal className="container-x">
        <SectionHeading title="Start With Ibadan" lede="Explore properties by area or see available listings on the map." />
      </Reveal>
      <div className="mt-8 lg:mt-12">
        <IbadanMap listings={listings} />
      </div>
      <Reveal className="container-x mt-10 lg:mt-16">
        <Rail grid="md:grid-cols-3 md:gap-10" item="w-[72%] sm:w-[48%]" label="Urbn in numbers">
        {stats.map((s, i) => (
          <div key={i} className="flex h-full gap-4 rounded-2xl bg-mist p-5 md:bg-transparent md:p-0">
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-urbn text-white">
              <s.icon className="size-5" />
            </span>
            <div>
              <h3 className="font-display text-2xl leading-tight">{s.label}</h3>
              <p className="mt-1.5 text-sm text-neutral-500">{s.text}</p>
              {s.to && (
                <Link to={s.to} className="mt-2 inline-block text-sm font-semibold text-urbn">
                  Get Launch Updates →
                </Link>
              )}
            </div>
          </div>
        ))}
        </Rail>
      </Reveal>
    </section>
  );
}

function FeaturedListings({ listings }: { listings: Card[] }) {
  const featured = listings.slice(0, 4);
  return (
    <section className="relative overflow-hidden bg-mist py-16 sm:py-24 lg:py-32">
      <div className="container-x">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <Reveal>
            <SectionHeading
              align="left"
              eyebrow="Listings"
              title="Properties to Explore"
              lede="Browse available listings and check each property's current Urbn verification status."
            />
          </Reveal>
          <ButtonLink to="/listings" variant="dark" className="hidden shrink-0 md:inline-flex">
            Browse Listings
          </ButtonLink>
        </div>
        <Reveal className="mt-8 lg:mt-12">
          <Rail grid="md:grid-cols-2 md:gap-5 lg:grid-cols-4" item="w-[82%] sm:w-[52%]" label="Featured verified listings">
            {featured.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </Rail>
        </Reveal>
        <ButtonLink to="/listings" variant="dark" size="lg" className="mt-6 w-full md:hidden">
          Browse Listings
        </ButtonLink>
      </div>
    </section>
  );
}

function Stories() {
  return (
    <section className="bg-ink py-16 text-white sm:py-24 lg:py-32">
      <div className="container-x">
        <Reveal>
          <SectionHeading dark title="Stories From Urbn" lede="Product updates, property insights and the people building Urbn." />
        </Reveal>
        <Reveal className="mt-8 md:mt-14">
          <Rail grid="md:grid-cols-3 md:gap-5" item="w-[80%] sm:w-[55%]" dark label="Stories">
          {STORIES.slice(0, 6).map((s) => (
              <Link key={s.slug} to={`/blog/${s.slug}`} className="group flex h-full flex-col rounded-card bg-white p-3 text-ink transition-transform duration-500 active:scale-[0.98] lg:hover:-translate-y-1.5">
                <div className="overflow-hidden rounded-[0.9rem]">
                  <img src={s.image} alt={s.imageAlt} loading="lazy" className={`aspect-[1.55] w-full ${coverFit(s)} transition-transform duration-700 group-hover:scale-105`} />
                </div>
                <div className="flex flex-1 flex-col px-2 pt-4 pb-2">
                  <h3 className="font-display text-xl leading-tight">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-600">{s.excerpt}</p>
                  <span className="mt-auto self-end pt-5 text-sm font-semibold text-urbn">
                    Read Story <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
                  </span>
                </div>
              </Link>
          ))}
          </Rail>
        </Reveal>
      </div>
    </section>
  );
}
