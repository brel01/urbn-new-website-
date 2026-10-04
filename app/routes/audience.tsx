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
    label: "For renters & home seekers",
    title: "Never guess again.",
    highlight: "guess",
    lede: "Check a property's identity before you send a single naira. No more taking anyone's word for it.",
    metaTitle: "For Renters: Find Verified Homes & Avoid Rental Scams",
    metaDescription:
      "Avoid fake listings and rental scams in Nigeria. Check any property's DPI, browse verified homes, book inspections and track your agent's live location with Urbn.",
    image: "/images/illus-renters.webp",
    pains: [
      { icon: FileWarning, title: "Fake and duplicate listings", text: "The same flat, five different 'agents', five different prices." },
      { icon: UserX, title: "Agents who never show up", text: "Wasted transport, wasted days, and no way to know who's real." },
      { icon: Banknote, title: "Deposits that disappear", text: "Money sent before anyone checked who actually owns the property." },
    ],
    gains: [
      { icon: ShieldCheck, title: "Verify before you pay", text: "Enter a DPI or scan the plaque to see the verified record instantly, free and with no account." },
      { icon: Sparkles, title: "Search in plain English", text: "Tell the AI assistant “2-bedroom in Bodija under ₦800k” and let it do the searching." },
      { icon: Video, title: "Video walkthroughs", text: "See a space the way you'd actually experience it, before you ever visit." },
      { icon: CalendarCheck, title: "Confirmed inspections", text: "Book physical or virtual visits and track your agent's live location on the day." },
    ],
    cta: { label: "Browse verified homes", to: "/listings" },
    secondary: { label: "Verify a property", to: "/verify" },
  },
  "for-owners": {
    path: "/for-owners",
    label: "For property owners",
    title: "Protect what's yours.",
    highlight: "yours.",
    lede: "Get your property a permanent identity, and prove it's legitimately yours to anyone, instantly.",
    metaTitle: "For Property Owners: Get Your Property a DPI",
    metaDescription:
      "Give your property a permanent Digital Property Identity. Protect your ownership, stop fake listings of your home, and log every tenancy and payment on one record.",
    image: "/images/illus-owners.webp",
    pains: [
      { icon: UserX, title: "Strangers listing your property", text: "Anyone can claim to represent your home, and there's nothing to check them against." },
      { icon: History, title: "History that walks away", text: "When an agent or tenant leaves, the records leave with them." },
      { icon: MessageSquareWarning, title: "Disputes with no paper trail", text: "Rent and complaints handled over cash and WhatsApp, with nothing to point back to." },
    ],
    gains: [
      { icon: BadgeCheck, title: "A permanent DPI", text: "Issued once, after identity, title and physical checks. It can never be faked, duplicated or reassigned." },
      { icon: QrCode, title: "Physical & virtual plaques", text: "A plaque on your gate anyone can scan, plus a shareable version for online listings." },
      { icon: History, title: "A record that never resets", text: "Tenancies, payments and disputes are logged against the property, timestamped, permanently." },
      { icon: ShieldCheck, title: "Proof on demand", text: "Show buyers, tenants and estate managers the verified record in seconds." },
    ],
    cta: { label: "Get your property a DPI", to: "/dpi" },
    secondary: { label: "How verification works", to: "/dpi#how-to-get-a-dpi" },
  },
  "for-agents": {
    path: "/for-agents",
    label: "For agents & property managers",
    title: "Close faster. Prove it's real.",
    highlight: "real.",
    lede: "Give every listing a verified identity that builds trust before you even show up.",
    metaTitle: "For Agents & Property Managers: List Verified Properties",
    metaDescription:
      "Stand out from fake listings. Verify your portfolio with Urbn DPIs, prove your authority to list, and close faster with renters and buyers who already trust what they see.",
    image: "/images/illus-agents.webp",
    pains: [
      { icon: FileWarning, title: "Competing with fakes", text: "Genuine listings get lost among duplicates and bait prices." },
      { icon: UserX, title: "Clients who don't trust you", text: "Every new client starts from suspicion, not confidence." },
      { icon: ClipboardCheck, title: "Admin that never ends", text: "Inspections, follow-ups and records scattered across chats and notebooks." },
    ],
    gains: [
      { icon: BadgeCheck, title: "Verified authority", text: "Your right to list is logged against each property's DPI, so clients know who they're dealing with." },
      { icon: TrendingUp, title: "Listings that convert", text: "Verified listings with video tours give serious renters and buyers a reason to choose you." },
      { icon: CalendarCheck, title: "Inspections, organised", text: "Bookings, confirmations and live location sharing in one place. No more no-shows." },
      { icon: Building2, title: "Portfolio-ready", text: "Manage multi-unit buildings, with each unit logged under one DPI." },
    ],
    cta: { label: "Get started", to: "/download" },
    secondary: { label: "See all features", to: "/features" },
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
            <WordsReveal key={a.path} text={a.title} highlight={[a.highlight]} className="mt-4 text-5xl leading-[1] sm:text-7xl" />
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

      <section className="bg-ink py-24 text-white">
        <div className="container-x">
          <Reveal>
            <SectionHeading dark title="Sound familiar?" />
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

      <section className="container-x py-24 sm:py-32">
        <Reveal>
          <SectionHeading title="How Urbn helps" lede="One verified identity per property, plus the tools to actually use it." />
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
