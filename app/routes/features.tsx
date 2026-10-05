import { clsx } from "clsx";
import { BellRing, CalendarCheck, Compass, MapPin, MessageSquareText, Play, Sparkles, Users } from "lucide-react";
import { motion } from "motion/react";
import type { ComponentType, ReactNode } from "react";
import { CtaBanner } from "~/components/cta-banner";
import { FaqSection } from "~/components/faq";
import { EASE, Reveal, Stagger, StaggerItem, WordsReveal } from "~/components/motion";
import {
  AiScreen,
  BookingScreen,
  ChatScreen,
  CommunityScreen,
  LocationScreen,
  NearbyScreen,
  Phone,
  UBeepScreen,
  VideoScreen,
} from "~/components/phone";
import { Rail } from "~/components/mobile";
import { ButtonLink } from "~/components/ui";
import { FEATURE_FAQS } from "~/lib/faqs";
import { breadcrumbs, faqJsonLd, seo } from "~/lib/seo";
import type { Route } from "./+types/features";

type Feature = {
  id: string;
  icon: ComponentType<{ className?: string }>;
  title: string;
  body: string;
  kicker?: string;
  highlight?: string;
  cta?: { label: string; to: string };
  /** The phone shows illustrative content. */
  sampleScreen?: boolean;
  screen: ReactNode;
};

const FEATURES: Feature[] = [
  {
    id: "u-beep",
    icon: BellRing,
    title: "U-Beep",
    body: "Scan the property's DPI QR code to send a visitor, delivery or service alert to eligible contacts. Delivery depends on connectivity and notification settings.",
    highlight: "Let the Property Know You're Here",
    screen: <UBeepScreen />,
  },
  {
    id: "nearby",
    icon: Compass,
    title: "Nearby",
    body: "See the businesses, schools, clinics, restaurants and other places recorded at properties around you, nearest first. Open one for its details, contact options and directions.",
    highlight: "Discover What Is Around You",
    cta: { label: "Explore Nearby", to: "/nearby" },
    sampleScreen: true,
    screen: <NearbyScreen />,
  },
  {
    id: "video-listings",
    icon: Play,
    title: "Video Listings",
    body: "Watch available property walkthroughs, save listings you like and review the details before arranging a visit.",
    highlight: "See More of the Space",
    screen: <VideoScreen />,
  },
  {
    id: "live-location",
    icon: MapPin,
    title: "Live Location",
    body: "Where available, use location sharing to follow the person meeting you for a confirmed inspection.",
    highlight: "Coordinate Your Inspection",
    screen: <LocationScreen />,
  },
  {
    id: "inspection-booking",
    icon: CalendarCheck,
    title: "Inspection Booking",
    body: "Request a physical or virtual inspection from the available slots. Check the app for acceptance and booking confirmation.",
    highlight: "Choose a Time to View",
    screen: <BookingScreen />,
  },
  {
    id: "ai-search",
    icon: Sparkles,
    title: "AI Search",
    body: "Enter an area, budget and must-haves in your own words. Urbn searches the available listings for matches.",
    highlight: "Describe the Property You Want",
    screen: <AiScreen />,
  },
  {
    id: "direct-chat",
    icon: MessageSquareText,
    title: "Direct Chat",
    body: "Message the owner or manager in Urbn to ask questions and discuss listing details.",
    highlight: "Keep Property Conversations Together",
    screen: <ChatScreen />,
  },
  {
    id: "community",
    icon: Users,
    title: "Neighbourhood Community",
    body: "Share updates and ask questions in the property or area communities available to your account.",
    highlight: "Stay Connected Locally",
    screen: <CommunityScreen />,
  },
];

export const meta: Route.MetaFunction = () =>
  seo({
    title: "Urbn Features | Property Records, Nearby, Inspections & More",
    description:
      "Explore Urbn's tools for property records, listings, Nearby discovery, inspection booking, direct messaging and everyday property activities.",
    path: "/features",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "MobileApplication",
        name: "Urbn",
        operatingSystem: "iOS, Android",
        applicationCategory: "LifestyleApplication",
        description: "Check property records, find properties, discover what's nearby, request inspections and manage everyday property activities with Urbn.",
        featureList: FEATURES.map((f) => f.title).join(", "),
        offers: { "@type": "Offer", price: "0", priceCurrency: "NGN" },
      },
      faqJsonLd(FEATURE_FAQS),
      breadcrumbs([
        { name: "Home", path: "/" },
        { name: "Features", path: "/features" },
      ]),
    ],
  });

export default function Features() {
  return (
    <>
      <Hero />
      <section className="container-x py-12 sm:py-20 lg:py-28" aria-label="Urbn features">
        {/* phones: an app tour, one feature per swipe */}
        <div className="lg:hidden">
          <p className="text-[10px] font-semibold tracking-widest text-neutral-400 uppercase">Swipe to Explore</p>
          <Rail grid="md:grid-cols-2 md:gap-5" item="w-[86%] sm:w-[60%]" className="mt-3" label="Urbn features">
            {FEATURES.map((f, i) => (
              <article key={f.id} className="flex h-full flex-col overflow-hidden rounded-[1.75rem] bg-mist">
                <div className="relative bg-gradient-to-b from-blue-100 to-mist px-10 pt-8">
                  <span className="absolute top-4 left-4 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-neutral-500">
                    {i + 1} / {FEATURES.length}
                  </span>
                  <div className="mx-auto -mb-24 w-full max-w-[12.5rem]">
                    <Phone>{f.screen}</Phone>
                  </div>
                </div>
                <div className="relative z-10 -mt-px flex flex-1 flex-col bg-mist p-6 pt-8 shadow-[0_-24px_30px_-8px_rgba(245,245,246,1)]">
                  <span className="grid size-11 place-items-center rounded-full bg-ink text-white">
                    <f.icon className="size-5" />
                  </span>
                  <h2 className="mt-4 text-2xl">{f.title}</h2>
                  <p className="mt-2 text-[15px] leading-relaxed text-neutral-600">{f.body}</p>
                  {(f.highlight || f.kicker) && <p className="mt-3 text-[15px] leading-snug font-medium text-urbn">{f.highlight ?? f.kicker}</p>}
                  {f.cta && <ButtonLink to={f.cta.to} variant="dark" size="sm" className="mt-4">{f.cta.label}</ButtonLink>}
                </div>
              </article>
            ))}
          </Rail>
        </div>
        <nav aria-label="Choose a Feature" className="mb-10 hidden flex-wrap justify-center gap-2 lg:flex">
          {FEATURES.map((f) => (
            <a
              key={f.id}
              href={`#${f.id}`}
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-neutral-200 px-4 py-2 text-sm transition hover:border-ink hover:bg-ink hover:text-white"
            >
              <f.icon className="size-4" /> {f.title}
            </a>
          ))}
        </nav>
        <Stagger className="hidden gap-5 lg:grid lg:grid-cols-2" stagger={0.08}>
          {FEATURES.map((f, i) => (
            <StaggerItem key={f.id} className={clsx(i === FEATURES.length - 1 && "lg:col-span-2")}>
              <FeatureCard feature={f} wide={i === FEATURES.length - 1} />
            </StaggerItem>
          ))}
        </Stagger>
      </section>
      <ExploreBand />
      <FaqSection
        faqs={FEATURE_FAQS}
        lede="See how Urbn connects property records with the actions people take around them."
      />
      <CtaBanner />
    </>
  );
}

function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-mist">
      <motion.div
        className="absolute inset-y-0 right-0 -z-10 w-full lg:w-[70%]"
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.2, ease: EASE }}
      >
        <img
          src="/images/hero-billboard.webp"
          srcSet="/images/hero-billboard-640.webp 640w, /images/hero-billboard.webp 992w"
          sizes="(min-width: 1024px) 70vw, 100vw"
          alt="Apartment building with a large Urbn DPI billboard"
          fetchPriority="high"
          className="size-full object-cover object-right"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-mist via-mist/70 to-transparent lg:via-mist/10" />
        <div className="absolute inset-0 bg-mist/75 lg:hidden" />
      </motion.div>
      <div className="container-x flex min-h-[22rem] flex-col justify-end pt-20 pb-10 sm:min-h-[34rem] sm:pt-24 sm:pb-14 lg:justify-center lg:py-28">
        <WordsReveal text="Every Property Has More Than One Moving Part." highlight={["Moving", "Part."]} className="max-w-xl text-[2.75rem] leading-[1] sm:text-6xl" />
        <motion.p
          className="mt-6 max-w-sm text-lg text-neutral-700"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          Keep property records, people and everyday activities connected in Urbn.
        </motion.p>
      </div>
    </section>
  );
}

function FeatureCard({ feature, wide }: { feature: Feature; wide?: boolean }) {
  return (
    <article
      id={feature.id}
      className={clsx(
        "group grid h-full scroll-mt-28 items-center gap-6 overflow-hidden rounded-card bg-mist p-6 transition-colors duration-500 hover:bg-fog sm:grid-cols-[1.1fr_0.9fr] sm:p-8",
        wide && "lg:grid-cols-[1.4fr_0.6fr] lg:px-14",
      )}
    >
      <div className="self-start">
        <span className="grid size-12 place-items-center rounded-full bg-ink text-white transition-transform duration-500 group-hover:scale-110 group-hover:bg-urbn">
          <feature.icon className="size-5" />
        </span>
        <h2 className="mt-6 text-2xl sm:text-3xl">{feature.title}</h2>
        <p className="mt-4 leading-relaxed text-neutral-600">{feature.body}</p>
        {feature.kicker && <p className="mt-4 leading-relaxed text-neutral-600">{feature.kicker}</p>}
        {feature.highlight && <p className="mt-4 text-lg leading-snug font-medium text-urbn">{feature.highlight}</p>}
        {feature.cta && <ButtonLink to={feature.cta.to} variant="dark" className="mt-6">{feature.cta.label}</ButtonLink>}
      </div>
      <div className="mx-auto w-full max-w-[15rem] sm:translate-y-10 sm:transition-transform sm:duration-700 sm:group-hover:translate-y-6">
        <Phone>{feature.screen}</Phone>
        {feature.sampleScreen && <p className="mt-2 text-center text-xs text-neutral-500">Sample screen. Live places are on the Nearby page.</p>}
      </div>
    </article>
  );
}

function ExploreBand() {
  return (
    <section className="container-x pb-8">
      <Reveal className="relative overflow-hidden rounded-card">
        <img
          src="/images/house-modern.webp"
          srcSet="/images/house-modern-640.webp 640w, /images/house-modern.webp 816w"
          sizes="100vw"
          alt="Contemporary home with timber cladding"
          loading="lazy"
          className="h-[26rem] w-full object-cover sm:h-[30rem]"
        />
        <motion.div
          className="absolute right-4 bottom-4 left-4 max-w-md rounded-2xl bg-white p-6 sm:right-8 sm:bottom-8 sm:left-auto sm:p-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.8, ease: EASE }}
        >
          <h2 className="font-display text-2xl sm:text-3xl">Bring Your Property Activities Together</h2>
          <p className="mt-2 text-sm text-neutral-600">
            Find a property, arrange an inspection and keep track of what comes next.
          </p>
          <ButtonLink to="/download" variant="dark" className="mt-5">
            Get the App
          </ButtonLink>
        </motion.div>
      </Reveal>
    </section>
  );
}
