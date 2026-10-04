import { clsx } from "clsx";
import { BellRing, CalendarCheck, MapPin, MessageSquareText, Play, Sparkles, Users } from "lucide-react";
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
  Phone,
  UBeepScreen,
  VideoScreen,
} from "~/components/phone";
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
  screen: ReactNode;
};

const FEATURES: Feature[] = [
  {
    id: "u-beep",
    icon: BellRing,
    title: "U-Beep",
    body: "Scan the DPI QR code, and let the right person know you're there, no phone number needed. Whether it's a delivery, a visitor, a service appointment, or something urgent, U-Beep gets your message to whoever's responsible for that property.",
    highlight: "It's not a chat app. It's the digital doorbell for every Urbn property.",
    screen: <UBeepScreen />,
  },
  {
    id: "video-listings",
    icon: Play,
    title: "Video Listings",
    body: "Swipe through real video walkthroughs of properties, not just photos. Like, save, and comment on the ones you love, and come back to them anytime.",
    kicker: "See a space the way you'd actually experience it, before you ever visit.",
    screen: <VideoScreen />,
  },
  {
    id: "live-location",
    icon: MapPin,
    title: "Live Location",
    body: "See exactly where a property is: pinned, precise, and impossible to fudge. Once you've booked an inspection, track your agent's live location in real time, so you always know they're on their way.",
    kicker: "No more wasted trips. No more waiting around for someone who was never coming.",
    screen: <LocationScreen />,
  },
  {
    id: "inspection-booking",
    icon: CalendarCheck,
    title: "Inspection Booking",
    body: "Book a physical visit, or start with a virtual walkthrough, whichever fits your schedule. Pick a time, confirm with the agent or owner, and you're set.",
    kicker: "No back-and-forth. No guessing if it's actually confirmed.",
    screen: <BookingScreen />,
  },
  {
    id: "ai-search",
    icon: Sparkles,
    title: "AI Search Assistant",
    body: "Tell it what you're looking for, like “2-bedroom in Bodija under ₦800k”, and let it do the searching. No endless scrolling, no filters to figure out.",
    kicker: "The more specific you are, the better it finds.",
    screen: <AiScreen />,
  },
  {
    id: "direct-chat",
    icon: MessageSquareText,
    title: "Direct Chat",
    body: "Message agents or owners straight from the app: ask questions, negotiate, confirm details. Everything in one place, so nothing gets lost in a WhatsApp thread you can't find later.",
    screen: <ChatScreen />,
  },
  {
    id: "community",
    icon: Users,
    title: "Neighborhood Community",
    body: "Connect with other renters and residents in your building or area. Ask questions, share tips, and connect with your neighbors.",
    screen: <CommunityScreen />,
  },
];

export const meta: Route.MetaFunction = () =>
  seo({
    title: "Features: U-Beep, Video Listings, AI Search & More",
    description:
      "Beyond DPI, Urbn helps you find, check and settle into a home: video listings, live location, inspection booking, an AI search assistant, direct chat and neighborhood communities.",
    path: "/features",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "MobileApplication",
        name: "Urbn",
        operatingSystem: "iOS, Android",
        applicationCategory: "LifestyleApplication",
        description: "Verify properties, find verified homes and settle in with U-Beep, video listings, AI search and more.",
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
      <section className="container-x py-20 sm:py-28" aria-label="Urbn features">
        <nav aria-label="Jump to feature" className="no-scrollbar -mx-4 mb-10 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:justify-center sm:px-0">
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
        <Stagger className="grid gap-5 lg:grid-cols-2" stagger={0.08}>
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
        lede="Beyond DPI, Urbn gives you the tools to actually find, book, and settle into a home."
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
      <div className="container-x flex min-h-[30rem] flex-col justify-end pt-24 pb-14 sm:min-h-[34rem] lg:justify-center lg:py-28">
        <WordsReveal text="More than verification" highlight={["verification"]} className="max-w-xl text-5xl leading-[1] sm:text-7xl" />
        <motion.p
          className="mt-6 max-w-sm text-lg text-neutral-700"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          Urbn helps you find, check, and settle into a home, not just prove it's real.
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
      </div>
      <div className="mx-auto w-full max-w-[15rem] sm:translate-y-10 sm:transition-transform sm:duration-700 sm:group-hover:translate-y-6">
        <Phone>{feature.screen}</Phone>
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
          <h2 className="font-display text-2xl sm:text-3xl">Get started, and explore it all for yourself.</h2>
          <p className="mt-2 text-sm text-neutral-600">
            Every feature works hand in hand with DPI, so the home you find is the home you get.
          </p>
          <ButtonLink to="/download" variant="dark" className="mt-5">
            Get Started
          </ButtonLink>
        </motion.div>
      </Reveal>
    </section>
  );
}
