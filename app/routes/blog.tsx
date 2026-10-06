import { Link } from "react-router";
import { CtaBanner } from "~/components/cta-banner";
import { Reveal, Stagger, StaggerItem, WordsReveal } from "~/components/motion";
import { breadcrumbs, seo } from "~/lib/seo";
import { absoluteUrl } from "~/lib/site";
import { STORIES, coverFit } from "~/lib/stories";
import type { Route } from "./+types/blog";
import { PageSky } from "~/components/city-scene";

export const meta: Route.MetaFunction = () =>
  seo({
    title: "Stories & Updates From Urbn",
    description: "Property insights, product updates and news from the team building the digital infrastructure for housing.",
    path: "/blog",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "Blog",
        name: "Urbn Stories",
        blogPost: STORIES.map((s) => ({ "@type": "BlogPosting", headline: s.title, datePublished: s.date, url: absoluteUrl(`/blog/${s.slug}`) })),
      },
      breadcrumbs([
        { name: "Home", path: "/" },
        { name: "Blog", path: "/blog" },
      ]),
    ],
  });

const fmt = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

export default function Blog() {
  const [lead, ...rest] = STORIES;
  return (
    <>
      <PageSky />
      <section className="container-x pt-16 pb-24 sm:pt-24">
        <WordsReveal text="Stories From Urbn" className="text-6xl sm:text-8xl" />
        <p className="lede mt-4 max-w-xl">Property insights, product updates and the people behind Urbn.</p>

        <Reveal className="mt-14">
          <Link to={`/blog/${lead.slug}`} className="group grid overflow-hidden rounded-card bg-ink text-white md:grid-cols-2">
            <div className="overflow-hidden">
              <img src={lead.image} alt={lead.imageAlt} className={`aspect-[1.5] size-full ${coverFit(lead)} transition-transform duration-700 group-hover:scale-105`} />
            </div>
            <div className="flex flex-col justify-center p-8 sm:p-12">
              <p className="text-sm text-blue-400">{lead.category} · {fmt(lead.date)}</p>
              <h2 className="mt-3 text-3xl sm:text-4xl">{lead.title}</h2>
              <p className="mt-4 text-neutral-400">{lead.excerpt}</p>
              <span className="mt-8 text-sm font-semibold">Read Story →</span>
            </div>
          </Link>
        </Reveal>

        <Stagger className="mt-6 grid gap-6 md:grid-cols-2">
          {rest.map((s) => (
            <StaggerItem key={s.slug} as="article">
              <Link to={`/blog/${s.slug}`} className="group block">
                <div className="overflow-hidden rounded-card">
                  <img src={s.image} alt={s.imageAlt} loading="lazy" className={`aspect-[1.55] w-full ${coverFit(s)} transition-transform duration-700 group-hover:scale-105`} />
                </div>
                <p className="mt-5 text-sm text-urbn">{s.category} · {fmt(s.date)} · {s.readMins} min read</p>
                <h2 className="mt-2 text-2xl group-hover:text-urbn">{s.title}</h2>
                <p className="mt-2 text-neutral-600">{s.excerpt}</p>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </section>
      <CtaBanner variant="waitlist" title="Updates From Urbn" body="Get new stories and product updates by email." />
    </>
  );
}
