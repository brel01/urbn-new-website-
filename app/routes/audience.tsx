import {
  BadgeCheck,
  Banknote,
  Building2,
  CalendarCheck,
  ClipboardCheck,
  FileWarning,
  History,
  MessageSquareWarning,
  QrCode,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserX,
  Video,
} from "lucide-react";
import { motion } from "motion/react";
import { useMatches } from "react-router";
import { CtaBanner } from "~/components/cta-banner";
import { EASE, Reveal, Stagger, StaggerItem, WordsReveal } from "~/components/motion";
import { ButtonLink, SectionHeading } from "~/components/ui";
import { breadcrumbs, seo } from "~/lib/seo";
import type { Route } from "./+types/audience";

type Audience = {
  path: string;
  label: string;
  title: string;
  highlight: string;
  lede: string;
  metaTitle: string;
  metaDescription: string;
  image: string;
  pains: { icon: typeof Search; title: string; text: string }[];
  gains: { icon: typeof Search; title: string; text: string }[];
  cta: { label: string; to: string };
  secondary: { label: string; to: string };
};

const AUDIENCES: Record<string, Audience> = {
  "for-renters": {
    path: "/for-renters",
    label: "For Renters & Home Seekers",
    title: "A Clearer Way to Find Your Next Home",
    highlight: "Next Home",
    lede: "Explore listings, ask questions and check the property record before you commit.",
    metaTitle: "For Renters | Find Homes & Manage Your Tenancy",
    metaDescription: "Explore homes, check property records, book inspections and follow your tenancy in Urbn.",
    image: "/images/illus-renters.webp",
    pains: [
      { icon: FileWarning, title: "Conflicting Listings", text: "One flat, different descriptions and prices." },
      { icon: UserX, title: "Unclear Inspection Plans", text: "Time and transport spent without a confirmed visit." },
      { icon: Banknote, title: "Scattered Tenancy Details", text: "Agreements and payment records spread across chats." },
    ],
    gains: [
      { icon: ShieldCheck, title: "Check Property Records", text: "Review available details and status." },
      { icon: Sparkles, title: "Search Your Way", text: "Use filters or AI Search." },
      { icon: CalendarCheck, title: "Arrange Inspections", text: "Request a slot and follow confirmation." },
      { icon: Video, title: "Track Your Tenancy", text: "Keep tenancy details in view." },
    ],
    cta: { label: "Browse Homes", to: "/listings" },
    secondary: { label: "Check a DPI", to: "/verify" },
  },
  "for-owners": {
    path: "/for-owners",
    label: "For Property Owners",
    title: "Keep Your Property in View",
    highlight: "in View",
    lede: "Connect your property's details, people and tenancy activities in one place.",
    metaTitle: "For Property Owners | Manage Your Property With Urbn",
    metaDescription: "Connect property details, occupants, listings and tenancy records in one place with Urbn.",
    image: "/images/illus-owners.webp",
    pains: [
      { icon: UserX, title: "Property Details in Different Places", text: "Important information is hard to find." },
      { icon: MessageSquareWarning, title: "Updates That Depend on Calls", text: "Knowing what's happening takes repeated follow-up." },
      { icon: History, title: "Tenancy Records That Get Lost", text: "Changes become harder to trace over time." },
    ],
    gains: [
      { icon: BadgeCheck, title: "A Connected Property Record", text: "Keep details linked to the property." },
      { icon: QrCode, title: "Occupants in View", text: "See the relationships recorded in Urbn." },
      { icon: History, title: "Tenancy Tracking", text: "Follow available tenancy and rent records." },
      { icon: ShieldCheck, title: "Listing Management", text: "Manage eligible spaces from the same property." },
    ],
    cta: { label: "Add Your Property", to: "/download" },
    secondary: { label: "How Verification Works", to: "/dpi#how-to-get-a-dpi" },
  },
  "for-agents": {
    path: "/for-agents",
    label: "For Agents & Property Managers",
    title: "More Properties. Less Scattered Work.",
    highlight: "Less Scattered Work.",
    lede: "Keep listings, inspection requests and property conversations organised in Urbn.",
    metaTitle: "For Agents & Property Managers | Organise Your Portfolio",
    metaDescription: "Manage property listings, inspection requests and client conversations through Urbn.",
    image: "/images/illus-agents.webp",
    pains: [
      { icon: FileWarning, title: "Repeated Questions", text: "Explaining the same details to each prospect." },
      { icon: UserX, title: "Inspection Follow-Up", text: "Requests and confirmations spread across chats." },
      { icon: ClipboardCheck, title: "Portfolio Admin", text: "Keeping property updates and records aligned." },
    ],
    gains: [
      { icon: BadgeCheck, title: "Property Records", text: "Link listings to their Urbn record." },
      { icon: TrendingUp, title: "Organised Listings", text: "Keep available properties in view." },
      { icon: CalendarCheck, title: "Inspection Management", text: "Review requests and upcoming visits." },
      { icon: Building2, title: "Connected Conversations", text: "Discuss property details in the app." },
    ],
    cta: { label: "Apply as an Agent", to: "/download" },
    secondary: { label: "Explore Features", to: "/features" },
  },
};

const fromId = (id: string) => AUDIENCES[id] ?? AUDIENCES["for-renters"];

export const meta: Route.MetaFunction = ({ matches }) => {
  const id = matches[matches.length - 1]?.id ?? "for-renters";
  const a = fromId(id);
  return seo({
    title: a.metaTitle,
    description: a.metaDescription,
    path: a.path,
    jsonLd: breadcrumbs([
      { name: "Home", path: "/" },
      { name: a.label, path: a.path },
    ]),
  });
};

export default function AudiencePage() {
  const matches = useMatches();
  const a = fromId(matches[matches.length - 1].id);
  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 to-white">
        <div className="container-x grid items-center gap-10 pt-16 pb-20 lg:grid-cols-[1.1fr_0.9fr] lg:pt-24">
          <div>
            <p className="eyebrow"><span className="size-2 rounded-full bg-urbn" /> {a.label}</p>
            <WordsReveal key={a.path} text={a.title} highlight={a.highlight.split(" ")} className="mt-4 text-5xl leading-[1] sm:text-6xl" />
            <motion.p key={`${a.path}-l`} className="lede mt-6 max-w-lg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
              {a.lede}
            </motion.p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink to={a.cta.to} variant="blue">{a.cta.label}</ButtonLink>
              <ButtonLink to={a.secondary.to} variant="outline">{a.secondary.label}</ButtonLink>
            </div>
          </div>
          <motion.img
            key={a.image}
            src={a.image}
            alt=""
            className="w-full mix-blend-multiply"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: EASE }}
          />
        </div>
      </section>

      <section className="bg-ink py-16 text-white sm:py-24">
        <div className="container-x">
          <Reveal>
            <SectionHeading dark title="Sound Familiar?" />
          </Reveal>
          <Stagger className="mt-12 grid gap-4 md:grid-cols-3">
            {a.pains.map((p) => (
              <StaggerItem key={p.title} className="rounded-card bg-graphite p-7">
                <p.icon className="size-6 text-error" />
                <h3 className="mt-5 font-sans text-lg font-semibold tracking-normal">{p.title}</h3>
                <p className="mt-2 text-sm text-neutral-400">{p.text}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="container-x py-16 sm:py-24 lg:py-32">
        <Reveal>
          <SectionHeading title="How Urbn Helps" lede="Property records, people and housing activities, connected in one place." />
        </Reveal>
        <Stagger className="mt-14 grid gap-5 sm:grid-cols-2">
          {a.gains.map((g) => (
            <StaggerItem key={g.title} className="group flex gap-5 rounded-card border border-neutral-200 p-7 transition hover:border-urbn">
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-urbn text-white transition-transform group-hover:scale-110">
                <g.icon className="size-5" />
              </span>
              <div>
                <h3 className="font-display text-xl">{g.title}</h3>
                <p className="mt-2 text-neutral-600">{g.text}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>
      <CtaBanner />
    </>
  );
}
