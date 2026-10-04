import { clsx } from "clsx";
import {
  BadgeCheck,
  CalendarClock,
  FileCheck2,
  FileText,
  Fingerprint,
  History,
  IdCard,
  Lock,
  MapPin,
  QrCode,
  ReceiptText,
  ScanLine,
  ShieldCheck,
  ShieldX,
  Stamp,
  Trash2,
  UserCheck,
} from "lucide-react";
import { AnimatePresence, motion, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { CtaBanner } from "~/components/cta-banner";
import { FaqSection } from "~/components/faq";
import { EASE, Reveal, Rings, Stagger, StaggerItem, WordsReveal } from "~/components/motion";
import { Plaque } from "~/components/plaque";
import { Rail } from "~/components/mobile";
import { ButtonLink, SectionHeading } from "~/components/ui";
import { SAMPLE_DPI } from "~/lib/dpi";
import { DPI_FAQS } from "~/lib/faqs";
import { breadcrumbs, faqJsonLd, seo } from "~/lib/seo";
import { absoluteUrl } from "~/lib/site";
import type { Route } from "./+types/dpi";

const DETAILED_STEPS = [
  {
    title: "Submit your property",
    text: "Sign up and provide your property's details: address, ownership information, and supporting documents (Certificate of Occupancy, deed, or equivalent).",
    icon: FileText,
  },
  {
    title: "Identity check (KYC)",
    text: "We confirm you are who you say you are, and that you have the right to submit this property, using a valid government-issued ID.",
    icon: Fingerprint,
  },
  {
    title: "Document verification",
    text: "Our team checks your title documents against the property and the claimed owner. If something doesn't line up, we'll tell you exactly what's missing.",
    icon: FileCheck2,
  },
  {
    title: "Physical inspection",
    text: "Someone from Urbn visits the property in person to confirm it exists, matches the documents, and matches its house number.",
    icon: MapPin,
  },
  {
    title: "DPI issued",
    text: "Your property receives its permanent DPI code, tied to the property itself. It never resets and can never be reassigned.",
    icon: BadgeCheck,
  },
  {
    title: "Request your plaque",
    text: "Order a physical plaque for your gate, and download a virtual plaque to share with buyers and renters anywhere.",
    icon: QrCode,
  },
  {
    title: "Once you're verified, carry the proof.",
    text: "Residents and owners can request a Property Card that proves their verified relationship to the property, wherever they need to.",
    icon: IdCard,
  },
];

export const meta: Route.MetaFunction = () =>
  seo({
    title: "What Is a DPI? Digital Property Identity Explained",
    description:
      "A DPI is a permanent, verified record tied to a property, not its owner, agent or listing. Learn how Urbn issues DPIs, what's on a plaque, and how to get one.",
    path: "/dpi",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: "How to get a Digital Property Identity (DPI) for your property",
        description: "The steps Urbn follows before issuing a permanent DPI to a property in Nigeria.",
        step: DETAILED_STEPS.map((s, i) => ({
          "@type": "HowToStep",
          position: i + 1,
          name: s.title,
          text: s.text,
          url: absoluteUrl(`/dpi#step-${i + 1}`),
        })),
      },
      faqJsonLd(DPI_FAQS),
      breadcrumbs([
        { name: "Home", path: "/" },
        { name: "DPI", path: "/dpi" },
      ]),
    ],
  });

export default function DpiPage() {
  return (
    <>
      <Hero />
      <WhyExists />
      <Solves />
      <DetailedSteps />
      <PropertyCard />
      <Anatomy />
      <CodeExplained />
      <Formats />
      <Lifecycle />
      <FaqSection faqs={DPI_FAQS} />
      <CtaBanner />
    </>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="container-x grid items-center gap-10 pt-12 pb-16 lg:grid-cols-[1fr_1.1fr] lg:pt-16 lg:pb-24">
        <div>
          <WordsReveal text="Get Your Property a DPI" highlight={["DPI"]} className="text-5xl leading-[1] sm:text-6xl lg:text-7xl" />
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8, ease: EASE }}>
            <p className="lede mt-6 max-w-xl">
              Right now, a property's identity depends on whoever's standing in front of you: an owner's claim, or a
              document you can't independently check until it's too late.
            </p>
            <p className="lede mt-4 max-w-xl">
              A DPI changes that. It's a permanent, verified record issued by Urbn, tied to the property itself, not to
              its owner, agent, or listing. Once issued, anyone can check it in seconds, without depending on anyone's
              word.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink to="/download" variant="dark">
                Get Started
              </ButtonLink>
              <ButtonLink to="/verify" variant="dark">
                Verify a Property
              </ButtonLink>
            </div>
          </motion.div>
        </div>
        <motion.div
          className="relative"
          initial={{ opacity: 0, scale: 0.94, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.2, ease: EASE, delay: 0.2 }}
        >
          <div className="absolute inset-[10%] -z-10 rounded-full bg-blue-100 blur-3xl" />
          <img
            src="/images/house-plaque.webp"
            srcSet="/images/house-plaque-640.webp 640w, /images/house-plaque.webp 792w"
            sizes="(min-width: 1024px) 50vw, 100vw"
            alt="Modern house with an Urbn DPI plaque mounted on its front wall"
            fetchPriority="high"
            className="w-full mix-blend-multiply"
          />
        </motion.div>
      </div>
    </section>
  );
}

function IconBadge({ icon: Icon, dark }: { icon: typeof History; dark?: boolean }) {
  return (
    <span className={clsx("grid size-12 place-items-center rounded-full", dark ? "bg-white text-ink" : "bg-ink text-white")}>
      <Icon className="size-5" />
    </span>
  );
}

function WhyExists() {
  const items = [
    { icon: History, title: "No reliable property history", text: "Records live with individual agents or owners. When they change, the history goes with them, or it's never passed on at all." },
    { icon: ReceiptText, title: "Fake & duplicate listings", text: "Anyone can claim to represent a property. There's no independent registry to check their claim against." },
    { icon: ShieldX, title: "Disputes with no paper trail", text: "Rent, agreements, and complaints get handled informally: cash, WhatsApp, verbal. Nothing is logged anywhere both parties can point back to." },
    { icon: ScanLine, title: "No way to verify before committing", text: "Buyers and renters have no independent source to check a property against. They rely entirely on the word of whoever's showing them around." },
  ];
  return (
    <section className="bg-ink py-16 text-white sm:py-24 lg:py-28">
      <div className="container-x">
        <Reveal>
          <SectionHeading dark title="Why DPI exists." lede="Real estate runs on trust, and today there's nothing to anchor it to." />
        </Reveal>
        <Reveal className="mt-8 md:mt-14">
        <Rail grid="md:grid-cols-2 md:gap-4 lg:grid-cols-4" item="w-[78%] sm:w-[52%]" dark label="Why DPI exists">
          {items.map((it) => (
            <div key={it.title} className="flex h-full flex-col items-start rounded-card bg-graphite p-7 ring-1 ring-white/5 transition hover:ring-white/20 md:items-center md:text-center">
              <IconBadge icon={it.icon} dark />
              <h3 className="mt-6 font-sans text-lg font-semibold tracking-normal">{it.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-neutral-400">{it.text}</p>
            </div>
          ))}
        </Rail>
        </Reveal>
      </div>
    </section>
  );
}

function Solves() {
  const items = [
    { icon: History, title: "A record that never resets", text: "A DPI is tied to the property, not to any person. Owners, tenants, and agents can change, but the record doesn't. Every tenancy, payment, and dispute is logged against it, permanently." },
    { icon: ShieldCheck, title: "Verification that can't be faked", text: "A property only has a DPI if it's passed Urbn's verification. Scan the plaque's QR code and see instantly whether it's genuinely verified, and by whom." },
    { icon: CalendarClock, title: "A timestamped record, always available", text: "Transactions and service events get logged to the DPI as they happen, creating a history both parties can point back to whenever they need it." },
    { icon: Lock, title: "Proof, before you pay anything", text: "Scan the plaque before sending money or signing anything. See the verified record for yourself: ownership, registration date, status. No one's word required." },
  ];
  return (
    <section className="container-x py-16 sm:py-24 lg:py-28">
      <Reveal>
        <SectionHeading title="How DPI solves it" />
      </Reveal>
      <Reveal className="mt-8 md:mt-14">
      <Rail grid="md:grid-cols-2 md:gap-4 lg:grid-cols-4" item="w-[78%] sm:w-[52%]" label="How DPI solves it">
        {items.map((it) => (
          <div key={it.title} className="group flex h-full flex-col items-start rounded-card border border-neutral-200 bg-white p-7 transition duration-500 md:items-center md:text-center lg:hover:-translate-y-1 lg:hover:border-urbn lg:hover:shadow-[0_20px_50px_-25px_rgba(37,61,226,0.5)]">
            <span className="transition-transform duration-500 group-hover:scale-110">
              <IconBadge icon={it.icon} />
            </span>
            <h3 className="mt-6 font-sans text-lg font-semibold tracking-normal">{it.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-neutral-500">{it.text}</p>
          </div>
        ))}
      </Rail>
      </Reveal>
    </section>
  );
}

function StepVisual({ index }: { index: number }) {
  const step = DETAILED_STEPS[index];
  if (index === 0)
    return <img src="/images/illus-submit.webp" alt="Illustration of documents checked under a magnifying glass with a verified shield" className="mx-auto w-full max-w-sm" />;
  if (index === 5) return <Plaque className="mx-auto w-full max-w-md" />;
  if (index === 6)
    return <img src="/images/property-card.webp" alt="Urbn Property Card: proof of relationship" className="mx-auto w-full max-w-sm rounded-card" />;
  const Icon = step.icon;
  return (
    <div className="relative mx-auto grid aspect-square w-full max-w-xs place-items-center">
      <div className="absolute inset-0 rounded-full bg-blue-50" />
      <Rings className="inset-0" count={3} />
      <motion.span
        className="relative grid size-28 place-items-center rounded-full bg-urbn text-white shadow-[0_20px_50px_-15px_rgba(37,61,226,0.8)]"
        initial={{ scale: 0.6, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 14 }}
      >
        <Icon className="size-12" />
      </motion.span>
      {index === 4 && (
        <motion.span
          className="absolute bottom-6 rounded-lg bg-ink px-3 py-1.5 font-mono text-sm text-white"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {SAMPLE_DPI}
        </motion.span>
      )}
      {index === 1 && <UserCheck className="absolute top-10 right-10 size-8 text-urbn" />}
    </div>
  );
}

function DetailedSteps() {
  const [active, setActive] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-30%" });
  const [auto, setAuto] = useState(true);
  useEffect(() => {
    if (!inView || !auto) return;
    const t = setInterval(() => setActive((a) => (a + 1) % DETAILED_STEPS.length), 3400);
    return () => clearInterval(t);
  }, [inView, auto]);
  const step = DETAILED_STEPS[active];
  // keep the active chip in view on phones without moving the page
  const chipsRef = useRef<HTMLOListElement>(null);
  useEffect(() => {
    const ol = chipsRef.current;
    const chip = ol?.children[active] as HTMLElement | undefined;
    if (ol && chip && ol.scrollWidth > ol.clientWidth) ol.scrollTo({ left: chip.offsetLeft - 16, behavior: "smooth" });
  }, [active]);

  return (
    <section className="container-x pb-24 sm:pb-32" id="how-to-get-a-dpi">
      <Reveal>
        <SectionHeading title="How to Get a DPI" lede="Seven steps, the same for every property. No shortcuts, no exceptions." />
      </Reveal>
      <div ref={ref} className="mt-8 grid gap-8 lg:mt-14 lg:grid-cols-2 lg:gap-16">
        <div className="relative order-2 min-h-[24rem] lg:order-1 lg:min-h-[26rem] lg:border-r lg:border-neutral-200 lg:pr-16">
          <motion.span
            className="absolute top-0 right-[-1px] hidden w-0.5 bg-ink lg:block"
            animate={{ height: `${((active + 1) / DETAILED_STEPS.length) * 100}%` }}
            transition={{ duration: 0.6, ease: EASE }}
          />
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.45, ease: EASE }}
            >
              <h3 className="text-3xl sm:text-4xl">{step.title}</h3>
              <p className="lede mt-4 max-w-md">{step.text}</p>
              <div className="mt-10">
                <StepVisual index={active} />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
        <ol ref={chipsRef} className="no-scrollbar order-1 -mx-4 flex gap-2 overflow-x-auto px-4 lg:order-2 lg:mx-0 lg:flex-col lg:gap-3 lg:overflow-visible lg:px-0">
          {DETAILED_STEPS.map((s, i) => (
            <li key={s.title} id={`step-${i + 1}`} className="shrink-0">
              <button
                type="button"
                onClick={() => {
                  setActive(i);
                  setAuto(false);
                }}
                aria-current={active === i ? "step" : undefined}
                className={clsx(
                  "relative flex w-full items-center gap-2.5 overflow-hidden rounded-full px-4 py-2.5 text-left transition-colors duration-300 lg:gap-4 lg:rounded-2xl lg:px-6 lg:py-5",
                  active === i ? "bg-ink text-white" : "bg-mist text-ink hover:bg-fog",
                )}
              >
                <span className="text-sm tabular-nums lg:w-5 lg:text-lg">{i + 1}</span>
                <span className="hidden size-1.5 rounded-full bg-current lg:block" />
                <span className="text-sm font-medium whitespace-nowrap lg:text-xl lg:whitespace-normal">{s.title}</span>
                {active === i && auto && inView && (
                  <motion.span
                    className="absolute bottom-0 left-0 h-0.5 bg-urbn"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 3.4, ease: "linear" }}
                  />
                )}
              </button>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function PropertyCard() {
  const blocks = [
    { title: "What it's for", text: "Show it to receive deliveries without a hassle, get through your estate gate without an interrogation, or prove where you live or what you own, without digging through old bills or documents." },
    { title: "Getting one", text: "Once your tenancy or ownership is logged against a property's DPI, request your card through the app. Urbn confirms the relationship is accurate, then issues it, usually within a few days." },
    { title: "What's on it?", text: "Your name, your permanent User ID, an issue date, and a QR code that pulls up your verified relationships in real time. It isn't tied to just one property, so it works no matter how many you're connected to." },
  ];
  return (
    <section id="property-card" className="scroll-mt-24 bg-ink py-16 text-white sm:py-24 lg:py-32">
      <div className="container-x">
        <Reveal>
          <SectionHeading
            dark
            title="What is a Property Card?"
            lede="A Property Card is a personal identity card issued by Urbn that proves your verified relationship to a property, as a resident or an owner. Where a DPI verifies the property itself, a Property Card verifies you."
          />
        </Reveal>
        <div className="mt-16 grid items-center gap-12 lg:grid-cols-2">
          <Stagger className="space-y-9">
            {blocks.map((b) => (
              <StaggerItem key={b.title}>
                <h3 className="font-display text-2xl">{b.title}</h3>
                <p className="mt-2 max-w-lg leading-relaxed text-neutral-400">{b.text}</p>
              </StaggerItem>
            ))}
          </Stagger>
          <Reveal delay={0.15} className="relative">
            <motion.div
              whileHover={{ rotateY: -8, rotateX: 6, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 200, damping: 18 }}
              style={{ transformPerspective: 1000 }}
              className="overflow-hidden rounded-card"
            >
              <img src="/images/property-card.webp" alt="Black Urbn Property Card reading 'Proof of Relationship' with ID URBN-IBD-23-00056" loading="lazy" className="w-full" />
            </motion.div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

const CALLOUTS = [
  { n: 1, title: "DPI code", text: `The property's permanent identifier, e.g. ${SAMPLE_DPI}.`, x: 98, y: 13 },
  { n: 2, title: "QR code", text: "Scans to the live digital record: real-time status, ownership, and history.", x: 98, y: 50 },
  { n: 3, title: "House number", text: "Matched to the physical property, so the plaque can be visually confirmed on sight.", x: 2, y: 50 },
  { n: 4, title: 'Urbn "Verified Property" seal', text: "Proof it passed verification. It can't be added any other way.", x: 2, y: 89 },
];

function Anatomy() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-25%" });
  const [hover, setHover] = useState<number | null>(null);
  return (
    <section className="bg-mist py-16 sm:py-24 lg:py-32">
      <div className="container-x">
        <Reveal>
          <SectionHeading eyebrow="What's on a DPI plaque" title="Anatomy of a DPI" />
        </Reveal>
        <div ref={ref} className="relative mx-auto mt-14 max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 30, rotateX: 18 }} animate={inView ? { opacity: 1, y: 0, rotateX: 0 } : {}} transition={{ duration: 1, ease: EASE }} style={{ transformPerspective: 1200 }}>
            <Plaque />
          </motion.div>
          {CALLOUTS.map((c, i) => (
            <motion.button
              key={c.n}
              type="button"
              aria-label={`${c.n}. ${c.title}`}
              onMouseEnter={() => setHover(c.n)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(c.n)}
              onBlur={() => setHover(null)}
              className="absolute grid size-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-urbn text-sm font-semibold text-white shadow-lg ring-4 ring-white sm:size-10"
              style={{ left: `${c.x}%`, top: `${c.y}%` }}
              initial={{ scale: 0 }}
              animate={inView ? { scale: hover === c.n ? 1.2 : 1 } : {}}
              transition={{ type: "spring", stiffness: 400, damping: 15, delay: hover === null ? 0.9 + i * 0.18 : 0 }}
            >
              <span className="absolute inset-0 animate-ping-slow rounded-full bg-urbn/60" />
              <span className="relative">{c.n}</span>
            </motion.button>
          ))}
        </div>
        <Stagger className="mx-auto mt-14 grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {CALLOUTS.map((c) => (
            <StaggerItem key={c.n} className={clsx("flex gap-3 rounded-2xl p-3 transition-colors", hover === c.n && "bg-white")}>
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-urbn text-sm font-semibold text-white">{c.n}</span>
              <div>
                <h3 className="font-display text-xl leading-tight">{c.title}</h3>
                <p className="mt-1 text-sm text-neutral-500">{c.text}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

function CodeExplained() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-30%" });
  const parts = [
    { seg: "IBADAN-NORTH", label: "IBADAN-NORTH", sub: "Local Government Area the property is registered in" },
    { seg: "0041", label: "0041", sub: "the property's number within that LGA" },
    { seg: "U", label: "U", sub: "check letter: a single typo won't match" },
  ];
  return (
    <section className="bg-ink py-16 text-white sm:py-24 lg:py-32">
      <div className="container-x">
        <Reveal>
          <SectionHeading dark eyebrow="How to read a DPI code" title="DPI Code Explained" lede="Every code tells you where a property is registered, and carries its own typo check." />
        </Reveal>
        <div ref={ref} className="mx-auto mt-14 max-w-3xl">
          <div className="flex flex-wrap items-center justify-center rounded-2xl bg-white px-4 py-5 font-display text-[1.6rem] text-blue-900 sm:text-5xl lg:text-6xl">
            {parts.map((p, i) => (
              <span key={p.seg} className="flex items-center">
                <motion.span
                  initial={{ color: "#111a5e" }}
                  animate={inView ? { color: ["#111a5e", "#253de2", "#111a5e"] } : {}}
                  transition={{ delay: 0.4 + i * 0.5, duration: 0.9 }}
                >
                  {p.seg}
                </motion.span>
                {i < parts.length - 1 && <span>-</span>}
              </span>
            ))}
          </div>
          <div className="mt-10 grid grid-cols-3 gap-4 sm:gap-6">
            {parts.map((p, i) => (
              <motion.div
                key={p.seg}
                className="flex flex-col items-center text-center"
                initial={{ opacity: 0, y: 16 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.4 + i * 0.5, duration: 0.6, ease: EASE }}
              >
                <motion.span
                  className="mb-3 w-px origin-top bg-white/40"
                  initial={{ height: 0 }}
                  animate={inView ? { height: 32 } : {}}
                  transition={{ delay: 0.4 + i * 0.5, duration: 0.5 }}
                />
                <span className="size-2.5 rounded-full border-2 border-white" />
                <span className="mt-3 font-display text-xl text-blue-400">{p.label}</span>
                <span className="mt-1 text-sm text-neutral-400">{p.sub}</span>
              </motion.div>
            ))}
          </div>
          <p className="mx-auto mt-12 max-w-xl text-center text-sm text-neutral-400">
            Buildings with several units add a unit code after a slash, for example{" "}
            <span className="font-mono text-white">{SAMPLE_DPI}/U01</span>, so every flat can be verified on its own.
          </p>
        </div>
      </div>
    </section>
  );
}

function Formats() {
  return (
    <section className="container-x py-16 sm:py-24 lg:py-32">
      <Reveal>
        <SectionHeading eyebrow="One identity, two formats." title="Physical vs. Virtual Plaque" />
      </Reveal>
      <Reveal className="mx-auto mt-8 max-w-5xl md:mt-14">
      <Rail grid="md:grid-cols-2 md:gap-8" item="w-[85%] sm:w-[60%]" label="Plaque formats">
        <div>
          <div className="overflow-hidden rounded-card">
            <img src="/images/plaque-scene.webp" alt="Physical Urbn DPI plaque mounted on a property wall" loading="lazy" className="aspect-[1.4] w-full object-cover transition-transform duration-700 hover:scale-105" />
          </div>
          <h3 className="mt-5 font-display text-2xl">Physical</h3>
          <p className="mt-2 text-neutral-500">Mounted on the property itself. Anyone standing in front of it can scan the QR code and see the verified record on the spot.</p>
        </div>
        <div>
          <div className="grid aspect-[1.4] place-items-center overflow-hidden rounded-card bg-gradient-to-br from-blue-50 to-blue-100 p-6">
            <motion.div className="w-full max-w-sm" animate={{ y: [0, -8, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}>
              <Plaque />
            </motion.div>
          </div>
          <h3 className="mt-5 font-display text-2xl">Virtual</h3>
          <p className="mt-2 text-neutral-500">A downloadable version of the same plaque, ready to share on WhatsApp, social media, or directly with a prospective buyer or renter.</p>
        </div>
      </Rail>
      </Reveal>
      <div className="mt-14 text-center">
        <p className="text-lg font-medium">Once your DPI is issued, you can request your plaque.</p>
        <ButtonLink to="/download" variant="dark" className="mt-5">
          Get Started
        </ButtonLink>
      </div>
    </section>
  );
}

function Lifecycle() {
  const items = [
    { icon: Stamp, title: "Issued once", text: "A property never gets a second DPI. Issuance is a one-time event." },
    { icon: ReceiptText, title: "Tied to the property, not the people", text: "When an owner sells, a tenant moves out, or an agent is reassigned, the DPI stays exactly where it is. Only the people associated with the record change." },
    { icon: History, title: "Updated, never overwritten", text: "Only Urbn, or authorized parties through Urbn's system, can write to the record. Payments, service changes, disputes, and ownership transfers are logged as they happen. No individual agent or owner can edit it unilaterally." },
    { icon: Trash2, title: "Nothing gets erased", text: "Past tenancies and resolved disputes stay part of the record, timestamped, even after new tenants or owners come in." },
  ];
  return (
    <section className="relative overflow-hidden bg-ink py-16 text-white sm:py-24 lg:py-32">
      <div className="container-x">
        <Reveal>
          <SectionHeading dark eyebrow="A record for life" title="Lifecycle" />
        </Reveal>
        <div className="relative mt-10 lg:mt-16">
          {/* phones: vertical timeline spine */}
          <motion.span
            aria-hidden
            className="absolute top-6 bottom-6 left-6 w-px origin-top bg-gradient-to-b from-urbn via-white/30 to-urbn sm:hidden"
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.6, ease: EASE }}
          />
          <motion.div
            className="absolute top-6 left-[12.5%] hidden h-px origin-left bg-gradient-to-r from-urbn via-white/40 to-urbn lg:block"
            style={{ width: "75%" }}
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.6, ease: EASE }}
          />
          <Stagger className="grid gap-8 sm:grid-cols-2 sm:gap-10 lg:grid-cols-4" stagger={0.18}>
            {items.map((it) => (
              <StaggerItem key={it.title} className="relative flex gap-5 sm:flex-col sm:items-center sm:gap-0 sm:text-center">
                <span className="relative shrink-0 rounded-full ring-8 ring-ink">
                  <IconBadge icon={it.icon} dark />
                </span>
                <div>
                  <h3 className="pt-2.5 font-sans text-lg font-semibold tracking-normal sm:mt-6 sm:pt-0">{it.title}</h3>
                  <p className="mt-2 max-w-xs text-sm leading-relaxed text-neutral-400 sm:mt-3">{it.text}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </div>
    </section>
  );
}
