import { CtaBanner } from "~/components/cta-banner";
import { Reveal, Stagger, StaggerItem, WordsReveal } from "~/components/motion";
import { ButtonLink } from "~/components/ui";
import { breadcrumbs, seo } from "~/lib/seo";
import { SITE } from "~/lib/site";
import type { Route } from "./+types/careers";

export const meta: Route.MetaFunction = () =>
  seo({
    title: "Careers at Urbn",
    description: "Help build Nigeria's Digital Property Identity system. See how to join the Urbn team.",
    path: "/careers",
    jsonLd: breadcrumbs([
      { name: "Home", path: "/" },
      { name: "Careers", path: "/careers" },
    ]),
  });

const TEAMS = [
  { t: "Verification & Field Ops", d: "The people who visit every property before a DPI is issued." },
  { t: "Engineering & Product", d: "Building the identity layer, the app and everything in between." },
  { t: "Partnerships & Growth", d: "Bringing owners, agencies and estates onto Urbn, city by city." },
];

export default function Careers() {
  return (
    <>
      <section className="container-x py-16 sm:py-24">
        <WordsReveal text="Build the trust layer for Nigerian real estate." highlight={["trust"]} className="max-w-4xl text-5xl leading-[1] sm:text-7xl" />
        <Reveal className="mt-6 max-w-xl">
          <p className="lede">
            We're a small team with a big job: making sure every property in Nigeria has an identity anyone can check. If
            that sounds like work worth doing, we'd like to hear from you.
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
          <h2 className="text-3xl">No open roles listed right now</h2>
          <p className="mt-3 max-w-xl text-neutral-400">
            We're growing as we launch new cities. Send your CV and a few lines about what you'd like to work on, and
            we'll reach out when there's a fit.
          </p>
          <ButtonLink to={`mailto:${SITE.email}?subject=Careers%20at%20Urbn`} reloadDocument variant="light" className="mt-6">
            Email the team
          </ButtonLink>
        </Reveal>
      </section>
      <CtaBanner />
    </>
  );
}
