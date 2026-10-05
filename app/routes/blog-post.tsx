import { ChevronLeft } from "lucide-react";
import { motion, useScroll, useSpring } from "motion/react";
import { data, Link } from "react-router";
import { CtaBanner } from "~/components/cta-banner";
import { EASE, Reveal } from "~/components/motion";
import { ButtonLink } from "~/components/ui";
import { breadcrumbs, seo } from "~/lib/seo";
import { SITE, absoluteUrl } from "~/lib/site";
import { STORIES, getStory } from "~/lib/stories";
import type { Route } from "./+types/blog-post";

export function loader({ params }: Route.LoaderArgs) {
  const story = getStory(params.slug);
  if (!story) throw data("Not found", { status: 404 });
  return { story, more: STORIES.filter((s) => s.slug !== story.slug) };
}

export const meta: Route.MetaFunction = ({ loaderData }) => {
  if (!loaderData) return [{ title: "Not found | Urbn" }];
  const s = loaderData.story;
  return seo({
    title: s.title,
    description: s.excerpt,
    path: `/blog/${s.slug}`,
    image: s.image,
    imageAlt: s.imageAlt,
    type: "article",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: s.title,
        description: s.excerpt,
        image: absoluteUrl(s.image),
        datePublished: s.date,
        dateModified: s.date,
        author: { "@type": "Organization", name: SITE.name, url: SITE.url },
        publisher: { "@id": `${SITE.url}/#organization` },
        mainEntityOfPage: absoluteUrl(`/blog/${s.slug}`),
      },
      breadcrumbs([
        { name: "Home", path: "/" },
        { name: "Blog", path: "/blog" },
        { name: s.title, path: `/blog/${s.slug}` },
      ]),
    ],
  });
};

export default function BlogPost({ loaderData }: Route.ComponentProps) {
  const { story: s, more } = loaderData;
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  return (
    <>
      <motion.div aria-hidden className="fixed inset-x-0 top-0 z-[60] h-1 origin-left bg-urbn" style={{ scaleX: progress }} />
      <article className="container-x pt-10 pb-24">
        <div className="mx-auto max-w-3xl">
          <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-ink">
            <ChevronLeft className="size-4" /> All stories
          </Link>
          <motion.header initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE }}>
            <p className="mt-8 text-sm text-urbn">
              {s.category} ·{" "}
              <time dateTime={s.date}>{new Date(s.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</time>{" "}
              · {s.readMins} min read
            </p>
            <h1 className="mt-3 text-4xl leading-[1.05] sm:text-6xl">{s.title}</h1>
            <p className="lede mt-5">{s.excerpt}</p>
          </motion.header>
        </div>
        <motion.img
          src={s.image}
          alt={s.imageAlt}
          className="mx-auto mt-10 aspect-[1.6] w-full max-w-4xl rounded-card object-cover"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: EASE, delay: 0.15 }}
        />
        <div className="mx-auto mt-12 max-w-2xl space-y-6 text-[17px] leading-[1.8] text-neutral-800">
          {s.body.map((b, i) => (
            <Reveal key={i}>
              {b.h && <h2 className="mt-10 mb-3 text-2xl sm:text-3xl">{b.h}</h2>}
              <p>{b.p}</p>
            </Reveal>
          ))}
          <div className="flex flex-wrap gap-3 pt-6">
            <ButtonLink to="/verify" variant="dark">Check a DPI</ButtonLink>
            <ButtonLink to="/listings" variant="outline">Browse Homes</ButtonLink>
          </div>
        </div>
      </article>
      <section className="bg-mist py-20">
        <div className="container-x">
          <h2 className="text-3xl">More Stories</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {more.map((m) => (
              <Link key={m.slug} to={`/blog/${m.slug}`} className="group flex gap-5 rounded-card bg-white p-4">
                <img src={m.image} alt="" loading="lazy" className="aspect-square w-28 shrink-0 rounded-xl object-cover sm:w-36" />
                <div>
                  <p className="text-sm text-urbn">{m.category}</p>
                  <h3 className="mt-1 font-display text-xl group-hover:text-urbn">{m.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-neutral-600">{m.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <div className="h-20" />
      <CtaBanner />
    </>
  );
}
