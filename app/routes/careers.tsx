import { CtaBanner } from "~/components/cta-banner";
import { Reveal, Stagger, StaggerItem, WordsReveal } from "~/components/motion";
import { ButtonLink } from "~/components/ui";
import { breadcrumbs, seo } from "~/lib/seo";
import { SITE } from "~/lib/site";
import type { Route } from "./+types/careers";

export const meta: Route.MetaFunction = () =>
  seo({
    title: "Careers at Urbn",
    description: "Help build the digital infrastructure for housing. Explore opportunities to join the Urbn team.",
    path: "/careers",
    jsonLd: breadcrumbs([
      { name: "Home", path: "/" },
      { name: "Careers", path: "/careers" },
    ]),
  });

const TEAMS = [
  { t: "Field Operations", d: "Supporting property checks and local onboarding." },
  { t: "Engineering", d: "Building connected records and the tools around them." },
  { t: "Growth & Partnerships", d: "Helping owners, managers and communities get started with Urbn." },
];

export default function Careers() {
  return (
    <>
      <section className="container-x py-16 sm:py-24">
        <WordsReveal text="Build the Digital Infrastructure for Housing." highlight={["Housing."]} className="max-w-4xl text-5xl leading-[1] sm:text-7xl" />
        <Reveal className="mt-6 max-w-xl">
          <p className="lede">
            We're connecting every kind of property, from homes and shops to schools and clinics, to its people, records
            and everyday activities. Come and build it with us.
          </p>
        </Reveal>
        <Stagger className="mt-14 grid gap-5 md:grid-cols-3">
          {TEAMS.map((x) => (
            <StaggerItem key={x.t} className="rounded-card bg-mist p-7">
              <h2 className="font-display text-2xl">{x.t}</h2>
              <p className="mt-2 text-neutral-600">{x.d}</p>
            </StaggerItem>
          ))}
        </Stagger>
        <Reveal className="mt-14 rounded-card bg-ink p-8 text-white sm:p-12">
          <h2 className="text-3xl">No Open Roles Right Now</h2>
          <p className="mt-3 max-w-xl text-neutral-400">
            Interested in working with Urbn? Send your CV and a short note about what you'd like to contribute. We'll
            contact you if a suitable opportunity opens.
          </p>
          <ButtonLink to={`mailto:${SITE.email}?subject=Careers%20at%20Urbn`} reloadDocument variant="light" className="mt-6">
            Email the Team
          </ButtonLink>
        </Reveal>
      </section>
      <CtaBanner />
    </>
  );
}
